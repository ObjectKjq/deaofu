/** 列表分页：保留页脚入口，按需加载；筛选变化时取消过期请求。 */
(() => {
    const labels = window.portalI18n.scroll;
    const cardLabels = window.portalI18n.card;
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));

    function renderCard(grid, item, index) {
        const language = grid.dataset.lazyLanguage;
        const suffix = language ? '?language=' + encodeURIComponent(language) : '';
        const image = item.coverUrl ? `<img src="${escape(item.coverUrl)}" alt="${escape(item.title)}" loading="lazy"/>` : '';
        if (grid.dataset.lazyTemplate === 'news') {
            const tag = item.tags?.[0]?.tagName || cardLabels.defaultTag;
            const date = new Date(item.createTime);
            const dateText = Number.isNaN(date.getTime()) ? '' : [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
            return `<a class="news-center-card" href="/news/${encodeURIComponent(item.newsId)}${suffix}">
                <div class="news-center-media">${image}<span class="news-center-category">${escape(tag)}</span></div>
                <div class="news-center-body"><div class="news-center-meta"><span>${escape(tag)}</span><time datetime="${dateText}">${dateText.replaceAll('-', '.')}</time></div>
                    <h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p>
                    <span class="news-center-link"><span>${escape(cardLabels.news)}</span> <span>↗</span></span></div></a>`;
        }
        const category = item.categoryName || '';
        const spec = item.parentCategoryName ? item.parentCategoryName + ' · ' + category : category;
        return `<a class="catalog-card" href="/product/${encodeURIComponent(item.productId)}${suffix}">
            <div class="catalog-card-media">${image}<span class="catalog-card-tag">${escape(category)}</span></div>
            <div class="catalog-card-body"><span class="catalog-card-code">P-${String(index + 1).padStart(2, '0')} / ${escape(category)}</span>
                <h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p>
                <div class="catalog-card-footer"><span class="catalog-card-spec">${escape(spec)}</span>
                    <span class="catalog-card-link"><span>${escape(cardLabels.detail)}</span> <span>↗</span></span></div></div></a>`;
    }

    document.querySelectorAll('[data-lazy-grid]').forEach((grid) => {
        let state;
        function cancel() {
            if (state?.request) state.request.abort();
            if (state) state.cancelled = true;
        }
        function reset() {
            cancel();
            grid.removeAttribute('aria-busy');
            const loaded = grid.querySelectorAll('a.catalog-card, a.news-center-card').length;
            const total = Number(grid.dataset.lazyTotal ?? loaded);
            const sentinel = grid.querySelector('[data-lazy-sentinel]');
            const end = grid.querySelector('[data-lazy-end]');
            state = { loaded, total, page: Number(grid.dataset.lazyPage || 1), request: null, cancelled: false };
            if (loaded >= total) {
                if (sentinel) sentinel.remove();
                if (end) { end.hidden = false; end.setAttribute('role', 'status'); }
                return;
            }
            if (!sentinel) return;
            sentinel.removeAttribute('aria-hidden');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'load-more-button';
            button.textContent = labels.more;
            button.setAttribute('aria-controls', grid.id);
            const feedback = document.createElement('span');
            feedback.className = 'load-more-status';
            feedback.setAttribute('role', 'status');
            feedback.setAttribute('aria-live', 'polite');
            sentinel.replaceChildren(button, feedback);
            button.addEventListener('click', async () => {
                if (state.request || state.cancelled) return;
                const current = state;
                const request = new AbortController();
                current.request = request;
                button.disabled = true;
                button.textContent = labels.loading;
                feedback.textContent = labels.loading;
                grid.setAttribute('aria-busy', 'true');
                try {
                    const params = new URLSearchParams({ pageNum: String(current.page + 1), pageSize: grid.dataset.lazySize || '9' });
                    ['categoryId', 'keyword', 'tagId', 'language'].forEach((name) => {
                        const value = grid.getAttribute('data-lazy-' + name.replace(/[A-Z]/g, (char) => '-' + char.toLowerCase()));
                        if (value) params.set(name, value);
                    });
                    const response = await fetch(grid.dataset.lazyUrl + '?' + params, { signal: request.signal, headers: { Accept: 'application/json' } });
                    const result = await response.json();
                    if (current !== state || current.cancelled) return;
                    if (!response.ok || result.code !== 0 || !Array.isArray(result.data?.list)) throw new Error('列表加载失败');
                    const items = result.data.list;
                    const previousCount = current.loaded;
                    sentinel.insertAdjacentHTML('beforebegin', items.map((item, index) => renderCard(grid, item, previousCount + index)).join(''));
                    current.page += 1;
                    current.loaded += items.length;
                    current.total = Number(result.data.total);
                    // 新增卡片获得焦点，键盘用户无需倒退寻找新内容。
                    const firstNew = grid.querySelectorAll('a.catalog-card, a.news-center-card')[previousCount];
                    if (firstNew) firstNew.focus({ preventScroll: true });
                    feedback.textContent = labels.updated;
                    if (current.loaded >= current.total || !items.length) {
                        sentinel.remove();
                        if (end) { end.hidden = false; end.setAttribute('role', 'status'); }
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        button.textContent = labels.retry;
                        feedback.textContent = labels.retry;
                    }
                } finally {
                    if (current === state && !current.cancelled) {
                        current.request = null;
                        button.disabled = false;
                        if (button.textContent === labels.loading) button.textContent = labels.more;
                        grid.removeAttribute('aria-busy');
                    }
                }
            });
        }
        grid.addEventListener('lazy-grid:cancel', cancel);
        grid.addEventListener('lazy-grid:reset', reset);
        reset();
    });
})();
