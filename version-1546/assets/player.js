import { H as Hls } from './hls-vendor.js';

function bindPlayer(panel) {
    var video = panel.querySelector('video');
    var button = panel.querySelector('.play-overlay');
    var source = panel.getAttribute('data-src');
    var hlsInstance = null;

    if (!video || !button || !source) {
        return;
    }

    function attachSource() {
        if (video.dataset.ready === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            video.dataset.ready = 'true';
        }
    }

    function playVideo() {
        attachSource();
        panel.classList.add('is-playing');
        var playback = video.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(function () {
                panel.classList.remove('is-playing');
            });
        }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener('play', function () {
        panel.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
            panel.classList.remove('is-playing');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(bindPlayer);
});
