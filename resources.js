const RESOURCE_INDEX_PATH = "./resources/index.json";

const listHint = document.getElementById("listHint");
const resourceFilters = document.getElementById("resourceFilters");
const resourceList = document.getElementById("resourceList");
const resourceCardTemplate = document.getElementById("resourceCardTemplate");

/** @type {Array<{title:string,url:string,category?:string,type?:string,summary?:string,tags?:string[]}>} */
let resourceCatalog = [];
let activeCategory = "全部";

function deriveTitleFromUrl(url) {
  if (typeof url !== "string" || !url.trim()) return "未命名资源";
  const trimmed = url.trim();
  const clean = trimmed.split("#")[0].split("?")[0];
  const segments = clean.split("/").filter(Boolean);
  const tail = segments.length ? segments[segments.length - 1] : clean;
  return tail || "未命名资源";
}

function normalizeType(type) {
  const value = (type || "").toString().trim().toLowerCase();
  if (value === "doc" || value === "document" || value === "文档") return "文档";
  if (value === "tool" || value === "工具") return "工具";
  return "链接";
}

function normalizeCategory(category) {
  if (typeof category === "string" && category.trim()) {
    return category.trim();
  }
  return "未分类";
}

function normalizeCatalog(data) {
  const list = Array.isArray(data) ? data : data?.resources;
  if (!Array.isArray(list)) return [];

  return list
    .map((entry) => {
      if (typeof entry === "string") {
        return {
          title: deriveTitleFromUrl(entry),
          url: entry,
          category: "未分类",
          type: "链接",
          summary: "",
          tags: [],
        };
      }

      if (!entry || typeof entry.url !== "string") return null;

      return {
        title: entry.title || deriveTitleFromUrl(entry.url),
        url: entry.url,
        category: normalizeCategory(entry.category),
        type: normalizeType(entry.type),
        summary: entry.summary || "",
        tags: Array.isArray(entry.tags) ? entry.tags : [],
      };
    })
    .filter(Boolean);
}

function getCategoryStats(items) {
  const stats = new Map();

  items.forEach((item) => {
    const key = item.category || "未分类";
    stats.set(key, (stats.get(key) || 0) + 1);
  });

  return [...stats.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-CN"));
}

function getFilteredResources(items) {
  if (activeCategory === "全部") return items;
  return items.filter((item) => (item.category || "未分类") === activeCategory);
}

function renderCategoryFilters(items) {
  resourceFilters.innerHTML = "";
  const stats = getCategoryStats(items);

  const allButton = document.createElement("button");
  allButton.className = `category-filter${activeCategory === "全部" ? " is-active" : ""}`;
  allButton.type = "button";
  allButton.textContent = `全部 (${items.length})`;
  allButton.addEventListener("click", () => {
    activeCategory = "全部";
    renderCategoryFilters(resourceCatalog);
    renderResourceCards(resourceCatalog);
  });
  resourceFilters.appendChild(allButton);

  stats.forEach(([category, count]) => {
    const button = document.createElement("button");
    button.className = `category-filter${activeCategory === category ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = `${category} (${count})`;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategoryFilters(resourceCatalog);
      renderResourceCards(resourceCatalog);
    });
    resourceFilters.appendChild(button);
  });
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

function createResourceCard(item, index) {
  const card = resourceCardTemplate.content.firstElementChild.cloneNode(true);
  card.style.animation = `fade-slide 360ms ${index * 55}ms ease-out both`;
  card.href = item.url;
  card.querySelector(".resource-card-category").textContent = item.category || "未分类";
  card.querySelector(".resource-card-type").textContent = item.type || "链接";
  card.querySelector(".resource-card-title").textContent = item.title;
  card.querySelector(".resource-card-summary").textContent =
    item.summary || "点击打开资源。";
  card.querySelector(".resource-card-tags").textContent =
    item.tags && item.tags.length ? item.tags.join(" / ") : "";

  if (!isExternalUrl(item.url)) {
    card.target = "_self";
    card.removeAttribute("rel");
  }

  return card;
}

function renderGroupedResources(items) {
  const grouped = new Map();

  items.forEach((item) => {
    const key = item.category || "未分类";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "zh-CN"))
    .forEach(([category, groupItems]) => {
      const group = document.createElement("section");
      group.className = "resource-group";

      const title = document.createElement("h3");
      title.className = "resource-group-title";
      title.textContent = category;
      group.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "resource-group-grid";

      groupItems.forEach((item, index) => {
        grid.appendChild(createResourceCard(item, index));
      });

      group.appendChild(grid);
      resourceList.appendChild(group);
    });
}

function renderResourceCards(items) {
  resourceList.innerHTML = "";
  const filteredItems = getFilteredResources(items);

  if (!items.length) {
    listHint.textContent = "还没有任何资源。请在 ./resources/index.json 中添加。";
    return;
  }

  if (!filteredItems.length) {
    listHint.textContent = `分类「${activeCategory}」下暂无资源。`;
    return;
  }

  if (activeCategory === "全部") {
    renderGroupedResources(filteredItems);
    listHint.textContent = `共 ${items.length} 条资源，已按分类分组展示。`;
    return;
  }

  filteredItems.forEach((item, index) => {
    resourceList.appendChild(createResourceCard(item, index));
  });

  listHint.textContent = `分类「${activeCategory}」下共 ${filteredItems.length} 条资源。`;
}

async function loadResources() {
  const response = await fetch(RESOURCE_INDEX_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`资源索引加载失败 (${response.status})`);
  }
  return normalizeCatalog(await response.json());
}

async function bootstrap() {
  try {
    resourceCatalog = await loadResources();
    renderCategoryFilters(resourceCatalog);
    renderResourceCards(resourceCatalog);
  } catch (error) {
    listHint.textContent = error.message || "资源加载失败";
  }
}

bootstrap();
