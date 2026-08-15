---
description: Bootstrap the React frontend development environment from scratch.
---

Bootstrap the retail-app React frontend:

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_URL` to the Laravel backend URL (e.g. `http://localhost/api`).

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Verify**
   - App loads at `http://localhost:5173`
   - Login works and the API returns data
   - No TypeScript or lint errors: `npx tsc --noEmit && npm run lint`

Report any step that fails with the exact error message.
