const POSTS_DIR = "./posts/";
const INDEX_PATH = "./posts/index.json";

const listView = document.getElementById("listView");
const postView = document.getElementById("postView");
const postList = document.getElementById("postList");
const listHint = document.getElementById("listHint");
const postMeta = document.getElementById("postMeta");
const postTitle = document.getElementById("postTitle");
const postContent = document.getElementById("postContent");
const backButton = document.getElementById("backButton");
const postCardTemplate = document.getElementById("postCardTemplate");

/** @type {Array<{file:string,title:string,date?:string,tags?:string[],summary?:string}>} */
let postCatalog = [];

marked.setOptions({
  mangle: false,
  headerIds: true,
  breaks: false,
});

function toSlugFromHash() {
  const raw = new URLSearchParams(window.location.hash.slice(1)).get("post");
  return raw ? decodeURIComponent(raw) : "";
}

function formatMeta(post) {
  const date = post.date || "未注明日期";
  const tags = post.tags && post.tags.length ? ` | ${post.tags.join(" / ")}` : "";
  return `${date}${tags}`;
}

function deriveTitleFromFile(file) {
  return file
    .replace(/\.md$/i, "")
    .split(/[\/_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeCatalog(data) {
  const list = Array.isArray(data) ? data : data?.posts;
  if (!Array.isArray(list)) return [];

  return list
    .map((entry) => {
      if (typeof entry === "string") {
        return { file: entry, title: deriveTitleFromFile(entry) };
      }

      if (!entry || typeof entry.file !== "string") return null;

      return {
        file: entry.file,
        title: entry.title || deriveTitleFromFile(entry.file),
        date: entry.date,
        tags: Array.isArray(entry.tags) ? entry.tags : [],
        summary: entry.summary || "",
      };
    })
    .filter(Boolean);
}

async function loadCatalogFromJson() {
  const response = await fetch(INDEX_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`index.json not found (${response.status})`);
  }
  return normalizeCatalog(await response.json());
}

async function loadCatalogFromDirectoryListing() {
  const response = await fetch(POSTS_DIR, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`directory listing unavailable (${response.status})`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = [...doc.querySelectorAll("a")]
    .map((a) => a.getAttribute("href") || "")
    .filter((href) => href.toLowerCase().endsWith(".md"))
    .map((href) => href.replace(/^\.\//, "").replace(/^posts\//i, ""));

  return normalizeCatalog([...new Set(links)]);
}

function renderPostCards(posts) {
  postList.innerHTML = "";

  if (!posts.length) {
    listHint.textContent =
      "未找到 Markdown 文章。请将文件放在 ./posts/ 并在 ./posts/index.json 中登记。";
    return;
  }

  listHint.textContent = `已发现 ${posts.length} 篇 Markdown 文章。`;

  posts.forEach((post, index) => {
    const card = postCardTemplate.content.firstElementChild.cloneNode(true);
    card.style.animation = `fade-slide 360ms ${index * 55}ms ease-out both`;
    card.querySelector(".post-card-date").textContent = post.date || "未注明日期";
    card.querySelector(".post-card-title").textContent = post.title;
    card.querySelector(".post-card-summary").textContent =
      post.summary || "点击阅读完整内容。";
    card.querySelector(".post-card-tags").textContent =
      post.tags && post.tags.length ? post.tags.join(" / ") : "";

    card.addEventListener("click", () => {
      const hash = new URLSearchParams({ post: post.file }).toString();
      window.location.hash = hash;
    });

    postList.appendChild(card);
  });
}

function showListView() {
  postView.hidden = true;
  listView.hidden = false;
  backButton.hidden = true;
}

function showPostView() {
  listView.hidden = true;
  postView.hidden = false;
  backButton.hidden = false;
}

async function renderPostByFile(file) {
  const item = postCatalog.find((post) => post.file === file);
  if (!item) {
    showListView();
    listHint.textContent = `未找到文章: ${file}`;
    return;
  }

  try {
    const response = await fetch(`${POSTS_DIR}${item.file}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`failed (${response.status})`);

    const markdown = await response.text();
    const rendered = marked.parse(markdown);
    postTitle.textContent = item.title;
    postMeta.textContent = formatMeta(item);
    postContent.innerHTML = DOMPurify.sanitize(rendered, {
      USE_PROFILES: { html: true },
    });

    showPostView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showListView();
    listHint.textContent = `加载 ${item.file} 失败: ${error.message}`;
  }
}

async function refreshViewFromHash() {
  const target = toSlugFromHash();
  if (!target) {
    showListView();
    return;
  }

  await renderPostByFile(target);
}

async function bootstrap() {
  try {
    postCatalog = await loadCatalogFromJson();
  } catch {
    postCatalog = await loadCatalogFromDirectoryListing().catch(() => []);
  }

  renderPostCards(postCatalog);
  await refreshViewFromHash();
}

backButton.addEventListener("click", () => {
  window.location.hash = "";
});
window.addEventListener("hashchange", () => {
  refreshViewFromHash();
});

bootstrap();
