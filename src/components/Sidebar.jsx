import { FilmIcon, HeartIcon, EyeIcon } from './Icons'
import './Sidebar.css'

const FILTERS = [
  { value: 'all', label: 'All movies', Icon: FilmIcon },
  { value: 'favorites', label: 'Favorites', Icon: HeartIcon },
  { value: 'watched', label: 'Watched', Icon: EyeIcon },
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
    <aside className="sidebar" aria-label="Filters and saved lists">
      <section className="sidebar__section">
        <h3 className="sidebar__heading">Filter</h3>
        <ul className="sidebar__filter-list">
          {FILTERS.map(({ value, label, Icon }) => {
            const count =
              value === 'favorites'
                ? favorites.size
                : value === 'watched'
                  ? watched.size
                  : null
            const isActive = filter === value
            return (
              <li key={value}>
                <button
                  type="button"
                  className={`sidebar__filter${isActive ? ' is-active' : ''}`}
                  onClick={() => onFilterChange(value)}
                  aria-pressed={isActive}
                >
                  <span className="sidebar__filter-left">
                    <Icon width={16} height={16} />
                    <span>{label}</span>
                  </span>
                  {count !== null && (
                    <span className="sidebar__count">{count}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="sidebar__section sidebar__section--lists">
        <h3 className="sidebar__heading">Favorites</h3>
        {favoriteMovies.length === 0 ? (
          <p className="sidebar__empty">Tap the heart on any card.</p>
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

      <section className="sidebar__section sidebar__section--lists">
        <h3 className="sidebar__heading">Watched</h3>
        {watchedMovies.length === 0 ? (
          <p className="sidebar__empty">Mark movies you have seen.</p>
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
