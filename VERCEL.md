# Separate Vercel deployment

The same three pages can run on Vercel without replacing Lovable hosting. Vercel reads public counts directly from BriBooks and streams chat through the published Lovable analyst. Its credentials, scheduled refresh, question storage, and AI billing stay on Lovable. Chat depends on the published Lovable site remaining available; this is not a second independent backend.

## Deploy

### Uploaded failure on October 23

The failed deployment used the older `shubhangmishra-net/shubhbooks` repository contents: its generated connection file is truncated, and it does not contain `vercel.json`. The current Lovable copy has an intact generated connection file and the separate Vercel settings. Adding a closing brace to the old file alone is not sufficient: its fetch helper also contains misplaced code and an invalid placeholder connection.

Replace the old repository source with the current complete codebase, including the Vercel configuration and lockfile. Keep generated connection files intact. In Vercel, use **Other**, clear conflicting build/install overrides, or set Build Command to `bunx vite build --config vite.vercel.config.ts`, Install Command to `sh scripts/vercel-install.sh` (it switches package downloads from the Lovable sandbox cache, which returns 429 to Vercel, to the public npm registry), and Output Directory to `.vercel/output`. Redeploy the newest commit rather than the failed old snapshot.

1. Import a repository containing this prepared code into Vercel, or deploy this folder with the Vercel CLI. An older repository copy will not include these changes.
2. Select **Other** as the framework. `vercel.json` provides the install/build commands and Nitro Build Output API output directory.
3. Retain the existing public `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` build settings. The project's `.env` contains only public configuration and server equivalents. Do not export managed secrets, private keys, or database passwords.
4. Vercel automatically supplies `VERCEL=1` in deployed functions, selecting direct counts and the chat proxy.
5. Enable **Web Analytics** in the Vercel project; its tracking component is included only in the Vercel build. Existing Lovable GA4 is not reused. Optionally configure `GOOGLE_ANALYTICS_MEASUREMENT_ID` with a separate GA4 stream/property.
6. Test `/`, `/book-views`, `/promo`, a counts question, and a follow-up. Verify the QR opens the Vercel address.

Vercel Hobby is restricted to personal/non-commercial use. This site promotes books for purchase; review Vercel's plan terms and arrange a suitable plan before deploying. No paid subscription has been purchased.

## Operations

- The API proxy contacts a fixed published hostname, forwards no cookies or bearer credentials, and preserves streaming and error statuses.
- Before a Vercel chat request, the existing public-key-protected refresh updates Lovable snapshots. Refresh errors prevent a misleading stale answer.
- No duplicate scheduler or managed credentials are needed on Vercel.
- Vercel promo links and QR codes use its own origin.
- Existing sitemap and robots declarations intentionally remain on the original Lovable hostname. Configure Vercel-specific search URLs after choosing a stable Vercel address.
- Default Lovable publishing continues using `vite.config.ts`; only Vercel selects `vite.vercel.config.ts`.
- Deployment is pending Vercel account access. No Vercel build or hosted check has been performed yet.