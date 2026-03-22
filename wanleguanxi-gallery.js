const galleryImages = Array.from(document.querySelectorAll(".gallery-item img"));

if (galleryImages.length) {
  const imageList = galleryImages.map((img) => ({
    src: img.currentSrc || img.src,
    alt: img.alt || "玩乐关系图集",
  }));

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="关闭图片预览">×</button>
    <figure class="lightbox-figure">
      <div class="lightbox-stage" aria-live="polite">
        <img class="lightbox-img" alt="" />
      </div>
      <p class="lightbox-hint">左右滑动切图，双击缩放</p>
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
  `;

  const lightboxImg = lightbox.querySelector(".lightbox-img");
  const lightboxStage = lightbox.querySelector(".lightbox-stage");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const closeButton = lightbox.querySelector(".lightbox-close");

  let currentIndex = 0;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let startX = 0;
  let startY = 0;
  let isTouching = false;
  let lastTapAt = 0;
  let savedScrollY = 0;
  let savedBodyPaddingRight = "";

  function lockPageScroll() {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    savedBodyPaddingRight = document.body.style.paddingRight || "";

    document.documentElement.classList.add("is-lightbox-open");
    document.body.classList.add("is-lightbox-open");
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.position = "fixed";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }
  }

  function unlockPageScroll() {
    document.documentElement.classList.remove("is-lightbox-open");
    document.body.classList.remove("is-lightbox-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = savedBodyPaddingRight;
    window.scrollTo(0, savedScrollY);
  }

  function wrapIndex(index) {
    const total = imageList.length;
    if (!total) return 0;
    return (index + total) % total;
  }

  function clampPan(value, axis) {
    const stageSize = axis === "x" ? lightboxStage.clientWidth : lightboxStage.clientHeight;
    const imageSize =
      (axis === "x" ? lightboxImg.clientWidth : lightboxImg.clientHeight) * zoom;
    const maxPan = Math.max(0, (imageSize - stageSize) / 2);
    return Math.max(-maxPan, Math.min(maxPan, value));
  }

  function applyTransform() {
    panX = clampPan(panX, "x");
    panY = clampPan(panY, "y");
    lightboxImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
    lightboxImg.style.cursor = zoom > 1 ? "grab" : "zoom-in";
  }

  function resetTransform() {
    zoom = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function showImage(index) {
    currentIndex = wrapIndex(index);
    const item = imageList[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = `${item.alt} (${currentIndex + 1}/${imageList.length})`;
    resetTransform();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    lightboxImg.alt = "";
    lightboxCaption.textContent = "";
    resetTransform();
    unlockPageScroll();
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.hidden = false;
    lockPageScroll();
  }

  function goNext() {
    showImage(currentIndex + 1);
  }

  function goPrev() {
    showImage(currentIndex - 1);
  }

  function toggleZoom() {
    if (zoom > 1) {
      resetTransform();
      return;
    }

    zoom = 2;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function onTouchStart(event) {
    const touch = event.touches[0];
    if (!touch) return;

    isTouching = true;
    startX = touch.clientX;
    startY = touch.clientY;
  }

  function onTouchMove(event) {
    if (!isTouching) return;
    const touch = event.touches[0];
    if (!touch) return;

    if (zoom > 1) {
      event.preventDefault();
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      startX = touch.clientX;
      startY = touch.clientY;
      panX += deltaX;
      panY += deltaY;
      applyTransform();
    }
  }

  function onTouchEnd(event) {
    const now = Date.now();
    if (now - lastTapAt < 280) {
      toggleZoom();
      lastTapAt = 0;
      isTouching = false;
      return;
    }
    lastTapAt = now;

    if (!isTouching || zoom > 1) {
      isTouching = false;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      isTouching = false;
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > 44 && absX > absY) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    isTouching = false;
  }

  galleryImages.forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index));
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowRight") {
      goNext();
    } else if (event.key === "ArrowLeft") {
      goPrev();
    }
  });

  lightboxImg.addEventListener("dblclick", toggleZoom);
  lightboxStage.addEventListener("touchstart", onTouchStart, { passive: true });
  lightboxStage.addEventListener("touchmove", onTouchMove, { passive: false });
  lightboxStage.addEventListener("touchend", onTouchEnd, { passive: true });

  lightboxImg.addEventListener("load", () => {
    applyTransform();
  });

  document.body.appendChild(lightbox);
}
