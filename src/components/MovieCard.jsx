import { POSTER_BASE } from '../api/tmdb'
import './MovieCard.css'

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#1a1d26"/>
      <text x="50%" y="50%" fill="#7a8090" font-family="Arial, sans-serif"
            font-size="20" text-anchor="middle" dominant-baseline="middle">
        No poster available
      </text>
    </svg>`
  )

const MovieCard = ({
  movie,
  onClick,
  isFavorite = false,
  isWatched = false,
  onToggleFavorite,
  onToggleWatched,
}) => {
  const posterSrc = movie.poster_path
    ? `${POSTER_BASE}${movie.poster_path}`
    : FALLBACK_POSTER

  const voteDisplay =
    typeof movie.vote_average === 'number'
      ? movie.vote_average.toFixed(1)
      : '—'

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(movie.id)
    }
  }

  const handleActionClick = (event, fn) => {
    event.stopPropagation()
    fn(movie.id)
  }

  const classes = [
    'movie-card',
    isFavorite ? 'movie-card--favorite' : '',
    isWatched ? 'movie-card--watched' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={classes}
      tabIndex={0}
      role="button"
      aria-label={`Open details for ${movie.title}`}
      onClick={() => onClick(movie.id)}
      onKeyDown={handleKeyDown}
    >
      <div className="movie-card__poster-wrap">
        <img
          src={posterSrc}
          alt={`${movie.title} poster`}
          className="movie-card__poster"
          loading="lazy"
        />
        <span className="movie-card__rating" aria-label={`Vote average ${voteDisplay} out of 10`}>
          ⭐ {voteDisplay}
        </span>
        {isWatched && (
          <span className="movie-card__watched-badge" aria-hidden="true">
            ✅ Watched
          </span>
        )}
      </div>
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
        <div className="movie-card__actions">
          <button
            type="button"
            className={`movie-card__action${
              isFavorite ? ' movie-card__action--active-fav' : ''
            }`}
            onClick={(event) => handleActionClick(event, onToggleFavorite)}
            aria-label={
              isFavorite
                ? `Remove ${movie.title} from favorites`
                : `Add ${movie.title} to favorites`
            }
            aria-pressed={isFavorite}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          <button
            type="button"
            className={`movie-card__action${
              isWatched ? ' movie-card__action--active-watched' : ''
            }`}
            onClick={(event) => handleActionClick(event, onToggleWatched)}
            aria-label={
              isWatched
                ? `Mark ${movie.title} as not watched`
                : `Mark ${movie.title} as watched`
            }
            aria-pressed={isWatched}
          >
            {isWatched ? '✅' : '👁'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default MovieCard
