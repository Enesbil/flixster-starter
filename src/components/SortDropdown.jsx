import './SortDropdown.css'

const SORT_OPTIONS = [
  { value: 'vote_average', label: 'Vote Average (Highest)' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'release_date', label: 'Release Date (Newest)' },
]

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select" className="sort-dropdown__label">
        Sort by
      </label>
      <select
        id="sort-select"
        className="sort-dropdown__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SortDropdown
