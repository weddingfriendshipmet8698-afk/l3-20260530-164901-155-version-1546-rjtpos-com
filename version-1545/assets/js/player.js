(function () {
  'use strict';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setMessage(box, text) {
    const message = box.querySelector('[data-player-message]');

    if (message) {
      message.textContent = text;
    }
  }

  async function attachHls(video, source, box) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      await video.play();
      return;
    }

    if (!window.Hls) {
      await loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js');
    }

    if (!window.Hls || !window.Hls.isSupported()) {
      throw new Error('当前浏览器不支持 HLS 播放。');
    }

    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {
        setMessage(box, '播放源已就绪，请再次点击播放按钮。');
      });
    });
    hls.on(window.Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        setMessage(box, '播放出现异常，正在尝试恢复线路。');
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      }
    });
  }

  function initPlayer(box) {
    const video = box.querySelector('video');
    const overlay = box.querySelector('[data-player-overlay]');
    const source = box.dataset.m3u8;
    let initialized = false;

    if (!video || !overlay || !source) {
      return;
    }

    async function play() {
      if (initialized) {
        video.play();
        overlay.classList.add('is-hidden');
        return;
      }

      initialized = true;
      overlay.classList.add('is-hidden');
      video.controls = true;
      setMessage(box, '正在加载高清播放源...');

      try {
        await attachHls(video, source, box);
        setMessage(box, '播放源已连接，可使用播放器控制栏切换播放状态。');
      } catch (error) {
        initialized = false;
        overlay.classList.remove('is-hidden');
        video.controls = false;
        setMessage(box, error.message || '播放源加载失败，请刷新页面后重试。');
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!initialized) {
        play();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player-box]').forEach(initPlayer);
  });
})();
