const blogRoot = document.querySelector("#blog-content");
const blogTitle = document.querySelector("#blog-title");
const blogSubtitle = document.querySelector("#blog-subtitle");
const blogBase = document.body.dataset.blogBase || "blog.html";

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

const formatBlogDate = (value) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long"
  }).format(new Date(value));
};

const sanitizeWordPressHtml = (html = "") => {
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

const postUrl = (post) => {
  return `${blogBase}?post=${encodeURIComponent(post.slug)}`;
};

const renderArchive = (archive) => {
  blogTitle.textContent = "Golden Echoes Blog";
  blogSubtitle.textContent = `${archive.posts.length} previous posts imported from WordPress.`;

  blogRoot.innerHTML = `
    <div class="archive-list">
      ${archive.posts
        .map((post) => {
          return `
            <article class="archive-post">
              <time datetime="${escapeHtml(post.date)}">${formatBlogDate(post.date)}</time>
              <h2><a href="${postUrl(post)}">${escapeHtml(post.title)}</a></h2>
              <p>${escapeHtml(post.excerpt)}</p>
              <a class="read-link" href="${postUrl(post)}">Read post</a>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
};

const renderPost = (post) => {
  document.title = `${post.title} - Golden Echoes`;
  blogTitle.textContent = post.title;
  blogSubtitle.textContent = formatBlogDate(post.date);

  blogRoot.innerHTML = `
    <article class="blog-post">
      <a class="back-link" href="${blogBase}">Back to all posts</a>
      <div class="wordpress-content">
        ${sanitizeWordPressHtml(post.contentHtml)}
      </div>
      <p class="source-link">
        <a href="${escapeHtml(post.link)}">Original WordPress post</a>
      </p>
    </article>
  `;
};

const loadArchive = async () => {
  try {
    const response = await fetch("data/wordpress-posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load WordPress archive");

    const archive = await response.json();
    const requestedSlug = new URLSearchParams(window.location.search).get("post");
    const requestedPost = archive.posts.find((post) => post.slug === requestedSlug);

    if (requestedSlug && requestedPost) {
      renderPost(requestedPost);
      return;
    }

    if (requestedSlug) {
      blogRoot.innerHTML = `
        <article class="post">
          <p>That post was not found.</p>
          <p><a class="read-link" href="${blogBase}">View all posts</a></p>
        </article>
      `;
      return;
    }

    renderArchive(archive);
  } catch (error) {
    blogRoot.innerHTML = '<article class="post"><p>Blog posts could not be loaded. Check <code>data/wordpress-posts.json</code>.</p></article>';
  }
};

loadArchive();
