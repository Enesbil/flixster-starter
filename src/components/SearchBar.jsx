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
        <input
          id="search-input"
          type="text"
          className="search-bar__input"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search movies by title…"
        />
        <button type="submit" className="search-bar__button">
          Search
        </button>
        {query && (
          <button
            type="button"
            className="search-bar__button search-bar__button--secondary"
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}

export default SearchBar
