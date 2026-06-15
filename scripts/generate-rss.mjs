#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");

const posts = JSON.parse(readFileSync(resolve(root, "data/posts.json"), "utf8"));

const SITE_URL = "https://goldenechoes.com";
const FEED_TITLE = "Golden Echoes";
const FEED_DESC = "Old truths. New scars. Freely shared.";

function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfcDate(iso) {
  return new Date(iso).toUTCString();
}

const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

const items = sorted
  .map((p) => {
    const link = `${SITE_URL}/post.html?slug=${p.slug}`;
    return `  <item>
    <title>${esc(p.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${rfcDate(p.date)}</pubDate>
    <category>${esc(p.category)}</category>
    <description>${esc(p.excerpt)}</description>
  </item>`;
  })
  .join("\n");

const lastBuild = rfcDate(sorted[0]?.date ?? new Date().toISOString());

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${FEED_TITLE}</title>
  <link>${SITE_URL}/</link>
  <description>${FEED_DESC}</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;

writeFileSync(resolve(root, "feed.xml"), xml, "utf8");
console.log(`feed.xml written (${sorted.length} posts)`);
