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

// Simple A/B test utility for the home 'What is EI' section
(function abTest() {
  const KEY = "quelli_ab_variant";
  const PARAM = "ab";
  const choices = ["A", "B"];

  function pickFromQuery() {
    const params = new URLSearchParams(location.search);
    const v = params.get(PARAM);
    if (!v) return null;
    if (v.toLowerCase() === "reset") {
      localStorage.removeItem(KEY);
      return null;
    }
    if (choices.includes(v.toUpperCase())) return v.toUpperCase();
    return null;
  }

  function pickRandom() {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function applyVariant(v) {
    document.documentElement.setAttribute("data-ab-variant", v);
    // show/hide blocks
    document.querySelectorAll(".ab-variant").forEach((el) => {
      el.style.display = el.getAttribute("data-variant") === v ? "" : "none";
    });
  }

  // decide
  const q = pickFromQuery();
  let variant = q || localStorage.getItem(KEY);
  if (!variant) {
    // default to A unless query param overrides
    variant = 'A';
    localStorage.setItem(KEY, variant);
  }
  if (q && choices.includes(q)) localStorage.setItem(KEY, q);

  // apply after DOM ready
  function init() {
    if (!document.querySelectorAll) return;
    if (!document.querySelectorAll(".ab-variant").length) return;
    applyVariant(variant);
    // expose for debugging
    window.quelliAB = {
      variant,
      set: (v) => {
        if (!choices.includes(v)) return;
        localStorage.setItem(KEY, v);
        variant = v;
        applyVariant(v);
        const btn = document.querySelector('.ab-toggle');
        if (btn) btn.setAttribute('aria-pressed', String(v === 'B'));
      },
      toggle: () => {
        const next = variant === 'A' ? 'B' : 'A';
        window.quelliAB.set(next);
      }
    };

  // Note: the explicit '.ab-toggle' button was removed from the DOM.
  // The document-level badge click handler below still provides a way
  // to toggle variants by clicking the bottom-right badge.

    // Allow clicking the small bottom-right AB badge (rendered via ::before)
    // Pseudo-elements can't receive events, so listen on document and
    // interpret clicks that land in the badge area (within 64px of the
    // bottom-right corner). This preserves the constraint of not adding
    // new DOM nodes while making the visual badge interactive.
    function onDocClick(e) {
      try {
        const x = e.clientX;
        const y = e.clientY;
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        // badge is positioned at right:12px, bottom:12px with padding; use a 64px hit area
        const hitMargin = 64;
        if (x >= vw - hitMargin && y >= vh - hitMargin) {
          // ensure our AB utility exists before toggling
          if (window.quelliAB && typeof window.quelliAB.toggle === 'function') {
            window.quelliAB.toggle();
            e.preventDefault();
          }
        }
      } catch (err) {
        // silent
      }
    }

    document.addEventListener('click', onDocClick);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
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
