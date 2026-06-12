# Flixster Planning

This is the spec I worked off while building. I tried to write it before touching any code, then kept updating it as decisions changed mid-build. A couple of the original assumptions broke once I started typing, so the doc is a mix of pre-build plans and post-fix corrections. I left both visible because that's what actually happened.

## 1. Component Architecture

Hierarchy:

```
App
  Header
  SearchBar
  SortDropdown
  Sidebar (filter, favorites list, watched list)
  MovieList
    MovieCard (one per movie)
  MovieModal (only when a movie is selected)
  Footer
```

| Component | Responsibility | Renders | Props | State? |
|---|---|---|---|---|
| App | Top-level container. Owns most state. Wires everything up. | All other top-level components, plus the modal when a movie is selected. | none | yes (most of it) |
| Header | Sticky brand bar. Clicking the brand resets to Now Playing. | logo image, "Flixster" text, button wrapper | onHomeClick | no |
| Footer | Copyright line and TMDb attribution (TMDb requires this when you use their data). | text, link to themoviedb.org | none | no |
| SearchBar | Controlled input plus submit and clear. | form, label, input, search and clear buttons | query, onQueryChange, onSubmit, onClear | no (input value is lifted) |
| SortDropdown | Sort selector. Three options: top rated, title, newest. | label, native select | value, onChange | no |
| Sidebar | Filter (all / favorites / watched) plus saved-list panels. On mobile it collapses to a horizontal pill row and the lists are hidden. | filter buttons with counts, two title lists | filter, onFilterChange, favorites, watched, movieIndex, onMovieClick | no |
| MovieList | The grid plus skeleton, empty state, error state, and the Load More button. | grid of MovieCards or skeletons | movies, onCardClick, onLoadMore, canLoadMore, isLoading, isLoadingMore, error, emptyMessage, favorites, watched, onToggleFavorite, onToggleWatched | no |
| MovieCard | Single poster card. Hover overlay reveals favorite and watched toggles. Whole card is keyboard-activatable. | poster image, rating chip, watched pill (when watched), action buttons, title, year | movie, onClick, isFavorite, isWatched, onToggleFavorite, onToggleWatched | no (memoized) |
| MovieModal | Detail overlay. Self-fetches `/movie/{id}` and the AI take. Traps focus, restores it on close, locks body scroll, closes on Escape, X button, or backdrop click. | backdrop image, title, meta (date, runtime, rating), genre chips, overview, trailer iframe (if available), AI take section | movieId, onClose | yes (details, loadingDetails, error, aiInsight, loadingInsight) |

Tiny helper modules:
- `Icons.jsx`: a small set of inline SVG icons (Search, Close, Star, Heart, Eye, Check, Film, Sparkles, Clock, Calendar, ChevronDown). I wanted to avoid an icon library, and the skill I used for styling told me not to use emoji as UI.
- `api/tmdb.js`: fetch wrappers for Now Playing, search, and details. Also `findYouTubeTrailerKey` to pick the best video.
- `api/openrouter.js`: the AI insight call plus a fallback string and a module-level cache by movie id.

## 2. API Contracts

### TMDb base
- Base URL: `https://api.themoviedb.org/3`
- Auth: `Authorization: Bearer ${VITE_API_READ_ACCESS_TOKEN}` header. Falls back to `?api_key=${VITE_API_KEY}` if the read token isn't set.
- Image bases:
  - cards: `https://image.tmdb.org/t/p/w342${poster_path}`
  - modal poster fallback: `https://image.tmdb.org/t/p/w500${poster_path}`
  - modal backdrop: `https://image.tmdb.org/t/p/w1280${backdrop_path}`
- Defaults sent on every request: `language=en-US`.

### 2.1 Now Playing
- `GET /movie/now_playing`
- Params: `language`, `page` (1+).
- Used fields: `results[].id`, `results[].title`, `results[].poster_path`, `results[].vote_average`, `results[].release_date`, `page`, `total_pages`.
- Errors I handle: any non-2xx surfaces a "Could not load movies" banner. The list keeps whatever was already loaded so a Load More failure does not blow away page 1.

### 2.2 Search
- `GET /search/movie`
- Params: `query` (required, URL-encoded), `language`, `page`, `include_adult=false`.
- Same response shape as Now Playing.
- Errors: same as Now Playing. Empty query is no-op'd in two places (the SearchBar form and `handleSearchSubmit`).

### 2.3 Movie Details
- `GET /movie/{movie_id}` with `append_to_response=videos` so I get details and trailers in one call.
- Used fields: `id`, `title`, `tagline`, `release_date`, `runtime`, `genres[].name`, `overview`, `backdrop_path`, `poster_path`, `vote_average`, `videos.results[]` (filtered to YouTube).
- Errors: a friendly "Could not load this movie" panel with the status code, instead of a broken modal.

