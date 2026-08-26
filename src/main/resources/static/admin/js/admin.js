(function () {
  'use strict';
  const API = '/admin';
  const workspace = document.getElementById('workspace');
  const moduleTitles = {products:'产品管理',categories:'产品分类管理',routes:'运输路线管理',partners:'合作企业管理',news:'公司动态管理',tags:'动态标签管理',consultations:'咨询信息管理'};
  const pageState = {};
  const openTabs = new Map();
  let activeModule;
  let tabOffset = 0;
  const endpoints = {products:'products',routes:'transport-routes',partners:'partner-companies',news:'news',consultations:'consultations'};
  let layuiLayer;
  let layerIndex;
  window.layui?.use(['layer', 'element', 'form'], () => { layuiLayer = window.layui.layer; window.layui.element.render('nav'); });
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const time = value => value ? String(value).replace('T', ' ').slice(0, 19) : '-';
  const image = (url, cls = 'thumb') => url ? `<img class="${cls}" src="${escapeHtml(url)}" alt="">` : `<span class="${cls}"></span>`;
  const request = async (url, options = {}) => {
    const response = await fetch(url, {credentials:'same-origin', headers:{'Content-Type':'application/json', ...(options.headers || {})}, ...options});
    const body = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    if (!response.ok || (body && body.code !== 0)) throw new Error(body?.message || '请求失败，请稍后重试');
    return body?.data;
  };
  const notify = message => layuiLayer ? layuiLayer.msg(message, {icon:2, time:2400}) : window.alert(message);
  const modal = (title, body, actions = '') => {
    const content = `<div class="deaofu-layer-form">${body}${actions ? `<footer class="modal-footer">${actions}</footer>` : ''}</div>`;
    if (layuiLayer) { layerIndex = layuiLayer.open({type:1, title, area:['650px', 'auto'], shadeClose:false, content}); return; }
    document.getElementById('modal-root').innerHTML = `<div class="modal-backdrop"><section class="modal-panel" role="dialog" aria-modal="true"><header class="modal-header"><h2>${title}</h2><button class="modal-close" type="button" data-close>&times;</button></header><div class="modal-content">${body}</div>${actions ? `<footer class="modal-footer">${actions}</footer>` : ''}</section></div>`;
    document.querySelector('[data-close]').onclick = closeModal;
  };
  const closeModal = () => { if (layuiLayer && layerIndex !== undefined) { layuiLayer.close(layerIndex); layerIndex = undefined; } document.getElementById('modal-root').innerHTML = ''; };
  const button = (name, text, extra = '') => `<button type="button" class="link-button ${extra}" data-row-action="${name}">${text}</button>`;
  const initShell = async () => {
    if (!workspace) return;
    document.getElementById('toggle-menu')?.addEventListener('click', () => document.body.classList.toggle('layadmin-side-shrink'));
    document.getElementById('refresh-workspace')?.addEventListener('click', () => loadModule(activeModule || currentModule()));
    document.getElementById('tab-prev')?.addEventListener('click', () => shiftTabs(-1));
    document.getElementById('tab-next')?.addEventListener('click', () => shiftTabs(1));
    window.addEventListener('resize', updateTabPosition);
    document.getElementById('logout-button').addEventListener('click', async () => { try { await request(`${API}/auth/logout`, {method:'POST'}); } finally { location.href = '/admin/login'; } });
    document.querySelectorAll('[data-module]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); history.pushState({}, '', link.href); loadModule(link.dataset.module); }));
    window.addEventListener('popstate', () => loadModule(currentModule()));
    try { const user = await request(`${API}/auth/me`); if (!user) { location.href = '/admin/login'; return; } document.getElementById('current-user').textContent = user.userName || user.username || '管理员'; } catch (_) { location.href = '/admin/login'; return; }
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
    tabHeader.querySelectorAll('[data-tab-module]').forEach(tab => tab.addEventListener('click', () => { const module = tab.dataset.tabModule; if (module === activeModule) return; history.pushState({}, '', modulePath(module)); loadModule(module); }));
    tabHeader.querySelectorAll('[data-close-tab]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); const module = button.dataset.closeTab; if (openTabs.size === 1) { notify('至少保留一个工作标签'); return; } const wasActive = module === activeModule; openTabs.delete(module); if (wasActive) { const nextModule = [...openTabs.keys()].at(-1); history.pushState({}, '', modulePath(nextModule)); loadModule(nextModule); } else renderTabs(); }));
    requestAnimationFrame(revealActiveTab);
  };
  const loadModule = async module => {
    if (!moduleTitles[module]) module = 'products';
    if (!openTabs.has(module)) openTabs.set(module, moduleTitles[module]);
    activeModule = module;
    renderTabs();
    document.querySelectorAll('[data-module]').forEach(link => { const active = link.dataset.module === module; link.classList.toggle('is-active', active); link.parentElement.classList.toggle('layui-this', active); });
    window.layui?.element.render('nav');
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    if (breadcrumbTitle) breadcrumbTitle.textContent = moduleTitles[module];
    workspace.innerHTML = '<div class="loading-state">正在载入数据...</div>';
    try { const markup = await (await fetch(`${API}/pages/${module}`, {credentials:'same-origin'})).text(); workspace.innerHTML = markup; window.layui?.form.render(); await initModule(module, workspace.querySelector('.module-page')); } catch (error) { workspace.innerHTML = `<div class="loading-state">${escapeHtml(error.message || '页面加载失败')}</div>`; }
  };
  const initModule = async (module, root) => {
    pageState[module] = {pageNum:1,pageSize:10,keyword:''};
    root.querySelector('[data-filter]')?.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); pageState[module] = {...pageState[module], ...Object.fromEntries(data), pageNum:1}; renderModule(module, root); });
    root.querySelector('[data-action="reset"]')?.addEventListener('click', () => setTimeout(() => { pageState[module] = {pageNum:1,pageSize:10,keyword:''}; renderModule(module, root); }, 0));
    root.querySelector('[data-action="create"]')?.addEventListener('click', () => openEditor(module));
    if (module === 'products' || module === 'categories') await populateCategories(root, module === 'products');
    if (module === 'news') await populateTags(root);
    await renderModule(module, root);
  };
  const populateCategories = async (root, secondaryOnly = false) => { const categories = await request(`${API}/product-categories`); const select = root.querySelector('[data-category-filter]'); if (select) { select.insertAdjacentHTML('beforeend', categories.filter(x => !secondaryOnly || x.level === 2).map(x => `<option value="${x.categoryId}">${escapeHtml(x.parentName ? `${x.parentName} / ${x.categoryName}` : x.categoryName)}</option>`).join('')); window.layui?.form.render('select'); } };
  const populateTags = async root => { const tags = await request(`${API}/news-tags`); const select = root.querySelector('[data-tag-filter]'); if (select) { select.insertAdjacentHTML('beforeend', tags.map(x => `<option value="${x.tagId}">${escapeHtml(x.tagName)}</option>`).join('')); window.layui?.form.render('select'); } };
  const renderModule = async (module, root) => {
    try {
      const state = pageState[module]; let list, total;
      if (module === 'categories') { list = await request(`${API}/product-categories`); if (state.keyword) list = list.filter(x => x.categoryName.includes(state.keyword)); total = list.length; }
      else if (module === 'tags') { list = await request(`${API}/news-tags`); if (state.keyword) list = list.filter(x => x.tagName.includes(state.keyword)); total = list.length; }
      else { const params = new URLSearchParams(Object.entries(state).filter(([,v]) => v !== '')); const page = await request(`${API}/${endpoints[module]}/page?${params}`); list = page.list || []; total = page.total || 0; }
      root.querySelector('[data-list]').innerHTML = list.length ? list.map(row => rowHtml(module, row)).join('') : '<tr><td class="empty-state" colspan="8">暂无数据</td></tr>';
      bindRows(module, root, list); renderPagination(module, root, total);
    } catch (error) { root.querySelector('[data-list]').innerHTML = `<tr><td class="empty-state" colspan="8">${escapeHtml(error.message)}</td></tr>`; }
  };
  const rowHtml = (module, x) => {
    const actions = id => `<div class="action-list">${button('view','查看')}${module !== 'consultations' ? button('edit','编辑') + button('delete','删除','danger') : ''}</div>`;
    if (module === 'products') return `<tr data-id="${x.productId}"><td><div class="item-title">${image(x.coverUrl)}<span>${escapeHtml(x.title)}</span></div></td><td>${escapeHtml([x.parentCategoryName,x.categoryName].filter(Boolean).join(' / ') || '-')}</td><td class="ellipsis">${escapeHtml(x.summary || '-')}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
    if (module === 'categories') return `<tr data-id="${x.categoryId}"><td><span class="tree-name">${x.level === 2 ? '<i class="tree-indent">└</i>' : ''}${escapeHtml(x.categoryName)}</span></td><td><span class="level-badge">${x.level === 1 ? '一级分类' : '二级分类'}</span></td><td>${escapeHtml(x.parentName || '-')}</td><td>${x.sortOrder ?? 0}</td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
    if (module === 'routes') return `<tr data-id="${x.routeId}"><td>${escapeHtml(x.sourceAddress)}</td><td class="route-arrow">&#8594;</td><td>${escapeHtml(x.targetAddress)}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
    if (module === 'partners') return `<tr data-id="${x.partnerId}"><td>${image(x.logoUrl,'logo-thumb')}</td><td><b>${escapeHtml(x.companyName)}</b></td><td>${time(x.createTime)}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
    if (module === 'news') return `<tr data-id="${x.newsId}"><td>${image(x.coverUrl)}</td><td><div class="item-title">${escapeHtml(x.title)}</div><span class="muted ellipsis">${escapeHtml(x.summary || '')}</span></td><td>${(x.tags || []).map(t => `<span class="tag">${escapeHtml(t.tagName)}</span>`).join('') || '-'}</td><td>${escapeHtml(x.projectRegion || '-')}</td><td>${time(x.updateTime)}</td><td class="align-right">${actions()}</td></tr>`;
    if (module === 'tags') return `<tr data-id="${x.tagId}"><td>${image(x.iconUrl,'tag-icon')}</td><td><b>${escapeHtml(x.tagName)}</b></td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
    return `<tr data-id="${x.consultationId}"><td><b>${escapeHtml(x.contactName)}</b></td><td>${escapeHtml(x.email)}<br><span class="muted">${escapeHtml(x.phone || '-')}</span></td><td>${(x.subjects || []).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('')}</td><td class="ellipsis">${escapeHtml(x.content)}</td><td>${time(x.createTime)}</td><td class="align-right">${actions()}</td></tr>`;
  };
  const bindRows = (module, root, list) => root.querySelectorAll('[data-row-action]').forEach(node => node.addEventListener('click', async () => { const row = node.closest('tr'); const id = row.dataset.id; const action = node.dataset.rowAction; if (action === 'delete') { if (!confirm('确定删除这条记录吗？此操作无法撤销。')) return; try { await request(`${API}/${module === 'categories' ? 'product-categories' : module === 'tags' ? 'news-tags' : endpoints[module]}/${id}`, {method:'DELETE'}); renderModule(module, root); } catch (error) { notify(error.message); } return; } if (action === 'edit') { openEditor(module, id); return; } const idField = module === 'categories' ? 'categoryId' : module === 'tags' ? 'tagId' : module === 'consultations' ? 'consultationId' : module === 'products' ? 'productId' : module === 'routes' ? 'routeId' : module === 'partners' ? 'partnerId' : 'newsId'; const data = list.find(x => x[idField] === id) || await fetchDetail(module, id); openDetail(module, data); }));
  const renderPagination = (module, root, total) => { const target = root.querySelector('[data-pagination]'); if (!target) return; const state = pageState[module], pages = Math.max(1, Math.ceil(total / state.pageSize)); target.innerHTML = `<span>共 ${total} 条</span><div class="pagination"><button data-page="${state.pageNum - 1}" ${state.pageNum <= 1 ? 'disabled':''}>&lsaquo;</button>${Array.from({length:pages},(_,i) => i + 1).slice(0,7).map(p => `<button data-page="${p}" class="${p === Number(state.pageNum) ? 'is-current':''}">${p}</button>`).join('')}<button data-page="${state.pageNum + 1}" ${state.pageNum >= pages ? 'disabled':''}>&rsaquo;</button></div>`; target.querySelectorAll('[data-page]').forEach(btn => btn.onclick = () => { pageState[module].pageNum = Number(btn.dataset.page); renderModule(module, root); }); };
  const fetchDetail = (module, id) => request(`${API}/${module === 'categories' ? 'product-categories' : module === 'tags' ? 'news-tags' : endpoints[module]}/${id}`);
  const openDetail = (module, x) => { let fields = [];
    if (module === 'products') fields = [['产品名称',x.title],['所属分类',[x.parentCategoryName,x.categoryName].filter(Boolean).join(' / ')],['产品简介',x.summary],['产品参数',(x.parameters||[]).map(p => `${p.label}：${p.value}`).join('\n')],['创建时间',time(x.createTime)]];
    else if (module === 'categories') fields = [['分类名称',x.categoryName],['分类层级',x.level === 1 ? '一级分类':'二级分类'],['所属一级分类',x.parentName || '-'],['排序值',x.sortOrder],['创建时间',time(x.createTime)]];
    else if (module === 'routes') fields = [['始发地',x.sourceAddress],['目的地',x.targetAddress],['创建时间',time(x.createTime)],['更新时间',time(x.updateTime)]];
    else if (module === 'partners') fields = [['企业名称',x.companyName],['创建时间',time(x.createTime)],['更新时间',time(x.updateTime)]];
    else if (module === 'news') fields = [['动态标题',x.title],['动态摘要',x.summary],['动态标签',(x.tags||[]).map(t => t.tagName).join('、') || '-'],['项目地区',x.projectRegion || '-'],['咨询邮箱',x.contactEmail || '-'],['正文',x.content],['创建时间',time(x.createTime)]];
    else if (module === 'tags') fields = [['标签名称',x.tagName],['创建时间',time(x.createTime)]];
    else fields = [['联系人',x.contactName],['邮箱',x.email],['电话',x.phone || '-'],['咨询主题',(x.subjects||[]).join('、')],['咨询内容',x.content],['提交时间',time(x.createTime)]];
    const cover = module === 'products' ? image(x.coverUrl,'detail-cover') : module === 'partners' ? image(x.logoUrl,'detail-cover') : module === 'news' ? image(x.coverUrl,'detail-cover') : module === 'tags' ? image(x.iconUrl,'detail-cover') : '';
    modal(`${moduleTitles[module]}详情`, `${cover}<dl class="detail-grid">${fields.map(([k,v]) => `<dt>${escapeHtml(k)}</dt><dd>${v ? escapeHtml(v).replace(/\n/g, '<br>') : '-'}</dd>`).join('')}</dl>`, '<button class="secondary-button" type="button" data-close>关闭</button>'); document.querySelector('[data-close]')?.addEventListener('click', closeModal);
  };
  const openEditor = async (module, id) => { try { const data = id ? await fetchDetail(module,id) : {}; const body = await editorForm(module,data); modal(`${id ? '编辑':'新增'}${moduleTitles[module]}`, body, '<button class="secondary-button" type="button" data-close>取消</button><button class="primary-button" type="button" data-save>保存</button>'); document.querySelector('[data-close]')?.addEventListener('click', closeModal); bindEditor(module,data); document.querySelector('[data-save]').onclick = () => saveEditor(module,id); } catch (error) { notify(error.message); } };
  const editorForm = async (module, data) => {
    const field = (name,label,value='',options='') => `<label class="form-field">${label}${options ? `<select name="${name}">${options}</select>` : `<input name="${name}" value="${escapeHtml(value || '')}">`}</label>`;
    if (module === 'categories') { const categories = await request(`${API}/product-categories`); return `<form class="form-grid" data-editor>${field('categoryName','分类名称',data.categoryName)}${field('sortOrder','排序值',data.sortOrder ?? 0)}<label class="form-field full">所属一级分类<select name="parentId"><option value="">作为一级分类</option>${categories.filter(x => x.level === 1 && x.categoryId !== data.categoryId).map(x=>`<option value="${x.categoryId}" ${x.categoryId === data.parentId?'selected':''}>${escapeHtml(x.categoryName)}</option>`).join('')}</select></label></form>`; }
    if (module === 'routes') return `<form class="form-grid" data-editor>${field('sourceAddress','始发地',data.sourceAddress)}${field('targetAddress','目的地',data.targetAddress)}</form>`;
    if (module === 'partners') return `<form class="form-grid" data-editor>${field('companyName','企业名称',data.companyName)}<label class="form-field full">企业 Logo<div class="file-picker">${image(data.logoUrl,'logo-thumb')}<label>选择图片<input type="file" accept="image/*" data-upload="logoAccessName"></label><span class="form-help" data-file-name>${data.logoAccessName || '请上传企业 Logo'}</span><input type="hidden" name="logoAccessName" value="${escapeHtml(data.logoAccessName||'')}"></div></label></form>`;
    if (module === 'tags') return `<form class="form-grid" data-editor>${field('tagName','标签名称',data.tagName)}<label class="form-field full">标签图标<div class="file-picker">${image(data.iconUrl,'tag-icon')}<label>选择图标<input type="file" accept="image/*" data-base64="iconBase64"></label><span class="form-help" data-file-name>${data.iconUrl ? '已保留现有图标' : '可选，建议上传方形 PNG 或 SVG'}</span><input type="hidden" name="iconBase64"></div></label></form>`;
    if (module === 'products') { const categories = await request(`${API}/product-categories`); const options = categories.filter(x=>x.level===2).map(x=>`<option value="${x.categoryId}" ${x.categoryId===data.categoryId?'selected':''}>${escapeHtml(`${x.parentName || ''}${x.parentName ? ' / ' : ''}${x.categoryName}`)}</option>`).join(''); return `<form class="form-grid" data-editor>${field('title','产品名称',data.title)}<label class="form-field">所属二级分类<select name="categoryId">${options}</select></label><label class="form-field full">产品简介<textarea name="summary">${escapeHtml(data.summary||'')}</textarea></label><label class="form-field full">产品封面<div class="file-picker">${image(data.coverUrl)}<label>上传封面<input type="file" accept="image/*" data-upload="coverAccessName"></label><span class="form-help" data-file-name>${data.coverAccessName || '请上传一张产品封面'}</span><input type="hidden" name="coverAccessName" value="${escapeHtml(data.coverAccessName||'')}"></div></label><label class="form-field full">详情图片<div class="file-picker"><label>添加图片<input type="file" accept="image/*" multiple data-upload-list="detailImages"></label><div class="image-list" data-image-list>${(data.detailImages||[]).map(n=>`<span class="image-item" data-access="${escapeHtml(n)}"><img src="${API}/sys-file/preview/${escapeHtml(n)}"><button type="button">&times;</button></span>`).join('')}</div></div></label><label class="form-field full">产品参数<div data-parameters>${(data.parameters||[]).map(p=>parameterRow(p)).join('') || parameterRow()}</div><button class="text-button" type="button" data-add-parameter>+ 添加参数</button></label></form>`; }
    const tags = module === 'news' ? await request(`${API}/news-tags`) : []; const selected = new Set((data.tags||[]).map(x=>x.tagId)); return `<form class="form-grid" data-editor>${field('title','动态标题',data.title)}${field('projectRegion','项目地区',data.projectRegion)}${field('contactEmail','咨询邮箱',data.contactEmail)}<label class="form-field full">动态标签<select name="tagIds" multiple size="4">${tags.map(x=>`<option value="${x.tagId}" ${selected.has(x.tagId)?'selected':''}>${escapeHtml(x.tagName)}</option>`).join('')}</select></label><label class="form-field full">动态封面<div class="file-picker">${image(data.coverUrl)}<label>上传封面<input type="file" accept="image/*" data-upload="coverAccessName"></label><span class="form-help" data-file-name>${data.coverAccessName || '请上传动态封面'}</span><input type="hidden" name="coverAccessName" value="${escapeHtml(data.coverAccessName||'')}"></div></label><label class="form-field full">动态摘要<textarea name="summary">${escapeHtml(data.summary||'')}</textarea></label><label class="form-field full">动态正文<textarea name="content" placeholder="支持 HTML 正文">${escapeHtml(data.content||'')}</textarea></label></form>`;
  };
  const parameterRow = p => `<div class="parameter-row"><input placeholder="参数名称" value="${escapeHtml(p?.label || '')}"><input placeholder="参数值" value="${escapeHtml(p?.value || '')}"><button type="button" data-remove-parameter>&times;</button></div>`;
  const bindEditor = module => { document.querySelectorAll('[data-upload]').forEach(input => input.addEventListener('change', async event => { const file = event.target.files[0]; if (!file) return; try { const form = new FormData(); form.append('file',file); const response = await fetch(`${API}/sys-file/upload`,{method:'POST',body:form,credentials:'same-origin'}); const body = await response.json(); if (!response.ok || body.code !== 0) throw new Error(body.message); const name = input.dataset.upload; document.querySelector(`[name="${name}"]`).value = body.data.accessName; input.closest('.file-picker').querySelector('[data-file-name]').textContent = body.data.originalName; const preview = input.closest('.file-picker').querySelector('img'); if (preview) preview.src = `${API}/sys-file/preview/${body.data.accessName}`; } catch(error) { notify(error.message); } })); document.querySelectorAll('[data-upload-list]').forEach(input => input.addEventListener('change', async event => { const holder = document.querySelector('[data-image-list]'); for (const file of event.target.files) { const form = new FormData(); form.append('file',file); try { const response = await fetch(`${API}/sys-file/upload`,{method:'POST',body:form,credentials:'same-origin'}); const body = await response.json(); if (body.code !== 0) throw new Error(body.message); holder.insertAdjacentHTML('beforeend',`<span class="image-item" data-access="${body.data.accessName}"><img src="${API}/sys-file/preview/${body.data.accessName}"><button type="button">&times;</button></span>`); } catch(error) { notify(error.message); } } })); document.querySelectorAll('[data-base64]').forEach(input => input.addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { document.querySelector('[name="iconBase64"]').value = reader.result; input.closest('.file-picker').querySelector('[data-file-name]').textContent = file.name; const preview = input.closest('.file-picker').querySelector('img'); if (preview) preview.src = reader.result; }; reader.readAsDataURL(file); })); document.querySelector('[data-add-parameter]')?.addEventListener('click', () => document.querySelector('[data-parameters]').insertAdjacentHTML('beforeend',parameterRow())); document.querySelector('[data-parameters]')?.addEventListener('click', event => { if (event.target.matches('[data-remove-parameter]')) event.target.parentElement.remove(); }); document.querySelector('[data-image-list]')?.addEventListener('click', event => { if (event.target.tagName === 'BUTTON') event.target.parentElement.remove(); }); };
  const saveEditor = async (module,id) => { const form = document.querySelector('[data-editor]'); const fields = new FormData(form); const data = Object.fromEntries(fields.entries()); if (module === 'products') { data.detailImages = [...form.querySelectorAll('[data-image-list] [data-access]')].map(x=>x.dataset.access); data.parameters = [...form.querySelectorAll('.parameter-row')].map(row => ({label:row.children[0].value.trim(),value:row.children[1].value.trim()})).filter(x=>x.label && x.value); } if (module === 'news') data.tagIds = [...form.querySelector('[name="tagIds"]')?.selectedOptions || []].map(x=>x.value); if (module === 'tags' && !data.iconBase64) delete data.iconBase64; const path = module === 'categories' ? 'product-categories' : module === 'tags' ? 'news-tags' : endpoints[module]; try { await request(`${API}/${path}${id ? '/' + id : ''}`, {method:id?'PUT':'POST',body:JSON.stringify(data)}); closeModal(); const root = workspace.querySelector('.module-page'); if (module === 'categories' || module === 'tags') await initModule(module,root); else await renderModule(module,root); } catch(error) { notify(error.message); } };
  const initLogin = () => { const form = document.getElementById('login-form'); if (!form) return; form.addEventListener('submit', async event => { event.preventDefault(); const button = form.querySelector('button'); button.disabled = true; try { await request(`${API}/auth/login`,{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))}); location.href = '/admin/products'; } catch(error) { let tip = form.querySelector('.error-message'); if (!tip) { tip = document.createElement('div'); tip.className = 'error-message'; form.append(tip); } tip.textContent = error.message; } finally { button.disabled = false; } }); };
  initLogin(); initShell();
})();
