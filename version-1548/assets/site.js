(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    const button = $('.mobile-toggle');
    const panel = $('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', () => {
      const open = panel.hasAttribute('hidden');
      panel.toggleAttribute('hidden', !open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function setupBackTop() {
    $$('.back-top').forEach((button) => {
      button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    });
  }

  function setupHero() {
    const slides = $$('[data-hero-slide]');
    const dots = $$('[data-hero-dot]');
    if (slides.length <= 1) return;
    let index = 0;
    let timer = null;

    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    $('[data-hero-prev]')?.addEventListener('click', () => {
      show(index - 1);
      play();
    });

    $('[data-hero-next]')?.addEventListener('click', () => {
      show(index + 1);
      play();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        play();
      });
    });

    play();
  }

  function setupPageFilters() {
    $$('[data-page-filter]').forEach((panel) => {
      const input = $('[data-filter-input]', panel);
      const chips = $$('[data-filter-chip]', panel);
      const scope = panel.parentElement || document;
      const cards = $$('[data-movie-card]', scope);
      let chipValue = '全部';

      const apply = () => {
        const query = normalize(input?.value);
        const chip = normalize(chipValue);
        cards.forEach((card) => {
          const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.year,
            card.dataset.tags,
            card.dataset.category
          ].join(' '));
          const queryMatch = !query || haystack.includes(query);
          const chipMatch = chip === '全部' || !chip || haystack.includes(chip);
          card.style.display = queryMatch && chipMatch ? '' : 'none';
        });
      };

      input?.addEventListener('input', apply);
      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          chips.forEach((item) => item.classList.remove('active'));
          chip.classList.add('active');
          chipValue = chip.dataset.filterChip || '全部';
          apply();
        });
      });
    });
  }

  function cardTemplate(movie) {
    const safe = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char]));
    return `
      <article class="movie-card compact" data-movie-card>
        <a class="card-link" href="./${safe(movie.file)}" aria-label="观看 ${safe(movie.title)}">
          <span class="card-cover">
            <img src="./${safe(movie.cover)}" alt="${safe(movie.title)}" loading="lazy">
            <span class="card-shade"></span>
            <span class="play-mark" aria-hidden="true">▶</span>
            <span class="year-badge">${safe(movie.year)}</span>
          </span>
          <span class="card-body">
            <span class="card-title">${safe(movie.title)}</span>
            <span class="card-meta">
              <span>${safe(movie.region)}</span>
              <span>${safe(movie.type)}</span>
              <span>${safe(movie.genre)}</span>
            </span>
          </span>
        </a>
      </article>`;
  }

  function setupSearchPage() {
    const results = $('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_DATA) return;
    const params = new URLSearchParams(window.location.search);
    const query = normalize(params.get('q'));
    const input = $('#searchQuery');
    const empty = $('[data-search-empty]');
    if (input && query) input.value = params.get('q');

    const matches = window.MOVIE_SEARCH_DATA.filter((movie) => {
      if (!query) return true;
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).includes(query);
    }).slice(0, 240);

    results.innerHTML = matches.map(cardTemplate).join('');
    if (empty) empty.hidden = matches.length > 0;
  }

  function setupPlayer() {
    $$('[data-player]').forEach((box) => {
      const video = $('.movie-video', box);
      const button = $('[data-play-toggle]', box);
      if (!video) return;
      const source = video.dataset.src;
      let hls = null;

      if (source) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      const update = () => box.classList.toggle('playing', !video.paused && !video.ended);
      const toggle = () => {
        if (video.paused || video.ended) {
          video.play().catch(() => update());
        } else {
          video.pause();
        }
      };

      button?.addEventListener('click', toggle);
      $$('[data-side-play]').forEach((sideButton) => {
        sideButton.addEventListener('click', () => {
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (video.paused || video.ended) {
            video.play().catch(() => update());
          }
        });
      });
      video.addEventListener('click', toggle);
      video.addEventListener('play', update);
      video.addEventListener('pause', update);
      video.addEventListener('ended', update);
      window.addEventListener('beforeunload', () => hls?.destroy?.());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupBackTop();
    setupHero();
    setupPageFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
