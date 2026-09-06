// 文章正文图片灯箱 —— 点图放大、Esc 关闭、点任意位置关闭
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
    var isOpen = false;

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
        isOpen = true;
        document.body.style.overflow = 'hidden';
        // 阻止移动端双击缩放 / 滚动手势误判
        overlay.addEventListener('touchmove', preventDefault, { passive: false });
        setTimeout(function () { closeBtn.focus(); }, 0);
    }

    function close() {
        if (!isOpen) return;
        overlay.classList.remove('is-open');
        isOpen = false;
        document.body.style.overflow = '';
        imgEl.setAttribute('src', '');
        overlay.removeEventListener('touchmove', preventDefault);
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus(); } catch (e) { /* 元素可能已卸载 */ }
        }
    }

    function preventDefault(ev) {
        ev.preventDefault();
    }

    // 绑定 trigger
    triggers.forEach(function (a, i) {
        a.addEventListener('click', function (ev) {
            ev.preventDefault();
            open(i);
        });
    });

    // 关闭逻辑 —— 移动端 click 经常被吞（图片拖拽/手势/双击缩放），
    // 用 pointerdown + touchend 双兜底，确保任何设备任何位置都能关。
    function handleClose(ev) {
        // 仅主按键 / 主手指
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        if (ev.cancelable) ev.preventDefault();
        ev.stopPropagation();
        close();
    }
    overlay.addEventListener('pointerdown', handleClose);
    overlay.addEventListener('touchend', handleClose);
    overlay.addEventListener('click', handleClose);

    // Esc 关闭
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && isOpen) {
            close();
        }
    });
})();
