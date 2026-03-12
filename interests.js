const ANIME_INDEX_PATH = "./interests/anime.json";

const listHint = document.getElementById("listHint");
const categoryFilters = document.getElementById("categoryFilters");
const animeList = document.getElementById("animeList");
const animeCardTemplate = document.getElementById("animeCardTemplate");

/** @type {Array<{title:string,image:string,category?:string,year?:string,score?:string,tags?:string[],review?:string}>} */
let animeCatalog = [];
let activeCategory = "全部";

function normalizeCategory(category) {
  if (typeof category === "string" && category.trim()) return category.trim();
  return "未分类";
}

function normalizeScore(score) {
  if (typeof score === "number") return score.toFixed(1);
  if (typeof score === "string" && score.trim()) return score.trim();
  return "未评分";
}

function normalizeCatalog(data) {
  const list = Array.isArray(data) ? data : data?.anime;
  if (!Array.isArray(list)) return [];

  return list
    .map((entry) => {
      if (!entry || typeof entry.title !== "string") return null;

      return {
        title: entry.title,
        image: typeof entry.image === "string" && entry.image.trim() ? entry.image : "",
        category: normalizeCategory(entry.category),
        year: typeof entry.year === "string" ? entry.year : "",
        score: normalizeScore(entry.score),
        tags: Array.isArray(entry.tags) ? entry.tags : [],
        review: typeof entry.review === "string" ? entry.review : "",
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

function getFilteredAnime(items) {
  if (activeCategory === "全部") return items;
  return items.filter((item) => (item.category || "未分类") === activeCategory);
}

function renderCategoryFilters(items) {
  categoryFilters.innerHTML = "";
  const stats = getCategoryStats(items);

  const allButton = document.createElement("button");
  allButton.className = `category-filter${activeCategory === "全部" ? " is-active" : ""}`;
  allButton.type = "button";
  allButton.textContent = `全部 (${items.length})`;
  allButton.addEventListener("click", () => {
    activeCategory = "全部";
    renderCategoryFilters(animeCatalog);
    renderAnimeCards(animeCatalog);
  });
  categoryFilters.appendChild(allButton);

  stats.forEach(([category, count]) => {
    const button = document.createElement("button");
    button.className = `category-filter${activeCategory === category ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = `${category} (${count})`;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategoryFilters(animeCatalog);
      renderAnimeCards(animeCatalog);
    });
    categoryFilters.appendChild(button);
  });
}

function createAnimeCard(item, index) {
  const card = animeCardTemplate.content.firstElementChild.cloneNode(true);
  card.style.animation = `fade-slide 360ms ${index * 55}ms ease-out both`;

  const cover = card.querySelector(".anime-cover");
  cover.src = item.image || "./assets/anime/default.svg";
  cover.alt = `${item.title} 海报`;

  card.querySelector(".anime-score").textContent = `评分 ${item.score}`;
  card.querySelector(".anime-category").textContent = item.category || "未分类";
  card.querySelector(".anime-year").textContent = item.year || "年份未填";
  card.querySelector(".anime-title").textContent = item.title;
  card.querySelector(".anime-tags").textContent =
    item.tags && item.tags.length ? item.tags.join(" / ") : "";
  card.querySelector(".anime-review").textContent = item.review || "暂无评价。";

  return card;
}

function renderGroupedAnime(items) {
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
      group.className = "anime-group";

      const title = document.createElement("h3");
      title.className = "anime-group-title";
      title.textContent = category;
      group.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "anime-group-grid";

      groupItems.forEach((item, index) => {
        grid.appendChild(createAnimeCard(item, index));
      });

      group.appendChild(grid);
      animeList.appendChild(group);
    });
}

function renderAnimeCards(items) {
  animeList.innerHTML = "";
  const filteredItems = getFilteredAnime(items);

  if (!items.length) {
    listHint.textContent = "还没有番剧条目，请在 ./interests/anime.json 中添加。";
    return;
  }

  if (!filteredItems.length) {
    listHint.textContent = `分类「${activeCategory}」下暂无条目。`;
    return;
  }

  if (activeCategory === "全部") {
    renderGroupedAnime(filteredItems);
    listHint.textContent = `共 ${items.length} 部作品，已按分类展示。`;
    return;
  }

  filteredItems.forEach((item, index) => {
    animeList.appendChild(createAnimeCard(item, index));
  });

  listHint.textContent = `分类「${activeCategory}」下共 ${filteredItems.length} 部作品。`;
}

async function loadCatalog() {
  const response = await fetch(ANIME_INDEX_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`兴趣索引加载失败 (${response.status})`);
  }
  return normalizeCatalog(await response.json());
}

async function bootstrap() {
  try {
    animeCatalog = await loadCatalog();
    renderCategoryFilters(animeCatalog);
    renderAnimeCards(animeCatalog);
  } catch (error) {
    listHint.textContent = error.message || "加载失败";
  }
}

bootstrap();
