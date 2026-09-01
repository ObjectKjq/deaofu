/**
 * 官网前台列表页无限滚动加载。
 *
 * <p>约定：
 * <ul>
 *     <li>触发容器为带 {@code data-lazy-grid} 的元素；其子节点中带 {@code data-lazy-sentinel}
 *         的元素作为滚动哨兵，触发加载下一页；带 {@code data-lazy-end} 的元素作为"已加载完"占位。</li>
 *     <li>服务端接口遵循 {@link com.deaofu.common.BaseResponse}&lt;{@link com.deaofu.common.PageResult}&lt;T&gt;&gt;
 *         协议，{@code data.total} 为总量，{@code data.list} 为本页数据。</li>
 *     <li>加载期间通过为 {@code document.documentElement} 添加 {@code data-lazy-busy} 属性
 *         阻止重复触发；全部加载完成后移除哨兵并解除 footer 隐藏。</li>
 * </ul>
 *
 * <p>页脚防穿透策略：列表页首次渲染时为 {@code <footer>} 注入 {@code data-lazy-loading}
 * 属性并通过 CSS 隐藏；只有当全部卡片加载完毕（{@code loaded >= total}）后才解除隐藏，
 * 让用户在文档流末尾自然滚动到页脚。
 */
(() => {
    'use strict';

    const FOOTER_HIDDEN_ATTR = 'data-lazy-loading';
    const BUSY_ATTR = 'data-lazy-busy';
    const FOOTER_SELECTOR = 'footer.footer, .site-footer, footer';

    /**
     * 将单条数据序列化为可插入 DOM 的 HTML 字符串。
     *
     * @param {HTMLElement} grid 列表容器，模板渲染时参照其已有的卡片结构
     * @param {object} item 数据项
     * @returns {string} 卡片 HTML
     */
    function renderCard(grid, item) {
        const template = grid.getAttribute('data-lazy-template') || '';
        if (template === 'news') {
            return renderNewsCard(item);
        }
        return renderProductCard(item);
    }

    /**
     * 产品卡片 HTML 渲染（与 templates/portal/products.html 保持一致）。
     */
    function renderProductCard(item) {
        const cover = item.coverUrl
            ? `<img src="${escapeAttr(item.coverUrl)}" alt="${escapeAttr(item.title || '')}" loading="lazy"/>`
            : '';
        const parent = item.parentCategoryName ? `${escapeHtml(item.parentCategoryName)} · ` : '';
        const params = (item.parameters || []).map(p => {
            const label = escapeHtml(p.label || '');
            const value = escapeHtml(p.value || '');
            return `<div class="parameter-row"><span>${label}</span><b>${value}</b></div>`;
        }).join('');
        return `
<a class="catalog-card" href="/product/${encodeURIComponent(item.productId || '')}">
    <div class="catalog-card-media">
        ${cover}
        <span class="catalog-card-tag">${escapeHtml(item.categoryName || '')}</span>
    </div>
    <div class="catalog-card-body">
        <h3>${escapeHtml(item.title || '')}</h3>
        <p>${escapeHtml(item.summary || '')}</p>
        ${params ? `<div class="catalog-card-params">${params}</div>` : ''}
        <div class="catalog-card-footer">
            <span class="catalog-card-spec">${parent}${escapeHtml(item.categoryName || '')}</span>
            <span class="catalog-card-link">查看详情 <span>↗</span></span>
        </div>
    </div>
</a>`;
    }

    /**
     * 公司动态卡片 HTML 渲染（与 templates/portal/news.html 保持一致）。
     */
    function renderNewsCard(item) {
        const cover = item.coverUrl
            ? `<img src="${escapeAttr(item.coverUrl)}" alt="${escapeAttr(item.title || '')}" loading="lazy"/>`
            : '';
        const tagName = (item.tags && item.tags[0] && item.tags[0].tagName) || '公司动态';
        const dateText = formatDate(item.createTime);
        const dateAttr = dateText.slice(0, 10);
        return `
<a class="news-center-card" href="/news/${encodeURIComponent(item.newsId || '')}">
    <div class="news-center-media">
        ${cover}
        <span class="news-center-category">${escapeHtml(tagName)}</span>
    </div>
    <div class="news-center-body">
        <div class="news-center-meta">
            <span>${escapeHtml(tagName)}</span>
            <time datetime="${dateAttr}">${dateAttr.slice(0, 7).replace('-', '.')}.${dateAttr.slice(8, 10)}</time>
        </div>
        <h3>${escapeHtml(item.title || '')}</h3>
        <p>${escapeHtml(item.summary || '')}</p>
        <span class="news-center-link">阅读详情 <span>↗</span></span>
    </div>
</a>`;
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(str) {
        return escapeHtml(str);
    }

    function formatDate(value) {
        if (!value) return '';
        const d = new Date(value);
        if (isNaN(d.getTime())) return '';
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    /**
     * 给页脚加上隐藏标记；所有 grid 都未加载完前页脚不可见。
     */
    function hideFooter() {
        const footer = document.querySelector(FOOTER_SELECTOR);
        if (footer) footer.setAttribute(FOOTER_HIDDEN_ATTR, 'true');
        document.body.setAttribute(FOOTER_HIDDEN_ATTR, 'true');
    }

    function showFooter() {
        const footer = document.querySelector(FOOTER_SELECTOR);
        if (footer) footer.removeAttribute(FOOTER_HIDDEN_ATTR);
        document.body.removeAttribute(FOOTER_HIDDEN_ATTR);
    }

    /**
     * 构造下一页请求 URL。
     */
    function buildUrl(grid, pageNum) {
        const base = grid.getAttribute('data-lazy-url');
        const params = new URLSearchParams();
        params.set('pageNum', String(pageNum));
        params.set('pageSize', String(grid.getAttribute('data-lazy-size') || 9));
        const categoryId = grid.getAttribute('data-lazy-category-id');
        if (categoryId) params.set('categoryId', categoryId);
        const tagId = grid.getAttribute('data-lazy-tag-id');
        if (tagId) params.set('tagId', tagId);
        const keyword = grid.getAttribute('data-lazy-keyword');
        if (keyword) params.set('keyword', keyword);
        return `${base}?${params.toString()}`;
    }

    /**
     * 把新一页的卡片追加到 grid 中（插入到 sentinel 之前）。
     */
    function appendCards(grid, items) {
        const sentinel = grid.querySelector('[data-lazy-sentinel]');
        const html = items.map(it => renderCard(grid, it)).join('');
        if (sentinel) {
            sentinel.insertAdjacentHTML('beforebegin', html);
        } else {
            grid.insertAdjacentHTML('beforeend', html);
        }
    }

    /**
     * 标记当前 grid 加载完毕：移除哨兵，显示"已经到底了"。
     */
    function finish(grid) {
        const sentinel = grid.querySelector('[data-lazy-sentinel]');
        const end = grid.querySelector('[data-lazy-end]');
        if (sentinel) sentinel.remove();
        if (end) end.hidden = false;
        grid.setAttribute('data-lazy-done', 'true');
        // 全部 grid 完成后再显示 footer
        if (document.querySelector('[data-lazy-grid]:not([data-lazy-done])') === null) {
            showFooter();
        }
    }

    async function loadMore(grid, state) {
        if (state.busy || state.done) return;
        state.busy = true;
        grid.setAttribute(BUSY_ATTR, 'true');
        try {
            const url = buildUrl(grid, state.pageNum + 1);
            const resp = await fetch(url, {headers: {'Accept': 'application/json'}});
            const json = await resp.json();
            const data = (json && json.data) || {};
            const list = Array.isArray(data.list) ? data.list : [];
            const total = Number(data.total || 0);
            state.total = total;
            state.pageNum += 1;
            state.loaded += list.length;
            appendCards(grid, list);
            if (state.loaded >= total || list.length === 0) {
                state.done = true;
                finish(grid);
            }
        } catch (err) {
            console.error('[lazy-load] 加载失败：', err);
        } finally {
            state.busy = false;
            grid.removeAttribute(BUSY_ATTR);
        }
    }

    /**
     * 在外部把 grid 的 innerHTML 整体替换后（例如 SPA 风格的分类切换），
     * 重置分页状态。
     *
     * <p>触发条件：grid 派发 {@code lazy-grid:reset} 自定义事件。
     * 重置内容包括：
     * <ul>
     *     <li>{@code state.pageNum / loaded / total / busy / done} 全部回到首屏状态；</li>
     *     <li>移除 {@code data-lazy-done} / {@code data-lazy-busy} 标记；</li>
     *     <li>重新隐藏 footer（避免上次分类翻完显示后被带过来）；</li>
     *     <li>若新 sentinel 已接近视口，主动触发一次加载。</li>
     * </ul>
     */
    function resetGridState(grid, state) {
        // 上次分类翻完时可能已经 showFooter()，这里要重新隐藏。
        hideFooter();
        const sentinel = grid.querySelector('[data-lazy-sentinel]');
        const initialCount = grid.querySelectorAll('a.catalog-card, a.news-center-card').length;
        state.pageNum = 1;
        state.size = Number(grid.getAttribute('data-lazy-size') || state.size || 9);
        state.loaded = initialCount;
        state.total = Number(grid.getAttribute('data-lazy-total') || Infinity);
        state.busy = false;
        state.done = !sentinel;
        grid.removeAttribute(BUSY_ATTR);
        grid.removeAttribute('data-lazy-done');
        if (!sentinel) {
            grid.setAttribute('data-lazy-done', 'true');
            if (document.querySelector('[data-lazy-grid]:not([data-lazy-done])') === null) {
                showFooter();
            }
            return;
        }
        // 还原"已经到底了"的隐藏态（上次分类可能已显示）。
        const end = grid.querySelector('[data-lazy-end]');
        if (end) end.hidden = true;
        // 新内容如果很短，sentinel 已近可视区，主动加载一次。
        const rect = sentinel.getBoundingClientRect();
        if (rect.top < innerHeight + 200) loadMore(grid, state);
    }

    /**
     * 初始化单个 grid 的滚动监听。
     *
     * <p>采用 {@code scroll} 事件而非 {@link IntersectionObserver}：
     * IO 只能在元素"穿过"边界时回调；当用户停留在顶部时，加载完一页
     * 后哨兵会被新插入的卡片推下视口，IO 不再触发，页面就会卡在
     * "正在加载更多…"的转圈状态。scroll 事件每次滚动都会重新判断
     * 哨兵是否接近视口，从而保证"滚到底部继续加载"。
     */
    function initGrid(grid) {
        const sentinel = grid.querySelector('[data-lazy-sentinel]');
        const initialCount = grid.querySelectorAll('a.catalog-card, a.news-center-card').length;
        const state = {pageNum: 1, size: Number(grid.getAttribute('data-lazy-size') || 9), loaded: initialCount, total: Number(grid.getAttribute('data-lazy-total') || Infinity), busy: false, done: false};
        hideFooter();
        // 没有 sentinel 视为没有需要懒加载的数据（菜单无结果），直接视为完成
        if (!sentinel) {
            state.done = true;
            grid.setAttribute('data-lazy-done', 'true');
            // 全部 grid 完成后再显示 footer
            if (document.querySelector('[data-lazy-grid]:not([data-lazy-done])') === null) {
                showFooter();
            }
        } else {
            // 提供给 SPA 风格的分类切换：main.js 在替换 grid.innerHTML 后
            // dispatch('lazy-grid:reset')，回调里把分页状态全部归零。
            grid.addEventListener('lazy-grid:reset', () => resetGridState(grid, state));
            let scrollTicking = false;
            const onScroll = () => {
                if (scrollTicking || state.busy || state.done) return;
                scrollTicking = true;
                requestAnimationFrame(() => {
                    scrollTicking = false;
                    const currentSentinel = grid.querySelector('[data-lazy-sentinel]');
                    if (!currentSentinel) return;
                    const rect = currentSentinel.getBoundingClientRect();
                    // 哨兵进入"距视口底部 200px"内才触发；不要用 innerHeight - rect.top，
                    // 否则页面顶部时也会触发。
                    if (rect.top < innerHeight + 200) {
                        loadMore(grid, state);
                    }
                });
            };
            addEventListener('scroll', onScroll, {passive: true});
            // 首次进入：若哨兵已经接近视口（短页面或小屏），主动触发一次
            const rect = sentinel.getBoundingClientRect();
            if (rect.top < innerHeight + 200) loadMore(grid, state);
        }
    }

    function init() {
        const grids = document.querySelectorAll('[data-lazy-grid]');
        if (!grids.length) return;
        // 禁用浏览器滚动位置恢复：切换菜单返回时 Chrome 会尝试恢复上一次
        // 的滚动位置，而 SSR 只有第一页数据，恢复到底部后不会再产生
        // scroll 事件，导致"正在加载更多…"卡死。禁用后每次进入都从
        // 页面顶部开始，与刷新行为一致。
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        // 先隐藏 footer，避免加载过程中用户意外看到
        hideFooter();
        grids.forEach(initGrid);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
