# Golden Echoes — Claude Context

## What This Is

A static blog (goldenechoes.com) hosted on GitHub Pages. There is no CMS or build step — Claude acts as the posting agent. Posts are written here, committed, and pushed; GitHub Pages deploys automatically from `main`.

## How Posts Work

All posts live in `data/posts.json` as an array of objects. The site reads this file client-side and renders everything in JavaScript (`assets/site.js`). No compilation or bundling needed.

Each post object:

```json
{
  "title": "Essay title",
  "date": "2026-06-14T12:00:00",
  "slug": "essay-title",
  "excerpt": "Two or three sentence summary.",
  "content": "<p>Post HTML.</p>",
  "category": "Leadership",
  "featured": false
}
```

- **slug** must be URL-safe and unique (kebab-case from the title)
- **content** accepts HTML: `<p>`, `<h3>`, `<h4>`, `<ul>`, `<ol>`, `<li>`, `<em>`, `<strong>`, `<blockquote>`
- **excerpt** is shown on cards; should be 2–3 sentences, no HTML
- **featured: true** puts the post in the hero row on the homepage (keep ≤ 4 featured at a time)
- New posts go at the top of the array; the site also sorts by date descending

## Categories

- Leadership
- AI & Technology
- Faith & Theology
- History & Culture
- Policy & Society

Categorization follows keyword matching in `scripts/build-posts-data.mjs` but for hand-written posts, set the category explicitly.

## Publishing Workflow

When asked to write a post:

1. Draft content following the editorial guide (see below)
2. Add the post object to the top of `data/posts.json`
3. Commit: `git commit -m "Add post: <title>"`
4. Push to `origin main` — this triggers GitHub Pages deployment

## Editorial Guide

All posts must follow `/Users/dowellstackpole/Documents/repos/goldenechoes.com/Golden_Echoes_Editorial_Guide_v2.md`.

Key principles:

- **Voice:** Older traveler speaking to someone on the same road — humble, reflective, conversational. Not a sermon, not a lecture.
- **Structure:** Concrete opening → universal question → Scripture as light (not hammer) → return to ordinary life → leave a lens, not an answer.
- **The Golden Echo Test:** Every essay needs at least one sentence that follows the reader home. End sections with an echo, not a conclusion. The ending opens a window; it does not close an argument.
- **Personal stories** are windows, not destinations. Pivot quickly from "I" to "you" or "we."
- **Assume the reader is intelligent.** Do not over-explain. Discovery changes people more than instruction.

Before finalizing any post, ask:
1. What sentence will still be with the reader next Tuesday?
2. Where does the essay become *the reader's* story?
3. What question will the reader carry away?

## Local Preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Scripts (for WordPress import only)

```bash
node scripts/import-wordpress.mjs     # fetch from WP REST API → data/wordpress-posts.json
node scripts/build-posts-data.mjs     # transform → data/posts.json
```

These are only needed if re-importing from the old WordPress site. New posts go directly into `data/posts.json`.
