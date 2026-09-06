// 文章正文图片灯箱 —— 点图放大、左右切换、滑动切图、点任意位置关闭
(function () {
    'use strict';

    // 仅在文章详情页跑（首页/列表页没有 .post-figure）
    var triggers = document.querySelectorAll('.post-figure a.lightbox-trigger');
    if (!triggers.length) return;

    // 收集所有可放大的图片，保留 DOM 顺序
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
        '<button type="button" class="lightbox-prev" aria-label="上一张">&#8249;</button>' +
        '<button type="button" class="lightbox-next" aria-label="下一张">&#8250;</button>' +
        '<img alt="" class="lightbox-img">' +
        '<div class="lightbox-caption" hidden></div>' +
        '<div class="lightbox-counter" hidden></div>';
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector('.lightbox-img');
    var captionEl = overlay.querySelector('.lightbox-caption');
    var counterEl = overlay.querySelector('.lightbox-counter');
    var closeBtn = overlay.querySelector('.lightbox-close');
    var prevBtn = overlay.querySelector('.lightbox-prev');
    var nextBtn = overlay.querySelector('.lightbox-next');
    var lastFocus = null;
    var isOpen = false;
    var currentIdx = -1;

    function showItem(idx) {
        if (idx < 0) idx = items.length - 1;
        if (idx >= items.length) idx = 0;
        currentIdx = idx;
        var item = items[idx];
        imgEl.setAttribute('src', item.src);
        imgEl.setAttribute('alt', item.alt || '');
        if (item.alt) {
            captionEl.textContent = item.alt;
            captionEl.hidden = false;
        } else {
            captionEl.hidden = true;
        }
        // 单图时隐藏计数器和左右按钮
        var single = items.length <= 1;
        counterEl.hidden = single;
        prevBtn.hidden = single;
        nextBtn.hidden = single;
        if (!single) {
            counterEl.textContent = (idx + 1) + ' / ' + items.length;
        }
    }

    function open(idx) {
        lastFocus = document.activeElement;
        overlay.classList.add('is-open');
        isOpen = true;
        document.body.style.overflow = 'hidden';
        // 阻止移动端双击缩放 / 滚动手势误判
        overlay.addEventListener('touchmove', preventDefault, { passive: false });
        showItem(idx);
        setTimeout(function () { closeBtn.focus(); }, 0);
    }

    function close() {
        if (!isOpen) return;
        overlay.classList.remove('is-open');
        isOpen = false;
        currentIdx = -1;
        document.body.style.overflow = '';
        imgEl.setAttribute('src', '');
        overlay.removeEventListener('touchmove', preventDefault);
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus(); } catch (e) { /* 元素可能已卸载 */ }
        }
    }

    function prev() {
        if (items.length <= 1) return;
        showItem(currentIdx - 1);
    }

    function next() {
        if (items.length <= 1) return;
        showItem(currentIdx + 1);
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

    // 左右按钮
    prevBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        prev();
    });
    nextBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        next();
    });

    // 遮罩背景区域点击关闭（图片/按钮区域不关）
    overlay.addEventListener('click', function (ev) {
        // 点图片本身 → 关闭
        if (ev.target === imgEl) { close(); return; }
        // 点遮罩空白 → 关闭
        if (ev.target === overlay) { close(); return; }
        // 点 caption / counter 文字区 → 关闭
        if (ev.target === captionEl || ev.target === counterEl) { close(); return; }
    });

    // 移动端触屏：图片本体点击也要能关。pointerdown/touchend 在触屏上更稳
    overlay.addEventListener('pointerdown', function (ev) {
        if (ev.pointerType === 'mouse' && ev.button !== 0) return;
        if (ev.target === imgEl) {
            if (ev.cancelable) ev.preventDefault();
            close();
        }
    });
    overlay.addEventListener('touchend', function (ev) {
        if (ev.target === imgEl) {
            if (ev.cancelable) ev.preventDefault();
            close();
        }
    });

    // 滑动手势 —— 在图片上水平滑动切换
    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartT = 0;
    var SWIPE_THRESHOLD = 50; // 滑动 > 50px 才触发
    var SWIPE_VELOCITY = 0.3; // 或者速度够快

    imgEl.addEventListener('touchstart', function (ev) {
        if (ev.touches.length !== 1) return;
        var t = ev.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchStartT = Date.now();
    }, { passive: true });

    imgEl.addEventListener('touchend', function (ev) {
        if (ev.changedTouches.length !== 1) return;
        if (items.length <= 1) return;
        var t = ev.changedTouches[0];
        var dx = t.clientX - touchStartX;
        var dy = t.clientY - touchStartY;
        var dt = Date.now() - touchStartT;
        // 水平位移大于垂直，且超过阈值 / 速度阈值
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            ev.preventDefault();
            if (dx > 0) prev(); else next();
        } else if (Math.abs(dx) > 30 && dt > 0 && Math.abs(dx) / dt > SWIPE_VELOCITY && Math.abs(dx) > Math.abs(dy)) {
            // 快速滑动
            ev.preventDefault();
            if (dx > 0) prev(); else next();
        }
    }, { passive: false });

    // 键盘 ← → Esc
    document.addEventListener('keydown', function (ev) {
        if (!isOpen) return;
        if (ev.key === 'Escape') { close(); return; }
        if (items.length <= 1) return;
        if (ev.key === 'ArrowLeft') { ev.preventDefault(); prev(); return; }
        if (ev.key === 'ArrowRight') { ev.preventDefault(); next(); return; }
    });
})();
