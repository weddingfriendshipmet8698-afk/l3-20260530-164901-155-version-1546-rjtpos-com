(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const nav = $('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.classList.toggle('is-active');
    });
  }

  function initHeroSlider() {
    const slider = $('[data-hero-slider]');

    if (!slider) {
      return;
    }

    const slides = $$('[data-hero-slide]', slider);
    const dots = $$('[data-hero-dot]', slider);
    const prev = $('[data-hero-prev]', slider);
    const next = $('[data-hero-next]', slider);
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initMovieFilters() {
    const panel = $('[data-filter-panel]');

    if (!panel) {
      return;
    }

    const searchInput = $('[data-filter-search]', panel);
    const typeSelect = $('[data-filter-type]', panel);
    const yearSelect = $('[data-filter-year]', panel);
    const regionSelect = $('[data-filter-region]', panel);
    const cards = $$('[data-movie-card]');
    const countNode = $('[data-result-count]');
    const emptyNode = $('[data-empty-state]');
    const url = new URL(window.location.href);
    const initialQuery = url.searchParams.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function matches(card) {
      const keyword = normalize(searchInput ? searchInput.value : '');
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      const search = normalize(card.dataset.search);

      if (keyword && !search.includes(keyword)) {
        return false;
      }

      if (type && card.dataset.type !== type) {
        return false;
      }

      if (year && card.dataset.year !== year) {
        return false;
      }

      if (region && card.dataset.region !== region) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      let visible = 0;

      cards.forEach(function (card) {
        const isVisible = matches(card);
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }

      if (emptyNode) {
        emptyNode.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function initBackToTop() {
    const button = $('[data-back-to-top]');

    if (!button) {
      return;
    }

    function update() {
      button.classList.toggle('is-visible', window.scrollY > 500);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initMovieFilters();
    initBackToTop();
  });
})();
