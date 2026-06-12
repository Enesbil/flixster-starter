const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export const SearchIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const StarIcon = ({ filled = false, ...props }) => (
  <svg
    {...baseProps}
    {...props}
    fill={filled ? 'currentColor' : 'none'}
  >
    <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.08 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
)

export const HeartIcon = ({ filled = false, ...props }) => (
  <svg
    {...baseProps}
    {...props}
    fill={filled ? 'currentColor' : 'none'}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

export const CheckIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const EyeIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const FilmIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 3v18M17 3v18M3 7h4M3 12h4M3 17h4M17 7h4M17 12h4M17 17h4" />
  </svg>
)

export const SparklesIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3 13.5 9.5 20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3z" />
    <path d="M19 17v4M17 19h4M5 4v4M3 6h4" />
  </svg>
)

export const ClockIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const CalendarIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
)

export const ChevronDownIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
