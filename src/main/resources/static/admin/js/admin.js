(function () {

    'use strict';



    const $ = (selector, root = document) => root.querySelector(selector);

    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const hasGsap = typeof window.gsap !== 'undefined';

    let activeConfig = null;

    let activeTable = null;

    let tableToolBound = false;



    const escapeHtml = (value) => String(value == null ? '' : value)

        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

    const previewUrl = (name) => name ? `/admin/sys-file/preview/${encodeURIComponent(name)}` : '';

    const imageCell = (url, alt) => url ? `<img class="table-image" src="${escapeHtml(url)}" alt="${escapeHtml(alt || '')}">` : '<span class="muted">—</span>';

    const actionsColumn = () => ({

        title: '操作', width: 135, fixed: 'right',

        toolbar: '<div class="row-actions"><button class="row-action edit" lay-event="edit">编辑</button><button class="row-action delete" lay-event="delete">删除</button></div>'

    });

    const MODULES_WHITELIST = new Set(['dashboard', 'products', 'categories', 'routes', 'partners', 'news', 'tags', 'consultations']);
    function getModuleFromPath() {
        const match = window.location.pathname.match(/^\/admin\/([a-z]+)$/);
        const candidate = match ? match[1] : '';
        return MODULES_WHITELIST.has(candidate) ? candidate : 'dashboard';
    }



    /**
     * 切换侧边栏折叠状态。
     * - 桌面端：通过 .is-collapsed 控制，保留过渡动画；
     * - 移动端：通过 .is-open 控制抽屉式展开。
     */
    function toggleSidebar() {
        const sidebar = $('#admin-sidebar');
        if (!sidebar) return;
        const isMobile = window.matchMedia('(max-width: 780px)').matches;
        const icon = $('#sidebar-toggle-icon');
        if (isMobile) {
            sidebar.classList.toggle('is-open');
        } else {
            const willCollapse = !sidebar.classList.contains('is-collapsed');
            sidebar.classList.toggle('is-collapsed', willCollapse);
            if (icon) {
                icon.classList.toggle('layui-icon-left', !willCollapse);
                icon.classList.toggle('layui-icon-right', willCollapse);
            }
        }
    }

    /**
     * 展开侧边栏（折叠态下用户操作菜单时调用）。
     */
    function expandSidebar() {
        const sidebar = $('#admin-sidebar');
        if (!sidebar) return;
        const isMobile = window.matchMedia('(max-width: 780px)').matches;
        if (isMobile) {
            sidebar.classList.add('is-open');
            return;
        }
        if (sidebar.classList.contains('is-collapsed')) {
            sidebar.classList.remove('is-collapsed');
            const icon = $('#sidebar-toggle-icon');
            if (icon) {
                icon.classList.add('layui-icon-left');
                icon.classList.remove('layui-icon-right');
            }
        }
    }

    /**
     * 折叠态下，鼠标悬停一级 / 二级菜单项时，弹出 tooltip 显示菜单名称。
     * tooltip 使用 fixed 定位以避开 sidebar/父级 overflow 裁剪。
     */
    function bindSidebarTooltips() {
        const sidebar = $('#admin-sidebar');
        const tooltip = $('#sidebar-tooltip');
        if (!sidebar || !tooltip) return;
        const show = (target) => {
            if (!sidebar.classList.contains('is-collapsed')) return;
            const text = target.dataset.tip;
            if (!text) return;
            const rect = target.getBoundingClientRect();
            tooltip.textContent = text;
            tooltip.style.top = (rect.top + rect.height / 2) + 'px';
            tooltip.style.left = (rect.right + 12) + 'px';
            tooltip.classList.add('is-visible');
        };
        const hide = () => tooltip.classList.remove('is-visible');
        $$('.nav-item, .nav-group-header', sidebar).forEach(item => {
            item.addEventListener('mouseenter', () => show(item));
            item.addEventListener('mouseleave', hide);
        });
        sidebar.addEventListener('mouseleave', hide);
    }

    /**
     * 一级 / 二级菜单项点击处理。
     * 折叠态：先展开侧边栏，再按常规逻辑跳转；
     * 展开态：直接跳转。
     */
    function handleNavItemClick(item) {
        expandSidebar();
        navigate(item.dataset.module);
    }

    /**
     * 二级菜单分组点击处理。
     * 折叠态：先展开侧边栏，再展开该分组，并跳转至该分组下第一个二级菜单；
     * 展开态：仅切换分组展开/折叠。
     */
    function handleGroupHeaderClick(header) {
        const group = header.closest('.nav-group');
        const sidebar = $('#admin-sidebar');
        const isCollapsed = sidebar && sidebar.classList.contains('is-collapsed');
        if (isCollapsed) {
            expandSidebar();
            toggleNavGroup(group);
            const firstChild = group && group.querySelector('.nav-item-child');
            if (firstChild) navigate(firstChild.dataset.module);
            return;
        }
        toggleNavGroup(group);
    }

    /**
     * 切换二级菜单分组的展开/折叠状态，并同步 aria-expanded 属性。
     */
    function toggleNavGroup(group) {
        if (!group) return;
        const willOpen = !group.classList.contains('is-open');
        group.classList.toggle('is-open', willOpen);
        const header = group.querySelector('.nav-group-header');
        if (header) header.setAttribute('aria-expanded', String(willOpen));
    }

    async function api(url, options = {}) {

        const settings = Object.assign({headers: {}}, options);

        if (!(settings.body instanceof FormData) && settings.body !== undefined) {

            settings.headers['Content-Type'] = 'application/json';

        }

        const response = await fetch(url, settings);

        const result = await response.json();

        if (result.code === 40100) {

            window.location.href = '/admin/login';

            throw new Error('登录状态已失效');

        }

        if (!response.ok || result.code !== 0) {

            throw new Error(result.message || '请求处理失败');

        }

        return result.data;

    }



    /**

     * 从当前加载的页面片段中读取该模块的配置 JSON。

     */

    function loadModuleConfig(module) {

        const script = document.getElementById(`module-config-${module}`);

        if (!script) return null;

        try { return JSON.parse(script.textContent); }

        catch (error) { console.error(`解析模块 ${module} 配置失败`, error); return null; }

    }



    /**

     * 读取该模块的添加/修改弹窗 HTML 模板字符串。

     */

    function loadEditorTemplate(module) {

        const script = document.getElementById(`module-editor-${module}`);

        return script ? script.innerHTML.trim() : '';

    }



    /**

     * 将每个页面 JSON 中定义的 column 元数据转换为 layui table 所需的列配置。

     */

    function buildColumns(columns) {

        return columns.map(col => {

            const base = {field: col.field, title: col.title};

            if (col.width) base.width = col.width;

            if (col.minWidth) base.minWidth = col.minWidth;

            if (col.sort) base.sort = col.sort;

            switch (col.type) {

                case 'image':

                    base.templet = d => imageCell(d[col.field], d.title || d.tagName || d.companyName || '');

                    break;

                case 'title':

                    base.templet = d => `<span class="table-title">${escapeHtml(d[col.field] || '')}</span>`;

                    break;

                case 'level':

                    base.templet = d => `<span class="level-badge level-${d[col.field]}">${d[col.field] === 1 ? '一级分类' : '二级分类'}</span>`;

                    break;

                case 'imageCount':

                    base.templet = d => `${(d[col.field] || []).length} 张`;

                    break;

                case 'tags':

                    base.templet = d => (d[col.field] || []).map(tag => `<span class="tag-chip">${escapeHtml(tag.tagName || tag)}</span>`).join(' ') || '<span class="muted">—</span>';

                    break;

                case 'subjects':

                    base.templet = d => (d[col.field] || []).map(item => `<span class="tag-chip">${escapeHtml(item)}</span>`).join(' ');

                    break;

                case 'routeLine':

                    base.templet = d => `<div class="route-line"><span>${escapeHtml(d.sourceAddress || '')}</span><i class="layui-icon layui-icon-right"></i><span>${escapeHtml(d.targetAddress || '')}</span></div>`;

                    base.field = undefined;

                    break;

                default:

                    break;

            }

            return base;

        }).concat([actionsColumn()]);

    }



    /**

     * 对已挂载到弹窗中的模板根节点进行数据回填。

     * 为避免 layui 在打开弹窗时触发表格行数据的兜底逻辑(出现 r.parents is not a function),

     * 这里不再创建 div,直接操作已挂在弹窗里的根 DOM。

     */

    function fillEditor(root, data, references) {

        // 注：root 是已经装入弹窗中的 DOM 根，模板 HTML 已由 layui 在打开弹窗时插入

        const setValue = (input, value) => {

            if (value == null) return;

            if (input.type === 'checkbox' || input.type === 'radio') input.checked = Boolean(value);

            else input.value = String(value);

        };

        // 简单输入/文本域

        $$('[name]', root).forEach(input => {

            const name = input.getAttribute('name');

            if (name === 'subjects') { setValue(input, (data.subjects || []).join(',')); return; }

            if (name === 'parameters') {

                setValue(input, JSON.stringify(Array.isArray(data.parameters) ? data.parameters : [], null, 2));

                return;

            }

            if (input.tagName === 'SELECT') {

                if (name === 'categoryId' && references.categories) {

                    const options = references.categories.filter(c => c.level === 2)

                        .map(c => `<option value="${c.categoryId}" ${c.categoryId === data.categoryId ? 'selected' : ''}>${escapeHtml((c.parentName || '') + ' / ' + c.categoryName)}</option>`).join('');

                    input.insertAdjacentHTML('beforeend', options);

                } else if (name === 'parentId' && references.categories) {

                    const options = references.categories.filter(c => c.level === 1 && c.categoryId !== data.categoryId)

                        .map(c => `<option value="${c.categoryId}" ${c.categoryId === data.parentId ? 'selected' : ''}>${escapeHtml(c.categoryName)}</option>`).join('');

                    input.insertAdjacentHTML('beforeend', options);

                } else { setValue(input, data[name]); }

                return;

            }

            if (input.type === 'file') return; // 文件控件不回填

            setValue(input, data[name]);

        });



        // 图片预览

        const coverPreview = $('[data-preview="coverAccessName"]', root);

        if (coverPreview && data.coverAccessName) coverPreview.innerHTML = `<img src="${escapeHtml(previewUrl(data.coverAccessName))}" alt="预览">`;

        const logoPreview = $('[data-preview="logoAccessName"]', root);

        if (logoPreview && data.logoAccessName) logoPreview.innerHTML = `<img src="${escapeHtml(previewUrl(data.logoAccessName))}" alt="预览">`;

        const iconPreview = $('[data-preview="iconBase64"]', root);

        if (iconPreview && data.iconUrl) iconPreview.innerHTML = `<img src="${escapeHtml(data.iconUrl)}" alt="预览">`;



        // 详情图片预览

        const detailPreview = $('[data-multi-preview="detailImages"]', root);

        if (detailPreview && Array.isArray(data.detailImages) && data.detailImages.length) {

            detailPreview.innerHTML = data.detailImages.map((name, i) => `<span><img src="${previewUrl(name)}" alt="详情图"><button type="button" data-remove-image="${i}">×</button></span>`).join('');

        }



        // 标签选择

        const tagBox = $('.tag-options', root);

        if (tagBox && references.tags) {

            const selected = new Set((data.tags || []).map(t => t.tagId).concat(Array.isArray(data.tagIds) ? data.tagIds : []));

            tagBox.innerHTML = references.tags.map(tag => `<label class="tag-option"><input type="checkbox" name="tagIds" value="${tag.tagId}" ${selected.has(tag.tagId) ? 'checked' : ''}>${escapeHtml(tag.tagName)}</label>`).join('') || '<span class="muted">暂无标签，请先创建动态标签</span>';

        }



        // 富文本

        const richEditor = $('[data-rich-editor]', root);

        if (richEditor) richEditor.innerHTML = data.content || '';



    }



    async function loadReferences(config) {

        const references = {};

        const fields = config.fields || [];

        if (fields.some(field => field.type && field.type.includes('category'))) {

            references.categories = await api('/admin/product-categories');

        }

        if (fields.some(field => field.type === 'tags')) {

            references.tags = await api('/admin/news-tags');

        }

        return references;

    }



    async function uploadFile(file) {

        const form = new FormData();

        form.append('file', file);

        return api('/admin/sys-file/upload', {method: 'POST', body: form});

    }



    function updateMultiPreview(container, fieldName, values) {

        const preview = $(`[data-multi-preview="${fieldName}"]`, container);

        if (!preview) return;

        preview.innerHTML = values.map((name, index) => `<span><img src="${previewUrl(name)}" alt="详情图"><button type="button" data-remove-image="${index}">×</button></span>`).join('');

        $$('[data-remove-image]', preview).forEach(button => button.addEventListener('click', () => {

            values.splice(Number(button.dataset.removeImage), 1);

            updateMultiPreview(container, fieldName, values);

        }));

    }



    function insertImageAtCursor(editor, dataUrl) {

        editor.focus();

        const image = document.createElement('img');

        image.src = dataUrl;

        const selection = window.getSelection();

        if (selection && selection.rangeCount && editor.contains(selection.anchorNode)) {

            const range = selection.getRangeAt(0);

            range.deleteContents();

            range.insertNode(image);

            range.setStartAfter(image);

            selection.removeAllRanges();

            selection.addRange(range);

        } else {

            editor.appendChild(image);

        }

    }



    function bindEditorEvents(editor, config, state) {

        const fields = config.fields || [];



        // 用 layui.form 美化弹窗中的 select / radio / checkbox

        if (window.layui && layui.form && typeof layui.form.render === 'function') {

            layui.form.render('select');

        }



        // 用 layui.upload 替换原生的 <input type="file">

        $$('[data-upload-field]', editor).forEach(btn => {

            const fieldName = btn.dataset.uploadField;

            const isMultiple = btn.dataset.uploadMultiple === 'true';

            const kind = btn.dataset.uploadKind || 'file';



            if (kind === 'icon') {

                // 动态标签的图标：需要 Base64 保存，所以 auto: false，在 choose 回调中读取

                layui.upload.render({

                    elem: btn, auto: false, accept: 'images', acceptMime: 'image/*',

                    exts: 'jpg|png|jpeg|webp|gif',

                    choose(obj) {

                        obj.preview((index, file, result) => {

                            state.iconBase64 = result;

                            const preview = $('[data-preview="' + fieldName + '"]', editor);

                            if (preview) preview.innerHTML = '<img src="' + result + '" alt="预览">';

                        });

                    }

                });

            } else {

                // 普通上传（单文件 / 多文件）：调用 /admin/sys-file/upload

                layui.upload.render({

                    elem: btn,

                    url: '/admin/sys-file/upload',

                    field: 'file',

                    accept: 'images',

                    acceptMime: 'image/*',

                    exts: 'jpg|png|jpeg|webp|gif',

                    multiple: isMultiple,

                    done(res) {

                        if (!res || res.code !== 0) {

                            layui.layer.msg((res && res.message) || '上传失败', {icon: 2});

                            return;

                        }

                        if (isMultiple) {

                            if (!Array.isArray(state[fieldName])) state[fieldName] = [];

                            state[fieldName].push(res.data.accessName);

                            updateMultiPreview(editor, fieldName, state[fieldName]);

                        } else {

                            state[fieldName] = res.data.accessName;

                            const hidden = $('[name="' + fieldName + '"]', editor);

                            if (hidden) hidden.value = res.data.accessName;

                            const preview = $('[data-preview="' + fieldName + '"]', editor);

                            if (preview) preview.innerHTML = '<img src="' + previewUrl(res.data.accessName) + '" alt="预览">';

                        }

                    },

                    error() {

                        layui.layer.msg('上传失败，请重试', {icon: 2});

                    }

                });

            }

        });



        // 多文件移除按钮

        $$('[data-remove-image]', editor).forEach(button => {

            button.addEventListener('click', () => {

                const wrapper = button.closest('[data-multi-preview]');

                if (!wrapper) return;

                const fieldName = wrapper.dataset.multiPreview;

                const values = Array.isArray(state[fieldName]) ? state[fieldName] : [];

                values.splice(Number(button.dataset.removeImage), 1);

                updateMultiPreview(editor, fieldName, values);

            });

        });



        // 富文本指令

        $$('[data-command]', editor).forEach(button => {

            button.addEventListener('click', () => document.execCommand(button.dataset.command, false, null));

        });

        // 富文本插入图片（Base64）

        const richImageInput = $('[data-rich-image]', editor);

        if (richImageInput) {

            richImageInput.addEventListener('change', () => {

                const file = richImageInput.files && richImageInput.files[0];

                if (!file) return;

                const reader = new FileReader();

                reader.onload = () => {

                    const richEditor = $('[data-rich-editor]', editor);

                    if (richEditor) insertImageAtCursor(richEditor, reader.result);

                };

                reader.readAsDataURL(file);

                richImageInput.value = '';

            });

        }

    }





    function collectPayload(editor, config) {

        const payload = {};

        const fields = config.fields || [];

        fields.forEach(field => {

            const input = $(`[name="${field.name}"]`, editor);

            if (!input) return;

            if (field.type === 'csv') {

                payload[field.name] = String(input.value || '').split(',').map(item => item.trim()).filter(Boolean);

            } else if (field.type === 'multi-file') {

                payload[field.name] = Array.isArray(config.moduleState && config.moduleState[field.name]) ? config.moduleState[field.name] : [];

            } else if (field.type === 'json-params') {

                try { payload[field.name] = JSON.parse(input.value || '[]'); }

                catch (error) { payload[field.name] = []; }

            } else if (field.type === 'tags') {

                payload[field.name] = $$('input[name="tagIds"]:checked', editor).map(item => item.value);

            } else if (input.type === 'checkbox') {

                payload[field.name] = input.checked;

            } else {

                payload[field.name] = input.value;

            }

        });

        return payload;

    }



    async function openEditor(config, row) {

        const editing = Boolean(row && row[config.id]);

        const data = editing ? await api(`${config.endpoint}/${row[config.id]}`) : {};

        const references = await loadReferences(config);

        const moduleKey = (config && config.moduleKey) || (activeConfig && activeConfig.moduleKey);

        const template = loadEditorTemplate(moduleKey);

        if (!template) { layui.layer.msg('未找到该模块的编辑表单模板', {icon: 2}); return; }

        // 临时状态：多文件列表 / 图标 Base64 等不能从 DOM 直接读回的字段保存在 config 上

        const state = {

            detailImages: Array.isArray(data.detailImages) ? [...data.detailImages] : [],

            iconBase64: ''

        };

        config.moduleState = state;

        const area = window.innerWidth < 780 ? ['96%', '92%'] : ['min(780px, 88vw)', '88%'];

        // 重点：content 直接传模板字符串,在 layui 完成弹窗渲染后的 success 回调中再做填值/绑定事件

        // 这样可避开在弹窗打开阶段触发 layui 表格的 r.parents 兑位逻辑

        layui.layer.open({

            type: 1, title: editing ? `编辑${config.title.replace('管理', '')}` : config.addLabel,

            area, shade: .28, shadeClose: false, content: template,

            btn: ['保存', '取消'],

            success(layerElement) {

                try {

                    const root = layerElement[0];

                    fillEditor(root, data, references);

                    bindEditorEvents(root, config, state);

                    if (hasGsap) gsap.from($('.admin-editor', root), {y: 16, opacity: 0, duration: .35, ease: 'power2.out'});

                } catch (e) {

                    console.error('editor init failed', e);

                    layui.layer.msg('表单渲染失败: ' + (e && e.message || e), {icon: 2});

                }

            },

            async yes(index, layerElement) {

                try {

                    const payload = collectPayload(layerElement[0], config);

                    if (config.fields && config.fields.some(f => f.type === 'icon' && config.moduleState && config.moduleState.iconBase64)) {

                        payload.iconBase64 = config.moduleState.iconBase64;

                    }

                    const url = editing ? `${config.endpoint}/${row[config.id]}` : config.endpoint;

                    await api(url, {method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload)});

                    layui.layer.close(index);

                    layui.layer.msg(editing ? '修改成功' : '新增成功', {icon: 1});

                    reloadActiveTable();

                } catch (error) {

                    layui.layer.msg(error.message, {icon: 2, time: 2800});

                }

            }

        });

    }



    function reloadActiveTable() {

        if (!activeTable) return;

        const keyword = $('[data-keyword]')?.value.trim() || '';

        layui.table.reload('admin-data-table-instance', {where: {keyword}, page: {curr: 1}});

    }



    function mountModule(module) {

        const config = loadModuleConfig(module);

        if (!config) { layui.layer.msg('未找到该模块的配置', {icon: 2}); return; }

        config.moduleKey = module;

        activeConfig = config;

        const tableUrl = config.page ? `${config.endpoint}/page` : config.endpoint;

        activeTable = layui.table.render({

            elem: '#admin-data-table', id: 'admin-data-table-instance', url: tableUrl,

            page: config.page ? {layout: ['prev', 'page', 'next', 'count', 'limit'], groups: 4} : false,

            limit: 10, limits: [10, 20, 50], request: {pageName: 'pageNum', limitName: 'pageSize'},

            text: {none: '暂无数据，点击右上角按钮开始创建'},

            cols: [buildColumns(config.columns || [])], skin: 'line', even: false,

            parseData(response) {

                if (response.code === 40100) {

                    window.location.href = '/admin/login';

                    return {code: 1, msg: '登录状态已失效', count: 0, data: []};

                }

                if (response.code !== 0) return {code: 1, msg: response.message, count: 0, data: []};

                let rows = config.page ? response.data.list : response.data;

                if (!config.page) {

                    const keyword = $('[data-keyword]')?.value.trim().toLowerCase();

                    if (keyword) rows = rows.filter(row => JSON.stringify(row).toLowerCase().includes(keyword));

                }

                return {code: 0, msg: response.message, count: config.page ? response.data.total : rows.length, data: rows};

            },

            done() {

                if (hasGsap) gsap.from('.layui-table-body tr', {y: 8, opacity: 0, duration: .28, stagger: .025, ease: 'power1.out'});

            }

        });

        $('[data-add-record]').onclick = () => openEditor(config).catch(error => layui.layer.msg(error.message, {icon: 2}));

        $('[data-refresh]').onclick = reloadActiveTable;

        $('[data-search]').onclick = reloadActiveTable;

        $('[data-keyword]').onkeydown = event => { if (event.key === 'Enter') reloadActiveTable(); };

        if (!tableToolBound) layui.table.on('tool(admin-data-table)', event => {

            const currentConfig = activeConfig;

            if (!currentConfig) return;

            if (event.event === 'edit') openEditor(currentConfig, event.data).catch(error => layui.layer.msg(error.message, {icon: 2}));

            if (event.event === 'delete') {

                const label = currentConfig.deleteLabel || currentConfig.title || '记录';

                layui.layer.confirm(`确认删除这条${label}记录吗？`, {icon: 3, title: '删除确认'}, async index => {

                    try {

                        await api(`${currentConfig.endpoint}/${event.data[currentConfig.id]}`, {method: 'DELETE'});

                        layui.layer.close(index);

                        layui.layer.msg('删除成功', {icon: 1});

                        reloadActiveTable();

                    } catch (error) { layui.layer.msg(error.message, {icon: 2}); }

                });

            }

        });

        tableToolBound = true;

    }



    async function mountDashboard() {

        try {

            const data = await api('/admin/api/dashboard');

            $$('[data-stat]').forEach(element => {

                const value = Number(data[element.dataset.stat] || 0);

                if (hasGsap) {

                    const counter = {value: 0};

                    gsap.to(counter, {value, duration: .8, ease: 'power2.out', onUpdate: () => element.textContent = Math.round(counter.value)});

                } else element.textContent = value;

            });

            const recent = $('#recent-consultations');

            recent.innerHTML = (data.recentConsultations || []).length ? data.recentConsultations.map(item => `

                <div class="recent-item"><span class="recent-initial">${escapeHtml((item.contactName || '?').slice(0, 1))}</span><div><div class="subject-chips">${(item.subjects || []).map(subject => `<span>${escapeHtml(subject)}</span>`).join('')}</div><strong>${escapeHtml(item.contactName)}</strong><small>${escapeHtml(item.email)} · ${escapeHtml(item.content)}</small></div><span class="recent-time">${escapeHtml(item.createTime || '')}</span></div>`).join('') : '<div class="empty-state">暂无咨询信息</div>';

            $$('[data-go-module]').forEach(button => { if (button) button.onclick = () => window.AdminApp.navigate(button.dataset.goModule); });

            const refreshBtn = $('[data-refresh-dashboard]');

            if (refreshBtn) refreshBtn.onclick = mountDashboard;

            if (hasGsap) {

                gsap.from('.stat-card', {y: 18, opacity: 0, duration: .5, stagger: .07, ease: 'power2.out'});

                gsap.to('.orbit-a', {rotation: 360, duration: 24, repeat: -1, ease: 'none'});

                gsap.to('.orbit-b', {rotation: -377, duration: 30, repeat: -1, ease: 'none'});

            }

        } catch (error) { layui.layer.msg(error.message, {icon: 2}); }

    }



    async function fetchWorkspace(module) {

        const response = await fetch(`/admin/pages/${module}`);

        const type = response.headers.get('content-type') || '';

        if (type.includes('application/json')) {

            const result = await response.json();

            if (result.code === 40100) window.location.href = '/admin/login';

            throw new Error(result.message || '工作区载入失败');

        }

        if (!response.ok) throw new Error('工作区载入失败');

        return response.text();

    }



    async function navigate(module, pushState = true) {

        const workspace = $('#admin-workspace');

        try {

            if (hasGsap && workspace.children.length) await gsap.to(workspace.children, {opacity: 0, y: -8, duration: .16});

            workspace.innerHTML = '<div class="workspace-loader"><span></span><p>正在载入工作区</p></div>';

            const html = await fetchWorkspace(module);

            workspace.innerHTML = html;

            $$('.nav-item').forEach(item => item.classList.toggle('is-active', item.dataset.module === module));
                // 若当前模块属于某个二级菜单分组，则自动展开该分组，便于用户感知层级关系
                const activeItem = $(`.nav-item[data-module="${module}"]`);
                if (activeItem) {
                    const group = activeItem.closest('.nav-group');
                    if (group) {
                        group.classList.add('is-open');
                        const header = group.querySelector('.nav-group-header');
                        if (header) header.setAttribute('aria-expanded', 'true');
                    }
                }



            const sectionLabel = module === 'dashboard' ? '仪表盘' : (loadModuleConfig(module)?.title || '管理后台');

            $('#current-section').textContent = sectionLabel;

            // 将 URL 改为完整路径(/admin/{module})，而不是带 hash
            if (pushState) {
                const targetUrl = '/admin/' + module;
                if (window.location.pathname !== targetUrl) {
                    window.history.pushState({module}, '', targetUrl);
                }
            }

            if (module === 'dashboard') await mountDashboard(); else mountModule(module);

            if (hasGsap) gsap.from(workspace.firstElementChild, {opacity: 0, y: 14, duration: .38, ease: 'power2.out'});

            $('#admin-sidebar')?.classList.remove('is-open');

        } catch (error) {

            workspace.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;

        }

    }



    function initLogin() {

        const form = $('#login-form');

        if (!form) return;

        if (hasGsap) {

            const timeline = gsap.timeline({defaults: {ease: 'power3.out'}});

            timeline.from('.login-shell', {opacity: 0, duration: .65})

                .from('.brand-lockup, .login-copy > *, .login-metric', {y: 22, opacity: 0, duration: .5, stagger: .08}, '-=.3')

                .from('.login-panel-inner > *', {x: 18, opacity: 0, duration: .42, stagger: .07}, '-=.55');

        }

        form.addEventListener('submit', async event => {

            event.preventDefault();

            const button = $('.login-submit', form);

            button.disabled = true;

            try {

                await api('/admin/auth/login', {method: 'POST', body: JSON.stringify({

                    username: form.elements.username.value.trim(), password: form.elements.password.value

                })});

                layui.layer.msg('登录成功', {icon: 1, time: 700});

                if (hasGsap) await gsap.to('.login-shell', {opacity: 0, y: -8, duration: .35});

                window.location.href = '/admin';

            } catch (error) {

                layui.layer.msg(error.message, {icon: 2});

                if (hasGsap) gsap.fromTo('.login-panel-inner', {x: -6}, {x: 0, duration: .3, ease: 'elastic.out(1, .3)'});

            } finally { button.disabled = false; }

        });

    }



    async function initApp() {

        if (!$('.admin-shell')) return;

        $('#today-label').textContent = new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'}).format(new Date());

        try {

            const user = await api('/admin/auth/me');

            if (user) {

                $('#admin-display-name').textContent = user.displayName || user.username;

                $('.user-avatar').textContent = (user.displayName || user.username || 'A').slice(0, 1).toUpperCase();

            }

        } catch (ignored) { return; }

        $$('.nav-item').forEach(item => {
            // 折叠态悬浮提示文字：从首个 <span> 取
            if (!item.dataset.tip) {
                const label = item.querySelector('span');
                if (label) item.dataset.tip = label.textContent.trim();
            }
            item.addEventListener('click', () => handleNavItemClick(item));
        });

        // 二级菜单分组的展开/折叠
        $$('.nav-group-header').forEach(header => {
            if (!header.dataset.tip) {
                const label = header.querySelector('span');
                if (label) header.dataset.tip = label.textContent.trim();
            }
            header.addEventListener('click', event => {
                event.stopPropagation();
                handleGroupHeaderClick(header);
            });
        });

        $('#sidebar-toggle').onclick = () => toggleSidebar();

        bindSidebarTooltips();

        $('#logout-button').onclick = async () => {

            try { await api('/admin/auth/logout', {method: 'POST'}); }

            finally { window.location.href = '/admin/login'; }

        };

        const initial = getModuleFromPath();
        // 前进/后退时跳转到对应模块，不重复 pushState
        window.addEventListener('popstate', () => navigate(getModuleFromPath(), false));

        navigate(initial);

    }



    // 仅用于在初始载入时校验 hash 是否命中已支持的模块




    window.AdminApp = {navigate};

    document.addEventListener('DOMContentLoaded', () => {

        if (typeof window.layui === 'undefined') return;

        layui.use(['layer', 'table', 'form', 'upload'], function () {

            initLogin();

            initApp();

        });

    });

})();





