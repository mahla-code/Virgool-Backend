# Virgool Clone

A backend for a blogging platform inspired by [Virgool](https://virgool.io), built with NestJS, TypeORM and PostgreSQL. It covers what a real blogging platform needs: phone/email/username login with OTP, writing and reading posts, following other writers, commenting, liking and bookmarking.

I built this as a more advanced follow-up to an earlier, simpler project, focusing on a cleaner module structure, reusable decorators, and a proper migration-based database setup instead of auto-sync.

## What it can do

### Authentication
- Sign in or sign up with a phone number, email, or username — the system figures out which one it got and whether the account already exists.
- OTP verification, with the code sent by real SMS (via Kavenegar).
- Sign in with Google as an alternative to OTP; a new account and profile are created automatically on first login.
- Check whether the current user is logged in.

### User & Profile
- View your own profile, including follower and following counts.
- Create or update your profile (bio, gender, birth date, LinkedIn link), with image upload for both a profile picture and a cover image in the same request.
- Change your email or phone number, each confirmed with its own OTP before it actually takes effect.
- Change your username (no OTP needed).
- Follow or unfollow other users.
- List your followers and the people you follow, paginated.
- Admin-only: block or unblock a user.
- List all users, paginated.

### Blog posts
- Create a post with one or more categories (a category that doesn't exist yet is created automatically) and an auto-generated, unique slug.
- List your own posts.
- List all posts, with pagination, category and text search filters, plus like/bookmark/comment counts for each.
- View a single post by its slug, including its comments and a handful of randomly suggested posts.
- Like and bookmark posts (toggled on and off).
- Edit and delete your own posts.

### Comments
- Comment on a post, with support for replying to another comment.
- Comments need to be accepted before they count toward a post's public comment count.

### Categories
Basic create / update / delete / list for blog categories.

### Images
Uploaded images are tracked as their own database records rather than just files on disk.

## Tech stack

| Area | Technology |
|---|---|
| Framework | NestJS |
| Database | PostgreSQL with TypeORM (migrations, not auto-sync) |
| Authentication | JWT, cookie-parser, Passport (Google OAuth2) |
| Validation | class-validator, class-transformer |
| File uploads | Multer |
| SMS | Kavenegar |
| API documentation | Swagger |

## Getting started

```bash
# install dependencies
npm install

# create your env file and fill it in
cp .env.example .env

# run the database migrations
npm run migration:run

# start the server
npm run start:dev
```

API documentation is available at `/swagger` once the server is running.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Port the server listens on |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection |
| `Cookie_Secret` | Secret used to sign cookies |
| `OTP_Token_Secret` | Secret for the short-lived OTP verification token |
| `Access_Token_Secret` | Secret for signing access tokens |
| `Email_Token_Secret`, `Phone_Token_Secret` | Secrets for the email/phone change verification tokens |
| `SEND_SMS_URL` | Kavenegar endpoint used to send OTP codes |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth2 credentials |

## Project structure

```
src/
├── modules/
│   ├── auth/       # OTP + Google login, tokens, guards
│   ├── user/       # profile, follow, block, change email/phone
│   ├── blog/       # posts, comments, likes, bookmarks
│   ├── category/   # blog categories
│   ├── image/      # uploaded image records
│   └── http/       # Kavenegar SMS integration
├── common/         # shared decorators, guards, enums, utils
├── config/         # TypeORM configuration (runtime and CLI)
└── migrations/     # database migrations
```

## Current limitations

- Google login currently only covers first-time sign-in; linking Google to an account that already exists through phone/email is not handled yet.
- SMS delivery depends on a Kavenegar account being configured; without valid credentials, OTP codes won't actually reach a phone.
- Role-based access is in place (an admin role exists and guards a couple of routes like blocking users), but most routes are only "logged in or not" — finer-grained permission checks per role are still limited.
