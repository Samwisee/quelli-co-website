// QUELLI & CO — Site JS (nav, carousel, faux subscribe)
window.site = (function () {
  const api = {};

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  // Carousel
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-track]");
    const dotsEl = carousel.querySelector("[data-dots]");
    const prev = carousel.querySelector("[data-prev]");
    const next = carousel.querySelector("[data-next]");

    const cardGap = 18;
    const step = () =>
      (track.children[0]?.offsetWidth || track.clientWidth) + cardGap;

    const updateDots = () => {
      if (!dotsEl) return;
      const w =
        track.firstElementChild?.getBoundingClientRect().width ||
        track.clientWidth;
      const idx = Math.round(track.scrollLeft / (w + cardGap));
      dotsEl
        .querySelectorAll("button")
        .forEach((b, i) => b.setAttribute("aria-current", String(i === idx)));
    };

    // Build dots
    const count = track.children.length;
    for (let i = 0; i < count; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Go to item ${i + 1}`);
      if (i === 0) b.setAttribute("aria-current", "true");
      b.addEventListener("click", () =>
        track.scrollTo({ left: i * step(), behavior: "smooth" })
      );
      dotsEl.appendChild(b);
    }

    prev?.addEventListener("click", () =>
      track.scrollBy({ left: -step(), behavior: "smooth" })
    );
    next?.addEventListener("click", () =>
      track.scrollBy({ left: step(), behavior: "smooth" })
    );
    track.addEventListener("scroll", () => requestAnimationFrame(updateDots));
    updateDots();
  });

  // Add keyboard navigation and reduced-motion awareness for carousels
  (function enhanceCarousels() {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
      const track = carousel.querySelector("[data-track]");
      if (!track) return;

      // Keyboard: left/right to navigate when focus is within carousel
      carousel.addEventListener("keydown", (ev) => {
        if (ev.key === "ArrowRight") {
          ev.preventDefault();
          const stepX =
            (track.children[0]?.offsetWidth || track.clientWidth) + 18;
          track.scrollBy({
            left: stepX,
            behavior: prefersReduced ? "auto" : "smooth",
          });
        }
        if (ev.key === "ArrowLeft") {
          ev.preventDefault();
          const stepX =
            (track.children[0]?.offsetWidth || track.clientWidth) + 18;
          track.scrollBy({
            left: -stepX,
            behavior: prefersReduced ? "auto" : "smooth",
          });
        }
      });

      // make track focusable for keyboard use
      track.tabIndex = 0;
      track.setAttribute("role", "region");
      track.setAttribute("aria-label", "carousel items");
    });
  })();

  // Faux newsletter submission (swap with real POST later)
  api.subscribe = function (e) {
    e.preventDefault();
    const form = e.target.closest("form");
    const btn = form.querySelector("button");
    const input = form.querySelector('input[type="email"]');
    const prevText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Thanks!";
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = prevText;
      if (input) input.value = "";
    }, 900);
    return false;
  };

  return api;
})();
