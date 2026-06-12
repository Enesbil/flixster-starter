import { SearchIcon, CloseIcon } from './Icons'
import './SearchBar.css'

const SearchBar = ({ query, onQueryChange, onSubmit, onClear }) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    if (query.trim().length === 0) return
    onSubmit()
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor="search-input" className="search-bar__label">
        Search movies
      </label>
      <div className="search-bar__row">
        <div className="search-bar__input-wrap">
          <SearchIcon className="search-bar__icon" />
          <input
            id="search-input"
            type="text"
            className="search-bar__input"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by title"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="search-bar__clear"
              onClick={onClear}
              aria-label="Clear search"
            >
              <CloseIcon width={16} height={16} />
            </button>
          )}
        </div>
        <button type="submit" className="search-bar__submit">
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar
