import MovieCard from './MovieCard'
import './MovieList.css'

const SKELETON_COUNT = 12

const MovieListSkeleton = () => (
  <ul className="movie-list__grid" aria-hidden="true">
    {Array.from({ length: SKELETON_COUNT }, (_, i) => (
      <li key={i} className="movie-list__item">
        <div className="movie-card movie-card--skeleton">
          <div className="movie-card__poster-wrap" />
          <div className="movie-card__body">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--meta" />
          </div>
        </div>
      </li>
    ))}
  </ul>
)

const MovieList = ({
  movies,
  onCardClick,
  onLoadMore,
  canLoadMore,
  isLoading,
  isLoadingMore,
  error,
  emptyMessage,
  favorites,
  watched,
  onToggleFavorite,
  onToggleWatched,
}) => {
  if (error && movies.length === 0) {
    return (
      <div className="movie-list__message movie-list__message--error" role="alert">
        <p>{error}</p>
      </div>
    )
  }

  if (isLoading && movies.length === 0) {
    return (
      <section className="movie-list" aria-label="Loading movies" aria-busy="true">
        <MovieListSkeleton />
      </section>
    )
  }

  if (!isLoading && movies.length === 0) {
    return (
      <div className="movie-list__message" role="status">
        <p>{emptyMessage || 'No movies to show.'}</p>
      </div>
    )
  }

  return (
    <section className="movie-list" aria-label="Movies">
      <ul className="movie-list__grid">
        {movies.map((movie) => (
          <li key={movie.id} className="movie-list__item">
            <MovieCard
              movie={movie}
              onClick={onCardClick}
              isFavorite={favorites?.has(movie.id) ?? false}
              isWatched={watched?.has(movie.id) ?? false}
              onToggleFavorite={onToggleFavorite}
              onToggleWatched={onToggleWatched}
            />
          </li>
        ))}
      </ul>
      {error && movies.length > 0 && (
        <div
          className="movie-list__message movie-list__message--error"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}
      {canLoadMore && (
        <div className="movie-list__load-more-wrap">
          <button
            type="button"
            className="movie-list__load-more"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  )
}

export default MovieList
