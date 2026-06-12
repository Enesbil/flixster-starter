import { FilmIcon } from './Icons'
import './Header.css'

const Header = ({ onHomeClick }) => {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button
          type="button"
          className="site-header__brand"
          onClick={onHomeClick}
        >
          <span className="site-header__logo" aria-hidden="true">
            <FilmIcon width={22} height={22} />
          </span>
          <span className="site-header__title">Flixster</span>
        </button>
      </div>
    </header>
  )
}

export default Header
