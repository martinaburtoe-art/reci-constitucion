<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Leaflet map lives in src/components/PointsMap.tsx and is loaded via React.lazy behind ClientOnly; shared types/constants (APP_NAME, map center) live in src/lib/app.ts — keeps leaflet out of SSR.
- Community features use owner-scoped tables and an opt-in ranking RPC that returns aliases only, to avoid publishing account identities.
- Direct inserts into recycling logs and items are revoked; recycling deposits use the transactional record_recycling RPC with an owner/client idempotency key; offline entries are local and sync only for their owner, to prevent partial records and duplicate rewards.
- GPS and catalog corrections are proposals reviewed through an authorized RPC, to separate untrusted submissions from verified point data.
- AI photo analysis uses an authenticated streaming server route with server-only credentials and browser cancellation, to protect access and keep long calls alive.
- PWA caches only public static assets and uses an offline fallback, never private data responses; calendar reminders use ICS exports and opt-in Web Push delivered by an authenticated managed schedule.

- Web Push keys are generated with Web Crypto and stored in service-only tables; only the public key reaches the browser.
- Offline service workers are generated with vite-plugin-pwa and registered only outside development, preview, iframe, and kill-switch contexts to avoid stale previews.
