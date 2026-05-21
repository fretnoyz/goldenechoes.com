const statusLabels = {
  operational: "Operational",
  maintenance: "Maintenance",
  degraded: "Degraded Performance",
  outage: "Service Outage"
};

const components = [
  { name: "Website", status: "operational" },
  { name: "Publishing", status: "operational" },
  { name: "Support", status: "operational" }
];

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

const normalizeStatus = (value) => {
  return Object.prototype.hasOwnProperty.call(statusLabels, value) ? value : "operational";
};

const formatDate = (value) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

const setSummary = (latestPost) => {
  const status = normalizeStatus(latestPost?.status);
  const dot = document.querySelector("#summary-dot");
  const label = document.querySelector("#summary-label");
  const time = document.querySelector("#summary-time");

  dot.className = `summary-dot ${status}`;
  label.textContent = statusLabels[status] || status;
  time.textContent = latestPost ? `Last updated ${formatDate(latestPost.date)}` : "No posts yet";
};

const renderComponents = () => {
  const root = document.querySelector("#components");
  root.innerHTML = components
    .map((component) => {
      const status = normalizeStatus(component.status);
      const label = statusLabels[status];
      return `
        <article class="component">
          <span class="component-dot ${status}" aria-hidden="true"></span>
          <div>
            <strong>${escapeHtml(component.name)}</strong>
            <span>${escapeHtml(label)}</span>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderPosts = (posts) => {
  const root = document.querySelector("#posts");
  if (!posts.length) {
    root.innerHTML = '<article class="post"><p>No updates have been posted yet.</p></article>';
    return;
  }

  root.innerHTML = posts
    .map((post) => {
      const status = normalizeStatus(post.status);
      const label = statusLabels[status];
      const date = escapeHtml(post.date);
      return `
        <article class="post">
          <div class="post-meta">
            <span class="badge ${status}">${label}</span>
            <time datetime="${date}">${formatDate(post.date)}</time>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.body)}</p>
        </article>
      `;
    })
    .join("");
};

const loadPosts = async () => {
  try {
    const response = await fetch("data/posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load posts");
    const posts = await response.json();
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSummary(sortedPosts[0]);
    renderPosts(sortedPosts);
  } catch (error) {
    setSummary(null);
    document.querySelector("#posts").innerHTML =
      '<article class="post"><p>Posts could not be loaded. Check <code>data/posts.json</code>.</p></article>';
  }
};

renderComponents();
loadPosts();
