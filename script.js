const POSTS_DIR = "./posts/";
const INDEX_PATH = "./posts/index.json";

const listView = document.getElementById("listView");
const postView = document.getElementById("postView");
const postList = document.getElementById("postList");
const listHint = document.getElementById("listHint");
const categoryFilters = document.getElementById("categoryFilters");
const postMeta = document.getElementById("postMeta");
const postTitle = document.getElementById("postTitle");
const postContent = document.getElementById("postContent");
const postToc = document.getElementById("postToc");
const postTocNav = document.getElementById("postTocNav");
const backButton = document.getElementById("backButton");
const postCardTemplate = document.getElementById("postCardTemplate");

let imageLightbox = null;
let imageLightboxImg = null;
let imageLightboxCaption = null;

/** @type {Array<{file:string,title:string,date?:string,tags?:string[],summary?:string,category?:string}>} */
let postCatalog = [];
let activeCategory = "全部";

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

function createHeadingSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderPostToc() {
  if (!postToc || !postTocNav) return;

  postTocNav.innerHTML = "";
  const headings = [...postContent.querySelectorAll("h1, h2, h3")];
  if (!headings.length) {
    postToc.hidden = true;
    return;
  }

  const usedIds = new Set();
  const list = document.createElement("ul");
  list.className = "post-toc-list";

  headings.forEach((heading, index) => {
    const text = heading.textContent ? heading.textContent.trim() : "";
    if (!text) return;

    let id = heading.id || createHeadingSlug(text) || `section-${index + 1}`;
    while (usedIds.has(id)) {
      id = `${id}-${index + 1}`;
    }

    usedIds.add(id);
    heading.id = id;

    const item = document.createElement("li");
    const level = Number(heading.tagName.slice(1));
    item.className = `toc-item toc-level-${Math.min(Math.max(level, 1), 3)}`;

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = text;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      heading.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    item.appendChild(link);
    list.appendChild(item);
  });

  if (!list.children.length) {
    postToc.hidden = true;
    return;
  }

  postTocNav.appendChild(list);
  postToc.hidden = false;
}

function resolveCategory(entry) {
  if (entry && typeof entry.category === "string" && entry.category.trim()) {
    return entry.category.trim();
  }

  if (entry && Array.isArray(entry.tags) && entry.tags.length) {
    return entry.tags[0];
  }

  return "未分类";
}

function normalizeCatalog(data) {
  const list = Array.isArray(data) ? data : data?.posts;
  if (!Array.isArray(list)) return [];

  const normalized = list
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
        category: resolveCategory(entry),
      };
    })
    .filter(Boolean);

  return normalized.sort((a, b) => {
    const timeA = Date.parse(a.date || "");
    const timeB = Date.parse(b.date || "");
    const validA = Number.isFinite(timeA);
    const validB = Number.isFinite(timeB);

    if (validA && validB && timeA !== timeB) {
      return timeB - timeA;
    }

    if (validA !== validB) {
      return validA ? -1 : 1;
    }

    return (a.title || "").localeCompare(b.title || "", "zh-CN");
  });
}