### 2.4 OpenRouter (AI take)
- `POST https://openrouter.ai/api/v1/chat/completions`
- Auth: `Authorization: Bearer ${VITE_OPENROUTER_API_KEY}` header.
- Body: `{ model, messages: [{role: 'system', ...}, {role: 'user', ...}] }`.
- Model: `openrouter/free` (the Free Models Router that picks an available free model per request, so I don't get stuck on one provider's rate limit).
- Used field: `choices[0].message.content`.
- Any non-2xx, network error, or parse failure returns the fallback string. The function never throws to the caller.

## 3. State Architecture

| Variable | Type | Initial | Owner | Update trigger |
|---|---|---|---|---|
| movies | Movie[] | [] | App | After each list fetch resolves; appended on Load More with id-dedupe. |
| mode | 'now_playing' \| 'search' | 'now_playing' | App | Flips on submit / clear / Now Playing click. |
| queryInput | string | '' | App | onChange of the SearchBar input. The live value. |
| activeQuery | string | '' | App | Set to `queryInput.trim()` on submit. The query the displayed results correspond to. |
| page | number | 1 | App | Set to the page that just loaded successfully (so a failed Load More retries the same page). |
| totalPages | number | 1 | App | Set from each list response. Drives Load More visibility. |
| sortOption | 'vote_average' \| 'title' \| 'release_date' | 'vote_average' | App | onChange of SortDropdown. Sort is applied as a derived `useMemo`, the source array is never mutated. |
| selectedMovieId | number \| null | null | App | Set on card click (or sidebar item click). Cleared on modal close. |
| isLoading | boolean | false | App | True around the first-page list fetch. Drives the skeleton. |
| isLoadingMore | boolean | false | App | True around Load More fetch. Disables the button. |
| error | string \| null | null | App | Set on fetch failure. Shows a banner and (for first-page failure) hides the grid. |
| favorites | Set\<number\> | new Set() | App | Toggled by the heart on a card. Resets on reload (per spec). |
| watched | Set\<number\> | new Set() | App | Toggled by the eye on a card. Resets on reload. |
| filter | 'all' \| 'favorites' \| 'watched' | 'all' | App | Sidebar filter button. |
| seenMovies | Map\<number, Movie\> | new Map() | App | Accumulates every movie seen this session, so the sidebar's saved lists keep working after a search switches the visible list. Resets on reload. |
| details | MovieDetails \| null | null | MovieModal | Set when `/movie/{id}` resolves. |
| loadingDetails | boolean | false | MovieModal | True around the details fetch. |
| error (modal) | string \| null | null | MovieModal | Set on details fetch failure. |
| aiInsight | string \| null | null | MovieModal | Set when the OpenRouter call resolves. Cached per movie id (skipping fallback strings so a transient failure can be retried). |
| loadingInsight | boolean | false | MovieModal | True while the AI call is in flight. |

## 4. Data Flow

1. App mounts. A `useEffect` calls `fetchNowPlaying(1)` through `loadPage`. Results land in `movies` and populate `seenMovies`. `total_pages` lands in `totalPages`.
2. Render: `App` derives `filteredMovies` (by `filter`) and then `sortedMovies` via `useMemo`. Both are pure derivations off `movies`. The grid renders from `sortedMovies`. `MovieCard` is wrapped in `React.memo` so unrelated state changes (typing in the search input) don't re-render every card.
3. Load More: `App` calls `loadPage` with `pageToLoad: page + 1` and `append: true`. Results are deduped by id and concatenated. `setPage(pageToLoad)` only runs after success, so a failed Load More doesn't skip a page.
4. Search: the SearchBar input is controlled by `queryInput`. On submit, `App` sets `mode='search'`, `activeQuery=trimmed`, and reloads from page 1. Clearing the input or clicking the brand resets back to Now Playing.
5. Card click: `MovieCard.onClick` fires `setSelectedMovieId(movie.id)`. `MovieModal` mounts with that id (and a `key={selectedMovieId}` so it remounts cleanly when switching between movies via the sidebar).
6. Modal: a first effect (keyed on `movieId`) fetches `/movie/{id}?append_to_response=videos`. A second effect (keyed on the primitive details fields, not the object reference) checks the `insightCache` and either uses the cached take or calls `getMovieInsight`. A third effect manages focus trap, body scroll lock, and focus restore.
7. Modal close: `onClose` sets `selectedMovieId=null`. Modal unmounts. Local state goes with it.
8. Sidebar item click: same as a card click but the id might not be in the current `movies` list. That's fine because `MovieModal` self-fetches details from TMDb and `seenMovies` is just for the sidebar to know the title.

No transformation is needed between TMDb's response shape and `MovieCard`'s props. The card reads `id`, `title`, `poster_path`, `vote_average`, `release_date` straight off the API object.

## 5. AI Feature Spec

### Prompt spec

