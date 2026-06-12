import './Sidebar.css'

const FILTERS = [
  { value: 'all', label: 'All Movies' },
  { value: 'favorites', label: '❤️ Favorites' },
  { value: 'watched', label: '✅ Watched' },
]

const Sidebar = ({
  filter,
  onFilterChange,
  favorites,
  watched,
  movieIndex,
  onMovieClick,
}) => {
  const favoriteMovies = [...favorites]
    .map((id) => movieIndex.get(id))
    .filter(Boolean)
  const watchedMovies = [...watched]
    .map((id) => movieIndex.get(id))
    .filter(Boolean)

  return (
    <aside className="sidebar" aria-label="Filters and lists">
      <section className="sidebar__section">
        <h3 className="sidebar__heading">Filter</h3>
        <ul className="sidebar__filter-list">
          {FILTERS.map((f) => {
            const count =
              f.value === 'favorites'
                ? favorites.size
                : f.value === 'watched'
                  ? watched.size
                  : null
            return (
              <li key={f.value}>
                <button
                  type="button"
                  className={`sidebar__filter${
                    filter === f.value ? ' sidebar__filter--active' : ''
                  }`}
                  onClick={() => onFilterChange(f.value)}
                  aria-pressed={filter === f.value}
                >
                  <span>{f.label}</span>
                  {count !== null && (
                    <span className="sidebar__count">{count}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="sidebar__section">
        <h3 className="sidebar__heading">❤️ Favorites</h3>
        {favoriteMovies.length === 0 ? (
          <p className="sidebar__empty">No favorites yet.</p>
        ) : (
          <ul className="sidebar__list">
            {favoriteMovies.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="sidebar__item"
                  onClick={() => onMovieClick(m.id)}
                >
                  {m.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sidebar__section">
        <h3 className="sidebar__heading">✅ Watched</h3>
        {watchedMovies.length === 0 ? (
          <p className="sidebar__empty">Nothing watched yet.</p>
        ) : (
          <ul className="sidebar__list">
            {watchedMovies.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="sidebar__item"
                  onClick={() => onMovieClick(m.id)}
                >
                  {m.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}

export default Sidebar
