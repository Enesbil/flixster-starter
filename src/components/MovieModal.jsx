import { useEffect, useState } from 'react'
import {
  fetchMovieDetails,
  BACKDROP_BASE,
  POSTER_BASE,
  findYouTubeTrailerKey,
} from '../api/tmdb'
import { getMovieInsight } from '../api/openrouter'
import './MovieModal.css'

const formatRuntime = (minutes) => {
  if (!minutes || typeof minutes !== 'number') return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

const formatReleaseDate = (raw) => {
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.valueOf())) return raw
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const MovieModal = ({ movieId, onClose }) => {
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState(null)
  const [aiInsight, setAiInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)

  useEffect(() => {
    let cancelled = false
    setDetails(null)
    setError(null)
    setLoadingDetails(true)
    setAiInsight(null)
    setLoadingInsight(false)
    fetchMovieDetails(movieId)
      .then((data) => {
        if (cancelled) return
        setDetails(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Failed to load movie details.')
      })
      .finally(() => {
        if (cancelled) return
        setLoadingDetails(false)
      })
    return () => {
      cancelled = true
    }
  }, [movieId])

  useEffect(() => {
    if (!details) return
    let cancelled = false
    setLoadingInsight(true)
    setAiInsight(null)
    getMovieInsight({
      title: details.title,
      genres: (details.genres || []).map((g) => g.name).join(', '),
      overview: details.overview,
    })
      .then((text) => {
        if (cancelled) return
        setAiInsight(text)
      })
      .finally(() => {
        if (cancelled) return
        setLoadingInsight(false)
      })
    return () => {
      cancelled = true
    }
  }, [details])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  const backdropSrc = details?.backdrop_path
    ? `${BACKDROP_BASE}${details.backdrop_path}`
    : details?.poster_path
      ? `${POSTER_BASE}${details.poster_path}`
      : null

  const trailerKey = details ? findYouTubeTrailerKey(details.videos) : null

  return (
    <div
      className="movie-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="movie-modal">
        <button
          type="button"
          className="movie-modal__close"
          onClick={onClose}
          aria-label="Close movie details"
        >
          ×
        </button>

        {loadingDetails && (
          <div className="movie-modal__status" role="status">
            Loading movie details…
          </div>
        )}

        {error && !loadingDetails && (
          <div className="movie-modal__status movie-modal__status--error" role="alert">
            <p>We couldn't load this movie's details.</p>
            <p className="movie-modal__error-detail">{error}</p>
          </div>
        )}

        {details && !error && (
          <>
            {backdropSrc && (
              <div className="movie-modal__backdrop">
                <img
                  src={backdropSrc}
                  alt={`${details.title} backdrop`}
                  className="movie-modal__backdrop-img"
                />
                <div className="movie-modal__backdrop-fade" aria-hidden="true" />
              </div>
            )}
            <div className="movie-modal__body">
              <h2 id="movie-modal-title" className="movie-modal__title">
                {details.title}
              </h2>
              <ul className="movie-modal__meta">
                {formatReleaseDate(details.release_date) && (
                  <li>📅 {formatReleaseDate(details.release_date)}</li>
                )}
                {formatRuntime(details.runtime) && (
                  <li>⏱ {formatRuntime(details.runtime)}</li>
                )}
                {typeof details.vote_average === 'number' && (
                  <li>⭐ {details.vote_average.toFixed(1)}</li>
                )}
              </ul>
              {details.genres && details.genres.length > 0 && (
                <ul className="movie-modal__genres" aria-label="Genres">
                  {details.genres.map((g) => (
                    <li key={g.id} className="movie-modal__genre">
                      {g.name}
                    </li>
                  ))}
                </ul>
              )}
              {details.overview && (
                <section className="movie-modal__section">
                  <h3 className="movie-modal__section-heading">Overview</h3>
                  <p className="movie-modal__overview">{details.overview}</p>
                </section>
              )}
              {trailerKey && (
                <section className="movie-modal__section">
                  <h3 className="movie-modal__section-heading">Trailer</h3>
                  <div className="movie-modal__trailer">
                    <iframe
                      title={`${details.title} trailer`}
                      src={`https://www.youtube-nocookie.com/embed/${trailerKey}`}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </section>
              )}
              {(loadingInsight || aiInsight) && (
                <section className="movie-modal__section movie-modal__ai">
                  <h3 className="movie-modal__section-heading">
                    ✨ AI Watch Recommendation
                  </h3>
                  {loadingInsight && (
                    <p className="movie-modal__ai-loading" role="status">
                      ✨ Getting a recommendation…
                    </p>
                  )}
                  {!loadingInsight && aiInsight && (
                    <p className="movie-modal__ai-text">{aiInsight}</p>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MovieModal