- Role: a film critic.
- Task: write a 2 to 3 sentence "watch recommendation" that tells the reader who the movie is for and what kind of evening it fits.
- Inputs (sent in the user message): movie `title`, `genres` joined as a comma-separated string, `overview`.
- Output format: plain prose, 2 to 3 sentences, second person, no markdown, no bullets, no headings.
- Constraints: no spoilers past the overview, no filler phrases like "must-see" or "instant classic" or "you won't want to miss it".
- Failure behavior: any error returns a single fallback string ("Could not generate a take this time. Try opening the movie again in a moment.") which is rendered through the same code path as a successful response, so the modal never has a half-loaded state.

### Endpoint and model
- `POST https://openrouter.ai/api/v1/chat/completions`
- Model: `openrouter/free` (the Free Models Router. I started with `meta-llama/llama-3.3-70b-instruct:free` as the assignment suggested, hit a 429 immediately, and switched to the router).
- Key: `import.meta.env.VITE_OPENROUTER_API_KEY`.

### State and trigger

- `aiInsight: string | null` and `loadingInsight: boolean`, both owned by `MovieModal`.
- The AI call fires from a `useEffect` that depends on the primitive details fields (id, title, genres, overview), not the whole `details` object. That stops the call from re-firing when the object identity changes but the contents don't.
- The successful response is cached in a module-level `Map` keyed by movie id. The fallback string is intentionally not cached so a transient OpenRouter failure can recover on the next open.

### Display

- A labeled "AI take" section in the modal, below the overview and trailer.
- While loading, three skeleton lines shimmer in place. The user does not see a spinner or a loading string.
- When the response arrives, it renders as a `<p>` inside an accent-bordered card.
- On failure the same `<p>` shows the fallback string.

### Decisions log

- **First responses, before any prompt tuning.** Output mostly fit the spec but kept landing on phrases like "must-see for fans of...". Added the "no filler phrases" constraint with three explicit examples. That fixed it on the next try.
- **Rate-limit pivot.** First test against `meta-llama/llama-3.3-70b-instruct:free` returned a 429 from the upstream provider (Venice) almost immediately. The assignment also lists `google/gemma-3-27b-it:free` as an alternative. I went one step further and used `openrouter/free`, which is OpenRouter's Free Models Router. It picks an available free model per request, so I'm not stuck on any one provider. Confirmed live: first response after the swap came back from `nvidia/nemotron-3-super-120b-a12b:free`, then later from `nvidia/nemotron-nano-9b-v2:free`. The trade-off is non-determinism in which model I get, which doesn't matter for a soft feature like this.
- **Cache choice.** Originally the AI fetch fired every time the modal opened a movie. That wasted requests on the same movie. Added a module-level `Map` keyed by id. The first fix cached everything including the fallback string, which meant a transient failure became permanent (the user saw the fallback every time they reopened). Fixed by skipping the cache write when the response equals the fallback string.
- **useEffect deps.** Originally the effect depended on the whole `details` object. TMDb returns a fresh object every fetch, so the effect kept re-firing for the same movie. Switched to depending on the primitive fields. The cache covers the same-movie repeat case, so the only thing that should re-fire is genuinely-different content.
- **Defensive prompt assembly.** TMDb sometimes returns null for `overview` or an empty `genres` array. I substitute "No overview available." and "Unspecified" so the user message stays well-formed. The model handles those gracefully (it just gives a more generic recommendation) instead of returning something weird.
- **What I learned.** Free-tier model endpoints fail per provider, so naming a single model is a single point of failure. The Free Models Router is the cleanest fix. On the React side, the cleanest pattern for the chained details-then-AI fetch was two separate effects, each with its own `cancelled` flag. Trying to chain them in one effect made cancellation messy.

## 6. Responsive notes

- Mobile (<480px): two-column grid. Sidebar collapses to a horizontal pill row at the top; the saved-lists are hidden until the viewport is wide enough to show them next to the grid.
- Small (480 to 599px): auto-fill grid at minmax(150px, 1fr).
- Tablet (600 to 1023px): auto-fill grid at minmax(170px, 1fr). Sidebar still collapsed.
- Desktop (1024+): auto-fill grid at minmax(190px, 1fr). Sidebar reappears as a 260px left rail, sticky under the header.
- Modal: max-width 800px on desktop, near-full-bleed on mobile, internal scroll up to 92vh.
- Header height is tokenized (`--header-height: 77px`) and the sidebar's sticky top derives from it.

## 7. Accessibility notes

- Skip-to-content link at the top of the page (visible on focus).
- One `<h1>` (visually hidden), then `<h2>` for page heading and modal title, `<h3>` for card titles and modal sections.
- Every interactive has a visible focus ring on `:focus-visible`. Touch targets are 44x44 minimum.
- Modal has `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, real focus trap (Tab and Shift+Tab cycle inside), Escape closes, and focus restores to the previously focused element on close.
- All images have descriptive alt text. The header logo has empty alt because the adjacent text already names it.
- Live regions: `role="alert"` on errors, `aria-busy` on loading.
- Reduced-motion: a global media rule kills shimmer, fade, and hover transforms when the user has it enabled.
- Color-not-only: favorites and watched both change color and icon shape.
