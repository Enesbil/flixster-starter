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
          <img
            src="/logo-mark.png"
            alt=""
            width="32"
            height="32"
            className="site-header__logo"
          />
          <span className="site-header__title">Flixster</span>
        </button>
      </div>
    </header>
  )
}

export default Header
