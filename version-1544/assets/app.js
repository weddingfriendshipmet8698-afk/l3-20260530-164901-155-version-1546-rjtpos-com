(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;
    var setSlide = function (next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    };
    var restart = function () {
      if (timer) window.clearInterval(timer);
      start();
    };
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) prev.addEventListener('click', function () { setSlide(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { setSlide(index + 1); restart(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    setSlide(0);
    start();
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (input && queryValue) input.value = queryValue;
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (type && (card.getAttribute('data-type') || '') !== type) ok = false;
        if (year && (card.getAttribute('data-year') || '') !== year) ok = false;
        if (region && (card.getAttribute('data-region') || '') !== region) ok = false;
        card.classList.toggle('is-filtered', !ok);
      });
    };
    [input, typeSelect, yearSelect, regionSelect].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });
    apply();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video[data-hls]');
    var cover = player.querySelector('[data-play-button]');
    if (!video || !cover) return;
    var src = video.getAttribute('data-hls');
    var prepared = false;
    var hls = null;
    var prepare = function () {
      if (prepared || !src) return;
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };
    var play = function () {
      prepare();
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    };
    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    player.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') play();
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') hls.destroy();
    });
  });
})();
