---
description: Build and deploy the React frontend. Runs type checks, linting, and production build.
---

Deploy the retail-app React frontend:

1. **Pre-deploy checks**
   - Type check: `npx tsc --noEmit`
   - Lint: `npm run lint`
   - Ensure `.env.production` has correct `VITE_API_URL`

2. **Production build**
   ```bash
   npm run build
   ```

3. **Verify build output**
   - Confirm `dist/` directory is generated
   - Check for any build warnings or errors
   - Preview locally if needed: `npm run preview`

4. **Deploy `dist/` to hosting**
   - Copy `dist/` contents to the web server / CDN
   - Confirm the app loads and can reach the Laravel API at `VITE_API_URL`

Report any type errors, lint failures, or build errors with the exact message and file location.
