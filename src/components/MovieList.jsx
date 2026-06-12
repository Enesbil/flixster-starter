import MovieCard from './MovieCard'
import './MovieList.css'

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
      <div className="movie-list__message" role="status">
        <p>Loading movies…</p>
      </div>
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
            {isLoadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}
    </section>
  )
}

export default MovieList
