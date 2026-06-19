(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = qs(".menu-toggle");
        var nav = qs(".main-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        qsa(".search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                form.action = "./search.html";
            });
        });
    }

    function initHero() {
        var slides = qsa("[data-hero-slide]");
        var dots = qsa("[data-hero-dot]");
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide) {
                slide.classList.toggle("is-active", Number(slide.getAttribute("data-hero-slide")) === index);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === index);
            });
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function cardMatches(card, query, filter) {
        var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category")
        ].join(" "));
        var filterOk = !filter || filter === "all" || haystack.indexOf(normalize(filter)) !== -1;
        var queryOk = !query || haystack.indexOf(normalize(query)) !== -1;
        return filterOk && queryOk;
    }

    function initFilters() {
        qsa("[data-filter-panel]").forEach(function (panel) {
            var input = qs("[data-filter-input]", panel);
            var buttons = qsa("[data-filter]", panel);
            var list = qs("[data-card-list]") || panel.nextElementSibling;
            var empty = qs("[data-empty-message]");
            var activeFilter = "all";
            if (!list) {
                return;
            }
            var cards = qsa(".searchable-card", list);
            function apply() {
                var query = input ? input.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = cardMatches(card, query, activeFilter);
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initRankingSort() {
        var select = qs("[data-sort-select]");
        var list = qs("[data-ranking-list]");
        if (!select || !list) {
            return;
        }
        function value(card, key) {
            if (key === "year") {
                return parseInt(card.getAttribute("data-year"), 10) || 0;
            }
            if (key === "views") {
                return parseInt(card.getAttribute("data-views"), 10) || 0;
            }
            return parseFloat(card.getAttribute("data-rating")) || 0;
        }
        select.addEventListener("change", function () {
            var key = select.value;
            qsa(".ranking-item", list)
                .sort(function (a, b) {
                    return value(b, key) - value(a, key);
                })
                .forEach(function (card, index) {
                    var no = qs(".ranking-no", card);
                    if (no) {
                        no.textContent = index + 1;
                    }
                    list.appendChild(card);
                });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initRankingSort();
    });
})();
