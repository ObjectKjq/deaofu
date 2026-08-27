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
        routes: 'transport-routes',
        partners: 'partner-companies',
        news: 'news',
        consultations: 'consultations'
    };
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
    const modal = (title, body, actions = '') => {
        const content = `<div class="layui-form" style="padding:20px 24px 4px">${body}${actions ? `<div class="layui-form-item" style="margin-bottom:0"><div class="layui-input-block" style="margin-left:0;text-align:right;border-top:1px solid #f2f2f2;padding-top:15px;margin-top:15px">${actions}</div></div>` : ''}</div>`;
        let shadeObserver = null;
        const syncShadeHeight = () => {
            const shade = document.querySelector('.layui-layer-shade');
            if (shade) shade.style.height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) + 'px';
        };
        const isMobile = () => window.matchMedia('(max-width:768px)').matches;
        const layerArea = isMobile() ? ['92vw', 'auto'] : ['650px', 'auto'];
        if (layuiLayer) {
            layerIndex = layuiLayer.open({
                type: 1, title, area: layerArea, shadeClose: false, content, success: layero => {
                    const node = layero && layero[0] ? layero[0] : layero;
                    // 渲染完成后由 JS 计算水平位置，避免 layui 内联定位与 CSS 覆盖冲突导致闪动
                    if (node && node.style) {
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
            return;
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
    };
    const closeModal = () => {
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
        root.querySelector('[data-filter]')?.addEventListener('submit', event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            pageState[module] = {...pageState[module], ...Object.fromEntries(data), pageNum: 1};
            renderModule(module, root);
        });
        root.querySelector('[data-action="reset"]')?.addEventListener('click', () => setTimeout(() => {
            pageState[module] = {pageNum: 1, pageSize: 10, keyword: ''};
            renderModule(module, root);
        }, 0));
        root.querySelector('[data-action="create"]')?.addEventListener('click', () => openEditor(module));
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
            const state = pageState[module];
            let list, total;
            if (module === 'categories') {
                list = await request(`${API}/product-categories`);
                if (state.keyword) list = list.filter(x => x.categoryName.includes(state.keyword));
                total = list.length;
            } else if (module === 'tags') {
                list = await request(`${API}/news-tags`);
                if (state.keyword) list = list.filter(x => x.tagName.includes(state.keyword));
                total = list.length;
            } else {
                const params = new URLSearchParams(Object.entries(state).filter(([, v]) => v !== ''));
                const page = await request(`${API}/${endpoints[module]}/page?${params}`);
                list = page.list || [];
                total = page.total || 0;
            }
            root.querySelector('[data-list]').innerHTML = list.length ? list.map(row => rowHtml(module, row)).join('') : '<tr><td class="empty-state" colspan="8">暂无数据</td></tr>';
            bindRows(module, root, list);
            renderPagination(module, root, total);
        } catch (error) {
            root.querySelector('[data-list]').innerHTML = `<tr><td class="empty-state" colspan="8">${escapeHtml(error.message)}</td></tr>`;
        }
    };
    const rowHtml = (module, x) => {
        const actions = id => `<div class="action-list">${button('view', '查看')}${module !== 'consultations' ? button('edit', '编辑') + button('delete', '删除', 'danger') : ''}</div>`;
        if (module === 'products') return `<tr data-id="${x.productId}"><td><div class="item-title">${image(x.coverUrl)}<span>${escapeHtml(x.title)}</span></div></td><td>${escapeHtml([x.parentCategoryName, x.categoryName].filter(Boolean).join(' / ') || '-')}</td><td class="ellipsis">${escapeHtml(x.summary || '-')}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
        if (module === 'categories') return `<tr data-id="${x.categoryId}"><td><span class="tree-name">${x.level === 2 ? '<i class="tree-indent">└</i>' : ''}${escapeHtml(x.categoryName)}</span></td><td><span class="level-badge">${x.level === 1 ? '一级分类' : '二级分类'}</span></td><td>${escapeHtml(x.parentName || '-')}</td><td>${x.sortOrder ?? 0}</td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
        if (module === 'routes') return `<tr data-id="${x.routeId}"><td>${escapeHtml(x.sourceAddress)}</td><td class="route-arrow">&#8594;</td><td>${escapeHtml(x.targetAddress)}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
        if (module === 'partners') return `<tr data-id="${x.partnerId}"><td>${image(x.logoUrl, 'logo-thumb')}</td><td><b>${escapeHtml(x.companyName)}</b></td><td>${time(x.createTime)}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
        if (module === 'news') return `<tr data-id="${x.newsId}"><td>${image(x.coverUrl)}</td><td><div class="item-title">${escapeHtml(x.title)}</div><span class="muted ellipsis">${escapeHtml(x.summary || '')}</span></td><td>${(x.tags || []).map(t => `<span class="tag">${escapeHtml(t.tagName)}</span>`).join('') || '-'}</td><td>${escapeHtml(x.projectRegion || '-')}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
        if (module === 'tags') return `<tr data-id="${x.tagId}"><td>${image(x.iconUrl, 'tag-icon')}</td><td><b>${escapeHtml(x.tagName)}</b></td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
        return `<tr data-id="${x.consultationId}"><td><b>${escapeHtml(x.contactName)}</b></td><td>${escapeHtml(x.email)}<br><span class="muted">${escapeHtml(x.phone || '-')}</span></td><td>${(x.subjects || []).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('')}</td><td class="ellipsis">${escapeHtml(x.content)}</td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
    };
    const bindRows = (module, root, list) => root.querySelectorAll('[data-row-action]').forEach(node => node.addEventListener('click', async () => {
        const row = node.closest('tr');
        const id = row.dataset.id;
        const action = node.dataset.rowAction;
        if (action === 'delete') {
            if (!confirm('确定删除这条记录吗？此操作无法撤销。')) return;
            try {
                await request(`${API}/${module === 'categories' ? 'product-categories' : module === 'tags' ? 'news-tags' : endpoints[module]}/${id}`, {method: 'DELETE'});
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
        const idField = module === 'categories' ? 'categoryId' : module === 'tags' ? 'tagId' : module === 'consultations' ? 'consultationId' : module === 'products' ? 'productId' : module === 'routes' ? 'routeId' : module === 'partners' ? 'partnerId' : 'newsId';
        const data = list.find(x => x[idField] === id) || await fetchDetail(module, id);
        openDetail(module, data);
    }));
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
    const openDetail = (module, x) => {
        let fields = [];
        if (module === 'products') fields = [['产品名称', x.title], ['所属分类', [x.parentCategoryName, x.categoryName].filter(Boolean).join(' / ')], ['产品简介', x.summary], ['产品参数', (x.parameters || []).map(p => `${p.label}：${p.value}`).join('\n')], ['创建时间', time(x.createTime)]];
        else if (module === 'categories') fields = [['分类名称', x.categoryName], ['分类层级', x.level === 1 ? '一级分类' : '二级分类'], ['所属一级分类', x.parentName || '-'], ['排序值', x.sortOrder], ['创建时间', time(x.createTime)]];
        else if (module === 'routes') fields = [['始发地', x.sourceAddress], ['目的地', x.targetAddress], ['创建时间', time(x.createTime)], ['更新时间', time(x.updateTime)]];
        else if (module === 'partners') fields = [['企业名称', x.companyName], ['创建时间', time(x.createTime)], ['更新时间', time(x.updateTime)]];
        else if (module === 'news') fields = [['动态标题', x.title], ['动态摘要', x.summary], ['动态标签', (x.tags || []).map(t => t.tagName).join('、') || '-'], ['项目地区', x.projectRegion || '-'], ['咨询邮箱', x.contactEmail || '-'], ['正文', x.content], ['创建时间', time(x.createTime)]];
        else if (module === 'tags') fields = [['标签名称', x.tagName], ['创建时间', time(x.createTime)]];
        else fields = [['联系人', x.contactName], ['邮箱', x.email], ['电话', x.phone || '-'], ['咨询主题', (x.subjects || []).join('、')], ['咨询内容', x.content], ['提交时间', time(x.createTime)]];
        const cover = module === 'products' ? image(x.coverUrl, 'detail-cover') : module === 'partners' ? image(x.logoUrl, 'detail-cover') : module === 'news' ? image(x.coverUrl, 'detail-cover') : module === 'tags' ? image(x.iconUrl, 'detail-cover') : '';
        modal(`${moduleTitles[module]}详情`, `${cover}<dl class="detail-grid">${fields.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${v ? escapeHtml(v).replace(/\n/g, '<br>') : '-'}</dd>`).join('')}</dl>`, '<button class="layui-btn" type="button" data-close>关闭</button>');
        document.querySelector('[data-close]')?.addEventListener('click', closeModal);
    };
    const openEditor = async (module, id) => {
        try {
            const data = id ? await fetchDetail(module, id) : {};
            const body = await editorForm(module, data);
            modal(`${id ? '编辑' : '新增'}${moduleTitles[module]}`, body, '<button class="layui-btn layui-btn-primary" type="button" data-close>取消</button><button class="layui-btn" type="button" data-save>保存</button>');
            document.querySelector('[data-close]')?.addEventListener('click', closeModal);
            bindEditor(module, data);
            document.querySelector('[data-save]').onclick = () => saveEditor(module, id);
        } catch (error) {
            notify(error.message);
        }
    };
    const editorForm = async (module, data) => {
        const input = (name, value = '', placeholder = '') => `<input type="text" name="${name}" value="${escapeHtml(value || '')}" placeholder="${escapeHtml(placeholder)}" autocomplete="off" class="layui-input">`;
        const select = (name, options, extra = '') => `<select name="${name}"${extra}><option value=""></option>${options}</select>`;
        const item = (label, control) => `<div class="layui-form-item"><label class="layui-form-label">${label}</label><div class="layui-input-block">${control}</div></div>`;
        const field = (name, label, value = '', placeholder = '') => item(label, input(name, value, placeholder));
        const fileItem = (label, previewHtml, pickerHtml, hidden) => `<div class="layui-form-item"><label class="layui-form-label">${label}</label><div class="layui-input-block"><div class="file-picker">${previewHtml}${pickerHtml}<span class="form-help" data-file-name></span>${hidden}</div></div></div>`;
        const previewImg = (url, cls) => url ? `<img class="${cls}" src="${escapeHtml(url)}" alt="">` : `<span class="${cls}"></span>`;
        const uploadBtn = (text, dataAttr, hiddenName, multiple) => `<label class="layui-btn layui-btn-primary">${text}<input type="file" accept="image/*" ${multiple ? 'multiple' : ''} data-${dataAttr}="${hiddenName}"></label>`;
        const hidden = (name, value) => name ? `<input type="hidden" name="${name}" value="${escapeHtml(value || '')}">` : '';
        if (module === 'categories') {
            const categories = await request(`${API}/product-categories`);
            return `<form lay-filter="editor-form" data-editor>${field('categoryName', '分类名称', data.categoryName)}${field('sortOrder', '排序值', data.sortOrder ?? 0)}${item('所属一级分类', select('parentId', categories.filter(x => x.level === 1 && x.categoryId !== data.categoryId).map(x => `<option value="${x.categoryId}" ${x.categoryId === data.parentId ? 'selected' : ''}>${escapeHtml(x.categoryName)}</option>`).join('')))}</form>`;
        }
        if (module === 'routes') return `<form lay-filter="editor-form" data-editor>${field('sourceAddress', '始发地', data.sourceAddress)}${field('targetAddress', '目的地', data.targetAddress)}</form>`;
        if (module === 'partners') return `<form lay-filter="editor-form" data-editor>${field('companyName', '企业名称', data.companyName)}${fileItem('企业 Logo', previewImg(data.logoUrl, 'logo-thumb'), uploadBtn('选择图片', 'upload', 'logoAccessName', false), hidden('logoAccessName', data.logoAccessName))}</form>`;
        if (module === 'tags') return `<form lay-filter="editor-form" data-editor>${field('tagName', '标签名称', data.tagName)}${fileItem('标签图标', previewImg(data.iconUrl, 'tag-icon'), uploadBtn('选择图标', 'base64', 'iconBase64', false), hidden('iconBase64', ''))}</form>`;
        if (module === 'products') {
            const categories = await request(`${API}/product-categories`);
            const options = categories.filter(x => x.level === 2).map(x => `<option value="${x.categoryId}" ${x.categoryId === data.categoryId ? 'selected' : ''}>${escapeHtml(`${x.parentName || ''}${x.parentName ? ' / ' : ''}${x.categoryName}`)}</option>`).join('');
            return `<form lay-filter="editor-form" data-editor>${field('title', '产品名称', data.title)}${item('所属分类', select('categoryId', options))}<div class="layui-form-item layui-form-text"><label class="layui-form-label">产品简介</label><div class="layui-input-block"><textarea name="summary" placeholder="请输入产品简介" class="layui-textarea">${escapeHtml(data.summary || '')}</textarea></div></div>${fileItem('产品封面', previewImg(data.coverUrl, 'thumb'), uploadBtn('上传封面', 'upload', 'coverAccessName', false), hidden('coverAccessName', data.coverAccessName))}<div class="layui-form-item"><label class="layui-form-label">详情图片</label><div class="layui-input-block"><div class="file-picker">${uploadBtn('添加图片', 'upload-list', 'detailImages', true)}<div class="image-list" data-image-list>${(data.detailImages || []).map(n => `<span class="image-item" data-access="${escapeHtml(n)}"><img src="${API}/sys-file/preview/${escapeHtml(n)}"><button type="button">&times;</button></span>`).join('')}</div></div></div></div><div class="layui-form-item"><label class="layui-form-label">产品参数</label><div class="layui-input-block"><div data-parameters>${(data.parameters || []).map(p => parameterRow(p)).join('') || parameterRow()}</div><button class="layui-btn layui-btn-primary layui-btn-sm" type="button" data-add-parameter>+ 添加参数</button></div></div></form>`;
        }
        const tags = module === 'news' ? await request(`${API}/news-tags`) : [];
        const selected = new Set((data.tags || []).map(x => x.tagId));
        return `<form lay-filter="editor-form" data-editor>${field('title', '动态标题', data.title)}${field('projectRegion', '项目地区', data.projectRegion)}${field('contactEmail', '咨询邮箱', data.contactEmail)}<div class="layui-form-item"><label class="layui-form-label">动态标签</label><div class="layui-input-block"><select name="tagIds" multiple size="4">${tags.map(x => `<option value="${x.tagId}" ${selected.has(x.tagId) ? 'selected' : ''}>${escapeHtml(x.tagName)}</option>`).join('')}</select></div></div>${fileItem('动态封面', previewImg(data.coverUrl, 'thumb'), uploadBtn('上传封面', 'upload', 'coverAccessName', false), hidden('coverAccessName', data.coverAccessName))}<div class="layui-form-item layui-form-text"><label class="layui-form-label">动态摘要</label><div class="layui-input-block"><textarea name="summary" placeholder="请输入动态摘要" class="layui-textarea">${escapeHtml(data.summary || '')}</textarea></div></div><div class="layui-form-item layui-form-text"><label class="layui-form-label">动态正文</label><div class="layui-input-block"><textarea name="content" placeholder="支持 HTML 正文" class="layui-textarea">${escapeHtml(data.content || '')}</textarea></div></div></form>`;
    };
    const parameterRow = p => `<div class="layui-form-item parameter-row"><div class="parameter-grid"><input placeholder="参数名称" value="${escapeHtml(p?.label || '')}" autocomplete="off" class="layui-input"><input placeholder="参数值" value="${escapeHtml(p?.value || '')}" autocomplete="off" class="layui-input"><button type="button" data-remove-parameter class="layui-btn parameter-remove" title="删除"><i class="layui-icon layui-icon-close"></i></button></div></div>`;
    const bindEditor = module => {
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
                input.closest('.file-picker').querySelector('[data-file-name]').textContent = body.data.originalName;
                const preview = input.closest('.file-picker').querySelector('img');
                if (preview) preview.src = `${API}/sys-file/preview/${body.data.accessName}`;
            } catch (error) {
                notify(error.message);
            }
        }));
        document.querySelectorAll('[data-upload-list]').forEach(input => input.addEventListener('change', async event => {
            const holder = document.querySelector('[data-image-list]');
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
                    holder.insertAdjacentHTML('beforeend', `<span class="image-item" data-access="${body.data.accessName}"><img src="${API}/sys-file/preview/${body.data.accessName}"><button type="button">&times;</button></span>`);
                } catch (error) {
                    notify(error.message);
                }
            }
        }));
        document.querySelectorAll('[data-base64]').forEach(input => input.addEventListener('change', event => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                document.querySelector('[name="iconBase64"]').value = reader.result;
                input.closest('.file-picker').querySelector('[data-file-name]').textContent = file.name;
                const preview = input.closest('.file-picker').querySelector('img');
                if (preview) preview.src = reader.result;
            };
            reader.readAsDataURL(file);
        }));
        document.querySelector('[data-add-parameter]')?.addEventListener('click', () => document.querySelector('[data-parameters]').insertAdjacentHTML('beforeend', parameterRow()));
        document.querySelector('[data-parameters]')?.addEventListener('click', event => {
            if (event.target.matches('[data-remove-parameter]')) event.target.parentElement.remove();
        });
        document.querySelector('[data-image-list]')?.addEventListener('click', event => {
            if (event.target.tagName === 'BUTTON') event.target.parentElement.remove();
        });
    };
    const saveEditor = async (module, id) => {
        const form = document.querySelector('[data-editor]');
        const fields = new FormData(form);
        const data = Object.fromEntries(fields.entries());
        if (module === 'products') {
            data.detailImages = [...form.querySelectorAll('[data-image-list] [data-access]')].map(x => x.dataset.access);
            data.parameters = [...form.querySelectorAll('.parameter-row')].map(row => ({
                label: row.children[0].value.trim(),
                value: row.children[1].value.trim()
            })).filter(x => x.label && x.value);
        }
        if (module === 'news') data.tagIds = [...form.querySelector('[name="tagIds"]')?.selectedOptions || []].map(x => x.value);
        if (module === 'tags' && !data.iconBase64) delete data.iconBase64;
        const path = module === 'categories' ? 'product-categories' : module === 'tags' ? 'news-tags' : endpoints[module];
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
