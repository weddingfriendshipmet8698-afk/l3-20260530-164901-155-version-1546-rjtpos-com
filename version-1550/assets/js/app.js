(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dotWrap = document.querySelector('.hero-dots');
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeSlide);
    });
    if (dotWrap) {
      Array.prototype.slice.call(dotWrap.children).forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeSlide);
      });
    }
  }

  if (slides.length && dotWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', '切换焦点影片');
      dot.addEventListener('click', function () {
        showSlide(i);
      });
      dotWrap.appendChild(dot);
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('.filter-input');
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('.empty-state');
    filterInput.addEventListener('input', function () {
      var q = filterInput.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var hit = !q || text.indexOf(q) !== -1;
        card.style.display = hit ? '' : 'none';
        if (hit) shown += 1;
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    });
  }

  function attachVideo(shell) {
    if (!shell || shell.getAttribute('data-ready') === '1') return;
    var video = shell.querySelector('video');
    var url = shell.getAttribute('data-video-url');
    if (!video || !url) return;
    shell.setAttribute('data-ready', '1');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      video.src = url;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-cover');
    var start = function () {
      attachVideo(shell);
      if (video) {
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
      if (button) button.classList.add('hidden');
    };
    if (button) button.addEventListener('click', start);
    shell.addEventListener('click', function (event) {
      if (event.target === video) return;
      start();
    });
  });
})();
