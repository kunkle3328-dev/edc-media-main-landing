# EDC MEDIA FRONTEND THEME CONTRACT

**EXISTING EDC MEDIA FRONTEND THEME IS AN AUTHORITATIVE SYSTEM.**

Future builds MUST NOT casually:
- replace global CSS
- create duplicate global CSS
- remove root stylesheet imports
- change Tailwind/PostCSS configuration
- replace theme variables
- replace fonts
- change responsive breakpoints
- replace the theme provider
- introduce another styling system
- overwrite the design-token system

unless the requested build explicitly requires a frontend visual-system change.

If a future feature needs new styling:
**EXTEND THE EXISTING THEME.** Do not replace it.

### AUTHORITATIVE GLOBAL STYLES:
`app/globals.css`

### AUTHORITATIVE ROOT LAYOUT:
`app/layout.tsx`

### TAILWIND CONFIG:
NONE (Using Tailwind v4 directly in PostCSS)

### POSTCSS CONFIG:
`postcss.config.mjs`

### THEME PROVIDER:
NONE (CSS Variables defined in `@theme` block of `app/globals.css`)

### DESIGN TOKENS:
`app/globals.css` (Obsidian background, EDC cyan accents)

### FONT CONFIGURATION:
`app/globals.css` (Native stack: -apple-system, BlinkMacSystemFont, "SF Pro Text", etc.)

### RESPONSIVE SYSTEM:
Tailwind standard breakpoints (sm, md, lg, xl, 2xl) configured natively in v4.

### THEME STATUS:
LOCKED
