import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import SortDropdown from './components/SortDropdown'
import MovieList from './components/MovieList'
import MovieModal from './components/MovieModal'
import Sidebar from './components/Sidebar'
import { fetchNowPlaying, searchMovies } from './api/tmdb'
import './App.css'

const dedupeById = (movies) => {
  const seen = new Set()
  const out = []
  for (const m of movies) {
    if (seen.has(m.id)) continue
    seen.add(m.id)
    out.push(m)
  }
  return out
}

const sortMovies = (movies, sortOption) => {
  const copy = [...movies]
  switch (sortOption) {
    case 'title':
      return copy.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, {
          sensitivity: 'base',
        })
      )
    case 'release_date':
      return copy.sort((a, b) => {
        const aDate = a.release_date ? new Date(a.release_date).valueOf() : 0
        const bDate = b.release_date ? new Date(b.release_date).valueOf() : 0
        return bDate - aDate
      })
    case 'vote_average':
    default:
      return copy.sort(
        (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
      )
  }
}

const App = () => {
  const [movies, setMovies] = useState([])
  const [mode, setMode] = useState('now_playing')
  const [activeQuery, setActiveQuery] = useState('')
  const [queryInput, setQueryInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortOption, setSortOption] = useState('vote_average')
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState(() => new Set())
  const [watched, setWatched] = useState(() => new Set())
  const [filter, setFilter] = useState('all')
  const [seenMovies, setSeenMovies] = useState(() => new Map())

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleWatched = useCallback((id) => {
    setWatched((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const loadPage = useCallback(
    async ({ nextMode, query, pageToLoad, append }) => {
      const isFirstPage = !append
      if (isFirstPage) setIsLoading(true)
      else setIsLoadingMore(true)
      setError(null)

      try {
        const data =
          nextMode === 'search'
            ? await searchMovies(query, pageToLoad)
            : await fetchNowPlaying(pageToLoad)
        const results = Array.isArray(data.results) ? data.results : []
        setTotalPages(data.total_pages ?? 1)
        setMovies((prev) =>
          append ? dedupeById([...prev, ...results]) : results
        )
        setSeenMovies((prev) => {
          const next = new Map(prev)
          for (const m of results) {
            if (!next.has(m.id)) next.set(m.id, m)
          }
          return next
        })
        setPage(pageToLoad)
      } catch (err) {
        setError(
          err?.message
            ? `Could not load movies: ${err.message}`
            : 'Could not load movies. Please try again.'
        )
        if (!append) setMovies([])
      } finally {
        if (isFirstPage) setIsLoading(false)
        else setIsLoadingMore(false)
      }
    },
    []
  )

  useEffect(() => {
    loadPage({
      nextMode: 'now_playing',
      query: '',
      pageToLoad: 1,
      append: false,
    })
  }, [loadPage])

  const handleSearchSubmit = () => {
    const trimmed = queryInput.trim()
    if (trimmed.length === 0) return
    setMode('search')
    setActiveQuery(trimmed)
    loadPage({
      nextMode: 'search',
      query: trimmed,
      pageToLoad: 1,
      append: false,
    })
  }

  const handleClearSearch = () => {
    setQueryInput('')
    if (mode !== 'now_playing') {
      setMode('now_playing')
      setActiveQuery('')
      loadPage({
        nextMode: 'now_playing',
        query: '',
        pageToLoad: 1,
        append: false,
      })
    }
  }

  const handleHomeClick = () => {
    handleClearSearch()
  }

  const handleLoadMore = () => {
    if (isLoading || isLoadingMore) return
    if (page >= totalPages) return
    loadPage({
      nextMode: mode,
      query: activeQuery,
      pageToLoad: page + 1,
      append: true,
    })
  }

  const sidebarMovieIndex = seenMovies

  const filteredMovies = useMemo(() => {
    if (filter === 'favorites') return movies.filter((m) => favorites.has(m.id))
    if (filter === 'watched') return movies.filter((m) => watched.has(m.id))
    return movies
  }, [movies, filter, favorites, watched])

  const sortedMovies = useMemo(
    () => sortMovies(filteredMovies, sortOption),
    [filteredMovies, sortOption]
  )

  const canLoadMore =
    filter === 'all' && movies.length > 0 && page < totalPages
  const baseHeading =
    mode === 'search'
      ? `Results for "${activeQuery}"`
      : 'Now playing'
  const filterSuffix =
    filter === 'favorites'
      ? ' / Favorites'
      : filter === 'watched'
        ? ' / Watched'
        : ''
  const headingLabel = `${baseHeading}${filterSuffix}`

  const emptyMessage =
    filter === 'favorites'
      ? 'No favorites in this list.'
      : filter === 'watched'
        ? 'No watched movies in this list.'
        : mode === 'search'
          ? `No results for "${activeQuery}".`
          : 'Nothing playing right now.'

  return (
    <div className="App">
      <a className="skip-link" href="#main">Skip to content</a>
      <h1 className="sr-only">Flixster</h1>
      <Header onHomeClick={handleHomeClick} />
      <main id="main" className="App__main" tabIndex={-1}>
        <div className="App__controls">
          <SearchBar
            query={queryInput}
            onQueryChange={setQueryInput}
            onSubmit={handleSearchSubmit}
            onClear={handleClearSearch}
          />
          <SortDropdown value={sortOption} onChange={setSortOption} />
        </div>

        <div className="App__layout">
          <div className="App__sidebar">
            <Sidebar
              filter={filter}
              onFilterChange={setFilter}
              favorites={favorites}
              watched={watched}
              movieIndex={sidebarMovieIndex}
              onMovieClick={setSelectedMovieId}
            />
          </div>

          <div className="App__content">
            <div className="App__heading-row">
              <h2 className="App__heading">{headingLabel}</h2>
              {mode === 'search' && (
                <button
                  type="button"
                  className="App__pill-button"
                  onClick={handleHomeClick}
                >
                  Back to now playing
                </button>
              )}
            </div>

            <MovieList
              movies={sortedMovies}
              onCardClick={setSelectedMovieId}
              onLoadMore={handleLoadMore}
              canLoadMore={canLoadMore}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              error={error}
              emptyMessage={emptyMessage}
              favorites={favorites}
              watched={watched}
              onToggleFavorite={toggleFavorite}
              onToggleWatched={toggleWatched}
            />
          </div>
        </div>
      </main>
      <Footer />

      {selectedMovieId !== null && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  )
}

export default App
