import { useEffect, useRef, useState } from 'react'
import {
  fetchMovieDetails,
  BACKDROP_BASE,
  POSTER_BASE,
  findYouTubeTrailerKey,
} from '../api/tmdb'
import { getMovieInsight, AI_FALLBACK_MESSAGE } from '../api/openrouter'
import {
  CloseIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
} from './Icons'
import './MovieModal.css'

const insightCache = new Map()

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

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const MovieModal = ({ movieId, onClose }) => {
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState(null)
  const [aiInsight, setAiInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)

  const modalRef = useRef(null)
  const previouslyFocused = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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

  const detailsId = details?.id
  const detailsTitle = details?.title
  const detailsGenres = details?.genres
  const detailsOverview = details?.overview

  useEffect(() => {
    if (!detailsId) return
    const cached = insightCache.get(detailsId)
    if (cached) {
      setAiInsight(cached)
      setLoadingInsight(false)
      return
    }
    let cancelled = false
    setLoadingInsight(true)
    setAiInsight(null)
    getMovieInsight({
      title: detailsTitle,
      genres: (detailsGenres || []).map((g) => g.name).join(', '),
      overview: detailsOverview,
    })
      .then((text) => {
        if (cancelled) return
        if (text !== AI_FALLBACK_MESSAGE) insightCache.set(detailsId, text)
        setAiInsight(text)
      })
      .finally(() => {
        if (cancelled) return
        setLoadingInsight(false)
      })
    return () => {
      cancelled = true
    }
  }, [detailsId, detailsTitle, detailsGenres, detailsOverview])

  useEffect(() => {
    previouslyFocused.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFirst = () => {
      const root = modalRef.current
      if (!root) return
      const first = root.querySelector(FOCUSABLE)
      if (first instanceof HTMLElement) first.focus()
    }
    focusFirst()

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const root = modalRef.current
      if (!root) return
      const focusable = Array.from(
        root.querySelectorAll(FOCUSABLE)
      ).filter((el) => el instanceof HTMLElement && !el.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
      const prev = previouslyFocused.current
      if (prev instanceof HTMLElement && prev.isConnected) {
        prev.focus()
      }
    }
  }, [])

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  const backdropSrc = details?.backdrop_path
    ? `${BACKDROP_BASE}${details.backdrop_path}`
    : details?.poster_path
      ? `${POSTER_BASE}${details.poster_path}`
      : null

  const trailerKey = details ? findYouTubeTrailerKey(details.videos) : null
  const releaseDate = details ? formatReleaseDate(details.release_date) : null
  const runtime = details ? formatRuntime(details.runtime) : null

  return (
    <div
      className="movie-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="movie-modal" ref={modalRef}>
        <button
          type="button"
          className="movie-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon width={20} height={20} />
        </button>

        {loadingDetails && (
          <div className="movie-modal__skeleton" aria-busy="true">
            <div className="movie-modal__skel-backdrop" />
            <div className="movie-modal__body">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--meta" />
              <div className="skeleton-line skeleton-line--meta" />
            </div>
          </div>
        )}

        {error && !loadingDetails && (
          <div className="movie-modal__status movie-modal__status--error" role="alert">
            <p className="movie-modal__error-title">Could not load this movie</p>
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
              {details.tagline && (
                <p className="movie-modal__tagline">{details.tagline}</p>
              )}
              <ul className="movie-modal__meta">
                {releaseDate && (
                  <li>
                    <CalendarIcon width={14} height={14} />
                    <span>{releaseDate}</span>
                  </li>
                )}
                {runtime && (
                  <li>
                    <ClockIcon width={14} height={14} />
                    <span>{runtime}</span>
                  </li>
                )}
                {typeof details.vote_average === 'number' && (
                  <li>
                    <StarIcon filled width={14} height={14} />
                    <span>{details.vote_average.toFixed(1)}</span>
                  </li>
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
                  <h3 className="movie-modal__section-heading movie-modal__ai-heading">
                    <SparklesIcon width={14} height={14} />
                    AI take
                  </h3>
                  {loadingInsight ? (
                    <div className="movie-modal__ai-skeleton" aria-busy="true">
                      <div className="skeleton-line skeleton-line--title" />
                      <div className="skeleton-line skeleton-line--title" />
                      <div className="skeleton-line skeleton-line--meta" />
                    </div>
                  ) : (
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
