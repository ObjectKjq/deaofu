(() => {
    const legacyPage = document.body.matches('.home-page, .contact-page');
    if (legacyPage) {
        const enhancementStyles = document.createElement('link');
        enhancementStyles.rel = 'stylesheet';
        enhancementStyles.href = '/portal/css/overrides.css';
        document.head.append(enhancementStyles);
    }
    const header = document.querySelector('.site-header');
    const progress = document.querySelector('.progress');
    const menu = document.querySelector('#menuToggle');
    const mobile = document.querySelector('#mobileNav');
    const backToTop = document.querySelector('#backToTop');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

    function scrollState() {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (header) header.classList.toggle('scrolled', scrollY > 40);
        if (progress) progress.style.transform = `scaleX(${max ? scrollY / max : 0})`;
        if (backToTop) backToTop.hidden = scrollY < innerHeight;

        // 仅首页存在锚点分区，仅在 href 为 "#xxx" 时做滚动高亮，避免对路由地址执行无效选择器
        let anyActive = false;
        document.querySelectorAll('.desktop-nav a').forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const section = document.querySelector(href);
            if (!section) return;
            const rect = section.getBoundingClientRect();
            const active = rect.top < innerHeight * 0.45 && rect.bottom > innerHeight * 0.3;
            link.classList.toggle('active', active);
            if (active) anyActive = true;
        });
        if (!anyActive) {
            const home = document.querySelector('.desktop-nav a[href="#home"]');
            if (home) home.classList.add('active');
        }
    }

    addEventListener('scroll', scrollState, {passive: true});
    scrollState();
    if (backToTop) backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
        const brand = document.querySelector('.site-header .brand');
        if (brand) brand.focus({ preventScroll: true });
    });

    if (menu && mobile) {
        const mobileWidth = matchMedia('(max-width: 900px)');
        function setMobileMenu(open) {
            mobile.classList.toggle('open', open);
            mobile.inert = !open;
            menu.setAttribute('aria-expanded', String(open));
            const labels = window.portalI18n && window.portalI18n.menu;
            if (labels) menu.setAttribute('aria-label', open ? labels.close : labels.open);
            if (header) header.classList.toggle('is-menu-open', open);
        }
        menu.addEventListener('click', () => setMobileMenu(!mobile.classList.contains('open')));
        mobile.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMobileMenu(false));
        });
        document.addEventListener('click', (event) => {
            if (header && !header.contains(event.target)) setMobileMenu(false);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobile.classList.contains('open')) {
                setMobileMenu(false);
                menu.focus();
            }
        });
        mobileWidth.addEventListener('change', () => setMobileMenu(false));
    }

    function initProductMedia() {
        const media = document.querySelector('.detail-media');
        if (!media) return;
        const stage = media.querySelector('.detail-media-stage');
        const image = media.querySelector('.detail-media-image:not(.detail-media-image-next)');
        const nextImage = media.querySelector('.detail-media-image-next');
        const thumbs = Array.from(media.querySelectorAll('.detail-media-thumb'));
        const prevBtn = media.querySelector('.detail-media-prev');
        const nextBtn = media.querySelector('.detail-media-next');
        const counter = media.querySelector('[data-media-counter]');
        const counterCurrent = media.querySelector('[data-media-current]');
        const counterTotal = media.querySelector('[data-media-total]');
        if (!thumbs.length) return;
        /* 单图：隐藏切换控件 + 计数器，仅保留缩略图（一张缩略图也无须保留激活态） */
        if (thumbs.length <= 1) {
            if (prevBtn) prevBtn.hidden = true;
            if (nextBtn) nextBtn.hidden = true;
            if (counter) counter.hidden = true;
        } else {
            if (counterTotal) counterTotal.textContent = String(thumbs.length);
        }
        let activeIndex = 0;
        let busy = false;

        // 原生模态框提供焦点约束和 Esc 关闭，预览始终从当前主图开始。
        const preview = document.getElementById('productImagePreview');
        if (preview) {
            const previewImage = preview.querySelector('.product-preview-image');
            const previewCounter = preview.querySelector('.product-preview-counter');
            const previewPrev = preview.querySelector('.product-preview-prev');
            const previewNext = preview.querySelector('.product-preview-next');
            let previewIndex = 0;
            let pointerStart = null;

            function showPreview(index) {
                previewIndex = (index + thumbs.length) % thumbs.length;
                previewImage.src = thumbs[previewIndex].dataset.image;
                previewCounter.textContent = `${previewIndex + 1} / ${thumbs.length}`;
            }

            function openPreview() {
                if (busy || preview.open) return;
                showPreview(activeIndex);
                preview.showModal();
                document.documentElement.classList.add('product-preview-open');
            }

            stage.addEventListener('pointerdown', (event) => {
                pointerStart = { x: event.clientX, y: event.clientY };
            });
            stage.addEventListener('click', (event) => {
                if (event.target.closest('button')) return;
                // 横滑切图和纵向滚动结束后，不把手势误判成点击放大。
                if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 10) return;
                openPreview();
            });
            image.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openPreview();
                }
            });
            previewPrev.hidden = previewNext.hidden = thumbs.length <= 1;
            previewPrev.addEventListener('click', () => showPreview(previewIndex - 1));
            previewNext.addEventListener('click', () => showPreview(previewIndex + 1));
            preview.querySelector('.product-preview-close').addEventListener('click', () => preview.close());
            preview.addEventListener('click', (event) => {
                if (event.target === preview) preview.close();
            });
            preview.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    showPreview(previewIndex + (event.key === 'ArrowLeft' ? -1 : 1));
                }
            });
            preview.addEventListener('close', () => {
                document.documentElement.classList.remove('product-preview-open');
                image.focus({ preventScroll: true });
            });
        }

        function updateCounter() {
            if (counterCurrent) counterCurrent.textContent = String(activeIndex + 1);
        }

        function updateThumbs() {
            thumbs.forEach((thumb, index) => {
                const selected = index === activeIndex;
                thumb.classList.toggle('is-active', selected);
                thumb.setAttribute('aria-selected', String(selected));
                thumb.tabIndex = selected ? 0 : -1;
            });
        }
        updateThumbs();

        function showMedia(index) {
            if (busy || thumbs.length <= 1) return;
            const targetIndex = (index + thumbs.length) % thumbs.length;
            if (targetIndex === activeIndex) return;
            const nextThumb = thumbs[targetIndex];
            const nextSrc = nextThumb.dataset.image;
            /* 方向：前进时新图从右侧入场、后退时从左侧入场，用于控制 scale/xPercent 的方向 */
            const direction = index > activeIndex ? 1 : -1;
            busy = true;
            const preloaded = new Image();
            preloaded.onload = () => {
                activeIndex = targetIndex;
                updateCounter();
                /* 标记新激活的缩略图，并把旧的标记去掉 */
                updateThumbs();
                if (!nextImage) {
                    image.src = nextSrc;
                    busy = false;
                    return;
                }
                nextImage.src = nextSrc;
                if (window.gsap && !reducedMotion.matches) {
                    /* 柔和 crossfade + 缩放：旧图向方向外淡出并轻微缩小，新图从方向外淡入并轻微放大，
                     * 两者时长略有错位，避免两张图横向对穿造成生硬的"翻页"感。*/
                    const tl = gsap.timeline({
                        onComplete: () => {
                            image.src = nextSrc;
                            gsap.set(image, { clearProps: 'transform,opacity' });
                            gsap.set(nextImage, { clearProps: 'transform,opacity' });
                            nextImage.style.visibility = 'hidden';
                            busy = false;
                        }
                    });
                    tl.to(image, {
                        duration: .42,
                        xPercent: direction * -10,
                        opacity: 0,
                        scale: .96,
                        ease: 'power3.inOut'
                    }, 0);
                    tl.fromTo(nextImage,
                        { xPercent: direction * 14, opacity: 0, scale: 1.06, visibility: 'visible' },
                        { duration: .5, xPercent: 0, opacity: 1, scale: 1, ease: 'power3.out' },
                        0
                    );
                    /* 激活的缩略图一圈柔光提示，呼应按钮风格 */
                    gsap.fromTo(nextThumb,
                        { boxShadow: '0 0 0 0 rgba(6, 59, 89, 0)' },
                        { duration: .5, boxShadow: '0 0 0 5px rgba(6, 59, 89, .22)', ease: 'power2.out', clearProps: 'boxShadow' }
                    );
                } else {
                    image.src = nextSrc;
                    nextImage.src = nextSrc;
                    busy = false;
                }
            };
            preloaded.onerror = () => {
                /* 图片加载失败时仍切到目标帧，避免一直卡在 busy */
                image.src = nextSrc;
                activeIndex = targetIndex;
                updateCounter();
                updateThumbs();
                busy = false;
            };
            preloaded.src = nextSrc;
        }

        thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => showMedia(index)));
        if (prevBtn) prevBtn.addEventListener('click', () => showMedia(activeIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => showMedia(activeIndex + 1));

        /* 键盘左右键切图：focus 到 media 容器后可用，避开表单控件 */
        media.tabIndex = 0;
        media.addEventListener('keydown', (e) => {
            if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); showMedia(activeIndex - 1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); showMedia(activeIndex + 1); }
        });

        /* 手机端单指横滑切图；纵向滚动、多指缩放和被系统取消的手势不切图。 */
        if (stage && thumbs.length > 1) {
            let gesture = null;
            stage.addEventListener('pointerdown', (e) => {
                if (!e.isPrimary) {
                    gesture = null;
                    return;
                }
                if (busy || e.pointerType === 'mouse' || e.target.closest('button')) return;
                gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: null };
                stage.setPointerCapture(e.pointerId);
            });
            stage.addEventListener('pointermove', (e) => {
                if (!gesture || e.pointerId !== gesture.id || gesture.axis) return;
                const dx = Math.abs(e.clientX - gesture.x);
                const dy = Math.abs(e.clientY - gesture.y);
                if (Math.max(dx, dy) < 8) return;
                if (dx > dy * 1.2) gesture.axis = 'horizontal';
                else if (dy > dx * 1.2) gesture.axis = 'vertical';
            });
            stage.addEventListener('pointerup', (e) => {
                if (!gesture || e.pointerId !== gesture.id) return;
                const { x, y, axis } = gesture;
                gesture = null;
                const dx = e.clientX - x;
                const dy = e.clientY - y;
                const threshold = Math.min(50, Math.max(24, stage.clientWidth * .1));
                if (axis !== 'vertical' && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    showMedia(activeIndex + (dx < 0 ? 1 : -1));
                }
            });
            const cancelGesture = (e) => {
                if (gesture && e.pointerId === gesture.id) gesture = null;
            };
            stage.addEventListener('pointercancel', cancelGesture);
            stage.addEventListener('lostpointercapture', cancelGesture);
        }

        updateCounter();
    }

    /** 参数较多时先展示八项，按需展开，避免首屏被长列表占满。 */
    function initProductSpecs() {
        const panel = document.querySelector('.detail-parameters');
        if (!panel || panel.querySelectorAll('.detail-spec-row').length <= 8) return;
        const toggle = panel.querySelector('.detail-spec-toggle');
        const label = toggle.querySelector('span');
        panel.classList.add('is-collapsed');
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
            const collapsed = panel.classList.toggle('is-collapsed');
            toggle.setAttribute('aria-expanded', String(!collapsed));
            label.textContent = collapsed ? toggle.dataset.expandLabel : toggle.dataset.collapseLabel;
            // 收起后将仍聚焦的按钮带回视口，避免停留在后续内容中。
            if (collapsed) toggle.scrollIntoView({ block: 'nearest' });
        });
    }

    function initProductFilters() {
        const filter = document.querySelector('.product-filter');
        if (!filter) return;
        const toggle = document.getElementById('productFilterToggle');
        const selection = document.getElementById('productFilterSelection');
        const mobileWidth = matchMedia('(max-width: 900px)');
        const all = filter.querySelector('.filter-all');
        const groupSetters = new Map();

        // 所有展开入口统一关闭其它分类，包括选中项回显和历史状态恢复。
        function expandGroup(group, animate = false) {
            groupSetters.forEach((setCollapsed, current) => {
                setCollapsed(current !== group, current === group && animate);
            });
        }

        function setPanelOpen(open) {
            filter.classList.toggle('is-open', open);
            if (toggle) toggle.setAttribute('aria-expanded', String(open));
        }

        function syncSelection() {
            const active = filter.querySelector('.filter-option.is-active');
            if (selection) selection.textContent = (active || all).textContent.trim();
            const resultTitle = document.getElementById('resultTitle');
            const grid = document.getElementById('productGrid');
            if (resultTitle && grid && !grid.dataset.lazyKeyword) {
                resultTitle.textContent = (active || all).textContent.trim();
            }
            filter.querySelectorAll('.filter-group').forEach((group) => {
                const selected = Boolean(group.querySelector('.filter-option.is-active'));
                group.classList.toggle('has-active', selected);
                if (selected && group.classList.contains('is-collapsed')) {
                    expandGroup(group, true);
                }
            });
        }

        // 浏览器禁用存储时，分类仍可正常展开和筛选。
        function readCollapsed(key) {
            try { return sessionStorage.getItem(key); } catch (error) { return null; }
        }

        let restoredGroup = null;
        filter.querySelectorAll('.filter-group-title').forEach((title) => {
            const group = title.closest('.filter-group');
            const options = group.querySelector('.filter-options');
            const key = 'deaofu-filter-collapsed:' + title.textContent.trim();
            if (!restoredGroup && readCollapsed(key) === '0') restoredGroup = group;
            const optionsStyle = getComputedStyle(options);
            const paddingTop = optionsStyle.paddingTop;
            const paddingBottom = optionsStyle.paddingBottom;
            function setCollapsed(collapsed, animate = false) {
                if (window.gsap) gsap.killTweensOf(options);
                group.classList.toggle('is-collapsed', collapsed);
                title.setAttribute('aria-expanded', String(!collapsed));
                options.inert = collapsed;
                try { sessionStorage.setItem(key, collapsed ? '1' : '0'); } catch (error) { /* 忽略存储限制 */ }
                if (!animate || reducedMotion.matches || !window.gsap) {
                    options.hidden = collapsed;
                    if (window.gsap) gsap.set(options, { clearProps: 'height,opacity,overflow,paddingTop,paddingBottom' });
                    return;
                }

                // 从当前高度接续动画，快速反复点击也不会跳回起点。
                if (options.hidden) {
                    options.hidden = false;
                    gsap.set(options, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 });
                }
                gsap.set(options, { overflow: 'hidden' });
                gsap.to(options, {
                    height: collapsed ? 0 : 'auto',
                    opacity: collapsed ? 0 : 1,
                    paddingTop: collapsed ? 0 : paddingTop,
                    paddingBottom: collapsed ? 0 : paddingBottom,
                    duration: .3,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        options.hidden = collapsed;
                        gsap.set(options, { clearProps: 'height,opacity,overflow,paddingTop,paddingBottom' });
                    }
                });
            }
            groupSetters.set(group, setCollapsed);
            // 先全部收起，初始化完成后最多恢复一个分类。
            setCollapsed(true);
            title.addEventListener('click', () => {
                if (group.classList.contains('is-collapsed')) expandGroup(group, true);
                else setCollapsed(true, true);
            });
        });

        const activeOption = filter.querySelector('.filter-option.is-active');
        expandGroup(activeOption ? activeOption.closest('.filter-group') : restoredGroup);

        if (toggle) {
            filter.classList.add('is-enhanced');
            setPanelOpen(false);
            toggle.addEventListener('click', () => setPanelOpen(!filter.classList.contains('is-open')));
            filter.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && mobileWidth.matches) {
                    setPanelOpen(false);
                    toggle.focus({ preventScroll: true });
                }
            });
        }
        filter.addEventListener('product-filter:changed', (event) => {
            syncSelection();
            if (mobileWidth.matches && event.detail.close) {
                setPanelOpen(false);
                if (toggle) toggle.focus({ preventScroll: true });
            }
        });
        syncSelection();
    }

    /**
     * 分类切换局部刷新：仅更新右侧产品列表，避免整页跳转导致左侧菜单闪烁
     */
    function initProductFilterNav() {
        const grid = document.getElementById('productGrid');
        const title = document.getElementById('resultTitle');
        const form = document.getElementById('productSearchForm');
        if (!grid || !title || !form) return;
        const filter = document.querySelector('.product-filter');
        const results = document.querySelector('.product-results');
        const status = document.getElementById('productResultsStatus');
        const labels = window.portalI18n.scroll;
        let pending = null;

        async function loadProducts(url, push) {
            if (pending) pending.abort();
            const request = new AbortController();
            pending = request;
            grid.dispatchEvent(new CustomEvent('lazy-grid:cancel'));
            results.setAttribute('aria-busy', 'true');
            results.classList.add('is-loading');
            status.textContent = labels.loading;
            try {
                const res = await fetch(url, { signal: request.signal });
                if (!res.ok) throw new Error('产品列表响应异常');
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                if (request !== pending) return;
                const newGrid = doc.getElementById('productGrid');
                const newTitle = doc.getElementById('resultTitle');
                if (!newGrid || !newTitle) throw new Error('产品列表结构缺失');
                grid.innerHTML = newGrid.innerHTML;
                title.textContent = newTitle.textContent;
                document.getElementById('productResultCount').textContent = doc.getElementById('productResultCount').textContent;
                document.getElementById('productSearch').value = doc.getElementById('productSearch').value;
                const target = new URL(url, location.origin);
                const selectedCategory = target.searchParams.get('categoryId') || '';
                const keyword = target.searchParams.get('keyword') || '';
                form.elements.categoryId.value = selectedCategory;
                form.elements.language.value = newGrid.dataset.lazyLanguage;
                document.getElementById('productFilterReset').hidden = !selectedCategory && !keyword;
                filter.querySelectorAll('a').forEach((link) => {
                    const linkUrl = new URL(link.href);
                    const active = (linkUrl.searchParams.get('categoryId') || '') === selectedCategory;
                    link.classList.toggle('is-active', active);
                    if (active) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                    if (keyword) linkUrl.searchParams.set('keyword', keyword);
                    else linkUrl.searchParams.delete('keyword');
                    link.href = linkUrl.href;
                });
                ['category-id', 'keyword', 'language', 'size', 'total', 'page'].forEach((name) => {
                    const attr = 'data-lazy-' + name;
                    if (newGrid.hasAttribute(attr)) grid.setAttribute(attr, newGrid.getAttribute(attr));
                    else grid.removeAttribute(attr);
                });
                filter.dispatchEvent(new CustomEvent('product-filter:changed', { detail: { close: push } }));
                grid.dispatchEvent(new CustomEvent('lazy-grid:reset'));
                if (push) history.pushState({}, '', target.pathname + target.search);
                status.textContent = labels.updated;
                // 在小屏幕已滚过列表标题时，把新结果带回可见区域。
                if (push && title.getBoundingClientRect().top < 90) {
                    title.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
                }
            } catch (error) {
                if (error.name !== 'AbortError') location.href = url;
            } finally {
                if (request === pending) {
                    results.removeAttribute('aria-busy');
                    results.classList.remove('is-loading');
                    pending = null;
                }
            }
        }

        function intercept(event, link) {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            loadProducts(link.href, true);
        }
        filter.querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => intercept(event, link)));
        const reset = document.getElementById('productFilterReset');
        reset.addEventListener('click', (event) => intercept(event, reset));
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const url = new URL(form.action);
            const data = new FormData(form);
            data.forEach((value, key) => {
                const normalized = String(value).trim();
                if (normalized) url.searchParams.set(key, normalized);
            });
            loadProducts(url.href, true);
        });
        window.addEventListener('popstate', () => loadProducts(location.href, false));
    }

    /** 同步动态分类标题，并在手机横向标签条中显示当前选中项。 */
    function initNewsTags() {
        const tags = document.getElementById('newsTags');
        const title = document.getElementById('newsResultTitle');
        if (!tags) return;
        const active = tags.querySelector('.is-active');
        if (!active) return;
        if (title) title.textContent = active.textContent.trim();
        const tagsBox = tags.getBoundingClientRect();
        const activeBox = active.getBoundingClientRect();
        tags.scrollLeft += activeBox.left - tagsBox.left - (tags.clientWidth - activeBox.width) / 2;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initProductMedia();
            initProductSpecs();
            initProductFilters();
            initProductFilterNav();
            initNewsTags();
        });
    } else {
        initProductMedia();
        initProductSpecs();
        initProductFilters();
        initProductFilterNav();
        initNewsTags();
    }

    /* ============================================================
     * 国家轮廓渲染与悬停交互
     * 数据源 world-countries.js (CC BY-SA 3.0)
     * 源 viewBox: 30.767,241.591 784.077x458.627  (X:[30.767,814.844] Y:[241.591,700.218])
     * 目标 viewBox: 0 0 1200 460
     * ============================================================ */
    const COUNTRY_NAMES = {
        ae: '阿联酋', af: '阿富汗', al: '阿尔巴尼亚', am: '亚美尼亚',
        ao: '安哥拉', ar: '阿根廷', at: '奥地利', au: '澳大利亚',
        az: '阿塞拜疆', ba: '波黑', bd: '孟加拉国', be: '比利时',
        bf: '布基纳法索', bg: '保加利亚', bi: '布隆迪', bj: '贝宁',
        bn: '文莱', bo: '玻利维亚', br: '巴西', bs: '巴哈马',
        bt: '不丹', bw: '博茨瓦纳', by: '白俄罗斯', bz: '伯利兹',
        ca: '加拿大', cd: '刚果（金）', cf: '中非', cg: '刚果（布）',
        ch: '瑞士', ci: '科特迪瓦', cl: '智利', cm: '喀麦隆',
        cn: '中国', co: '哥伦比亚', cr: '哥斯达黎加', cu: '古巴',
        cv: '佛得角', cy: '塞浦路斯', cz: '捷克', de: '德国',
        dj: '吉布提', dk: '丹麦', dm: '多米尼克', do: '多米尼加',
        dz: '阿尔及利亚', ec: '厄瓜多尔', ee: '爱沙尼亚', eg: '埃及',
        eh: '西撒哈拉', er: '厄立特里亚', es: '西班牙', et: '埃塞俄比亚',
        fi: '芬兰', fj: '斐济', fk: '福克兰群岛', fr: '法国',
        ga: '加蓬', gb: '英国', ge: '格鲁吉亚', gf: '法属圭亚那',
        gh: '加纳', gi: '直布罗陀', gl: '格陵兰', gm: '冈比亚',
        gn: '几内亚', gq: '赤道几内亚', gr: '希腊', gt: '危地马拉',
        gw: '几内亚比绍', gy: '圭亚那', hn: '洪都拉斯', hr: '克罗地亚',
        ht: '海地', hu: '匈牙利', id: '印度尼西亚', ie: '爱尔兰',
        il: '以色列', in: '印度', iq: '伊拉克', ir: '伊朗',
        is: '冰岛', it: '意大利', jm: '牙买加', jo: '约旦',
        jp: '日本', ke: '肯尼亚', kg: '吉尔吉斯斯坦', kh: '柬埔寨',
        kp: '朝鲜', kr: '韩国', kw: '科威特', kz: '哈萨克斯坦',
        la: '老挝', lb: '黎巴嫩', lk: '斯里兰卡', lr: '利比里亚',
        ls: '莱索托', lt: '立陶宛', lu: '卢森堡', lv: '拉脱维亚',
        ly: '利比亚', ma: '摩洛哥', md: '摩尔多瓦', me: '黑山',
        mg: '马达加斯加', mk: '北马其顿', ml: '马里', mm: '缅甸',
        mn: '蒙古', mr: '毛里塔尼亚', mt: '马耳他', mu: '毛里求斯',
        mv: '马尔代夫', mw: '马拉维', mx: '墨西哥', my: '马来西亚',
        mz: '莫桑比克', na: '纳米比亚', nc: '新喀里多尼亚', ne: '尼日尔',
        ng: '尼日利亚', ni: '尼加拉瓜', nl: '荷兰', no: '挪威',
        np: '尼泊尔', nz: '新西兰', om: '阿曼', pa: '巴拿马',
        pe: '秘鲁', pg: '巴布亚新几内亚', ph: '菲律宾', pk: '巴基斯坦',
        pl: '波兰', pr: '波多黎各', ps: '巴勒斯坦', pt: '葡萄牙',
        py: '巴拉圭', qa: '卡塔尔', ro: '罗马尼亚', rs: '塞尔维亚',
        ru: '俄罗斯', rw: '卢旺达', sa: '沙特阿拉伯', sb: '所罗门群岛',
        sc: '塞舌尔', sd: '苏丹', se: '瑞典', sg: '新加坡',
        si: '斯洛文尼亚', sk: '斯洛伐克', sl: '塞拉利昂', sn: '塞内加尔',
        so: '索马里', sr: '苏里南', ss: '南苏丹', sv: '萨尔瓦多',
        sy: '叙利亚', sz: '斯威士兰', td: '乍得', tg: '多哥',
        th: '泰国', tj: '塔吉克斯坦', tl: '东帝汶', tm: '土库曼斯坦',
        tn: '突尼斯', tr: '土耳其', tt: '特立尼达和多巴哥', tw: '中国台湾',
        tz: '坦桑尼亚', ua: '乌克兰', ug: '乌干达', us: '美国',
        uy: '乌拉圭', uz: '乌兹别克斯坦', ve: '委内瑞拉', vn: '越南',
        vu: '瓦努阿图', ye: '也门', za: '南非', zm: '赞比亚',
        zw: '津巴布韦', _somaliland: '索马里兰'
    };

    function renderCountries() {
        const container = document.querySelector('#countryPaths');
        if (!container) return;
        if (!window.WORLD_COUNTRIES_PATHS) {
            console.error('世界地图数据未加载（world-countries.js）');
            return;
        }

        // 首页由服务端按官网语言注入名称；非首页场景回退到内置中文字典。
        const countryNames = window.portalCountryNames && Object.keys(window.portalCountryNames).length
            ? window.portalCountryNames : COUNTRY_NAMES;
        const isEnglish = !String(document.documentElement.lang || '').toLowerCase().startsWith('zh');
        const displayName = code => {
            if (countryNames[code]) return countryNames[code];
            if (isEnglish && typeof Intl !== 'undefined' && Intl.DisplayNames) {
                try {
                    return new Intl.DisplayNames(['en'], {type: 'region'}).of(code.toUpperCase()) || code.toUpperCase();
                } catch (error) {
                    // 非标准地图区域代码回退到内置名称或代码。
                }
            }
            return COUNTRY_NAMES[code] || code.toUpperCase();
        };

        // 源 viewBox 映射到目标 viewBox 0 0 1200 460
        const sourceMinX = 30.767;
        const sourceMinY = 241.591;
        const sourceMaxX = 814.844;
        const sourceMaxY = 700.218;
        const scaleX = 1200 / (sourceMaxX - sourceMinX);
        const scaleY = 460 / (sourceMaxY - sourceMinY);
        const translateX = -sourceMinX * scaleX;
        const translateY = -sourceMinY * scaleY;

        // 解析 SVG：优先用 DOMParser；失败时降级到 innerHTML
        const SVG_NS = 'http://www.w3.org/2000/svg';
        let sourceSvg = null;

        const wrapped = '<svg xmlns="http://www.w3.org/2000/svg">' + window.WORLD_COUNTRIES_PATHS + '</svg>';
        const parser = new DOMParser();
        const doc = parser.parseFromString(wrapped, 'image/svg+xml');
        if (doc && doc.documentElement && doc.documentElement.tagName.toLowerCase() === 'svg') {
            sourceSvg = doc.documentElement;
        } else {
            // 降级方案：把内容塞进一个真实的 <svg> 元素，浏览器自己解析
            const temp = document.createElementNS(SVG_NS, 'svg');
            temp.style.display = 'none';
            temp.innerHTML = window.WORLD_COUNTRIES_PATHS;
            document.body.appendChild(temp);
            sourceSvg = temp;
            // 注意：temp 在函数末尾不会自动清理
        }

        if (!sourceSvg) {
            console.error('世界地图数据解析失败');
            return;
        }

        const wrapper = document.createElementNS(SVG_NS, 'g');
        wrapper.setAttribute('class', 'country-paths');
        wrapper.setAttribute('transform', `translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})`);

        // 遍历源 SVG 顶层子元素：单 path 或带 mainland+islands 的 <g>
        Array.from(sourceSvg.children).forEach((el) => {
            const tag = el.tagName.toLowerCase();
            if (tag !== 'path' && tag !== 'g') return;
            const code = el.getAttribute('id');
            if (!code) return;
            const sourcePaths = tag === 'g'
                ? Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'path')
                : [el];
            if (!sourcePaths.length) return;

            const countryGroup = document.createElementNS(SVG_NS, 'g');
            countryGroup.setAttribute('class', 'country');
            countryGroup.setAttribute('data-code', code);
            countryGroup.setAttribute('data-name', displayName(code));

            sourcePaths.forEach((p) => {
                const cloned = document.createElementNS(SVG_NS, 'path');
                cloned.setAttribute('d', p.getAttribute('d'));
                if (p.getAttribute('class') === 'mainland') {
                    cloned.setAttribute('class', 'country-mainland');
                } else {
                    cloned.setAttribute('class', 'country-island');
                }
                countryGroup.appendChild(cloned);
            });

            wrapper.appendChild(countryGroup);
        });

        container.appendChild(wrapper);

        // 移除临时 svg（如果用了降级方案）
        if (sourceSvg && sourceSvg.parentNode && sourceSvg.style && sourceSvg.style.display === 'none') {
            sourceSvg.parentNode.removeChild(sourceSvg);
        }

        // 悬停交互：GSAP 驱动颜色/描边/缩放过渡 + tooltip 渐显
        const tooltip = document.querySelector('#mapTooltip');
        const map = document.querySelector('#worldMap');

        // 品牌色（PRD 色彩系统：#003B5C 深海蓝 / #0F4C81 品牌主色 / #4A6FA5 静谧蓝）
        const COLOR = {
            baseFill: '#c3d1d3',
            baseStroke: '#ffffff',
            baseStrokeWidth: 0.6,
            hoverFill: 'rgba(15, 76, 129, 0.55)',  // 品牌主色 #0F4C81
            hoverStroke: '#ffffff',                   // 保持白色描边（不加边框线）
            hoverStrokeWidth: 0.6,                    // 保持基础描边宽度
            hoverScale: 1.003                         // 极轻微缩放
        };
        const ease = 'power2.out';

        // 初始化 tooltip 定位：让锚点位于国家中心，tooltip 在锚点上方
        if (window.gsap && tooltip) {
            gsap.set(tooltip, { xPercent: -50, yPercent: -130, opacity: 0, scale: 0.96 });
        }

        function showTooltip(countryGroup) {
            if (!tooltip || !map) return;
            const mapBox = map.getBoundingClientRect();
            const rect = countryGroup.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const centerX = rect.left + rect.width / 2 - mapBox.left;
            const centerY = rect.top + rect.height / 2 - mapBox.top;
            tooltip.textContent = countryGroup.getAttribute('data-name');
            tooltip.style.left = `${centerX}px`;
            tooltip.style.top = `${centerY}px`;
            tooltip.classList.add('is-visible');
            if (window.gsap) {
                gsap.fromTo(tooltip,
                    { opacity: 0, y: 8, scale: 0.94 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.45, ease, overwrite: 'auto' }
                );
            } else {
                tooltip.style.opacity = '1';
            }
        }

        function moveTooltip(countryGroup) {
            if (!tooltip || !map) return;
            const mapBox = map.getBoundingClientRect();
            const rect = countryGroup.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - mapBox.left;
            const centerY = rect.top + rect.height / 2 - mapBox.top;
            tooltip.style.left = `${centerX}px`;
            tooltip.style.top = `${centerY}px`;
        }

        function animateCountry(countryGroup, hover) {
            const paths = countryGroup.querySelectorAll('path');
            if (!paths.length) return;
            if (window.gsap) {
                // 只动填充色，描边保持原样
                gsap.to(paths, {
                    duration: hover ? 0.35 : 0.28,
                    fill: hover ? COLOR.hoverFill : COLOR.baseFill,
                    ease,
                    overwrite: 'auto'
                });
                // 极轻微的整体放大，几乎察觉不到
                const box = countryGroup.getBBox();
                if (box && box.width && box.height) {
                    const cx = box.x + box.width / 2;
                    const cy = box.y + box.height / 2;
                    gsap.to(countryGroup, {
                        duration: hover ? 0.4 : 0.3,
                        scale: hover ? COLOR.hoverScale : 1,
                        transformOrigin: `${cx}px ${cy}px`,
                        ease,
                        overwrite: 'auto'
                    });
                }
            } else {
                paths.forEach((p) => {
                    p.style.fill = hover ? COLOR.hoverFill : COLOR.baseFill;
                });
            }
        }

        function hideTooltip() {
            if (!tooltip) return;
            if (window.gsap) {
                gsap.to(tooltip, {
                    opacity: 0,
                    y: -4,
                    scale: 0.96,
                    duration: 0.3,
                    ease,
                    onComplete: () => tooltip.classList.remove('is-visible')
                });
            } else {
                tooltip.style.opacity = '0';
                tooltip.classList.remove('is-visible');
            }
        }

        wrapper.querySelectorAll('.country').forEach((countryGroup) => {
            countryGroup.addEventListener('mouseenter', () => {
                animateCountry(countryGroup, true);
                showTooltip(countryGroup);
            });
            countryGroup.addEventListener('mousemove', () => moveTooltip(countryGroup));
            countryGroup.addEventListener('mouseleave', () => {
                animateCountry(countryGroup, false);
                hideTooltip();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCountries);
    } else {
        renderCountries();
    }

    /* ============================================================
     * 地图点位悬停提示
     * ============================================================ */
    document.querySelectorAll('.map-point').forEach((point) => {
        const tooltip = document.querySelector('#mapTooltip');
        const map = document.querySelector('#worldMap');
        if (!tooltip || !map) return;

        point.addEventListener('mouseenter', () => {
            const pointBox = point.getBoundingClientRect();
            const mapBox = map.getBoundingClientRect();
            tooltip.textContent = point.dataset.country;
            tooltip.style.left = `${pointBox.left - mapBox.left + pointBox.width / 2}px`;
            tooltip.style.top = `${pointBox.top - mapBox.top}px`;
            tooltip.classList.add('is-visible');
        });
        point.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));
    });

        /* ============================================================
     * 语言切换：点击 -> 写入 ?lang= URL 参数，
     * 由 I18nConfig.LocaleChangeInterceptor 处理并写入 CookieLocaleResolver。
     * ============================================================ */
    const language = document.querySelector('#langToggle');
    if (language) {
        language.addEventListener('click', (event) => {
            event.preventDefault();
            const next = (window.portalI18n && window.portalI18n.lang && window.portalI18n.lang.next)
                || language.dataset.lang
                || 'en';
            const url = new URL(window.location.href);
            url.searchParams.set('lang', next);
            // 内容按语言独立维护，切换时清除旧语言的分类及分页条件。
            if (!legacyPage) ['language', 'categoryId', 'tagId', 'pageNum'].forEach((key) => url.searchParams.delete(key));
            if (/^\/product\//.test(url.pathname)) url.pathname = '/products';
            if (/^\/news\//.test(url.pathname)) url.pathname = '/news';
            window.location.href = url.toString();
        });
    }

    /* ============================================================
     * GSAP 滚动叙事：通用 reveal 入场动画
     * ============================================================ */
    function initLegacyRevealAnimations() {
        if (!window.gsap || !window.ScrollTrigger) return;

        const gsap = window.gsap;
        gsap.registerPlugin(window.ScrollTrigger);

        const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduce) {
            // 用户偏好减弱动效：直接清除所有 reveal 隐藏态
            document.querySelectorAll('.reveal, .reveal--small, .reveal--scale')
                .forEach((el) => el.style.removeProperty('opacity'));
            return;
        }

        // 1) 章节顶部 hairline：从左向右生长
        document.querySelectorAll('.hairline--top').forEach((line) => {
            gsap.to(line, {
                scaleX: 1, duration: 0.9, ease: 'power2.inOut',
                scrollTrigger: { trigger: line, start: 'top 90%', once: true }
            });
        });

        // 2) Hero 玻璃光斑：进入后缓慢漂移循环
        document.querySelectorAll('.glass-spot').forEach((spot, idx) => {
            gsap.fromTo(spot,
                { opacity: 0, scale: 0.7 },
                {
                    opacity: 1, scale: 1, duration: 1.4, delay: 0.3 + idx * 0.2, ease: 'power3.out',
                    onComplete: () => {
                        // 漂移循环
                        gsap.to(spot, {
                            y: '+=18', x: idx % 2 ? '+=10' : '-=10',
                            duration: 4 + idx, yoyo: true, repeat: -1, ease: 'sine.inOut'
                        });
                    }
                }
            );
        });

        // 3) 通用 reveal：标题 / 段落 / kicker / 章节标签
        const sectionHeadEls = document.querySelectorAll(
            '.section-head > *, .intro h2, .intro p, .intro .lead, .intro-stats, ' +
            '.capability h2, .capability p, .capability .feature-list, ' +
            '.intro .section-label, .kicker, .center-title, .section-note'
        );
        sectionHeadEls.forEach((el) => {
            if (el.classList.contains('reveal') ||
                el.classList.contains('reveal--small') ||
                el.classList.contains('reveal--scale')) return;
            el.classList.add('reveal');
        });

        // 4) 卡片（产品 / 新闻）：stagger 入场
        document.querySelectorAll('.product-card').forEach((el) => el.classList.add('reveal'));
        document.querySelectorAll('.news-feature, .news-item').forEach((el) => el.classList.add('reveal'));

        // 5) Feature 列表项：stagger
        document.querySelectorAll('.feature-list > div').forEach((el) => el.classList.add('reveal--small'));

        // 6) Intro 数据块：单独动画
        document.querySelectorAll('.intro-stats > div').forEach((el) => el.classList.add('reveal--small'));

        // 7) 地图元素：进入视口时按距离 stagger 出现（用 GSAP fromTo，不加 .reveal 类避免 SVG transform 兼容问题）
        const mapPoints = document.querySelectorAll('.map-points circle');
        const mapLabels = document.querySelectorAll('.map-labels text');
        if (mapPoints.length) {
            gsap.fromTo(mapPoints,
                { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' },
                {
                    opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)',
                    stagger: 0.08,
                    scrollTrigger: { trigger: '.world-map', start: 'top 80%', once: true }
                }
            );
        }
        if (mapLabels.length) {
            gsap.fromTo(mapLabels,
                { opacity: 0, y: 10 },
                {
                    opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
                    stagger: 0.08, delay: 0.3,
                    scrollTrigger: { trigger: '.world-map', start: 'top 80%', once: true }
                }
            );
        }

        // 9) 触发批量 reveal 动画（按 section 分组，stagger）
        const revealGroups = [
            { selector: '.intro .container > *', trigger: '.intro' },
            { selector: '.products .product-card', trigger: '.product-grid', stagger: 0.12 },
            { selector: '.capability .container > *', trigger: '.capability .container' },
            { selector: '.capability .feature-list > div', trigger: '.feature-list', stagger: 0.1 },
            { selector: '.logistics .container > *', trigger: '.logistics' },
            { selector: '.news .news-feature, .news .news-item', trigger: '.news-grid', stagger: 0.14 },
        ];

        revealGroups.forEach((group) => {
            const targets = document.querySelectorAll(group.selector);
            const trigger = document.querySelector(group.trigger);
            if (!targets.length || !trigger) return;
            gsap.fromTo(targets,
                { opacity: 0, y: 28 },
                {
                    opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
                    stagger: group.stagger || 0.08,
                    scrollTrigger: { trigger, start: 'top 80%', once: true }
                }
            );
        });

        // 10) 通用 .reveal 元素：单独的兜底动画
        document.querySelectorAll('.reveal:not([data-reveal-bound]), .reveal--small:not([data-reveal-bound]), .reveal--scale:not([data-reveal-bound])').forEach((el) => {
            el.dataset.revealBound = '1';
        });

        // 11) Logo 墙：进入视口时 logo 渐入（保留原色，不加灰度）
        const logoImages = document.querySelectorAll('.logo-grid img');
        if (logoImages.length) {
            gsap.fromTo(logoImages,
                { opacity: 0, y: 12, filter: 'blur(2px)' },
                {
                    opacity: 1, y: 0, filter: 'blur(0px)',
                    duration: 0.7, ease: 'power2.out', stagger: 0.05,
                    scrollTrigger: { trigger: '.logo-marquee', start: 'top 85%', once: true }
                }
            );
        }

        // 12) 工厂图：进入视口时轻微缩放 + 投影
        const factoryImage = document.querySelector('.factory-image');
        if (factoryImage) {
            gsap.fromTo(factoryImage,
                { opacity: 0, scale: 0.96, y: 30 },
                {
                    opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out',
                    scrollTrigger: { trigger: factoryImage, start: 'top 85%', once: true }
                }
            );
        }

        // 13) 按钮光泽扫过
        document.querySelectorAll('.button-primary').forEach((btn) => {
            btn.addEventListener('mouseenter', () => {
                gsap.fromTo(btn,
                    { '--shine-x': '-120%' },
                    { '--shine-x': '220%', duration: 0.7, ease: 'power2.out' }
                );
            });
        });
    }

    function initRevealAnimations() {
        if (legacyPage) return initLegacyRevealAnimations();
        if (!window.gsap || !window.ScrollTrigger || reducedMotion.matches) return;
        gsap.registerPlugin(ScrollTrigger);
        // 每个可见单元只绑定一次；正文保留可读性，避免父子叠加淡入导致发灰。
        document.querySelectorAll('.hairline--top').forEach((line) => {
            gsap.to(line, { scaleX: 1, duration: .5, scrollTrigger: { trigger: line, start: 'top 95%', once: true } });
        });
        document.querySelectorAll('.section-head, .intro h2, .product-card, .news-card, .factory-image').forEach((element) => {
            gsap.fromTo(element, { y: 14 }, {
                y: 0, duration: .5, ease: 'power2.out', clearProps: 'transform',
                scrollTrigger: { trigger: element, start: 'top 96%', once: true }
            });
        });
    }

    /* ============================================================
     * 数字计数：GSAP 增强版（更平滑 + 易维护）
     * ============================================================ */
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        if (window.gsap && window.ScrollTrigger) {
            const gsap = window.gsap;
            counters.forEach((el) => {
                const target = Number(el.dataset.count);
                const obj = { val: 0 };
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                    onEnter: () => {
                        gsap.to(obj, {
                            val: target, duration: 1.6, ease: 'power3.out',
                            onUpdate: () => { el.textContent = Math.round(obj.val); }
                        });
                    }
                });
            });
        } else {
            // 降级：原生 rAF（保留旧实现）
            counters.forEach((element) => {
                const observer = new IntersectionObserver((entries) => {
                    if (!entries[0].isIntersecting) return;
                    const target = Number(element.dataset.count);
                    const start = performance.now();
                    function tick(now) {
                        const progressValue = Math.min((now - start) / 1100, 1);
                        element.textContent = Math.round(target * (1 - Math.pow(1 - progressValue, 3)));
                        if (progressValue < 1) requestAnimationFrame(tick);
                    }
                    requestAnimationFrame(tick);
                    observer.disconnect();
                }, { threshold: 0.65 });
                observer.observe(element);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initRevealAnimations();
            initCounters();
        });
    } else {
        initRevealAnimations();
        initCounters();
    }
})();
