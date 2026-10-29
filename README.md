# Crypt Hopper — Monster Mash

A fang-filled, single-player arcade game made for the October Jam theme **Monster
Mash**: build something with fangs, claws, or way too many eyes. Guide a purple,
three-eyed crypt critter through the gaps between haunted gates. Anonymous
visitors can play instantly; Freebuff users can put their best escape on the
shared leaderboard. The monster, eye-covered gates, moonlit hills, and effects are
code-native canvas artwork; fonts are bundled locally, so there are no external
image or font requests.

## Run

```sh
bun install
bun run dev
```

Open the printed loopback URL. Space, arrow up, a pointer click or a touch flaps
your monster between haunted gates; Escape or P pauses. Leaving the tab pauses
automatically. Resume counts down before restoring the exact simulation state.
The floating golden eye in each gate is an optional collectible; the HUD tracks
them separately from gates cleared. Sound is opt-in, and fullscreen is shown
only where supported. The layout fills
the viewport without page scrolling; only a long leaderboard scrolls inside its
dialog.

```sh
bun run typecheck
bun test tests
bun run build
```

Use the repository's pinned Bun when working inside the monorepo. This project is
standalone, with its own lockfile; it does not import other repo packages.

Crypt Hopper adapts the existing arcade starter's fixed-step runner and
score-verification pattern with new monster artwork, haunted gates, and
collectible eyes made for the jam.

## Optional Freebuff sign-in

Read `node_modules/@freebuff/auth/AGENTS.md`. Register a new project and use its
own client, never another template's registration. In Freebuff Sites, provision
auth with `sites_enable_auth`; deployment injects the existing public bindings
`FREEBUFF_CLIENT_ID`, `FREEBUFF_ISSUER`, and `APP_ORIGIN`. No auth secret is needed.
The SDK runs before the SPA and owns `/auth/freebuff/*`.

For standalone hosting, register with the creator's Freebuff CLI login:

```sh
bunx @freebuff/auth register --project your-crypt-hopper --name "Crypt Hopper" \\
  --environment production \\
  --redirect-uri https://your-site.example/auth/freebuff/callback
```

Use a separate development client for loopback, following `.env.example`. For
the local Vite preview, register the app's loopback origin and use only its
development client values; never put the hosted preview's production-origin
binding in a local env file. `APP_ORIGIN` must be the configured canonical origin, never an arbitrary request
host. Missing auth configuration leaves the game anonymous and hides sign-in;
it never creates a fake signed-in development identity. The Worker rejects
anonymous score writes regardless of client UI.

Signing in applies to subsequent flights. Anonymous scores remain a personal
best on that device; they are not retroactively uploaded. The public board
contains the top 20 personal bests and display names, never emails or account IDs.
A zero-score completed flight is valid. Ties retain their original achievement
order. A signed-in player's failed save exposes a retry action on the result.

## Storage and score verification

Provision Cloudflare D1 as `DB`. Local Vite/workerd creates a local database using
`wrangler.jsonc`; deployed bindings come from Freebuff Sites. The Worker creates
its SQLite schema on first API use.

- `leaderboard`: one best gate-clear score per verified `user.sub`; collectible
eyes are tracked during replay but do not replace the gate-clear score.
- `runs`: random course seed, owning user, start time, and consumption time.
- A signed-in flight obtains its seed from the Worker. It submits only the run ID,
  fixed-step duration, and flap ticks. The Worker replays the shared simulation;
  it does not trust a claimed score, user ID, or name.
- Runs expire after 30 minutes, allowing pauses. Old runs are cleaned in bounded
  batches. Rapid starts, oversized bodies, invalid flap timing, unfinished replays,
  and runs faster than wall-clock time are refused.
- The single-use update and best-score upsert run in one D1 transaction. Retries
  are idempotent, and a lower score cannot overwrite a higher score.
- Authenticated mutations require a same-origin request. Personalized responses
  are private and uncached. No credentials enter the browser's storage.

Replay verification is a casual-game integrity check, not bot prevention: a
skilled script can produce a valid run. Missing storage or a connection failure
does not stop anonymous play. A signed-in player whose run could not be
registered gets a clearly identified practice run.

## Customize

- `src/game/render.ts`: monster, fang-lined gates, moonlit sky, clouds, hills,
  terrain and particles. All artwork is code-native and resolution independent.
- `src/game/physics.ts`: deterministic 120 Hz physics, seed generator, collision
  geometry, course spacing, collectible eyes and replay validation. Rendering and
  viewport size do not change collision coordinates or scoring. A flight is
  capped at six minutes.
- `src/main.ts`: UI states, controls, local best, auth status and leaderboard.
- `src/style.css`: typography, colors, layout, and responsive breakpoints.
- `src/game/sound.ts`: short synthesized sounds; no audio downloads.
- `src/worker/index.ts`: auth wrapper, API, D1 schema and score persistence.

Changing physics changes replay verification too, so let in-progress runs finish
before deploying a physics revision if preserving their verified scores matters.

## Build and deployment

`deploy.json` points to the built Worker and static assets for Freebuff Sites.
The preview uses its own D1 database and Freebuff sign-in; Sites injects the
public auth bindings when deploying. `wrangler.jsonc` keeps a local-only D1
placeholder. `freebuff-site.json` records the Sites project and preview target.
The jam build adds collectible crypt eyes to the deterministic simulation and
replay verification alongside its monster artwork and haunted theme.

Tests cover the deterministic simulation, collision boundaries, eye collection,
replay validation, anonymous access, account isolation, cross-origin refusal,
rate limiting, expired runs, duplicate submissions, and best-score preservation
using in-memory SQLite behind the D1 interface. Live sign-in and sign-out still
need browser verification against the published preview.
