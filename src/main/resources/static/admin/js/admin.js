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
    const actionsColumn = () => ({title: '操作', width: 135, fixed: 'right', toolbar: '#admin-row-actions'});

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

    const moduleConfigs = {
        products: {
            title: '产品管理', eyebrow: 'PRODUCT CATALOG', description: '维护产品封面、详情图集、分类与规格参数。', addLabel: '新增产品', endpoint: '/admin/products', id: 'productId', page: true,
            columns: [
                {field: 'coverUrl', title: '封面', width: 78, templet: d => imageCell(d.coverUrl, d.title)},
                {field: 'title', title: '产品标题', minWidth: 190, templet: d => `<span class="table-title">${escapeHtml(d.title)}</span>`},
                {field: 'parentCategoryName', title: '一级分类', width: 130},
                {field: 'categoryName', title: '二级分类', width: 140},
                {field: 'detailImages', title: '详情图片', width: 100, templet: d => `${(d.detailImages || []).length} 张`},
                {field: 'updateTime', title: '更新时间', width: 165}, actionsColumn()
            ],
            fields: [
                {name: 'title', label: '产品标题', type: 'text', required: true, wide: true},
                {name: 'categoryId', label: '产品二级分类', type: 'category-select', required: true},
                {name: 'coverAccessName', label: '产品封面', type: 'file', required: true},
                {name: 'summary', label: '产品简介', type: 'textarea', wide: true},
                {name: 'detailImages', label: '详情图片', type: 'multi-file', required: true, wide: true},
                {name: 'parameters', label: '参数信息', type: 'json-params', required: true, wide: true}
            ]
        },
        categories: {
            title: '产品分类', eyebrow: 'CATALOG STRUCTURE', description: '维护最多两级的产品目录，排序值越大越靠前。', addLabel: '新增分类', endpoint: '/admin/product-categories', id: 'categoryId', page: false,
            columns: [
                {field: 'categoryName', title: '分类名称', minWidth: 180, templet: d => `<span class="table-title">${escapeHtml(d.categoryName)}</span>`},
                {field: 'level', title: '层级', width: 95, templet: d => `<span class="level-badge level-${d.level}">${d.level === 1 ? '一级分类' : '二级分类'}</span>`},
                {field: 'parentName', title: '父级分类', minWidth: 150, templet: d => escapeHtml(d.parentName || '—')},
                {field: 'sortOrder', title: '排序值', width: 100, sort: true},
                {field: 'createTime', title: '创建时间', width: 165}, actionsColumn()
            ],
            fields: [
                {name: 'categoryName', label: '分类名称', type: 'text', required: true, wide: true},
                {name: 'parentId', label: '父级分类', type: 'parent-category-select'},
                {name: 'sortOrder', label: '排序值', type: 'number', required: true}
            ]
        },
        routes: {
            title: '运输线路', eyebrow: 'GLOBAL LOGISTICS', description: '维护世界地图上的源地址与目标地址线路。', addLabel: '新增线路', endpoint: '/admin/transport-routes', id: 'routeId', page: true,
            columns: [
                {title: '运输路径', minWidth: 360, templet: d => `<div class="route-line"><span>${escapeHtml(d.sourceAddress)}</span><i class="layui-icon layui-icon-right"></i><span>${escapeHtml(d.targetAddress)}</span></div>`},
                {field: 'createTime', title: '创建时间', width: 170}, {field: 'updateTime', title: '更新时间', width: 170}, actionsColumn()
            ],
            fields: [
                {name: 'sourceAddress', label: '源地址', type: 'text', required: true, wide: true},
                {name: 'targetAddress', label: '目标地址', type: 'text', required: true, wide: true}
            ]
        },
        partners: {
            title: '合作企业', eyebrow: 'TRUSTED PARTNERS', description: '维护合作企业品牌Logo与企业名称。', addLabel: '新增企业', endpoint: '/admin/partner-companies', id: 'partnerId', page: true,
            columns: [
                {field: 'logoUrl', title: 'Logo', width: 85, templet: d => imageCell(d.logoUrl, d.companyName)},
                {field: 'companyName', title: '企业名称', minWidth: 230, templet: d => `<span class="table-title">${escapeHtml(d.companyName)}</span>`},
                {field: 'createTime', title: '创建时间', width: 170}, {field: 'updateTime', title: '更新时间', width: 170}, actionsColumn()
            ],
            fields: [
                {name: 'companyName', label: '企业名称', type: 'text', required: true, wide: true},
                {name: 'logoAccessName', label: '企业Logo', type: 'file', required: true, wide: true}
            ]
        },
        news: {
            title: '公司动态', eyebrow: 'COMPANY STORIES', description: '发布项目动态、企业新闻与富文本内容。', addLabel: '发布动态', endpoint: '/admin/news', id: 'newsId', page: true,
            columns: [
                {field: 'coverUrl', title: '封面', width: 78, templet: d => imageCell(d.coverUrl, d.title)},
                {field: 'title', title: '动态标题', minWidth: 200, templet: d => `<span class="table-title">${escapeHtml(d.title)}</span>`},
                {field: 'projectRegion', title: '项目地区', width: 130, templet: d => escapeHtml(d.projectRegion || '—')},
                {field: 'tags', title: '标签', minWidth: 150, templet: d => (d.tags || []).map(tag => `<span class="tag-chip">${escapeHtml(tag.tagName)}</span>`).join(' ') || '—'},
                {field: 'updateTime', title: '更新时间', width: 165}, actionsColumn()
            ],
            fields: [
                {name: 'title', label: '动态标题', type: 'text', required: true, wide: true},
                {name: 'coverAccessName', label: '封面图片', type: 'file', required: true},
                {name: 'projectRegion', label: '项目地区', type: 'text'},
                {name: 'contactEmail', label: '咨询邮箱', type: 'email'},
                {name: 'tagIds', label: '动态标签', type: 'tags', wide: true},
                {name: 'summary', label: '动态简介', type: 'textarea', wide: true},
                {name: 'content', label: '动态正文', type: 'richtext', required: true, wide: true}
            ]
        },
        tags: {
            title: '动态标签', eyebrow: 'EDITORIAL TAXONOMY', description: '维护公司动态标签及二进制图标。', addLabel: '新增标签', endpoint: '/admin/news-tags', id: 'tagId', page: false,
            columns: [
                {field: 'iconUrl', title: '图标', width: 85, templet: d => imageCell(d.iconUrl, d.tagName)},
                {field: 'tagName', title: '标签名称', minWidth: 250, templet: d => `<span class="table-title">${escapeHtml(d.tagName)}</span>`},
                {field: 'createTime', title: '创建时间', width: 170}, actionsColumn()
            ],
            fields: [
                {name: 'tagName', label: '标签名称', type: 'text', required: true, wide: true},
                {name: 'iconBase64', label: '标签图标', type: 'icon', wide: true}
            ]
        },
        consultations: {
            title: '咨询信息', eyebrow: 'CUSTOMER INQUIRIES', description: '集中查看和维护官网客户咨询线索。', addLabel: '录入咨询', endpoint: '/admin/consultations', id: 'consultationId', page: true,
            columns: [
                {field: 'contactName', title: '姓名', width: 110, templet: d => `<span class="table-title">${escapeHtml(d.contactName)}</span>`},
                {field: 'subjects', title: '咨询主题', minWidth: 160, templet: d => (d.subjects || []).map(item => `<span class="tag-chip">${escapeHtml(item)}</span>`).join(' ')},
                {field: 'content', title: '咨询内容', minWidth: 230, templet: d => `<span class="table-title">${escapeHtml(d.content)}</span>`},
                {field: 'email', title: '邮箱', width: 190}, {field: 'phone', title: '电话', width: 145},
                {field: 'createTime', title: '提交时间', width: 165}, actionsColumn()
            ],
            fields: [
                {name: 'subjects', label: '咨询主题', type: 'csv', required: true, wide: true},
                {name: 'contactName', label: '姓名', type: 'text', required: true},
                {name: 'phone', label: '电话', type: 'text'},
                {name: 'email', label: '邮箱', type: 'email', required: true, wide: true},
                {name: 'content', label: '咨询内容', type: 'textarea', required: true, wide: true}
            ]
        }
    };

    function renderField(field, data, references) {
        const value = data[field.name] == null ? '' : data[field.name];
        const classes = `editor-field${field.wide ? ' is-wide' : ''}`;
        const label = `<label class="${field.required ? 'required' : ''}">${escapeHtml(field.label)}</label>`;
        if (['text', 'email', 'number'].includes(field.type)) {
            return `<div class="${classes}">${label}<input class="editor-input" type="${field.type}" name="${field.name}" value="${escapeHtml(value)}"></div>`;
        }
        if (field.type === 'textarea') {
            return `<div class="${classes}">${label}<textarea class="editor-textarea" name="${field.name}">${escapeHtml(value)}</textarea></div>`;
        }
        if (field.type === 'csv') {
            const csvValue = Array.isArray(value) ? value.join(',') : value;
            return `<div class="${classes}">${label}<input class="editor-input" name="${field.name}" value="${escapeHtml(csvValue)}"><p class="editor-help">多个主题请使用英文逗号分隔，例如：价格咨询,项目合作</p></div>`;
        }
        if (field.type === 'category-select') {
            const options = (references.categories || []).filter(item => item.level === 2)
                .map(item => `<option value="${item.categoryId}" ${item.categoryId === value ? 'selected' : ''}>${escapeHtml((item.parentName || '') + ' / ' + item.categoryName)}</option>`).join('');
            return `<div class="${classes}">${label}<select class="editor-select" name="${field.name}"><option value="">请选择二级分类</option>${options}</select></div>`;
        }
        if (field.type === 'parent-category-select') {
            const options = (references.categories || []).filter(item => item.level === 1 && item.categoryId !== data.categoryId)
                .map(item => `<option value="${item.categoryId}" ${item.categoryId === value ? 'selected' : ''}>${escapeHtml(item.categoryName)}</option>`).join('');
            return `<div class="${classes}">${label}<select class="editor-select" name="${field.name}"><option value="">无（创建一级分类）</option>${options}</select></div>`;
        }
        if (field.type === 'file' || field.type === 'icon') {
            const source = field.type === 'icon' ? data.iconUrl : previewUrl(value);
            return `<div class="${classes}">${label}<div class="upload-box"><div class="upload-preview" data-preview="${field.name}">${source ? `<img src="${escapeHtml(source)}" alt="预览">` : '<i class="layui-icon layui-icon-picture"></i>'}</div><div class="upload-control"><strong>${field.type === 'icon' ? '选择图标文件' : '上传至文件库'}</strong><small>${field.type === 'icon' ? '图标将以二进制保存' : '支持 JPG / PNG / WEBP 等图片格式'}</small><input type="file" accept="image/*" data-file-field="${field.name}" data-file-kind="${field.type}"></div></div></div>`;
        }
        if (field.type === 'multi-file') {
            const images = Array.isArray(value) ? value : [];
            return `<div class="${classes}">${label}<div class="upload-box"><div class="upload-control"><strong>批量上传详情图片</strong><small>可一次选择多张图片，提交前可移除</small><input type="file" accept="image/*" multiple data-file-field="${field.name}" data-file-kind="multi-file"><div class="multi-preview" data-multi-preview="${field.name}">${images.map((name, index) => `<span><img src="${previewUrl(name)}" alt="详情图"><button type="button" data-remove-image="${index}">×</button></span>`).join('')}</div></div></div></div>`;
        }
        if (field.type === 'json-params') {
            const text = JSON.stringify(Array.isArray(value) ? value : [{label: '厚度范围', value: '4.76 - 12 mm'}], null, 2);
            return `<div class="${classes}">${label}<textarea class="editor-textarea" name="${field.name}" rows="7">${escapeHtml(text)}</textarea><p class="editor-help">JSON数组格式：[{"label":"厚度范围","value":"4.76 - 12 mm"}]</p></div>`;
        }
        if (field.type === 'tags') {
            const selected = new Set((data.tags || []).map(tag => tag.tagId).concat(Array.isArray(value) ? value : []));
            const options = (references.tags || []).map(tag => `<label class="tag-option"><input type="checkbox" name="tagIds" value="${tag.tagId}" ${selected.has(tag.tagId) ? 'checked' : ''}>${escapeHtml(tag.tagName)}</label>`).join('');
            return `<div class="${classes}">${label}<div class="tag-options">${options || '<span class="muted">暂无标签，请先创建动态标签</span>'}</div></div>`;
        }
        if (field.type === 'richtext') {
            return `<div class="${classes}">${label}<div class="rich-toolbar"><button type="button" data-command="bold"><b>B</b></button><button type="button" data-command="italic"><i>I</i></button><button type="button" data-command="insertUnorderedList">项目列表</button><label><span class="ghost-button">插入正文图片</span><input type="file" accept="image/*" data-rich-image hidden></label></div><div class="rich-editor" contenteditable="true" data-rich-editor>${value || ''}</div><p class="editor-help">正文保存为HTML；插入的图片会以内嵌Base64方式随正文保存。</p></div>`;
        }
        return '';
    }

    async function loadReferences(config) {
        const references = {};
        if (config.fields.some(field => field.type.includes('category'))) {
            references.categories = await api('/admin/product-categories');
        }
        if (config.fields.some(field => field.type === 'tags')) {
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

    function bindEditorEvents(container, state) {
        $$('[data-file-field]', container).forEach(input => input.addEventListener('change', async () => {
            if (!input.files.length) return;
            const fieldName = input.dataset.fileField;
            const kind = input.dataset.fileKind;
            const loading = layui.layer.load(2, {shade: .12});
            try {
                if (kind === 'icon') {
                    const reader = new FileReader();
                    reader.onload = () => {
                        state[fieldName] = reader.result;
                        state.iconContentType = input.files[0].type || 'image/png';
                        $(`[data-preview="${fieldName}"]`, container).innerHTML = `<img src="${reader.result}" alt="图标预览">`;
                    };
                    reader.readAsDataURL(input.files[0]);
                } else if (kind === 'multi-file') {
                    state[fieldName] = state[fieldName] || [];
                    for (const file of input.files) {
                        const uploaded = await uploadFile(file);
                        state[fieldName].push(uploaded.accessName);
                    }
                    updateMultiPreview(container, fieldName, state[fieldName]);
                } else {
                    const uploaded = await uploadFile(input.files[0]);
                    state[fieldName] = uploaded.accessName;
                    $(`[data-preview="${fieldName}"]`, container).innerHTML = `<img src="${previewUrl(uploaded.accessName)}" alt="图片预览">`;
                }
            } catch (error) {
                layui.layer.msg(error.message, {icon: 2});
            } finally {
                layui.layer.close(loading);
            }
        }));
        updateMultiPreview(container, 'detailImages', state.detailImages || []);
        $$('[data-command]', container).forEach(button => button.addEventListener('click', () => {
            document.execCommand(button.dataset.command, false, null);
        }));
        const richImage = $('[data-rich-image]', container);
        if (richImage) {
            richImage.addEventListener('change', () => {
                const file = richImage.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => insertImageAtCursor($('[data-rich-editor]', container), reader.result);
                reader.readAsDataURL(file);
            });
        }
    }

    function collectPayload(container, config, state) {
        const payload = {};
        for (const field of config.fields) {
            let value;
            if (field.type === 'file') value = state[field.name] || '';
            else if (field.type === 'multi-file') value = state[field.name] || [];
            else if (field.type === 'icon') {
                value = state[field.name] || '';
                payload.iconContentType = state.iconContentType || '';
            } else if (field.type === 'tags') {
                value = $$('input[name="tagIds"]:checked', container).map(input => input.value);
            } else if (field.type === 'richtext') {
                value = $('[data-rich-editor]', container).innerHTML.trim();
            } else {
                const input = $(`[name="${field.name}"]`, container);
                value = input ? input.value.trim() : '';
                if (field.type === 'number') value = Number(value || 0);
                if (field.type === 'csv') value = value.split(',').map(item => item.trim()).filter(Boolean);
                if (field.type === 'json-params') {
                    try { value = JSON.parse(value); }
                    catch (error) { throw new Error('参数信息不是有效的JSON数组'); }
                    if (!Array.isArray(value)) throw new Error('参数信息必须是JSON数组');
                }
            }
            if (field.required && (value === '' || value == null || (Array.isArray(value) && value.length === 0))) {
                throw new Error(`${field.label}不能为空`);
            }
            payload[field.name] = value;
        }
        return payload;
    }

    async function openEditor(config, row) {
        const editing = Boolean(row && row[config.id]);
        const data = editing ? await api(`${config.endpoint}/${row[config.id]}`) : {};
        const references = await loadReferences(config);
        const state = Object.assign({}, data, {
            detailImages: Array.isArray(data.detailImages) ? [...data.detailImages] : [],
            iconBase64: ''
        });
        const content = `<div class="admin-editor"><div class="editor-grid">${config.fields.map(field => renderField(field, data, references)).join('')}</div></div>`;
        const area = window.innerWidth < 780 ? ['96%', '92%'] : ['min(780px, 88vw)', '88%'];
        layui.layer.open({
            type: 1, title: editing ? `编辑${config.title.replace('管理', '')}` : config.addLabel,
            area, shade: .28, shadeClose: false, content, btn: ['保存', '取消'],
            success(layerElement) {
                bindEditorEvents(layerElement[0], state);
                if (hasGsap) gsap.from($('.admin-editor', layerElement[0]), {y: 16, opacity: 0, duration: .35, ease: 'power2.out'});
            },
            async yes(index, layerElement) {
                try {
                    const payload = collectPayload(layerElement[0], config, state);
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
        const config = moduleConfigs[module];
        if (!config) return;
        activeConfig = config;
        $('[data-module-title]').textContent = config.title;
        $('[data-module-eyebrow]').textContent = config.eyebrow;
        $('[data-module-description]').textContent = config.description;
        $('[data-add-label]').textContent = config.addLabel;
        const tableUrl = config.page ? `${config.endpoint}/page` : config.endpoint;
        activeTable = layui.table.render({
            elem: '#admin-data-table', id: 'admin-data-table-instance', url: tableUrl,
            page: config.page ? {layout: ['prev', 'page', 'next', 'count', 'limit'], groups: 4} : false,
            limit: 10, limits: [10, 20, 50], request: {pageName: 'pageNum', limitName: 'pageSize'},
            text: {none: '暂无数据，点击右上角按钮开始创建'},
            cols: [config.columns], skin: 'line', even: false,
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
                layui.layer.confirm(`确认删除这条${currentConfig.title.replace('管理', '')}记录吗？`, {icon: 3, title: '删除确认'}, async index => {
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
            const data = await api('/admin/dashboard');
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
            $$('[data-go-module]').forEach(button => button.onclick = () => window.AdminApp.navigate(button.dataset.goModule));
            $('[data-refresh-dashboard]').onclick = mountDashboard;
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

    async function navigate(module) {
        const workspace = $('#admin-workspace');
        try {
            if (hasGsap && workspace.children.length) await gsap.to(workspace.children, {opacity: 0, y: -8, duration: .16});
            workspace.innerHTML = '<div class="workspace-loader"><span></span><p>正在载入工作区</p></div>';
            const html = await fetchWorkspace(module);
            workspace.innerHTML = html;
            $$('.nav-item').forEach(item => item.classList.toggle('is-active', item.dataset.module === module));
            const config = moduleConfigs[module];
            $('#current-section').textContent = module === 'dashboard' ? '仪表盘' : (config ? config.title : '管理后台');
            window.location.hash = module;
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
        $$('.nav-item').forEach(item => item.addEventListener('click', () => navigate(item.dataset.module)));
        $('#sidebar-toggle').onclick = () => $('#admin-sidebar').classList.toggle('is-open');
        $('#logout-button').onclick = async () => {
            try { await api('/admin/auth/logout', {method: 'POST'}); }
            finally { window.location.href = '/admin/login'; }
        };
        const initial = window.location.hash.replace('#', '');
        navigate(initial === 'dashboard' || moduleConfigs[initial] ? initial : 'dashboard');
    }

    window.AdminApp = {navigate};
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.layui === 'undefined') return;
        layui.use(['layer', 'table'], function () {
            initLogin();
            initApp();
        });
    });
})();
