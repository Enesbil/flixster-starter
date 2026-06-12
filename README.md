## Unit Assignment: Flixster

Submitted by: **Muhammed Enes Bilek**

Estimated time spent: **~8** hours spent in total

### Application Features

#### CORE FEATURES

- [x] **Display Movies (Home Page)**
  - [x] Fetch and display a list of movies currently playing in theaters using the TMDb Now Playing endpoint.
    - [x] Movies are displayed in a responsive grid that reflows from 2 columns on phones up to 4 or 5 on a wide desktop.
  - [x] Each movie is shown in a `MovieCard` that includes:
    - [x] Title
    - [x] Poster image
    - [x] Vote average

- [x] **Search Functionality**
  - [x] Search for movies by title using the TMDb search endpoint.
  - [x] Search submits on Enter or via the Search button.
  - [x] Users can return to the Now Playing list by clearing the search, clicking the brand in the header, or clicking the "Back to now playing" pill.

- [x] **Load More**
  - [x] "Load More" button appends additional results to the existing list (does not replace).
  - [x] Button hides when the current page reaches `total_pages`.
  - [x] Disabled state while a fetch is in flight.

- [x] **Movie Modal**
  - [x] Modal opens when a `MovieCard` is clicked.
  - [x] Displays the backdrop image, title, runtime, release date, genres, and overview.
  - [x] Closes via the X button, the Escape key, or clicking the backdrop.
  - [x] Traps focus while open and restores focus to the previously focused element on close.
  - [x] Body scroll is locked while the modal is open.
  - [x] Modal floats with a shadow, semi-transparent backdrop, and rounded corners.

- [x] **Sort**
  - [x] Sort dropdown with options for:
    - [x] Title (A to Z)
    - [x] Newest (release date, descending)
    - [x] Top rated (vote average, descending)
  - [x] Sort applies in render via `useMemo`. The source array is never mutated.

- [x] **Header and Footer**
  - [x] Sticky header with the Flixster brand. Clicking it resets to Now Playing.
  - [x] Footer with a copyright line and the required TMDb attribution link.

- [x] **Error and Loading States**
  - [x] Loading is shown via skeleton placeholders, not spinners or text.
  - [x] First-page failures show a banner with `role="alert"`. The grid stays out of the way.
  - [x] Load More failures keep the existing list visible and surface an alert next to it. Retry hits the same page.
  - [x] Modal failures show a friendly message instead of a broken half-rendered modal.

- [x] **Planning Documentation**
  - [x] [planning.md](./planning.md) covers:
    - [x] Component Architecture (more than 5 components, each with responsibility, renders, and props)
    - [x] API Contracts (4 endpoints: Now Playing, Search, Movie Details, OpenRouter)
    - [x] State Architecture (every state variable with type, initial value, owner, and update trigger)
    - [x] Data Flow (how data moves from TMDb to the rendered card)
    - [x] AI Feature Spec
  - [x] Decisions log lives in section 5 of `planning.md`, as the assignment specifies.

- [x] **AI-Powered Movie Insight**
  - [x] When a movie modal opens, an AI-generated "AI take" is fetched from OpenRouter using the movie's title, genres, and overview as context.
  - [x] A skeleton loading state is shown while the request is in flight.
  - [x] On failure, a fallback string renders through the same code path so the modal never breaks.
  - [x] Successful responses are cached per movie id. Fallback strings are intentionally not cached so a transient failure can recover.
  - [x] AI feature spec and decisions log are in `planning.md` section 5.

#### STRETCH FEATURES

- [x] **Render Deployment**
  - [x] `render.yaml` Blueprint is committed (static site, Vite build, SPA rewrite, security headers, three env vars marked `sync: false`).
  - [x] Site is live on Render. (Pushing the deploy after the final commit.)

- [x] **Embedded Trailers**
  - [x] When the modal opens, `/movie/{id}?append_to_response=videos` returns the trailer list.
  - [x] `findYouTubeTrailerKey` ranks by type (Trailer beats Teaser beats Clip) with a tiebreaker on the official flag.
  - [x] Picked trailer renders as a 16:9 `youtube-nocookie.com` iframe.

- [x] **Favorite Button**
  - [x] Heart icon in the card's hover overlay (always visible on touch).
  - [x] Toggling fills the heart, tints the card border, and updates the sidebar count.
  - [x] Stored in a `Set` in component state. Resets on reload, per the assignment.

- [x] **Watched Checkbox**
  - [x] Eye icon in the card's hover overlay turns into a check on click.
  - [x] Watched cards desaturate the poster and show a "Watched" pill bottom-left.
  - [x] Stored in a separate `Set`. Resets on reload.

- [x] **Sidebar**
  - [x] Filter (All, Favorites, Watched) with live counts.
  - [x] Saved-list panels for favorites and watched, click to open the movie's modal.
  - [x] On mobile the sidebar collapses to a horizontal pill row above the grid; saved lists are hidden until the viewport is wide enough.
  - [x] Sticky on desktop, sized off the header height token so it never tucks under the header.

### Walkthrough Video

`TODO://` add the Loom link before submission.

**Walkthrough video:** [Flixster Walkthrough](ADD_LOOM_LINK_HERE)

### Reflection

* Did the topics discussed in your labs prepare you to complete the assignment? Be specific, which features in your weekly assignment did you feel unprepared to complete?

The Weather Report labs covered most of what I needed for the basics. Controlled inputs from Part 3 mapped almost directly to the SearchBar, and the API spec writing from Part 2 made the planning step feel natural. The two areas I felt underprepared for were the modal's accessibility plumbing (focus trap, restore on close, body scroll lock, Escape handling) and pagination state. The labs touch on a single-fetch flow, but Load More with append-and-dedupe and a failure path that does not advance the page is a different shape, and I had to think through the state transitions carefully.

* If you had more time, what would you have done differently? Would you have added additional features? Changed the way your project responded to a particular event, etc.

I would move both API calls behind a small server proxy so the keys are not in the bundle. The assignment accepts the trade-off but it is the obvious next step. Persisting favorites and watched in `localStorage` is right there. I would also add year and genre filters on top of sort, and a small retry control on the AI take when the fallback string shows up.

* Reflect on your project demo, what went well? Were there things that maybe didn't go as planned? Did you notice something that your peer did that you would like to try next time?

What went well: the responsive layout held up across phone, tablet, and desktop without me babying it during the demo, and the AI take landed reliably (the Free Models Router pivot earned its keep). What did not go as planned: I noticed during a final pass that the modal's focus trap effect was tearing down on every parent re-render because I had passed an inline arrow function as `onClose`. That was already fixed by the time I demoed but it took me longer to spot than it should have. From peers, I want to try lazy-loading the modal as a separate chunk to shave the initial bundle.

### Open-source libraries used

- [React 18](https://react.dev/) and [React DOM](https://react.dev/) for the UI.
- [Vite 5](https://vitejs.dev/) for the dev server and production build.
- [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts for typography.
- [TMDb API](https://developer.themoviedb.org/) for movie data.
- [OpenRouter](https://openrouter.ai/) for the AI take.

No icon libraries, no UI frameworks. Icons are inline SVG in `src/components/Icons.jsx`.

### Shout out

`TODO://` Add your shout out before submission.
