(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("player-start");
        var hls = null;
        var loaded = false;
        if (!video || !source) {
            return;
        }
        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }
        function showButton() {
            if (button) {
                button.classList.remove("is-hidden");
            }
        }
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            load();
            hideButton();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showButton();
                });
            }
        }
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", hideButton);
        video.addEventListener("pause", function () {
            if (!video.ended && video.currentTime === 0) {
                showButton();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
