// 文章正文图片灯箱 —— 点图放大、Esc 关闭、点遮罩关闭
(function () {
    'use strict';

    // 仅在文章详情页跑（首页/列表页没有 .post-figure）
    var triggers = document.querySelectorAll('.post-figure a.lightbox-trigger');
    if (!triggers.length) return;

    // 收集所有可放大的图片，保留 DOM 顺序，方便后续扩展 prev/next
    var items = Array.prototype.map.call(triggers, function (a) {
        return {
            src: a.getAttribute('data-lightbox-src') || a.getAttribute('href'),
            alt: a.getAttribute('data-lightbox-alt') || ''
        };
    });

    // 创建遮罩 DOM（一次性）
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '图片预览');
    overlay.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="关闭">&times;</button>' +
        '<img alt="">' +
        '<div class="lightbox-caption" hidden></div>';
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector('img');
    var captionEl = overlay.querySelector('.lightbox-caption');
    var closeBtn = overlay.querySelector('.lightbox-close');
    var lastFocus = null;

    function open(idx) {
        var item = items[idx];
        if (!item) return;
        lastFocus = document.activeElement;
        imgEl.setAttribute('src', item.src);
        imgEl.setAttribute('alt', item.alt || '');
        if (item.alt) {
            captionEl.textContent = item.alt;
            captionEl.hidden = false;
        } else {
            captionEl.hidden = true;
        }
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        // 等下一帧再聚焦，避免和点击事件抢焦点
        setTimeout(function () { closeBtn.focus(); }, 0);
    }

    function close() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        imgEl.setAttribute('src', '');
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus(); } catch (e) { /* 元素可能已卸载 */ }
        }
    }

    // 绑定 trigger
    triggers.forEach(function (a, i) {
        a.addEventListener('click', function (ev) {
            ev.preventDefault();
            open(i);
        });
    });

    // 点遮罩或关闭按钮关闭
    overlay.addEventListener('click', function (ev) {
        // 点图片本身不关；点遮罩或按钮才关
        if (ev.target === overlay || ev.target === closeBtn) {
            close();
        }
    });

    // Esc 关闭
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && overlay.classList.contains('is-open')) {
            close();
        }
    });
})();
