import './Footer.css'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>© {year} Flixster. Built for the CodePath SITE Flixster project.</p>
        <p>
          Movie data provided by{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Movie Database (TMDb)
          </a>
          .
        </p>
      </div>
    </footer>
  )
}

export default Footer
