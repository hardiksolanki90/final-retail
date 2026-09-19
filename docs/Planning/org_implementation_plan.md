# Registration with Minimal Details & Organisation Creation — Implementation Plan

## Summary

The goal is to streamline the registration flow so that:
1. A new user registers using a **minimal registration form** containing basic user details and organisation name.
2. The backend creates both the **Organisation** and the **User** (assigned as Organisation Admin) in an atomic transaction and establishes the authenticated session.
3. Upon registration, the application automatically **redirects to the organisation page** (`/organisation/view`), displaying live organisation data rather than static mocks.

---

## User Review Required

> [!IMPORTANT]
> **Database Schema Considerations for Minimal Organisation Creation:**
> In `0001_01_01_000000_create_organisations_table.php`, several columns are currently `NOT NULL` without default values:
> - `reg_software_id`, `org_company_id`, `org_street1`, `org_country_id`, `org_phone`, `gstin_number`, `gst_reg_date`.
>
> **Approach:** 
> When creating the organisation during minimal registration:
> - `org_company_id`: Auto-generate a readable company code (e.g. `ORG-` + uppercase 6-char alphanumeric or slugified name).
> - `reg_software_id`: Default to `1`.
> - `org_phone`: Populated from the user's phone/mobile or default empty string.
> - `org_street1`, `gstin_number`, `gst_reg_date`: Set to empty string `''` (or we add a migration making them nullable).
> - `org_country_id`: Default to `1` (or fallback).
> 
> *Full details can be completed later by the user from the Organisation Edit page.*

---

## Architecture & Workflow

```
 ┌────────────────────────────────────────────────────────┐
 │ Frontend: /register                                    │
 │ Form: First Name, Last Name, Email, Mobile (opt),       │
 │       Password, Organization Name                      │
 └──────────────────────────┬─────────────────────────────┘
                            │ POST /api/auth/register
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ Backend: AuthController@register (DB Transaction)     │
 │ 1. Create Organisation (minimal fields + defaults)     │
 │ 2. Create User (linked via organisation_id, usertype 1)│
 │ 3. Authenticate session (Auth::login / Sanctum)        │
 │ 4. Return user + organisation data                     │
 └──────────────────────────┬─────────────────────────────┘
                            │ 201 Created + Auth Session
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ Frontend: AuthContext                                  │
 │ 1. Set user state + organisationComplete flag          │
 │ 2. Redirect to /organisation/view                      │
 └──────────────────────────┬─────────────────────────────┘
                            │ GET /api/organisation/current
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ Frontend: OrganisationView                             │
 │ Displays live organization data (Active, Name, Code)   │
 │ User can click "Edit Details" to complete full profile │
 └────────────────────────────────────────────────────────┘
```

---

## Proposed Changes

### 1. Backend: Authentication & Organisation Creation

#### [NEW] `app/Http/Controllers/Api/AuthController.php`
- `register(RegisterRequest $request)`:
  - Validates `firstname`, `lastname`, `email`, `password`, `mobile` (optional), and `org_name`.
  - Begins DB transaction:
    - Generates unique UUID and `org_company_id` (e.g. `ORG-XXXXXX`).
    - Creates `Organisation` record with `org_name` and safe defaults for non-nullable columns.
    - Creates `User` with `organisation_id = $organisation->id`, `usertype = 1` (Admin), `role_id = 2` (Org Admin), hashed password, and API token.
  - Logs user in (`Auth::login($user)`) to initiate the stateful Sanctum session.
  - Returns `{ user, organisation, message }`.
- `login(LoginRequest $request)`:
  - Standard email/password authentication via `Auth::attempt()`.
- `logout(Request $request)`:
  - Clears session/auth tokens.
- `user(Request $request)`:
  - Returns authenticated user with their loaded `organisation` relationship.

#### [NEW] `app/Http/Requests/RegisterRequest.php`
- Form request validation rules for registration:
  - `firstname`: required, string, max:191
  - `lastname`: required, string, max:191
  - `email`: required, email, max:191, unique:users,email
  - `password`: required, string, min:8, confirmed
  - `mobile`: nullable, string, max:20
  - `org_name`: required, string, max:191

#### [MODIFY] `routes/api.php`
- Add public authentication endpoints:
  - `POST /auth/register` -> `AuthController@register`
  - `POST /auth/login` -> `AuthController@login`
- Add authenticated auth endpoints:
  - `POST /auth/logout` -> `AuthController@logout`
  - `GET /auth/user` -> `AuthController@user`

#### [MODIFY] `app/Repositories/OrganisationRepository.php`
- Add `toResource(Organisation $organisation): array` to format organisation response data cleanly for the frontend.
- Update `current()` to return the shaped resource.

---

### 2. Frontend: Minimal Registration Form & Redirection

#### [MODIFY] `src/pages/Authentication/Register.tsx`
- Simplify registration form to **minimal detail**:
  - Remove redundant `usertype` selection (defaults to Admin on registration).
  - Clean 2-column layout:
    - **Personal Info**: First Name, Last Name, Email, Mobile (optional)
    - **Organization Info**: Organization Name
    - **Security**: Password, Confirm Password
  - Upon successful registration:
    - Call `registerUser` via `useAuth()`.
    - Directly navigate to `/organisation/view` (Organisation Overview).

#### [MODIFY] `src/context/AuthContext.tsx`
- Ensure `applyUser(u)` correctly detects the newly created organisation so `organisationComplete` is handled smoothly without getting stuck in redirection loops.

#### [MODIFY] `src/pages/Organisation/OrganisationView.tsx`
- Replace hardcoded static mock object (`orgData`) with a live fetch:
  - Call `getCurrentOrganisation()` on mount.
  - Display actual organisation name, company ID, status, and contact info.
  - Show a banner or badge suggesting the user to "Complete Profile Details" if street, tax ID, or country are still unconfigured.
  - "Edit Details" button routes to `/organisation/add` (or `/settings/organisation/edit`) to allow updating the full profile.

---

## Verification Plan

### Automated & Unit Tests
- `php artisan test` to verify no regressions in existing migrations and controllers.
- Test endpoint `POST /api/auth/register` with valid and invalid payloads.

### Manual End-to-End Verification
1. **Registration Flow:**
   - Open browser at `http://localhost:10001/register` (or custom host).
   - Fill out minimal details (First Name, Last Name, Email, Password, Org Name).
   - Submit form.
   - Verify that:
     - User account is created in `users` table with `usertype: 1` and associated `organisation_id`.
     - Organisation record is created in `organisations` table with matching `org_name` and generated company ID.
2. **Automatic Redirection:**
   - Verify user is immediately redirected to `/organisation/view`.
3. **Organisation View Validation:**
   - Verify the Organisation View displays the actual `org_name`, company ID, and active status.
   - Verify clicking "Edit Details" loads the edit form pre-populated with current data.
