import './Header.css'

const Header = ({ onHomeClick }) => {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button
          type="button"
          className="site-header__brand"
          onClick={onHomeClick}
          aria-label="Go to Now Playing"
        >
          <span className="site-header__logo" aria-hidden="true">🎬</span>
          <span className="site-header__title">Flixster</span>
        </button>
        <p className="site-header__tagline">Now playing in theaters</p>
      </div>
    </header>
  )
}

export default Header
