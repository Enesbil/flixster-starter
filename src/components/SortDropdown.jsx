import { ChevronDownIcon } from './Icons'
import './SortDropdown.css'

const SORT_OPTIONS = [
  { value: 'vote_average', label: 'Top rated' },
  { value: 'title', label: 'Title' },
  { value: 'release_date', label: 'Newest' },
]

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select" className="sort-dropdown__label">
        Sort
      </label>
      <div className="sort-dropdown__wrap">
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
        <ChevronDownIcon className="sort-dropdown__chevron" />
      </div>
    </div>
  )
}

export default SortDropdown
