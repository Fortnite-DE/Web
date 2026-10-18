# FortniteDE Web

Minimal Next.js App Router setup with TypeScript, Tailwind CSS, ESLint, and Prettier. Bun is the package manager.

## Setup

Use Node.js 22+ and Bun 1.3.14.

```sh
bun install --frozen-lockfile
bun run dev
```

## Pages

- `/`: community landing page.
- `/leaderboard`: live level leaderboard with automatic loading on scroll.
- `/leaderboard?userId=1011724476754448456`: opens at the top with the personal placement card. Clicking the card loads the user's ranking page directly and smoothly centers their highlighted row. Earlier and later pages load automatically when scrolling toward either end, preserving the current viewport. Level rings show progress to the next level on hover or keyboard focus.
- `/verify/success` and `/verify/error`: animated verification results, with troubleshooting on the error page. Reduced-motion preferences are respected.

The same-origin `/api/leaderboard` route reads the public `auth.fn-discord.de` API for guild `398567824471097345`. It validates responses, applies request timeouts, and avoids browser CORS dependencies. No API credentials are required. At most six pages (300 rows) are kept in the browser.

The font, logo, Fortnite artwork, and decorative shapes come from the existing fn-discord.de site.

## Checks

```sh
bun run typecheck
bun run lint
bun run format:check
bun run test
```

`bun run typecheck` generates Next.js route types before checking TypeScript. GitHub Actions runs all four checks on pushes and pull requests.

Run `bun run format` to format files. Production commands are `bun run build` and `bun run start`.

Legacy URLs `/leaderboard-beta`, `/verify-error`, and `/verify-success` redirect to their new routes, preserving query parameters.
