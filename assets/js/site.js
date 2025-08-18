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
    if (!track) return; // nothing to do without a track

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

    // Build dots only if the dots container exists
    if (dotsEl) {
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

// Rive animation loader (initialise decorative animation if available)
(function initRiveLook() {
  const CANVAS_ID = "look-rive";
  const RIVE_SRC = "assets/animations/look.riv";
  const RIVE_CDN = "https://unpkg.com/@rive-app/canvas@latest/rive.min.js";

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  function fitCanvasToContainer(canvas, container) {
    const rect = container.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  async function init() {
    try {
      const canvas = document.getElementById(CANVAS_ID);
      if (!canvas) return;

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        canvas.style.display = "none";
        return;
      }

      if (typeof Rive === "undefined") {
        // load runtime dynamically
        try {
          await loadScript(RIVE_CDN);
        } catch (err) {
          console.warn("Failed to load Rive runtime:", err);
          canvas.style.display = "none";
          return;
        }
        if (typeof Rive === "undefined") {
          canvas.style.display = "none";
          return;
        }
      }

      // Make the canvas occupy the same area as the hero art container
      const container = canvas.parentElement || canvas;
      fitCanvasToContainer(canvas, container);

      // debounce resize
      let rAF = null;
      function onResize() {
        if (rAF) cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(() =>
          fitCanvasToContainer(canvas, container)
        );
      }
      window.addEventListener("resize", onResize);

      // Instantiate Rive
      const rive = new Rive.Rive({
        src: RIVE_SRC,
        canvas: canvas,
        autoplay: true,
      });

      // If Rive fails, hide canvas so the underlying picture shows
      rive.on("load", () => {
        // nothing extra required; decorative only
      });
      rive.on("error", (err) => {
        console.warn("Rive error:", err);
        canvas.style.display = "none";
      });
    } catch (err) {
      console.warn("Rive init failed:", err);
    }
  }

  // Run init after DOM ready — site.js runs deferred, so DOM should be ready
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
