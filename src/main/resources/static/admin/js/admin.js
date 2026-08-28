(function () {
    'use strict';
    const API = '/admin';
    const workspace = document.getElementById('workspace');
    const moduleTitles = {
        products: '产品管理',
        categories: '产品分类管理',
        routes: '运输路线管理',
        partners: '合作企业管理',
        news: '公司动态管理',
        tags: '动态标签管理',
        consultations: '咨询信息管理'
    };
    const pageState = {};
    const openTabs = new Map();
    let activeModule;
    let tabOffset = 0;
    const endpoints = {
        products: 'products',
        categories: 'product-categories',
        tags: 'news-tags',
        routes: 'transport-routes',
        partners: 'partner-companies',
        news: 'news',
        consultations: 'consultations'
    };
    // 分类页面处于展开状态的一级分类ID集合（翻页/搜索后保持）
    const expandedCategories = new Set();
    let layuiLayer;
    let layerIndex;
    window.layui?.use(['layer', 'element', 'form'], () => {
        layuiLayer = window.layui.layer;
        window.layui.element.render('nav');
    });
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[c]));
    const time = value => value ? String(value).replace('T', ' ').slice(0, 19) : '-';
    const image = (url, cls = 'thumb') => url ? `<img class="${cls}" src="${escapeHtml(url)}" alt="">` : `<span class="${cls}"></span>`;
    const request = async (url, options = {}) => {
        const response = await fetch(url, {
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json', ...(options.headers || {})}, ...options
        });
        const body = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
        if (!response.ok || (body && body.code !== 0)) throw new Error(body?.message || '请求失败，请稍后重试');
        return body?.data;
    };
    const notify = message => layuiLayer ? layuiLayer.msg(message, {icon: 2, time: 2400}) : window.alert(message);
    // 图片预览遮罩层：点击任意处关闭
    const openPreview = url => {
        const mask = document.createElement('div');
        mask.className = 'image-preview-mask';
        mask.innerHTML = `<img src="${escapeHtml(url)}" alt="图片预览">`;
        mask.addEventListener('click', () => mask.remove());
        document.body.appendChild(mask);
    };
    const modal = (title, body, actions = '', module = '') => {
        const content = `<div class="layui-form" style="padding:20px 24px 4px">${body}${actions ? `<div class="layui-form-item" style="margin-bottom:0"><div class="layui-input-block" style="margin-left:0;text-align:right;border-top:1px solid #f2f2f2;padding-top:15px;margin-top:15px;padding-bottom:20px">${actions}</div></div>` : ''}</div>`;
        let shadeObserver = null;
        const syncShadeHeight = () => {
            const shade = document.querySelector('.layui-layer-shade');
            if (shade) shade.style.height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) + 'px';
        };
        const isMobile = () => window.matchMedia('(max-width:768px)').matches;
        // 公司动态弹窗加宽；正文编辑已移至全屏层，表单高度有限，弹窗高度自适应内容
        const layerArea = isMobile() ? ['92vw', 'auto'] : [module === 'news' ? '820px' : '650px', 'auto'];
        if (layuiLayer) {
            layerIndex = layuiLayer.open({
                type: 1,
                title,
                area: layerArea,
                shadeClose: false,
                skin: module === 'news' ? 'layui-layer-news' : '',
                content,
                success: layero => {
                    const node = layero && layero[0] ? layero[0] : layero;
                    // 渲染完成后由 JS 计算水平位置，避免 layui 内联定位与 CSS 覆盖冲突导致闪动
                    if (node && node.style) {
                        // 强制高度自适应内容：layui 默认会把高度限制在视口内，
                        // 配合 overflow:visible 会导致超出部分没有白色背景
                        node.style.height = 'auto';
                        const contentNode = node.querySelector?.('.layui-layer-content');
                        if (contentNode) contentNode.style.height = 'auto';
                        const width = node.offsetWidth || 0;
                        const vw = document.documentElement.clientWidth;
                        const left = isMobile() ? Math.max((vw - width) / 2, 10) : Math.max((vw - width) / 2, 20);
                        node.style.left = Math.round(left) + 'px';
                        node.style.right = 'auto';
                        node.style.margin = '0';
                    }
                    const update = () => syncShadeHeight();
                    update();
                    document.documentElement.classList.add('modal-page-scroll');
                    window.addEventListener('resize', update);
                    window.addEventListener('scroll', update);
                    const cleanup = () => {
                        window.removeEventListener('resize', update);
                        window.removeEventListener('scroll', update);
                        document.documentElement.classList.remove('modal-page-scroll');
                        if (shadeObserver) shadeObserver.disconnect();
                    };
                    shadeObserver = new MutationObserver(records => {
                        for (const r of records) {
                            for (const node of r.removedNodes) {
                                if (node.nodeType === 1 && (node.classList?.contains('layui-layer-shade') || node.classList?.contains('layui-layer'))) {
                                    cleanup();
                                    return;
                                }
                            }
                        }
                        update();
                    });
                    shadeObserver.observe(document.body, {childList: true, subtree: true});
                }
            });
            window.layui?.form.render();
            // 返回当前弹窗根节点，避免全局查询命中未销毁的旧弹窗
            return document.getElementById(`layui-layer${layerIndex}`);
        }
        document.getElementById('modal-root').innerHTML = `<div class="modal-backdrop"><section class="modal-panel" role="dialog" aria-modal="true"><header class="modal-header"><h2>${title}</h2><button class="modal-close" type="button" data-close>&times;</button></header><div class="modal-content">${content}</div></section></div>`;
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.style.minHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) + 'px';
        document.documentElement.classList.add('modal-page-scroll');
        const panel = document.querySelector('.modal-panel');
        if (isMobile() && panel) {
            panel.style.position = 'absolute';
            panel.style.top = '60px';
            panel.style.left = '4vw';
            panel.style.right = 'auto';
            panel.style.width = '92vw';
            panel.style.height = 'auto';
            panel.style.maxHeight = 'none';
        }
        document.querySelector('[data-close]').onclick = closeModal;
        window.layui?.form.render();
        // 返回当前弹窗根节点，避免全局查询命中未销毁的旧弹窗
        return panel;
    };
    const closeModal = () => {
        closeRichLayer(false);
        newsContentDraft = '';
        if (layuiLayer && layerIndex !== undefined) {
            layuiLayer.close(layerIndex);
            layerIndex = undefined;
        }
        document.getElementById('modal-root').innerHTML = '';
        document.documentElement.classList.remove('modal-page-scroll');
    };
    const button = (name, text, extra = '') => `<button type="button" class="link-button ${extra}" data-row-action="${name}">${text}</button>`;
    const initShell = async () => {
        if (!workspace) return;
        const toggleBtn = document.getElementById('toggle-menu');
        const toggleIcon = document.getElementById('toggle-menu-icon');
        const syncToggleState = () => {
            const shrunk = document.body.classList.contains('layadmin-side-shrink');
            if (toggleIcon) {
                toggleIcon.classList.toggle('layui-icon-shrink-right', !shrunk);
                toggleIcon.classList.toggle('layui-icon-spread-left', shrunk);
            }
            toggleBtn?.setAttribute('title', shrunk ? '展开侧边栏' : '折叠侧边栏');
        };
        toggleBtn?.addEventListener('mousedown', event => event.preventDefault());
        toggleBtn?.addEventListener('click', event => {
            const isMobile = window.matchMedia('(max-width:992px)').matches;
            if (isMobile) {
                document.body.classList.toggle('layadmin-side-spread-sm');
                document.body.classList.remove('layadmin-side-shrink');
                const shade = document.getElementById('body-shade');
                if (shade) shade.style.display = document.body.classList.contains('layadmin-side-spread-sm') ? 'block' : 'none';
            } else {
                document.body.classList.toggle('layadmin-side-shrink');
            }
            syncToggleState();
            toggleBtn.blur();
            document.activeElement?.blur && document.activeElement !== document.body && document.activeElement.blur();
        });
        document.getElementById('body-shade')?.addEventListener('click', () => {
            document.body.classList.remove('layadmin-side-spread-sm');
            document.body.classList.remove('layadmin-side-shrink');
            const shade = document.getElementById('body-shade');
            if (shade) shade.style.display = 'none';
            syncToggleState();
        });
        syncToggleState();
        initCollapsedMenu();
        document.getElementById('refresh-workspace')?.addEventListener('click', () => loadModule(activeModule || currentModule()));
        document.getElementById('tab-prev')?.addEventListener('click', () => shiftTabs(-1));
        document.getElementById('tab-next')?.addEventListener('click', () => shiftTabs(1));
        window.addEventListener('resize', updateTabPosition);
        document.getElementById('logout-button').addEventListener('click', async () => {
            try {
                await request(`${API}/auth/logout`, {method: 'POST'});
            } finally {
                location.href = '/admin/login';
            }
        });
        document.querySelectorAll('[data-module]').forEach(link => link.addEventListener('click', event => {
            event.preventDefault();
            history.pushState({}, '', link.href);
            loadModule(link.dataset.module);
        }));
        window.addEventListener('popstate', () => loadModule(currentModule()));
        try {
            const user = await request(`${API}/auth/me`);
            if (!user) {
                location.href = '/admin/login';
                return;
            }
            document.getElementById('current-user').textContent = user.userName || user.username || '管理员';
        } catch (_) {
            location.href = '/admin/login';
            return;
        }
        loadModule(currentModule());
    };
    const currentModule = () => Object.keys(moduleTitles).find(key => location.pathname.endsWith('/' + key)) || 'products';
    const modulePath = module => `/admin/${module}`;
    const updateTabPosition = () => {
        const tabHeader = document.getElementById('LAY_app_tabsheader');
        const viewport = tabHeader?.parentElement;
        if (!tabHeader || !viewport) return;
        const maxOffset = Math.max(0, tabHeader.scrollWidth - viewport.clientWidth);
        tabOffset = Math.min(Math.max(0, tabOffset), maxOffset);
        tabHeader.style.transform = `translateX(-${tabOffset}px)`;
    };
    const shiftTabs = direction => {
        tabOffset += direction * 180;
        updateTabPosition();
    };
    const revealActiveTab = () => {
        const tabHeader = document.getElementById('LAY_app_tabsheader');
        const viewport = tabHeader?.parentElement;
        const activeTab = tabHeader?.querySelector('.layui-this');
        if (!tabHeader || !viewport || !activeTab) return;
        const left = activeTab.offsetLeft;
        const right = left + activeTab.offsetWidth;
        if (left < tabOffset) tabOffset = left;
        if (right > tabOffset + viewport.clientWidth) tabOffset = right - viewport.clientWidth;
        updateTabPosition();
    };
    const renderTabs = () => {
        const tabHeader = document.getElementById('LAY_app_tabsheader');
        if (!tabHeader) return;
        tabHeader.innerHTML = [...openTabs].map(([module, title]) => `<li data-tab-module="${module}" class="${module === activeModule ? 'layui-this' : ''}"><span ${module === activeModule ? 'id="breadcrumb-title"' : ''}>${title}</span><i class="layui-icon layui-unselect layui-tab-close" data-close-tab="${module}">&#x1006;</i></li>`).join('');
        tabHeader.querySelectorAll('[data-tab-module]').forEach(tab => tab.addEventListener('click', () => {
            const module = tab.dataset.tabModule;
            if (module === activeModule) return;
            history.pushState({}, '', modulePath(module));
            loadModule(module);
        }));
        tabHeader.querySelectorAll('[data-close-tab]').forEach(button => button.addEventListener('click', event => {
            event.stopPropagation();
            const module = button.dataset.closeTab;
            if (openTabs.size === 1) {
                notify('至少保留一个工作标签');
                return;
            }
            const wasActive = module === activeModule;
            openTabs.delete(module);
            if (wasActive) {
                const nextModule = [...openTabs.keys()].at(-1);
                history.pushState({}, '', modulePath(nextModule));
                loadModule(nextModule);
            } else renderTabs();
        }));
        requestAnimationFrame(revealActiveTab);
    };
    const loadModule = async module => {
        if (!moduleTitles[module]) module = 'products';
        if (!openTabs.has(module)) openTabs.set(module, moduleTitles[module]);
        activeModule = module;
        renderTabs();
        document.querySelectorAll('[data-module]').forEach(link => {
            const active = link.dataset.module === module;
            link.classList.toggle('is-active', active);
            link.parentElement.classList.toggle('layui-this', active);
        });
        window.layui?.element.render('nav');
        const breadcrumbTitle = document.getElementById('breadcrumb-title');
        if (breadcrumbTitle) breadcrumbTitle.textContent = moduleTitles[module];
        workspace.innerHTML = '<div class="loading-state">正在载入数据...</div>';
        try {
            const markup = await (await fetch(`${API}/pages/${module}`, {credentials: 'same-origin'})).text();
            workspace.innerHTML = markup;
            window.layui?.form.render();
            await initModule(module, workspace.querySelector('.module-page'));
        } catch (error) {
            workspace.innerHTML = `<div class="loading-state">${escapeHtml(error.message || '页面加载失败')}</div>`;
        }
    };
    const initModule = async (module, root) => {
        pageState[module] = {pageNum: 1, pageSize: 10, keyword: ''};
        // 保存成功后会重复调用 initModule，必须用 onclick 赋值避免事件监听叠加（叠加会导致一次点击打开多个弹窗）
        const filter = root.querySelector('[data-filter]');
        if (filter) filter.onsubmit = event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            pageState[module] = {...pageState[module], ...Object.fromEntries(data), pageNum: 1};
            renderModule(module, root);
        };
        const resetButton = root.querySelector('[data-action="reset"]');
        if (resetButton) resetButton.onclick = () => setTimeout(() => {
            pageState[module] = {pageNum: 1, pageSize: 10, keyword: ''};
            renderModule(module, root);
        }, 0);
        const createButton = root.querySelector('[data-action="create"]');
        if (createButton) createButton.onclick = () => openEditor(module);
        if (module === 'products' || module === 'categories') await populateCategories(root, module === 'products');
        if (module === 'news') await populateTags(root);
        await renderModule(module, root);
    };
    const populateCategories = async (root, secondaryOnly = false) => {
        const categories = await request(`${API}/product-categories`);
        const select = root.querySelector('[data-category-filter]');
        if (select) {
            select.insertAdjacentHTML('beforeend', categories.filter(x => !secondaryOnly || x.level === 2).map(x => `<option value="${x.categoryId}">${escapeHtml(x.parentName ? `${x.parentName} / ${x.categoryName}` : x.categoryName)}</option>`).join(''));
            window.layui?.form.render('select');
        }
    };
    const populateTags = async root => {
        const tags = await request(`${API}/news-tags`);
        const select = root.querySelector('[data-tag-filter]');
        if (select) {
            select.insertAdjacentHTML('beforeend', tags.map(x => `<option value="${x.tagId}">${escapeHtml(x.tagName)}</option>`).join(''));
            window.layui?.form.render('select');
        }
    };
    const renderModule = async (module, root) => {
        try {
            // 运输路线需要展示国家中文名：进入页面时构建一次 code→name 映射
            if (module === 'routes' && !window.countryMap) {
                const countries = await request(`${API}/countries`);
                window.countryMap = new Map(countries.map(c => [c.code, c.name]));
            }
            const state = pageState[module];
            const params = new URLSearchParams(Object.entries(state).filter(([, v]) => v !== ''));
            const page = await request(`${API}/${endpoints[module]}/page?${params}`);
            const list = page.list || [];
            const total = page.total || 0;
            root.querySelector('[data-list]').innerHTML = list.length ? list.map(row => rowHtml(module, row)).join('') : `<tr><td class="empty-state" colspan="${module === 'products' ? 9 : module === 'news' ? 9 : 8}">暂无数据</td></tr>`;
            bindRows(module, root, list);
            bindProductPreviews(module, root, list);
            bindCategoryToggle(module, root, list);
            renderPagination(module, root, total);
        } catch (error) {
            root.querySelector('[data-list]').innerHTML = `<tr><td class="empty-state" colspan="8">${escapeHtml(error.message)}</td></tr>`;
        }
    };
    const rowHtml = (module, x) => {
        const actions = id => {
            const showView = module === 'consultations';
            const showContent = module === 'news';
            const showEditDelete = module !== 'consultations';
            return `<div class="action-list">${showView ? button('view', '查看') : ''}${showContent ? button('view-content', '查看正文') : ''}${showEditDelete ? button('edit', '编辑') + button('delete', '删除', 'danger') : ''}</div>`;
        };
        if (module === 'products') {
            const params = x.parameters || [];
            const detailImages = x.detailImages || [];
            const creator = x.createBy || '-';
            return `<tr data-id="${x.productId}"><td><div class="item-title"><span>${escapeHtml(x.title)}</span></div></td><td>${escapeHtml([x.parentCategoryName, x.categoryName].filter(Boolean).join(' / ') || '-')}</td><td>${image(x.coverUrl, 'thumb thumb-zoomable')}</td><td class="ellipsis">${escapeHtml(x.summary || '-')}</td><td>${params.length ? `<span class="param-summary" title="点击查看全部参数">查看参数（${params.length}）</span>` : '-'}</td><td>${detailImages.length ? `<span class="image-summary">查看图片（${detailImages.length}）</span>` : '-'}</td><td>${escapeHtml(creator)}</td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
        }
        if (module === 'categories') {
            if (x.level === 2) return `<tr data-id="${x.categoryId}" class="category-child-row"><td><div class="cell-collapse"><span class="tree-name"><i class="tree-indent">└</i>${escapeHtml(x.categoryName)}</span></div></td><td><div class="cell-collapse"><span class="level-badge">${escapeHtml(x.level === 1 ? '一级分类' : '二级分类')}</span></div></td><td><div class="cell-collapse">${escapeHtml(x.parentName || '-')}</div></td><td><div class="cell-collapse">${x.sortOrder ?? 0}</div></td><td><div class="cell-collapse">${time(x.createTime)}</div></td><td><div class="cell-collapse">${actions()}</div></td></tr>`;
            const children = x.children || [];
            const expanded = expandedCategories.has(x.categoryId);
            const toggle = children.length ? `<span class="tree-toggle ${expanded ? '' : 'is-collapsed'}" data-toggle-category="${x.categoryId}" title="${expanded ? '收起' : '展开'}"><i class="layui-icon layui-icon-down"></i></span>` : '<span class="tree-toggle is-empty"></span>';
            const childRows = expanded ? children.map(child => rowHtml('categories', child)).join('') : '';
            return `<tr data-id="${x.categoryId}"><td><span class="tree-name">${toggle}${escapeHtml(x.categoryName)}${children.length ? `<span class="tree-count">${children.length}</span>` : ''}</span></td><td><span class="level-badge">一级分类</span></td><td>-</td><td>${x.sortOrder ?? 0}</td><td>${time(x.createTime)}</td><td>${actions()}</td></tr>${childRows}`;
        }
        if (module === 'routes') {
            const country = (code) => window.countryMap?.get(code) || code || '-';
            return `<tr data-id="${x.routeId}"><td>${escapeHtml(country(x.sourceAddress))}</td><td class="route-arrow">&#8594;</td><td>${escapeHtml(country(x.targetAddress))}</td><td>${time(x.updateTime)}</td><td>${actions()}</td></tr>`;
        }
        if (module === 'partners') return `<tr data-id="${x.partnerId}"><td>${image(x.logoUrl, 'logo-thumb logo-zoomable')}</td><td>${escapeHtml(x.companyName)}</td><td>${time(x.createTime)}</td><td>${time(x.updateTime)}</td><td>${actions()}</td></tr>`;
        if (module === 'news') return `<tr data-id="${x.newsId}"><td>${image(x.coverUrl, 'thumb thumb-zoomable news-cover')}</td><td><div class="item-title"><span>${escapeHtml(x.title)}</span></div></td><td>${(x.tags || []).map(t => `<span class="tag">${escapeHtml(t.tagName)}</span>`).join('') || '-'}</td><td class="ellipsis">${escapeHtml(x.summary || '-')}</td><td>${escapeHtml(x.projectRegion || '-')}</td><td>${escapeHtml(x.contactEmail || '-')}</td><td>${escapeHtml(x.createBy || '-')}</td><td>${time(x.createTime)}</td><td>${actions()}</td></tr>`;
        if (module === 'tags') return `<tr data-id="${x.tagId}"><td>${image(x.iconUrl, 'tag-icon logo-zoomable')}</td><td><b>${escapeHtml(x.tagName)}</b></td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
        return `<tr data-id="${x.consultationId}"><td>${escapeHtml(x.contactName)}</td><td>${escapeHtml(x.email)}<br><span class="muted">${escapeHtml(x.phone || '-')}</span></td><td>${(x.subjects || []).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('')}</td><td class="ellipsis">${escapeHtml(x.content)}</td><td>${time(x.createTime)}</td><td>${actions()}</td></tr>`;
    };
    const bindRows = (module, root, list, rows) => (rows || root.querySelectorAll('[data-row-action]')).forEach(node => node.addEventListener('click', async () => {
        const row = node.closest('tr');
        const id = row.dataset.id;
        const action = node.dataset.rowAction;
        if (action === 'delete') {
            if (!confirm('确定删除这条记录吗？此操作无法撤销。')) return;
            try {
                await request(`${API}/${endpoints[module]}/${id}`, {method: 'DELETE'});
                renderModule(module, root);
            } catch (error) {
                notify(error.message);
            }
            return;
        }
        if (action === 'edit') {
            openEditor(module, id);
            return;
        }
        if (action === 'view-content') {
            const data = list.find(x => x.newsId === id) || await fetchDetail(module, id);
            openNewsContent(data);
            return;
        }
        const idField = module === 'categories' ? 'categoryId' : module === 'tags' ? 'tagId' : module === 'consultations' ? 'consultationId' : module === 'products' ? 'productId' : module === 'routes' ? 'routeId' : module === 'partners' ? 'partnerId' : 'newsId';
        const data = list.find(x => x[idField] === id) || await fetchDetail(module, id);
        openDetail(module, data);
    }));
    // 分类折叠/展开：局部插入/移除二级行并播放渐入渐出动画，避免整表重绘的生硬感
    const bindProductPreviews = (module, root, list) => {
        // 全屏灯箱：直接展示图片，无弹窗外壳
        const openLightbox = (images, productTitle) => {
            if (!images || !images.length) return;
            const single = images.length === 1;
            const box = document.createElement('div');
            box.className = 'image-lightbox';
            box.innerHTML = `<button class="image-lightbox-close" type="button"><i class="layui-icon layui-icon-close"></i></button>${single ? '' : '<button class="image-lightbox-nav image-lightbox-prev" type="button"><i class="layui-icon layui-icon-left"></i></button>'}<img src="${escapeHtml(images[0])}" alt="${escapeHtml(productTitle || '')}">${single ? '' : `<button class="image-lightbox-nav image-lightbox-next" type="button"><i class="layui-icon layui-icon-right"></i></button><div class="image-lightbox-counter">1 / ${images.length}</div>`}`;
            const img = box.querySelector('img');
            const counter = box.querySelector('.image-lightbox-counter');
            let index = 0;
            const show = i => {
                index = (i + images.length) % images.length;
                img.src = images[index];
                if (counter) counter.textContent = `${index + 1} / ${images.length}`;
            };
            const close = () => {
                document.removeEventListener('keydown', onKey);
                box.remove();
            };
            const onKey = event => {
                if (event.key === 'Escape') close();
                if (!single && event.key === 'ArrowLeft') show(index - 1);
                if (!single && event.key === 'ArrowRight') show(index + 1);
            };
            box.addEventListener('click', event => {
                if (event.target === box || event.target === img) close();
            });
            box.querySelector('.image-lightbox-close').onclick = close;
            const prevBtn = box.querySelector('.image-lightbox-prev');
            const nextBtn = box.querySelector('.image-lightbox-next');
            if (prevBtn) prevBtn.onclick = event => {
                event.stopPropagation();
                show(index - 1);
            };
            if (nextBtn) nextBtn.onclick = event => {
                event.stopPropagation();
                show(index + 1);
            };
            document.addEventListener('keydown', onKey);
            document.body.appendChild(box);
        };
        const openCover = (coverUrl, productTitle) => {
            if (!coverUrl) return;
            openLightbox([coverUrl], productTitle);
        };
        const openGallery = (images, productTitle) => openLightbox(images, productTitle);
        // 合作企业 Logo / 动态封面 / 标签图标 点击查看大图
        const zoomField = module === 'partners' ? 'logoUrl' : module === 'news' ? 'coverUrl' : module === 'tags' ? 'iconUrl' : null;
        const zoomIdField = module === 'partners' ? 'partnerId' : module === 'news' ? 'newsId' : 'tagId';
        const zoomNameField = module === 'partners' ? 'companyName' : 'tagName';
        if (zoomField) {
            const zoomMap = new Map((list || []).map(x => [x[zoomIdField], x]));
            root.querySelectorAll('tr[data-id]').forEach(row => {
                const data = zoomMap.get(row.dataset.id);
                const img = row.querySelector('.logo-zoomable, .thumb-zoomable');
                if (data && img && data[zoomField]) img.style.cursor = 'zoom-in', img.onclick = event => {
                    event.stopPropagation();
                    openLightbox([data[zoomField]], data[zoomNameField]);
                };
            });
            return;
        }
        const products = list || [];
        const map = new Map(products.map(x => [x.productId, x]));
        root.querySelectorAll('tr[data-id]').forEach(row => {
            const id = row.dataset.id;
            const data = map.get(id);
            if (!data) return;
            const cover = row.querySelector('.thumb-zoomable');
            if (cover) cover.style.cursor = 'zoom-in', cover.onclick = event => {
                event.stopPropagation();
                openCover(cover.src, data.title);
            };
            const paramBadge = row.querySelector('.param-summary');
            if (paramBadge) paramBadge.style.cursor = 'pointer', paramBadge.onclick = event => {
                event.stopPropagation();
                const rows = (data.parameters || []).map(p => `<div class="param-modal-row"><span class="param-modal-label">${escapeHtml(p.label || '-')}</span><span class="param-modal-value">${escapeHtml(p.value || '-')}</span></div>`).join('');
                modal(`产品参数 - ${escapeHtml(data.title || '')}`, `<div class="param-modal-list">${rows || '<div class="empty-state">暂无参数</div>'}</div>`, '', module);
            };
            const summary = row.querySelector('.image-summary');
            if (summary) summary.style.cursor = 'pointer', summary.onclick = event => {
                event.stopPropagation();
                openGallery(data.detailImages || [], data.title);
            };
        });
    };
    const bindCategoryToggle = (module, root, list) => {
        if (module !== 'categories') return;
        root.querySelectorAll('[data-toggle-category]').forEach(node => node.addEventListener('click', event => {
            event.stopPropagation();
            const id = node.dataset.toggleCategory;
            const expanding = !expandedCategories.has(id);
            expanding ? expandedCategories.add(id) : expandedCategories.delete(id);
            const parentRow = node.closest('tr');
            node.classList.toggle('is-collapsed', !expanding);
            node.title = expanding ? '收起' : '展开';
            const childRows = [];
            let sibling = parentRow.nextElementSibling;
            while (sibling?.classList.contains('category-child-row')) {
                childRows.push(sibling);
                sibling = sibling.nextElementSibling;
            }
            if (expanding) {
                const children = (list || []).find(x => x.categoryId === id)?.children || [];
                parentRow.insertAdjacentHTML('afterend', children.map(child => rowHtml('categories', child)).join(''));
                const newRows = [];
                sibling = parentRow.nextElementSibling;
                while (sibling?.classList.contains('category-child-row')) {
                    const row = sibling;
                    row.classList.add('category-child-enter');
                    // 双 rAF 确保初始态先渲染，再过渡到展开态
                    requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add('is-shown')));
                    newRows.push(row);
                    sibling = row.nextElementSibling;
                }
                // 动态插入的行不在 renderModule 绑定范围内，需单独绑定查看/编辑/删除事件
                bindRows(module, root, [...(list || []), ...children], newRows);
            } else {
                childRows.forEach(row => {
                    row.classList.remove('category-child-enter', 'is-shown');
                    row.classList.add('category-child-leave');
                });
                setTimeout(() => childRows.forEach(row => row.remove()), 240);
            }
        }));
    };
    const renderPagination = (module, root, total) => {
        const target = root.querySelector('[data-pagination]');
        if (!target) return;
        const state = pageState[module], pages = Math.max(1, Math.ceil(total / state.pageSize));
        target.innerHTML = `<span>共 ${total} 条</span><div class="pagination"><button data-page="${state.pageNum - 1}" ${state.pageNum <= 1 ? 'disabled' : ''}>&lsaquo;</button>${Array.from({length: pages}, (_, i) => i + 1).slice(0, 7).map(p => `<button data-page="${p}" class="${p === Number(state.pageNum) ? 'is-current' : ''}">${p}</button>`).join('')}<button data-page="${state.pageNum + 1}" ${state.pageNum >= pages ? 'disabled' : ''}>&rsaquo;</button></div>`;
        target.querySelectorAll('[data-page]').forEach(btn => btn.onclick = () => {
            pageState[module].pageNum = Number(btn.dataset.page);
            renderModule(module, root);
        });
    };
    const fetchDetail = (module, id) => request(`${API}/${module === 'categories' ? 'product-categories' : module === 'tags' ? 'news-tags' : endpoints[module]}/${id}`);
    // 公司动态正文：主表单仅显示入口，点击打开全屏富文本编辑层（wangEditor v5）
    let newsContentDraft = '';
    let richLayer = null;
    const updateContentPreview = () => {
        const text = newsContentDraft.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        const preview = document.querySelector('[data-content-preview]');
        if (preview) preview.textContent = text ? `已编辑正文（约 ${text.length} 字）` : '暂无正文，点击右侧按钮编辑';
    };
    const closeRichLayer = save => {
        if (!richLayer) return;
        if (save) {
            newsContentDraft = richLayer.editor.getHtml();
            updateContentPreview();
        }
        richLayer.editor.destroy();
        richLayer.root.remove();
        richLayer = null;
    };
    const openRichLayer = () => {
        if (!window.wangEditor || richLayer) return;
        const {createEditor, createToolbar} = window.wangEditor;
        const root = document.createElement('div');
        root.className = 'rich-layer';
        root.innerHTML = `<header class="rich-layer-header"><span>编辑动态正文</span><button class="layui-btn layui-btn-sm" type="button" data-rich-done>完成编辑</button></header><div class="rich-layer-body"><div class="rich-editor-box"><div data-rich-toolbar></div><div data-rich-editor></div></div></div><footer class="rich-layer-footer"><span data-rich-stat>当前 0 字</span><span class="muted">编辑完成后请点击右上角「完成编辑」保存草稿</span></footer>`;
        document.body.appendChild(root);
        const stat = root.querySelector('[data-rich-stat]');
        const editor = createEditor({
            selector: root.querySelector('[data-rich-editor]'),
            html: newsContentDraft || '<p><br></p>',
            config: {
                placeholder: '请输入动态正文，支持图文混排...',
                // 上传配置必须位于 MENU_CONF['uploadImage']：图片转 base64 内嵌正文，与既有存储格式保持一致
                MENU_CONF: {
                    uploadImage: {
                        // wangEditor 逐张调用 customUpload：file 为单个 File 对象，转 base64 后插入正文
                        customUpload: (file, insertFn) => {
                            const reader = new FileReader();
                            reader.onload = () => insertFn(reader.result, file.name, '');
                            reader.readAsDataURL(file);
                        }
                    }
                },
                onChange: () => {
                    if (!stat) return;
                    const text = (editor.getHtml() || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
                    stat.textContent = `当前 ${text.length} 字`;
                }
            }
        });
        createToolbar({
            editor,
            selector: root.querySelector('[data-rich-toolbar]'),
            config: {excludeKeys: ['group-video', 'insertVideo', 'uploadVideo', 'fullScreen']}
        });
        // 首次渲染完成后立刻更新一次字数
        if (stat && editor.getHtml) {
            const text = (editor.getHtml() || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
            stat.textContent = `当前 ${text.length} 字`;
        }
        richLayer = {editor, root};
        root.querySelector('[data-rich-done]').onclick = () => closeRichLayer(true);
    };
    const openDetail = (module, x) => {
        let fields = [];
        if (module === 'news') fields = [['动态标题', x.title], ['动态摘要', x.summary], ['动态标签', (x.tags || []).map(t => t.tagName).join('、') || '-'], ['项目地区', x.projectRegion || '-'], ['咨询邮箱', x.contactEmail || '-'], ['创建人', x.createBy || '-'], ['创建时间', time(x.createTime)]];
        else fields = [['联系人', x.contactName], ['邮箱', x.email], ['电话', x.phone || '-'], ['咨询主题', (x.subjects || []).join('、')], ['咨询内容', x.content], ['提交时间', time(x.createTime)]];
        const cover = module === 'products' ? image(x.coverUrl, 'detail-cover') : module === 'partners' ? image(x.logoUrl, 'detail-cover') : module === 'news' ? image(x.coverUrl, 'detail-cover') : module === 'tags' ? image(x.iconUrl, 'detail-cover') : '';
        modal(`${moduleTitles[module]}详情`, `${cover}<dl class="detail-grid">${fields.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${v ? escapeHtml(v).replace(/\n/g, '<br>') : '-'}</dd>`).join('')}</dl>`, '<button class="layui-btn" type="button" data-close>关闭</button>', module).querySelector('[data-close]')?.addEventListener('click', closeModal);
    };
    // 公司动态正文查看：直接渲染 HTML（含 base64 图片）到弹窗
    const openNewsContent = x => {
        const title = `动态正文 - ${escapeHtml(x.title || '')}`;
        const body = `<div class="news-content-viewer">${x.content || '<div class="empty-state">暂无正文</div>'}</div>`;
        modal(title, body, '<button class="layui-btn" type="button" data-close>关闭</button>', 'news').querySelector('[data-close]')?.addEventListener('click', closeModal);
    };
    const openEditor = async (module, id) => {
        try {
            const data = id ? await fetchDetail(module, id) : {};
            const body = await editorForm(module, data);
            const panel = modal(`${id ? '编辑' : '新增'}${moduleTitles[module]}`, body, '<button class="layui-btn layui-btn-primary" type="button" data-close>取消</button><button class="layui-btn" type="button" data-save>保存</button>', module);
            panel.querySelector('[data-close]')?.addEventListener('click', closeModal);
            bindEditor(module, data);
            // 公司动态正文：初始化草稿、回显预览并绑定全屏编辑层入口
            if (module === 'news') {
                newsContentDraft = data.content || '';
                updateContentPreview();
                panel.querySelector('[data-edit-content]').onclick = openRichLayer;
            }
            panel.querySelector('[data-save]').onclick = () => saveEditor(module, id, panel);
        } catch (error) {
            notify(error.message);
        }
    };
    const editorForm = async (module, data) => {
        const input = (name, value = '', placeholder = '') => `<input type="text" name="${name}" value="${escapeHtml(value || '')}" placeholder="${escapeHtml(placeholder)}" autocomplete="off" class="layui-input">`;
        const select = (name, options, extra = '') => `<select name="${name}"${extra}><option value=""></option>${options}</select>`;
        // 可搜索国家下拉：用户输入搜索词筛选，展示中文名，提交时携带 ISO code 到隐藏字段
        const searchableCountry = (label, name, list, currentCode) => {
            const items = (list || []).map(c => `<li class="country-option" data-code="${escapeHtml(c.code)}" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)}</li>`).join('');
            return `<div class="layui-form-item"><label class="layui-form-label">${label}</label><div class="layui-input-block"><div class="country-searchable" data-country-searchable><input type="text" class="layui-input country-searchable-input" placeholder="输入国家名称搜索" autocomplete="off"><input type="hidden" name="${name}" value="${escapeHtml(currentCode || '')}"><div class="country-searchable-panel" hidden><ul class="country-searchable-list">${items}</ul><div class="country-searchable-empty" hidden>无匹配国家</div></div></div></div></div>`;
        };
        const item = (label, control) => `<div class="layui-form-item"><label class="layui-form-label">${label}</label><div class="layui-input-block">${control}</div></div>`;
        const field = (name, label, value = '', placeholder = '') => item(label, input(name, value, placeholder));
        if (module === 'categories') {
            const categories = await request(`${API}/product-categories`);
            return `<form lay-filter="editor-form" data-editor>${field('categoryName', '分类名称', data.categoryName)}${field('sortOrder', '排序值', data.sortOrder ?? 0)}${item('所属一级分类', select('parentId', categories.filter(x => x.level === 1 && x.categoryId !== data.categoryId).map(x => `<option value="${x.categoryId}" ${x.categoryId === data.parentId ? 'selected' : ''}>${escapeHtml(x.categoryName)}</option>`).join('')))}</form>`;
        }
        if (module === 'routes') {
            const countries = await request(`${API}/countries`);
            const source = data.sourceAddress || '';
            const target = data.targetAddress || '';
            return `<form lay-filter="editor-form" data-editor>${searchableCountry('始发地', 'sourceAddress', countries, source)}${searchableCountry('目的地', 'targetAddress', countries, target)}</form>`;
        }
        if (module === 'partners') return `<form lay-filter="editor-form" data-editor>${field('companyName', '企业名称', data.companyName)}${singleUpload('企业 Logo', 'logoAccessName', data.logoAccessName, data.logoUrl, data.logoAccessName)}</form>`;
        if (module === 'tags') return `<form lay-filter="editor-form" data-editor>${field('tagName', '标签名称', data.tagName)}${singleUpload('标签图标', 'iconBase64', '', data.iconUrl, '')}</form>`;
        if (module === 'products') {
            const categories = await request(`${API}/product-categories`);
            const options = categories.filter(x => x.level === 2).map(x => `<option value="${x.categoryId}" ${x.categoryId === data.categoryId ? 'selected' : ''}>${escapeHtml(`${x.parentName || ''}${x.parentName ? ' / ' : ''}${x.categoryName}`)}</option>`).join('');
            return `<form lay-filter="editor-form" data-editor>${field('title', '产品名称', data.title)}${item('所属分类', select('categoryId', options))}<div class="layui-form-item layui-form-text"><label class="layui-form-label">产品简介</label><div class="layui-input-block"><textarea name="summary" placeholder="请输入产品简介" class="layui-textarea">${escapeHtml(data.summary || '')}</textarea></div></div>${singleUpload('产品封面', 'coverAccessName', data.coverAccessName, data.coverUrl, data.coverAccessName)}<div class="layui-form-item"><label class="layui-form-label">详情图片</label><div class="layui-input-block"><div class="upload-area" data-image-list>${uploadTile('upload-list', 'detailImages', true)}${(data.detailImages || []).map(n => imageTile(n, n.substring(n.lastIndexOf('/') + 1), n)).join('')}<span class="upload-help">请选择图片文件，可批量上传</span></div></div></div><div class="layui-form-item"><label class="layui-form-label">产品参数</label><div class="layui-input-block"><div data-parameters>${(data.parameters || []).map(p => parameterRow(p)).join('') || parameterRow()}</div><button class="layui-btn layui-btn-primary layui-btn-sm" type="button" data-add-parameter>+ 添加参数</button></div></div></form>`;
        }
        const tags = module === 'news' ? await request(`${API}/news-tags`) : [];
        const selected = new Set((data.tags || []).map(x => x.tagId));
        // 动态正文：富文本改为全屏编辑层入口，textarea 仅作降级
        const contentField = module === 'news'
            ? (window.wangEditor
                ? `<div class="layui-form-item"><label class="layui-form-label">动态正文</label><div class="layui-input-block"><div class="content-entry"><span class="content-entry-text" data-content-preview></span><button class="layui-btn layui-btn-sm" type="button" data-edit-content>编辑正文</button></div></div></div>`
                : `<div class="layui-form-item layui-form-text"><label class="layui-form-label">动态正文</label><div class="layui-input-block"><textarea name="content" placeholder="支持 HTML 正文" class="layui-textarea">${escapeHtml(data.content || '')}</textarea></div></div>`)
            : '';
        return `<form lay-filter="editor-form" data-editor>${field('title', '动态标题', data.title)}${field('projectRegion', '项目地区', data.projectRegion)}${field('contactEmail', '咨询邮箱', data.contactEmail)}<div class="layui-form-item"><label class="layui-form-label">动态标签</label><div class="layui-input-block"><select name="tagIds" multiple size="4">${tags.map(x => `<option value="${x.tagId}" ${selected.has(x.tagId) ? 'selected' : ''}>${escapeHtml(x.tagName)}</option>`).join('')}</select></div></div>${singleUpload('动态封面', 'coverAccessName', data.coverAccessName, data.coverUrl, data.coverAccessName)}<div class="layui-form-item layui-form-text"><label class="layui-form-label">动态摘要</label><div class="layui-input-block"><textarea name="summary" placeholder="请输入动态摘要" class="layui-textarea">${escapeHtml(data.summary || '')}</textarea></div></div>${contentField}</form>`;
    };
    // 上传组件图标（内联 SVG）
    const eyeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    const trashIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    // 上传占位方块：点击选择图片
    const uploadTile = (dataAttr, hiddenName, multiple) => `<label class="upload-tile" title="点击上传图片"><input type="file" accept="image/*" ${multiple ? 'multiple' : ''} data-${dataAttr}="${hiddenName}"><i class="layui-icon layui-icon-add-1"></i><span>点击上传图片</span></label>`;
    // 已上传图片块：缩略图 + hover 遮罩（预览/删除）+ 文件名
    const imageTile = (src, name, access = '') => `<div class="image-tile"${access ? ` data-access="${escapeHtml(access)}"` : ''}><div class="image-thumb"><img src="${escapeHtml(src)}" alt=""><div class="image-mask"><button type="button" data-preview title="预览">${eyeIcon}</button><button type="button" data-remove-image title="删除">${trashIcon}</button></div></div><span class="image-name">${escapeHtml(name || '')}</span></div>`;
    // 单图上传表单项：已有图片时隐藏占位方块
    const singleUpload = (label, hiddenName, accessName, previewUrl, fileName) => `<div class="layui-form-item"><label class="layui-form-label">${label}</label><div class="layui-input-block"><div class="upload-area${previewUrl ? ' has-image' : ''}" data-single-upload>${uploadTile('upload', hiddenName, false)}${previewUrl ? imageTile(previewUrl, fileName, accessName) : ''}<span class="upload-help">请选择单张图片文件上传</span><input type="hidden" name="${hiddenName}" value="${escapeHtml(accessName || '')}"></div></div></div>`;
    const parameterRow = p => `<div class="parameter-row"><div class="parameter-grid"><input placeholder="参数名称" value="${escapeHtml(p?.label || '')}" autocomplete="off" class="layui-input"><input placeholder="参数值" value="${escapeHtml(p?.value || '')}" autocomplete="off" class="layui-input"><button type="button" data-remove-parameter class="layui-btn parameter-remove" title="删除"><i class="layui-icon layui-icon-close"></i></button></div></div>`;
    const bindEditor = module => {
        // 可搜索国家下拉：输入搜索词筛选、点击/回车选中；外部点击关闭面板
        const bindCountrySearchable = () => {
            document.querySelectorAll('[data-country-searchable]').forEach(root => {
                const input = root.querySelector('.country-searchable-input');
                const panel = root.querySelector('.country-searchable-panel');
                const list = root.querySelector('.country-searchable-list');
                const empty = root.querySelector('.country-searchable-empty');
                const hidden = root.querySelector('input[type=hidden]');
                const close = () => { panel.hidden = true; };
                const open = () => { panel.hidden = false; };
                // 回显：根据隐藏字段初值填充展示文本
                const presetCode = hidden.value;
                if (presetCode) {
                    const match = list.querySelector(`[data-code="${presetCode}"]`);
                    if (match) input.value = match.dataset.name;
                }
                const filter = () => {
                    const keyword = input.value.trim().toLowerCase();
                    let visible = 0;
                    list.querySelectorAll('.country-option').forEach(li => {
                        const hit = !keyword || li.dataset.name.toLowerCase().includes(keyword) || li.dataset.code.toLowerCase().includes(keyword);
                        li.hidden = !hit;
                        if (hit) visible++;
                    });
                    empty.hidden = visible > 0;
                    if (visible > 0) open(); else close();
                };
                input.addEventListener('focus', filter);
                input.addEventListener('input', () => {
                    // 用户输入即清空已选 code（防止显示文字与 value 不一致）
                    hidden.value = '';
                    filter();
                });
                list.addEventListener('click', event => {
                    const li = event.target.closest('.country-option');
                    if (!li) return;
                    input.value = li.dataset.name;
                    hidden.value = li.dataset.code;
                    close();
                });
                // 防止表单提交时把搜索文本误当作值：使用 readonly input 不参与表单；这里表单只提交 hidden
                input.setAttribute('autocomplete', 'off');
                document.addEventListener('click', event => {
                    if (!root.contains(event.target)) close();
                });
            });
        };
        if (module === 'routes') bindCountrySearchable();
        // 单图上传：成功后填充缩略图块并隐藏占位方块
        document.querySelectorAll('[data-upload]').forEach(input => input.addEventListener('change', async event => {
            const file = event.target.files[0];
            if (!file) return;
            try {
                const form = new FormData();
                form.append('file', file);
                const response = await fetch(`${API}/sys-file/upload`, {
                    method: 'POST',
                    body: form,
                    credentials: 'same-origin'
                });
                const body = await response.json();
                if (!response.ok || body.code !== 0) throw new Error(body.message);
                const name = input.dataset.upload;
                document.querySelector(`[name="${name}"]`).value = body.data.accessName;
                const area = input.closest('.upload-area');
                area.querySelector('.image-tile')?.remove();
                area.querySelector('.upload-help').insertAdjacentHTML('beforebegin', imageTile(`${API}/sys-file/preview/${body.data.accessName}`, body.data.originalName));
                area.classList.add('has-image');
            } catch (error) {
                notify(error.message);
            }
        }));
        // 批量上传详情图片：逐张插入缩略图块
        document.querySelectorAll('[data-upload-list]').forEach(input => input.addEventListener('change', async event => {
            const area = input.closest('.upload-area');
            for (const file of event.target.files) {
                const form = new FormData();
                form.append('file', file);
                try {
                    const response = await fetch(`${API}/sys-file/upload`, {
                        method: 'POST',
                        body: form,
                        credentials: 'same-origin'
                    });
                    const body = await response.json();
                    if (body.code !== 0) throw new Error(body.message);
                    area.querySelector('.upload-help').insertAdjacentHTML('beforebegin', imageTile(`${API}/sys-file/preview/${body.data.accessName}`, body.data.originalName, body.data.accessName));
                } catch (error) {
                    notify(error.message);
                }
            }
        }));
        // 标签图标 Base64 上传
        document.querySelectorAll('[data-base64]').forEach(input => input.addEventListener('change', event => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                document.querySelector('[name="iconBase64"]').value = reader.result;
                const area = input.closest('.upload-area');
                area.querySelector('.image-tile')?.remove();
                area.querySelector('.upload-help').insertAdjacentHTML('beforebegin', imageTile(reader.result, file.name));
                area.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }));
        document.querySelector('[data-add-parameter]')?.addEventListener('click', () => document.querySelector('[data-parameters]').insertAdjacentHTML('beforeend', parameterRow()));
        document.querySelector('[data-parameters]')?.addEventListener('click', event => {
            const removeBtn = event.target.closest('[data-remove-parameter]');
            if (removeBtn) removeBtn.closest('.parameter-row').remove();
        });
        // 图片块预览 / 删除（单图清空隐藏域并恢复占位方块，列表图直接移除）
        document.querySelector('[data-editor]')?.addEventListener('click', event => {
            const previewBtn = event.target.closest('[data-preview]');
            if (previewBtn) {
                const src = previewBtn.closest('.image-tile')?.querySelector('img')?.src;
                if (src) openPreview(src);
                return;
            }
            const removeBtn = event.target.closest('[data-remove-image]');
            if (!removeBtn) return;
            const tile = removeBtn.closest('.image-tile');
            const area = tile.closest('.upload-area');
            if (area?.matches('[data-single-upload]')) {
                const hiddenInput = area.querySelector('input[type=hidden]');
                if (hiddenInput) hiddenInput.value = '';
                area.classList.remove('has-image');
            }
            tile.remove();
        });
    };
    const saveEditor = async (module, id, panel) => {
        const form = (panel || document).querySelector('[data-editor]');
        const fields = new FormData(form);
        const data = Object.fromEntries(fields.entries());
        if (module === 'products') {
            // data-access 可能是完整预览 URL，提交前剥离前缀还原为文件 accessName
            const previewPrefix = `${API}/sys-file/preview/`;
            data.detailImages = [...form.querySelectorAll('[data-image-list] [data-access]')].map(x => x.dataset.access.startsWith(previewPrefix) ? x.dataset.access.slice(previewPrefix.length) : x.dataset.access);
            data.parameters = [...form.querySelectorAll('.parameter-row')].map(row => {
                const inputs = row.querySelectorAll('input');
                return {label: inputs[0]?.value.trim() || '', value: inputs[1]?.value.trim() || ''};
            }).filter(x => x.label && x.value);
        }
        if (module === 'news') data.tagIds = [...form.querySelector('[name="tagIds"]')?.selectedOptions || []].map(x => x.value);
        if (module === 'news' && window.wangEditor) data.content = newsContentDraft;
        if (module === 'tags' && !data.iconBase64) delete data.iconBase64;
        const path = endpoints[module];
        try {
            await request(`${API}/${path}${id ? '/' + id : ''}`, {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(data)
            });
            closeModal();
            const root = workspace.querySelector('.module-page');
            if (module === 'categories' || module === 'tags') await initModule(module, root); else await renderModule(module, root);
        } catch (error) {
            notify(error.message);
        }
    };
    const initCollapsedMenu = () => {
        const sideNav = document.getElementById('LAY-system-side-menu');
        if (!sideNav) return;
        let tipBox = document.querySelector('.deaofu-side-tips');
        if (!tipBox) {
            tipBox = document.createElement('div');
            tipBox.className = 'deaofu-side-tips';
            document.body.appendChild(tipBox);
        }
        const expandGroup = group => {
            const firstSubLink = group.querySelector('.layui-nav-child dd > a[data-module]');
            if (!firstSubLink) return;
            const toggleBtn = document.getElementById('toggle-menu');
            if (document.body.classList.contains('layadmin-side-shrink') && toggleBtn) toggleBtn.click();
            // 确保该一级菜单在展开后处于 itemed 状态，确保子菜单可见
            group.classList.add('layui-nav-itemed');
            window.layui?.element.render('nav');
            history.pushState({}, '', firstSubLink.getAttribute('href'));
            loadModule(firstSubLink.dataset.module);
        };
        const groups = sideNav.querySelectorAll('.layui-nav-item');
        groups.forEach(group => {
            const titleNode = group.querySelector('a > cite');
            const groupName = titleNode ? titleNode.textContent.trim() : '';
            group.addEventListener('mouseenter', () => {
                if (!document.body.classList.contains('layadmin-side-shrink')) return;
                if (!groupName) return;
                const rect = group.getBoundingClientRect();
                tipBox.textContent = groupName;
                tipBox.style.top = `${rect.top}px`;
                tipBox.classList.add('is-show');
            });
            group.addEventListener('mouseleave', () => tipBox.classList.remove('is-show'));
            // 使用 capture 阶段先于 layui 处理，避免 layui 的 click 阻止跳转
            group.addEventListener('click', event => {
                if (!document.body.classList.contains('layadmin-side-shrink')) return;
                event.preventDefault();
                event.stopPropagation();
                expandGroup(group);
            }, true);
        });
    };
    const initLogin = () => {
        const form = document.getElementById('login-form');
        if (!form) return;
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const button = form.querySelector('button');
            button.disabled = true;
            try {
                await request(`${API}/auth/login`, {
                    method: 'POST',
                    body: JSON.stringify(Object.fromEntries(new FormData(form)))
                });
                location.href = '/admin/products';
            } catch (error) {
                let tip = form.querySelector('.error-message');
                if (!tip) {
                    tip = document.createElement('div');
                    tip.className = 'error-message';
                    form.append(tip);
                }
                tip.textContent = error.message;
            } finally {
                button.disabled = false;
            }
        });
    };
    initLogin();
    initShell();
})();
