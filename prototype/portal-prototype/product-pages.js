(function () {
  const products = [
    {
      id: 'front-windshield', category: 'bus-glass', subcategory: 'front', code: 'BG / 01',
      name: '公交前挡风玻璃', en: 'Laminated Front Windshield',
      summary: '为公交车、长途客车与新能源巴士提供清晰、坚固的层压前挡风玻璃。',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85',
      spec: '夹层玻璃 · OEM 定制',
      badges: ['ECE R43', 'DOT', 'OEM 可定制'],
      description: '采用高强度玻璃与 PVB 薄膜复合工艺，兼顾清晰视野、抗冲击能力与长期耐候性。支持不同车型的曲面、孔位及传感器区域定制。',
      specs: [['产品类别', '公交车 / 长途客车'], ['玻璃结构', '夹层安全玻璃'], ['厚度范围', '4.76 - 12 mm'], ['认证标准', 'ECE R43 · DOT · CCC'], ['服务方式', 'OEM / 售后替换']],
      features: [['清晰视野', '低畸变光学设计，减少驾驶员长途行驶的视觉疲劳。'], ['安全防护', '夹层结构在受冲击后保持整体性，降低碎片飞溅风险。'], ['精准适配', '依据原厂图纸或样件开发，支持小批量打样。']]
    },
    {
      id: 'rear-windshield', category: 'bus-glass', subcategory: 'rear', code: 'BG / 02',
      name: '公交后挡风玻璃', en: 'Rear Windshield',
      summary: '稳定可靠的后挡总成，支持加热、电连接和不同安装结构。',
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=85', spec: '夹层 / 钢化 · 结构定制', badges: ['ECE R43', '加热选配'],
      description: '针对城市公交、旅游客车和校车后部结构开发，提供不同曲率、丝印边界及加热线路方案，满足整车厂装配节拍。', specs: [['产品类别', '公交车 / 客车'], ['玻璃结构', '夹层或钢化'], ['功能选项', '除霜加热 · 丝印'], ['认证标准', 'ECE R43 · CCC'], ['服务方式', 'OEM / 替换件']], features: [['结构匹配', '按车身开口与密封条尺寸匹配，降低安装调整成本。'], ['功能集成', '可集成加热丝、接插件和黑边丝印方案。'], ['交付稳定', '批次留样与包装防护，适合全球运输。']]
    },
    {
      id: 'side-window', category: 'bus-glass', subcategory: 'side', code: 'BG / 03',
      name: '公交侧窗玻璃', en: 'Curved Side Window',
      summary: '精准弯曲成型，适配多种车身结构与开启方式。',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85', spec: '弯曲钢化 · 多种开启方式', badges: ['曲面成型', '低铁可选'],
      description: '覆盖固定侧窗、推拉窗和应急窗等常见方案，边缘加工细致，满足公交与长途客车的通风、采光及安全需求。', specs: [['产品类别', '公交车 / 客车'], ['玻璃结构', '弯曲钢化玻璃'], ['可选功能', '低铁 · 太阳能控制'], ['认证标准', 'ECE R43 · CCC'], ['服务方式', 'OEM / 替换件']], features: [['曲面一致', '热弯模具稳定，保障左右件和批次间曲率一致。'], ['边缘安全', '精磨倒角与边缘检验，适配密封条和粘接安装。'], ['灵活定制', '可按车型提供孔位、缺口和丝印调整。']]
    },
    {
      id: 'panoramic-glass', category: 'bus-glass', subcategory: 'panoramic', code: 'BG / 04',
      name: '全景公交玻璃', en: 'Panoramic Bus Glass',
      summary: '更开阔的视野与更高的安全性能，为新能源公交提供新选择。',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=85', spec: '超大曲面 · 新能源车型', badges: ['新能源车型', '大尺寸成型'],
      description: '面向新能源公交和高端客车开发的大尺寸全景玻璃，强调光学清晰度、热舒适性和复杂曲面成型能力。', specs: [['产品类别', '新能源公交 / 客车'], ['玻璃结构', '夹层安全玻璃'], ['功能选项', '隔热 · HUD 区域'], ['认证标准', 'ECE R43 · DOT'], ['服务方式', '项目开发']], features: [['宽阔视野', '优化透光区域，为乘客与驾驶员提供更好的视野体验。'], ['热舒适性', '可选隔热膜与低辐射方案，减少车厢热负荷。'], ['项目协同', '从样件验证到批量交付提供工程支持。']]
    },
    {
      id: 'vehicle-lights', category: 'auto-parts', subcategory: 'lighting', code: 'AP / 01',
      name: '车辆照明灯具', en: 'Vehicle Lighting Systems',
      summary: '可靠耐用的车辆照明系统配件，覆盖信号、前照和尾灯应用。',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85', spec: 'LED · 信号与照明', badges: ['LED', '商用车配套'],
      description: '为商用车和特种车辆提供照明灯具配件，支持不同电压、接口和安装结构，帮助车队降低维护频率。', specs: [['产品类别', '车辆照明灯具'], ['应用范围', '前照灯 · 尾灯 · 信号灯'], ['光源方案', 'LED / 卤素'], ['配套方式', '车型匹配 / 批量供货'], ['服务方式', '询样开发']], features: [['稳定耐用', '严选材料与密封结构，适应雨水、灰尘和长期振动。'], ['能效友好', 'LED 方案降低能耗并延长维护周期。'], ['快速匹配', '根据车型、接口和安装位提供替换建议。']]
    },
    {
      id: 'brake-components', category: 'auto-parts', subcategory: 'braking', code: 'AP / 02',
      name: '制动与缓速系统配件', en: 'Brake & Retarder Components',
      summary: '覆盖制动、缓速与气路系统的专业配件，保障车辆稳定运行。',
      image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=85', spec: '制动 · 缓速系统', badges: ['商用车', '可靠耐久'],
      description: '围绕公交与商用车制动系统提供常用配件，关注制动力传递、耐磨寿命和安装兼容性。', specs: [['产品类别', '制动与缓速系统'], ['应用范围', '公交车 · 卡车 · 客车'], ['供货方式', '标准件 / 车型匹配'], ['质量管理', '来料与出厂检验'], ['服务方式', '询样开发']], features: [['安全优先', '关键尺寸与材料批次可追溯，满足稳定制动需求。'], ['耐久表现', '针对高频启停和重载工况优化材料选择。'], ['库存支持', '常用规格备有稳定供应，减少车队停运时间。']]
    },
    {
      id: 'engine-components', category: 'auto-parts', subcategory: 'engine', code: 'AP / 03',
      name: '发动机及动力系统配件', en: 'Engine & Powertrain Parts',
      summary: '面向商用车动力系统的常用配件与维护解决方案。',
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=85', spec: '发动机 · 动力系统', badges: ['商用车', '维护配套'],
      description: '提供发动机及动力系统常用维护配件，重视尺寸精度、材料可靠性和长期供货能力。', specs: [['产品类别', '发动机及动力系统'], ['应用范围', '公交车 · 客车 · 工程车'], ['供货方式', '标准件 / 定制件'], ['质量管理', '批次检验与追溯'], ['服务方式', '询样开发']], features: [['尺寸稳定', '关键部件进行尺寸和装配检验，降低返工概率。'], ['供应可靠', '围绕常用车型建立持续供货清单。'], ['技术响应', '提供型号核对与替代件建议，缩短选型时间。']]
    },
    {
      id: 'emergency-window', category: 'bus-glass', subcategory: 'side', code: 'BG / 05',
      name: '公交应急窗玻璃', en: 'Emergency Exit Glass',
      summary: '适配应急出口与安全锤方案，满足公交车快速逃生需求。',
      image: 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1200&q=85', spec: '应急出口 · 钢化玻璃', badges: ['安全出口', '车型匹配'],
      description: '面向公交车和客车应急出口设计，支持不同开合结构、标识丝印及安全锤配套。', specs: [['产品类别', '公交车 / 客车'], ['玻璃结构', '钢化安全玻璃'], ['配置选项', '丝印 · 安全锤'], ['认证标准', 'ECE R43 · CCC'], ['服务方式', 'OEM / 替换件']], features: [['快速识别', '清晰耐久的应急标识，便于乘客在紧急情况下找到出口。'], ['开合顺畅', '边缘与孔位按机构配合，降低装配阻力。'], ['批量稳定', '尺寸、标识和包装均按批次标准执行。']]
    }
  ];

  const categoryLabels = { all: '全部产品', 'bus-glass': '公交车玻璃', 'auto-parts': '其它汽车配件' };
  const subcategoryLabels = { all: '全部', front: '前挡风玻璃', rear: '后挡风玻璃', side: '侧窗玻璃 / 应急窗', panoramic: '全景玻璃', lighting: '照明灯具类', braking: '制动系统配件', engine: '发动机系统配件' };

  function setupHeader() {
    const toggle = document.querySelector('#menuToggle');
    const mobile = document.querySelector('#mobileNav');
    if (toggle && mobile) toggle.addEventListener('click', () => mobile.classList.toggle('open'));
    document.querySelectorAll('.mobile-nav a').forEach((link) => link.addEventListener('click', () => mobile && mobile.classList.remove('open')));
    const language = document.querySelector('#langToggle');
    if (language) language.addEventListener('click', (event) => { event.preventDefault(); language.textContent = language.textContent.startsWith('中') ? 'EN / 中' : '中 / EN'; });
    const path = location.pathname.split('/').pop();
    document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if ((path === 'product-center.html' || path === 'product-detail.html') && href.includes('product-center')) link.classList.add('active');
    });
  }

  function cardTemplate(product) {
    return `<a class="catalog-card" href="product-detail.html?id=${product.id}">
      <div class="catalog-card-media"><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="catalog-card-tag">${categoryLabels[product.category]}</span></div>
      <div class="catalog-card-body"><span class="catalog-card-code">${product.code} / ${product.en}</span><h3>${product.name}</h3><p>${product.summary}</p><div class="catalog-card-footer"><span class="catalog-card-spec">${product.spec}</span><span class="catalog-card-link">查看详情 <span>↗</span></span></div></div>
    </a>`;
  }

  function initCatalog() {
    const root = document.querySelector('[data-product-catalog]');
    if (!root) return;
    const grid = root.querySelector('#productGrid');
    const search = root.querySelector('#productSearch');
    const searchForm = root.querySelector('#productSearchForm');
    const resultTitle = root.querySelector('#resultTitle');
    let category = 'all'; let subcategory = 'all';

    function render() {
      const term = (search.value || '').trim().toLowerCase();
      const matches = products.filter((product) => {
        const text = `${product.name} ${product.en} ${product.summary} ${product.spec}`.toLowerCase();
        return (category === 'all' || product.category === category) && (subcategory === 'all' || product.subcategory === subcategory) && (!term || text.includes(term));
      });
      grid.innerHTML = matches.length ? matches.map(cardTemplate).join('') : '<div class="catalog-empty"><strong>没有找到匹配的产品</strong>请尝试更换关键词或筛选条件。</div>';
      resultTitle.textContent = term ? `搜索结果` : categoryLabels[category];
    }
    function setCategory(nextCategory) {
      category = nextCategory;
      subcategory = 'all';
      root.querySelectorAll('[data-category], [data-subcategory]').forEach((item) => item.classList.remove('is-active'));
      root.querySelectorAll('[data-submenu]').forEach((menu) => {
        menu.hidden = menu.dataset.submenu !== category;
      });
      const selected = root.querySelector(`[data-category="${category}"]`);
      if (selected) selected.classList.add('is-active');
      render();
    }

    root.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.category)));
    root.querySelectorAll('[data-subcategory]').forEach((button) => button.addEventListener('click', () => {
      subcategory = button.dataset.subcategory; category = button.dataset.parent || category;
      root.querySelectorAll('[data-category], [data-subcategory]').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      const parent = root.querySelector(`[data-category="${category}"]`); if (parent) parent.classList.add('is-active');
      render();
    }));
    search.addEventListener('input', render);
    if (searchForm) searchForm.addEventListener('submit', (event) => { event.preventDefault(); render(); });
    root.querySelectorAll('[data-submenu]').forEach((menu) => { menu.hidden = true; });
    render();
  }

  function detailTemplate(product) {
    const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);
    document.title = `${product.name} | DEAOFU 德奥福`;
    document.querySelector('#detailContent').innerHTML = `<div class="container"><div class="detail-breadcrumb"><a href="index.html">首页</a><span>/</span><a href="product-center.html">产品中心</a><span>/</span>${product.name}</div></div>
      <section class="detail-hero"><div class="container detail-hero-grid"><div class="detail-media"><img src="${product.image}" alt="${product.name}"></div><div class="detail-copy"><p class="detail-overline">${product.code} / ${product.en}</p><h1>${product.name}</h1><p class="lede">${product.description}</p><div class="detail-badges">${product.badges.map((badge) => `<span class="detail-badge">${badge}</span>`).join('')}</div><div class="detail-actions"><a class="button button-primary" href="mailto:dafbusglass@163.com?subject=${encodeURIComponent(`产品询价：${product.name}`)}">获取产品报价 <span>↗</span></a><a class="button detail-outline" href="product-center.html">返回产品中心</a></div><dl class="detail-specs">${product.specs.map(([label, value]) => `<div class="detail-spec-row"><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></div></div></section>
      <section class="detail-section"><div class="container"><div class="detail-section-head"><h2>为每一次交付，<br><em>准备可靠答案。</em></h2><p>从工程确认到批量供货，我们以透明的技术沟通和稳定的质量标准支持全球客户。</p></div><div class="detail-features">${product.features.map(([title, text], index) => `<div class="detail-feature"><strong>0${index + 1} / ${title}</strong><p>${text}</p></div>`).join('')}</div></div></section>
      <section class="detail-section"><div class="container"><div class="detail-section-head"><h2>相关产品</h2><a class="text-link" href="product-center.html">浏览全部产品 <span>→</span></a></div><div class="related-grid">${related.map((item) => `<a class="related-card" href="product-detail.html?id=${item.id}"><img src="${item.image}" alt="${item.name}" loading="lazy"><div><small>${item.code}</small><h3>${item.name}</h3></div></a>`).join('')}</div></div></section>`;
  }

  function initDetail() {
    const target = document.querySelector('#detailContent');
    if (!target) return;
    const product = products.find((item) => item.id === new URLSearchParams(location.search).get('id')) || products[0];
    detailTemplate(product);
  }

  setupHeader();
  initCatalog();
  initDetail();
  window.DEAOFU_PRODUCTS = products;
})();
