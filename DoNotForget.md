# Do not forget

## Auth / login (production)

- **Never show demo account credentials on the login page** (or any public auth screen). Demo emails, passwords, and `npm run db:seed` hints are for local development only — keep them in README or internal docs, not in the UI.
- Auth layout must **not** use the `learner-canvas` class on the sign-in form column. Its fixed `::before` / `::after` layers cover the full viewport and break panel contrast.
- Auth pages use a **plain white** background (no cream tint, dot grid, or warm gradients on the welcome or form columns). Copy uses **navy / gray** text and the **light** logo theme (`theme="light"`).
