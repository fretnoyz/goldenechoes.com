const POSTS_URL = "data/posts.json";
const SITE_TITLE = "Golden Echoes";
const SITE_TAGLINE = "Old truths. New scars. Freely shared.";
const AUTHOR = "Golden Echoes";
const ALL_CATEGORIES = "All";

let postsCache;

const page = document.body.dataset.page;

const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
};

const stripHtml = (html = "") => {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent.replace(/\s+/g, " ").trim();
};

const sanitizeHtml = (html = "") => {
  const template = document.createElement("template");
  template.innerHTML = html;

  template.content.querySelectorAll("script, style, iframe, object, embed").forEach((node) => {
    node.remove();
  });

  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || value.startsWith("javascript:")) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return template.innerHTML;
};

const formatDate = (value) => {
  if (!value) return "Undated";
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(value));
};

const getYear = (value) => {
  return Number.isNaN(new Date(value).getFullYear()) ? "Undated" : String(new Date(value).getFullYear());
};

const readingTime = (post) => {
  const words = stripHtml(post.content || post.excerpt || "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 225))} min read`;
};

const postHref = (post) => {
  return `post.html?slug=${encodeURIComponent(post.slug)}`;
};

const categoriesFrom = (posts) => {
  return [ALL_CATEGORIES, ...new Set(posts.map((post) => post.category || "Uncategorized"))];
};

const setMeta = (selector, attribute, value) => {
  const node = document.head.querySelector(selector);
  if (node) node.setAttribute(attribute, value);
};

const setPageMeta = ({ title, description, url }) => {
  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:url"]', "content", url || window.location.href);
};

const loadPosts = async () => {
  if (postsCache) return postsCache;
  const response = await fetch(POSTS_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Posts could not be loaded");
  const posts = await response.json();
  postsCache = posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return postsCache;
};

const renderFilters = (root, posts, onChange) => {
  if (!root) return;
  root.innerHTML = categoriesFrom(posts)
    .map((category, index) => {
      return `<button class="filter-button${index === 0 ? " active" : ""}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
    })
    .join("");

  root.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      root.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      onChange(button.dataset.category);
    });
  });
};

const postCard = (post, featured = false) => {
  return `
    <article class="post-card${featured ? " featured-card" : ""}" data-category="${escapeHtml(post.category || "Uncategorized")}">
      <div class="card-meta">
        <span>${escapeHtml(post.category || "Uncategorized")}</span>
        <time datetime="${escapeHtml(post.date || "")}">${formatDate(post.date)}</time>
      </div>
      <h3><a href="${postHref(post)}">${escapeHtml(post.title || "Untitled")}</a></h3>
      <p>${escapeHtml(post.excerpt || stripHtml(post.content || "").slice(0, 280))}</p>
      <a class="read-more" href="${postHref(post)}">Read more</a>
    </article>
  `;
};

const renderHome = async () => {
  const featuredRoot = document.querySelector("#featured-posts");
  const gridRoot = document.querySelector("#post-grid");
  const filtersRoot = document.querySelector("#home-filters");

  try {
    const posts = await loadPosts();
    const featured = posts.filter((post) => post.featured).slice(0, 4);
    const fallbackFeatured = featured.length ? featured : posts.slice(0, 4);

    featuredRoot.innerHTML = fallbackFeatured.map((post) => postCard(post, true)).join("");

    const renderGrid = (category = ALL_CATEGORIES) => {
      const visiblePosts = category === ALL_CATEGORIES ? posts : posts.filter((post) => (post.category || "Uncategorized") === category);
      gridRoot.innerHTML = visiblePosts.map((post) => postCard(post)).join("");
    };

    renderFilters(filtersRoot, posts, renderGrid);
    renderGrid();
  } catch (error) {
    featuredRoot.innerHTML = "";
    gridRoot.innerHTML = '<p class="error">Posts could not be loaded.</p>';
  }
};

const renderPost = async () => {
  const root = document.querySelector("#post-root");
  const requestedSlug = new URLSearchParams(window.location.search).get("slug") || new URLSearchParams(window.location.search).get("post");

  try {
    const posts = await loadPosts();
    const post = posts.find((item) => item.slug === requestedSlug) || posts[0];
    const related = posts
      .filter((item) => item.slug !== post.slug && item.category === post.category)
      .slice(0, 3);
    const description = post.excerpt || stripHtml(post.content || "").slice(0, 160);

    setPageMeta({
      title: `${post.title || "Untitled"} | ${SITE_TITLE}`,
      description,
      url: window.location.href
    });

    root.innerHTML = `
      <article class="article">
        <a class="back-link" href="./">Back to blog</a>
        <header class="article-header">
          <p class="kicker">${escapeHtml(post.category || "Uncategorized")}</p>
          <h1>${escapeHtml(post.title || "Untitled")}</h1>
          <div class="article-meta">
            <span>By ${AUTHOR}</span>
            <time datetime="${escapeHtml(post.date || "")}">${formatDate(post.date)}</time>
            <span>${readingTime(post)}</span>
          </div>
        </header>
        <div class="article-content">${sanitizeHtml(post.content || `<p>${escapeHtml(post.excerpt || "")}</p>`)}</div>
      </article>
      <section class="related-section" aria-labelledby="related-title">
        <h2 id="related-title">Related Posts</h2>
        <div class="related-grid">
          ${related.length ? related.map((item) => postCard(item)).join("") : '<p class="muted">No related posts yet.</p>'}
        </div>
      </section>
    `;
  } catch (error) {
    root.innerHTML = '<p class="error">This post could not be loaded.</p>';
  }
};

const renderArchive = async () => {
  const listRoot = document.querySelector("#archive-list");
  const filtersRoot = document.querySelector("#archive-filters");

  try {
    const posts = await loadPosts();

    const renderList = (category = ALL_CATEGORIES) => {
      const visiblePosts = category === ALL_CATEGORIES ? posts : posts.filter((post) => (post.category || "Uncategorized") === category);
      const groups = visiblePosts.reduce((acc, post) => {
        const year = getYear(post.date);
        acc[year] = acc[year] || [];
        acc[year].push(post);
        return acc;
      }, {});

      listRoot.innerHTML = Object.entries(groups)
        .map(([year, yearPosts]) => {
          return `
            <section class="archive-year">
              <h2>${escapeHtml(year)}</h2>
              <ol>
                ${yearPosts
                  .map((post) => {
                    return `
                      <li>
                        <time datetime="${escapeHtml(post.date || "")}">${formatDate(post.date)}</time>
                        <a href="${postHref(post)}">${escapeHtml(post.title || "Untitled")}</a>
                        <span>${escapeHtml(post.category || "Uncategorized")}</span>
                      </li>
                    `;
                  })
                  .join("")}
              </ol>
            </section>
          `;
        })
        .join("");
    };

    renderFilters(filtersRoot, posts, renderList);
    renderList();
  } catch (error) {
    listRoot.innerHTML = '<p class="error">Archive could not be loaded.</p>';
  }
};

const initMenu = () => {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector("#nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    links.classList.toggle("open", !isOpen);
  });
};

initMenu();

if (page === "home") renderHome();
if (page === "post") renderPost();
if (page === "archive") renderArchive();
