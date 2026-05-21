import { writeFile, mkdir } from "node:fs/promises";
import { request } from "node:https";

const siteUrl = "https://goldenechoes.com";
const outputPath = new URL("../data/wordpress-posts.json", import.meta.url);
const perPage = 100;

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "status-site-wordpress-importer/1.0"
        },
        rejectUnauthorized: false
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Request failed with ${res.statusCode}: ${body.slice(0, 200)}`));
            return;
          }

          try {
            resolve({
              headers: res.headers,
              data: JSON.parse(body)
            });
          } catch (error) {
            reject(new Error(`Could not parse JSON from ${url}: ${error.message}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
};

const stripHtml = (html = "") => {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&hellip;/g, "...")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizePost = (post) => {
  const title = stripHtml(post.title?.rendered || "Untitled");
  const excerpt = stripHtml(post.excerpt?.rendered || "");

  return {
    id: post.id,
    title,
    slug: post.slug,
    date: post.date,
    dateGmt: post.date_gmt,
    modified: post.modified,
    link: post.link,
    excerpt,
    contentHtml: post.content?.rendered || "",
    categories: post.categories || [],
    tags: post.tags || [],
    featuredMedia: post.featured_media || 0
  };
};

const importPosts = async () => {
  const firstUrl = `${siteUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=1&_embed=1`;
  const firstPage = await fetchJson(firstUrl);
  const totalPages = Number(firstPage.headers["x-wp-totalpages"] || 1);
  const totalPosts = Number(firstPage.headers["x-wp-total"] || firstPage.data.length);
  const posts = [...firstPage.data];

  for (let page = 2; page <= totalPages; page += 1) {
    const url = `${siteUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=1`;
    const response = await fetchJson(url);
    posts.push(...response.data);
  }

  const importedAt = new Date().toISOString();
  const archive = {
    source: siteUrl,
    importedAt,
    totalPosts,
    posts: posts.map(normalizePost)
  };

  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(archive, null, 2)}\n`);

  console.log(`Imported ${archive.posts.length} posts from ${siteUrl}`);
  console.log(`Saved ${outputPath.pathname}`);
};

importPosts().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
