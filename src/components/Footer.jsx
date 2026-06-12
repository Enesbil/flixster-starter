import './Footer.css'

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__line">
          Movie data from{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Movie Database
          </a>
        </p>
        <p className="site-footer__line site-footer__line--dim">
          Built with React and TMDb. Not endorsed by TMDb.
        </p>
      </div>
    </footer>
  )
}

export default Footer
