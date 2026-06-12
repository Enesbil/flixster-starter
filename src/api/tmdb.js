const BASE_URL = 'https://api.themoviedb.org/3'
const READ_TOKEN = import.meta.env.VITE_API_READ_ACCESS_TOKEN
const API_KEY = import.meta.env.VITE_API_KEY

export const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'
export const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280'

const buildHeaders = () => {
  const headers = { 'Content-Type': 'application/json' }
  if (READ_TOKEN) headers.Authorization = `Bearer ${READ_TOKEN}`
  return headers
}

const tmdbFetch = async (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('language', 'en-US')
  if (!READ_TOKEN && API_KEY) url.searchParams.set('api_key', API_KEY)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }
  const response = await fetch(url.toString(), { headers: buildHeaders() })
  if (!response.ok) {
    throw new Error(`TMDb request failed (${response.status})`)
  }
  return response.json()
}

export const fetchNowPlaying = (page = 1) =>
  tmdbFetch('/movie/now_playing', { page })

export const searchMovies = (query, page = 1) =>
  tmdbFetch('/search/movie', { query, page, include_adult: 'false' })

export const fetchMovieDetails = (movieId) =>
  tmdbFetch(`/movie/${movieId}`, { append_to_response: 'videos' })

export const findYouTubeTrailerKey = (videos) => {
  const list = videos?.results
  if (!Array.isArray(list)) return null
  const TYPE_WEIGHT = { Trailer: 1000, Teaser: 100, Clip: 10 }
  const ranked = list
    .filter((v) => v.site === 'YouTube' && typeof v.key === 'string')
    .sort((a, b) => {
      const score = (v) => (TYPE_WEIGHT[v.type] ?? 0) + (v.official ? 1 : 0)
      return score(b) - score(a)
    })
  return ranked[0]?.key ?? null
}
