(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;

        function setHero(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                setHero(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                setHero(activeIndex + 1);
            }, 5200);
        }
    }

    var filterBar = document.querySelector('[data-filter-bar]');
    var filterGrid = document.querySelector('[data-filter-grid]');

    if (filterBar && filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
        var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('button'));

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.getAttribute('data-filter');
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                cards.forEach(function (card) {
                    var visible = filter === 'all' || card.getAttribute('data-region') === filter;
                    card.style.display = visible ? '' : 'none';
                });
            });
        });
    }
})();
