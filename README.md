# Golden Echoes Static Site

A small static blog that can be hosted for free on GitHub Pages. The homepage shows imported WordPress posts from Golden Echoes.

## Previous Blog Posts

Imported WordPress posts are shown on the homepage. The archive reads from `data/wordpress-posts.json`, and individual posts open with URLs like:

```text
/?post=leaders-walk-to-you
```

## Optional Status Updates

The original status page is still available at `status.html`.

To add a status update, edit `data/posts.json` and add a new object at the top or bottom of the list:


```json
{
  "title": "Short update title",
  "date": "2026-05-21T12:00:00-05:00",
  "status": "operational",
  "body": "Write the status update here."
}
```

Supported `status` values:

- `operational`
- `maintenance`
- `degraded`
- `outage`

## Preview Locally

Run this from the project folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Import WordPress Posts

The importer pulls published posts from the public WordPress REST API and saves them to `data/wordpress-posts.json`.

```bash
node scripts/import-wordpress.mjs
```

The current import source is:

```text
https://goldenechoes.com/wp-json/wp/v2/posts
```

## Publish On GitHub Pages

1. Create a new GitHub repository.
2. Commit and push this folder to that repository:

```bash
git add .
git commit -m "Create static Golden Echoes site"
git remote add origin git@github.com:YOUR-USER/YOUR-REPO.git
git push -u origin main
```

3. In GitHub, open the repository settings.
4. Go to Pages.
5. Set the source to `Deploy from a branch`.
6. Choose the `main` branch and `/root`.
7. Save.

Your site will be published at the GitHub Pages URL shown in the Pages settings.