function getCategoryStats(posts) {
  const stats = new Map();

  posts.forEach((post) => {
    const key = post.category || "未分类";
    stats.set(key, (stats.get(key) || 0) + 1);
  });

  return [...stats.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-CN"));
}

function getFilteredPosts(posts) {
  if (activeCategory === "全部") return posts;
  return posts.filter((post) => (post.category || "未分类") === activeCategory);
}

function renderCategoryFilters(posts) {
  categoryFilters.innerHTML = "";
  const stats = getCategoryStats(posts);

  const allButton = document.createElement("button");
  allButton.className = `category-filter${activeCategory === "全部" ? " is-active" : ""}`;
  allButton.type = "button";
  allButton.textContent = `全部 (${posts.length})`;
  allButton.addEventListener("click", () => {
    activeCategory = "全部";
    renderCategoryFilters(postCatalog);
    renderPostCards(postCatalog);
  });
  categoryFilters.appendChild(allButton);

  stats.forEach(([category, count]) => {
    const button = document.createElement("button");
    button.className = `category-filter${activeCategory === category ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = `${category} (${count})`;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategoryFilters(postCatalog);
      renderPostCards(postCatalog);
    });
    categoryFilters.appendChild(button);
  });
}

function createPostCard(post, index) {
  const card = postCardTemplate.content.firstElementChild.cloneNode(true);
  card.style.animation = `fade-slide 360ms ${index * 55}ms ease-out both`;
  card.querySelector(".post-card-date").textContent = post.date || "未注明日期";
  card.querySelector(".post-card-category").textContent = post.category || "未分类";
  card.querySelector(".post-card-title").textContent = post.title;
  card.querySelector(".post-card-summary").textContent =
    post.summary || "点击阅读完整内容。";
  card.querySelector(".post-card-tags").textContent =
    post.tags && post.tags.length ? post.tags.join(" / ") : "";

  card.addEventListener("click", () => {
    const hash = new URLSearchParams({ post: post.file }).toString();
    window.location.hash = hash;
  });

  return card;
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
  const filteredPosts = getFilteredPosts(posts);

  if (!posts.length) {
    listHint.textContent =
      "未找到 Markdown 文章。请将文件放在 ./posts/ 并在 ./posts/index.json 中登记。";
    return;
  }

  if (!filteredPosts.length) {
    listHint.textContent = `分类「${activeCategory}」下暂无文章。`;
    return;
  }

  if (activeCategory === "全部") {
    const grouped = new Map();

    filteredPosts.forEach((post) => {
      const key = post.category || "未分类";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(post);
    });

    [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "zh-CN"))
      .forEach(([category, items]) => {
        const group = document.createElement("section");
        group.className = "post-group";

        const title = document.createElement("h3");
        title.className = "post-group-title";
        title.textContent = category;
        group.appendChild(title);

        const grid = document.createElement("div");
        grid.className = "post-group-grid";

        items.forEach((post, index) => {
          grid.appendChild(createPostCard(post, index));
        });

        group.appendChild(grid);
        postList.appendChild(group);
      });

    listHint.textContent = `已发现 ${posts.length} 篇文章，按分类分组展示。`;
    return;
  }

  filteredPosts.forEach((post, index) => {
    postList.appendChild(createPostCard(post, index));
  });

  listHint.textContent = `分类「${activeCategory}」下共 ${filteredPosts.length} 篇文章。`;
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

function toPostRelativeUrl(postFile, rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return rawUrl;
  if (/^(?:[a-z][a-z\d+.-]*:|\/|#|data:)/i.test(rawUrl)) return rawUrl;

  const postDir = postFile.includes("/")
    ? postFile.slice(0, postFile.lastIndexOf("/") + 1)
    : "";
  const base = new URL(`${POSTS_DIR}${postDir}`, window.location.href);
  return new URL(rawUrl, base).href;
}

function rewritePostAssetUrls(postFile) {
  const nodes = postContent.querySelectorAll("img[src], source[src], video[src], audio[src]");
  nodes.forEach((node) => {
    const raw = node.getAttribute("src");
    const resolved = toPostRelativeUrl(postFile, raw);
    if (resolved && resolved !== raw) {
      node.setAttribute("src", resolved);
    }
  });
}

function ensureImageLightbox() {
  if (imageLightbox) return;

  imageLightbox = document.createElement("div");
  imageLightbox.className = "image-lightbox";
  imageLightbox.hidden = true;
  imageLightbox.innerHTML = `
    <button class="image-lightbox-close" type="button" aria-label="关闭图片预览">×</button>
    <img class="image-lightbox-img" alt="" />
    <p class="image-lightbox-caption"></p>
  `;

  imageLightboxImg = imageLightbox.querySelector(".image-lightbox-img");
  imageLightboxCaption = imageLightbox.querySelector(".image-lightbox-caption");

  imageLightbox.addEventListener("click", (event) => {
    if (event.target === imageLightbox || event.target.closest(".image-lightbox-close")) {
      closeImageLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeImageLightbox();
    }
  });

  document.body.appendChild(imageLightbox);
}

function openImageLightbox(src, altText) {
  ensureImageLightbox();
  if (!imageLightbox || !imageLightboxImg) return;

  imageLightboxImg.src = src;
  imageLightboxImg.alt = altText || "图片预览";

  if (imageLightboxCaption) {
    imageLightboxCaption.textContent = altText || "点击空白处或按 Esc 关闭";
  }

  imageLightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
}

function closeImageLightbox() {
  if (!imageLightbox || imageLightbox.hidden) return;

  imageLightbox.hidden = true;
  document.body.classList.remove("is-lightbox-open");

  if (imageLightboxImg) {
    imageLightboxImg.removeAttribute("src");
    imageLightboxImg.removeAttribute("alt");
  }
}

function bindPostImageZoom() {
  postContent.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (!target.src) return;

    event.preventDefault();
    openImageLightbox(target.src, target.alt || "");
  });
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
    rewritePostAssetUrls(item.file);
    renderPostToc();

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
  renderCategoryFilters(postCatalog);
  await refreshViewFromHash();
}

backButton.addEventListener("click", () => {
  window.location.hash = "";
});
window.addEventListener("hashchange", () => {
  refreshViewFromHash();
});

bindPostImageZoom();

bootstrap();
