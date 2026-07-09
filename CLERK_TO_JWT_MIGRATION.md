# Migrating from Clerk to Custom JWT Auth

> Status: **Planned, not started.** Captured 2026-06-18 for future work.
> Decision made: keep existing user passwords working by importing Clerk's
> password hashes (Option 1 below).

## Why this is non-trivial

The hard part is **not** the ~165 `auth()` call sites. It's that **Clerk is
currently the entire user database**:

- There is **no `User` model** in `prisma/schema.prisma`.
- Every table that references a person stores the **Clerk user ID**
  (`user_2abc…`) as a plain string. ~287 references across:
  - `Course.userId`
  - `Purchase.userId`
  - `UserProgress.userId`
  - `StripeCustomer.userId`
- Email, name, and passwords live **only in Clerk**.
- The teacher dashboard fetches the roster live from
  `clerkClient().users.getUserList()` (`actions/getStudents.ts`).

## The key insight that makes it manageable

**Reuse the existing Clerk user IDs as the new primary keys.**

If the new `User.id` equals the old `user_2abc…` string, then every existing
`Purchase`, `UserProgress`, and `StripeCustomer` row stays valid with **zero
data migration**. This turns a scary relational migration into a contained
auth-layer swap.

## Current Clerk integration points (what has to change)

| Area | Current | Files / notes |
|------|---------|---------------|
| Server auth | `auth()` from `@clerk/nextjs/server` (~165 uses) | replace with a `getAuth()` shim returning the **same `{ userId }` shape** |
| Client auth | `useUser`, `useAuth` (~4 uses) | replace with custom hook / context |
| Provider | `ClerkProvider` (`app/layout.tsx`) | replace with own session provider |
| Middleware | `clerkMiddleware` + `createRouteMatcher` (`middleware.ts`) | replace with JWT cookie check; keep same public-route list |
| Roster | `clerkClient().users.getUserList()` (`actions/getStudents.ts`) | replace with a DB query on the new `User` table |
| Teacher check | `isTeacher(userId)` (`lib/teacher.ts`) | back with a `role` column instead of hardcoded IDs |
| Mobile | `/api/mobile/*` use `auth()` | issue/verify **bearer JWT** tokens |

Public routes currently in `middleware.ts` (preserve these):
`/sign-in(.*)`, `/test(.*)`, `/api/webhook`, `/courses(.*)`, `/`, `/dashboard`,
`/about-us`, `/masters(.*)`, `/opengraph-image.jpg`, `/api/mobile/home`

## Decision: passwords (Option 1 — chosen)

**Import Clerk's password hashes so logins stay seamless.**

- Request a **password-hash export** from Clerk support. Clerk stores
  passwords as **bcrypt** hashes.
- Import the hashes into the new `User.passwordHash`.
- Verify with a bcrypt-compatible library so existing users keep their current
  password (no forced reset).
- Dependency to be aware of: this requires a Clerk support request and
  (typically) a paid plan. Confirm access before starting.

Alternatives that were considered and rejected for now:
- *Force password reset for all* — simpler, but every user must reset on cutover.
- *Lazy/gradual migration* — most seamless but runs dual auth; most complex.

## Implementation steps (for when we pick this up)

1. **Schema**: add a `User` model.
   - `id` = existing Clerk ID (String, `@id`), `email` (`@unique`), `passwordHash`,
     `name`, `role` (e.g. `STUDENT` / `TEACHER`), timestamps.
   - Run a Prisma migration (no FK changes needed since IDs are reused).
2. **Export users from Clerk**: pull id, email, name via Clerk Backend API;
   request the bcrypt hash export from support; seed the `User` table.
   Map existing teacher IDs to `role = TEACHER`.
3. **Auth helpers** (`lib/auth.ts`):
   - `getAuth()` → `{ userId }` (reads httpOnly cookie OR `Authorization: Bearer`),
     **same shape as Clerk's `auth()`** so call sites change by import only.
   - password hashing/verify (bcrypt), JWT sign/verify (`jose`).
4. **Routes**: `POST /api/auth/sign-in`, `/sign-up`, `/sign-out`.
   - Web: set httpOnly, Secure, SameSite cookie.
   - Mobile: return a bearer JWT in the JSON body.
5. **Middleware**: replace `clerkMiddleware` with a JWT cookie verify; reuse the
   public-route matcher list above.
6. **Client**: replace `ClerkProvider` / `useUser` / `useAuth` with a session
   context + hook.
7. **Sign-in / sign-up pages**: replace
   `app/(auth)/(routes)/sign-in` and `sign-up` Clerk components with custom forms.
8. **Roster**: rewrite `actions/getStudents.ts` to query the `User` table.
9. **Mobile**: confirm every `/api/mobile/*` route reads the bearer token via the
   new `getAuth()`.
10. **Cleanup**: remove `@clerk/nextjs` dependency and Clerk env vars once verified.

## Suggested new dependencies

- `jose` — JWT sign/verify (edge-compatible, works in middleware).
- `bcryptjs` (or `bcrypt`) — to verify imported Clerk hashes and hash new passwords.

## Pre-flight checklist before starting

- [ ] Confirm Clerk plan/support access for the password-hash export.
- [ ] Take a full DB backup.
- [ ] Confirm the exact public-route list is still current.
- [ ] Decide a `JWT_SECRET` / key strategy and add to env.
- [ ] Plan a maintenance window for the cutover (export → seed → deploy).
