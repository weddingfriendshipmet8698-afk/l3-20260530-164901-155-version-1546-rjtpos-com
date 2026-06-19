(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const empty = scope.querySelector('[data-empty-state]');

    if (!input || cards.length === 0) {
      return;
    }

    function applyFilter() {
      const value = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();

        const matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input.hasAttribute('data-url-query')) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });

  const playerBox = document.querySelector('[data-player]');

  if (playerBox) {
    const video = playerBox.querySelector('video');
    const cover = playerBox.querySelector('[data-play-button]');
    const stream = playerBox.getAttribute('data-stream');
    let hlsReady = false;
    let hlsInstance = null;

    function setup() {
      if (!video || !stream || hlsReady) {
        return;
      }

      hlsReady = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playerBox.classList.contains('is-playing')) {
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
              promise.catch(function () {});
            }
          }
        });
        return;
      }

      video.src = stream;
    }

    function play() {
      setup();
      playerBox.classList.add('is-playing');

      if (cover) {
        cover.classList.add('is-hidden');
      }

      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
