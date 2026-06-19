(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var index = window.MOVIE_INDEX || [];

    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var resultBox = form.querySelector("[data-search-results]");
      if (!input || !resultBox) {
        return;
      }

      function render() {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          resultBox.classList.remove("open");
          resultBox.innerHTML = "";
          return;
        }
        var matches = index.filter(function (item) {
          var text = [item.title, item.year, item.type, item.genre, item.region].join(" ").toLowerCase();
          return text.indexOf(q) !== -1;
        }).slice(0, 8);
        resultBox.innerHTML = matches.map(function (item) {
          return "<a href=\"" + item.href + "\"><strong>" + item.title + "</strong><span>" + item.year + " · " + item.type + " · " + item.genre + "</span></a>";
        }).join("");
        resultBox.classList.toggle("open", matches.length > 0);
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          resultBox.classList.remove("open");
        }
      });
      form.addEventListener("submit", function (event) {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          return;
        }
        event.preventDefault();
        var match = index.find(function (item) {
          return item.title.toLowerCase().indexOf(q) !== -1;
        });
        if (match) {
          window.location.href = match.href;
        } else {
          window.location.href = "categories.html";
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
