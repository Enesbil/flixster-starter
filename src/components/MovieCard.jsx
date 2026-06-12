import { POSTER_BASE } from '../api/tmdb'
import { HeartIcon, EyeIcon, StarIcon, CheckIcon } from './Icons'
import './MovieCard.css'

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#141416"/>
      <text x="50%" y="50%" fill="#64748b" font-family="Inter, sans-serif"
            font-size="16" text-anchor="middle" dominant-baseline="middle">
        No poster
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
      : null

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(movie.id)
    }
  }

  const handleAction = (event, fn) => {
    event.stopPropagation()
    fn(movie.id)
  }

  const classes = [
    'movie-card',
    isFavorite ? 'is-favorite' : '',
    isWatched ? 'is-watched' : '',
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
        {voteDisplay && (
          <span
            className="movie-card__rating"
            aria-label={`Rated ${voteDisplay} out of 10`}
          >
            <StarIcon filled width={12} height={12} />
            {voteDisplay}
          </span>
        )}
        {isWatched && (
          <span className="movie-card__watched-pill" aria-hidden="true">
            <CheckIcon width={12} height={12} />
            Watched
          </span>
        )}
        <div className="movie-card__actions">
          <button
            type="button"
            className={`movie-card__action${isFavorite ? ' is-active-fav' : ''}`}
            onClick={(event) => handleAction(event, onToggleFavorite)}
            aria-label={
              isFavorite
                ? `Remove ${movie.title} from favorites`
                : `Add ${movie.title} to favorites`
            }
            aria-pressed={isFavorite}
          >
            <HeartIcon filled={isFavorite} />
          </button>
          <button
            type="button"
            className={`movie-card__action${isWatched ? ' is-active-watched' : ''}`}
            onClick={(event) => handleAction(event, onToggleWatched)}
            aria-label={
              isWatched
                ? `Mark ${movie.title} as not watched`
                : `Mark ${movie.title} as watched`
            }
            aria-pressed={isWatched}
          >
            {isWatched ? <CheckIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
        {movie.release_date && (
          <p className="movie-card__year">
            {movie.release_date.slice(0, 4)}
          </p>
        )}
      </div>
    </article>
  )
}

export default MovieCard
