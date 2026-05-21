import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../data/wordpress-posts.json", import.meta.url);
const outputPath = new URL("../data/posts.json", import.meta.url);

const featuredSlugs = new Set([
  "leaders-walk-to-you",
  "lost",
  "the-prompt-and-the-platen",
  "the-green-mirage-whos-really-steering-the-climate-train"
]);

const categoryRules = [
  {
    category: "Leadership",
    words: ["leader", "leadership", "ceo", "founder", "front line", "team", "work", "office", "business", "management", "intensity", "friend", "whole again"]
  },
  {
    category: "AI & Technology",
    words: ["ai", "artificial", "intelligence", "applied intelligence", "prompt", "technology", "tech", "machine", "algorithm", "digital", "data"]
  },
  {
    category: "Faith & Theology",
    words: ["church", "christ", "jesus", "god", "gospel", "faith", "theology", "bible", "scripture", "sermon", "preach", "prayer", "lord", "worship"]
  },
  {
    category: "History & Culture",
    words: ["history", "america", "usa", "culture", "bluebonnet", "fort worth", "war", "memorial", "martin", "longhouse", "common man"]
  },
  {
    category: "Policy & Society",
    words: ["policy", "society", "climate", "government", "politic", "public", "nation", "rage", "green", "law", "rights"]
  }
];

const stripHtml = (html = "") => {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&hellip;/g, "...")
    .replace(/\s+/g, " ")
    .trim();
};

const sentenceExcerpt = (post) => {
  const existing = stripHtml(post.excerpt || "");
  const withoutContinue = existing.replace(/\s*Continue reading\s+".*?"\s*$/i, "").trim();
  if (withoutContinue.length > 80) return withoutContinue;

  const text = stripHtml(post.contentHtml || "");
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, 3).join(" ").trim().slice(0, 420);
};

const categorize = (post) => {
  const haystack = `${post.title} ${post.excerpt} ${stripHtml(post.contentHtml)}`.toLowerCase();
  const match = categoryRules.find((rule) => {
    return rule.words.some((word) => haystack.includes(word));
  });
  return match?.category || "History & Culture";
};

const archive = JSON.parse(await readFile(sourcePath, "utf8"));
const posts = archive.posts.map((post) => {
  return {
    title: post.title || "Untitled",
    date: post.date || post.dateGmt || "",
    slug: post.slug || String(post.id),
    excerpt: sentenceExcerpt(post),
    content: post.contentHtml || "",
    category: categorize(post),
    featured: featuredSlugs.has(post.slug),
    originalUrl: post.link || ""
  };
});

await writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`Wrote ${posts.length} posts to ${outputPath.pathname}`);
