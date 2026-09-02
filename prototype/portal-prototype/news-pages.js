(function () {
  const articles = [
    {
      id: 'uk-laminated-windshield', category: 'case', categoryLabel: '客户案例', date: '2026.05.18',
      title: '向英国公交制造商供应夹层挡风玻璃',
      excerpt: '为新电动公交车队提供符合 ECE R43 标准的定制层压挡风玻璃，满足精准安装与准时交付需求。',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1400&q=85',
      location: '英国 · 电动公交车队',
      body: [
        '一家英国公交制造商正在为新一代电动公交车队寻找可靠的层压挡风玻璃供应商。项目需要兼顾大尺寸曲面、光学清晰度和欧洲法规要求，同时必须匹配整车厂既定的装配节拍。',
        'DEAOFU 汽车玻璃团队根据客户提供的车型图纸完成了曲面校核、边界丝印和安装区域确认，并以 ECE R43 认证标准组织样件验证。经过多轮装配测试，样件在视野范围、边缘配合和密封结构上均达到项目要求。',
        '随后，我们按照批量交付计划完成包装和运输，让客户能够按期将玻璃集成到电动公交车中。客户反馈：“DEAOFU Auto Glass 提供了卓越的品质和服务，他们对细节的关注令人印象深刻。”'
      ],
      points: ['定制层压结构与复杂曲面成型', '符合 ECE R43 的测试与文件支持', '样件确认、批量生产及全球交付一体化']
    },
    {
      id: 'factory-upgrade', category: 'factory', categoryLabel: '工厂动态', date: '2026.04.22',
      title: '德奥福持续升级公交玻璃生产设备',
      excerpt: '引进自动切割与热弯设备，进一步提升复杂弧形玻璃的生产效率与批次一致性。',
      image: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1400&q=85',
      location: '河南 · 周口工厂',
      body: [
        '面对新能源公交和大型客车对复杂曲面玻璃日益增长的需求，德奥福在生产基地完成了新一轮设备升级。新设备覆盖自动切割、精密印刷和热弯成型等关键工序。',
        '设备升级后，工程团队可以更快地从车型数据进入样件阶段，并通过稳定的参数控制减少人工调整带来的偏差。我们同时完善了批次留样和过程检验记录，让每一批产品都能被追溯。',
        '这次升级将支持更多小批量、多品种的 OEM 项目，也为后续的全球交付提供更充足的产能保障。'
      ],
      points: ['自动切割与热弯参数协同', '复杂弧形玻璃的批次一致性提升', '过程检验、留样与追溯记录完善']
    },
    {
      id: 'panoramic-windshield', category: 'product', categoryLabel: '产品资讯', date: '2026.03.14',
      title: '面向全球市场推出新款全景公交前挡',
      excerpt: '更开阔的视野与更高的安全性能，为新能源公交和高端客车提供新的玻璃方案。',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85',
      location: '产品开发 · 新能源公交',
      body: [
        '随着新能源公交车身结构不断变化，前挡风玻璃需要在更大视野、结构安全和热舒适性之间取得平衡。德奥福推出的新款全景公交前挡，针对这些需求重新优化了光学区域和曲面过渡。',
        '产品采用夹层安全玻璃结构，可根据项目需要匹配隔热膜、低辐射方案及 HUD 预留区域。工程团队从样件阶段开始参与车型适配，帮助客户更快完成安装验证。',
        '该方案适用于城市公交、机场摆渡车和高端客车等多种应用，支持从项目开发到批量供货的完整服务。'
      ],
      points: ['大尺寸曲面与低畸变视野', '隔热、低辐射及 HUD 区域可选', '支持新能源车型的项目开发']
    },
    {
      id: 'ece-r43-quality', category: 'industry', categoryLabel: '行业观察', date: '2026.02.26',
      title: '商用车玻璃的合规要求正在走向更细分的工程协同',
      excerpt: '从认证文件到装配数据，玻璃供应商需要更早参与整车项目，帮助客户降低开发与交付风险。',
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=85',
      location: '行业观察 · 全球市场',
      body: [
        '商用车玻璃已经从单一的替换部件，逐步成为整车安全、视野和热管理系统中的重要组成部分。不同市场对认证、光学性能及安装结构的要求越来越细，供应商的工程响应速度直接影响项目进度。',
        '对于公交制造商和零部件分销商而言，尽早确认车型数据、边界尺寸与法规文件，可以减少样件返工和批量交付中的不确定性。供应链透明度同样重要，批次记录和包装方案需要覆盖整个运输过程。',
        '德奥福将继续把制造、质量与项目沟通前置，为客户提供更完整的玻璃解决方案。'
      ],
      points: ['认证与车型数据同步确认', '光学、结构和热管理协同设计', '从样件到交付的过程透明度']
    },
    {
      id: 'south-america-delivery', category: 'case', categoryLabel: '客户案例', date: '2026.01.19',
      title: '稳定包装支持南美公交玻璃批量交付',
      excerpt: '针对长距离海运和多次转运场景，优化木箱结构与边角防护，帮助客户减少到货损耗。',
      image: 'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=1400&q=85',
      location: '南美 · 公交维修网络',
      body: [
        '南美客户需要一批适配不同城市公交车型的前挡和侧窗玻璃，运输路线长且包含多次转运。项目重点不仅是玻璃本身的适配，也包括包装稳定性和到货后的分拣效率。',
        '德奥福根据玻璃尺寸和曲率分区设计木箱，增加边角缓冲与清晰的箱内标识，并在出货前进行装箱检查。客户收到货物后，可以按照车型和位置快速完成库存归类。',
        '这次交付进一步验证了标准化包装与项目沟通结合的价值，也为后续的售后替换件供应建立了更稳定的节奏。'
      ],
      points: ['按尺寸与曲率定制木箱分区', '边角缓冲和箱内标识优化', '适配维修网络的库存分拣方式']
    },
    {
      id: 'lighting-parts-line', category: 'product', categoryLabel: '产品资讯', date: '2025.12.08',
      title: '商用车照明灯具配件扩充车型匹配范围',
      excerpt: '新增常用 LED 信号灯和尾灯配套规格，为公交车队维护提供更灵活的替换选择。',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85',
      location: '配件中心 · 商用车照明',
      body: [
        '除汽车玻璃外，德奥福也持续完善商用车配件供应。近期新增的照明灯具配件覆盖常用 LED 信号灯、尾灯和安装组件，帮助车队在维护阶段快速找到匹配方案。',
        '我们根据电压、接口、安装位和外形尺寸整理车型信息，并为常用规格建立稳定的供货清单。客户可以通过车型或样件进行核对，减少选型过程中的沟通成本。',
        '后续我们将继续扩充制动与发动机系统配件，为商用车客户提供更完整的售后支持。'
      ],
      points: ['常用 LED 信号灯与尾灯规格', '按接口和安装位进行车型匹配', '玻璃与汽车配件的组合供货']
    }
  ];

  const categoryLabels = { all: '全部动态', case: '客户案例', factory: '工厂动态', product: '产品资讯', industry: '行业观察' };

  function setupHeader() {
    const toggle = document.querySelector('#menuToggle');
    const mobile = document.querySelector('#mobileNav');
    if (toggle && mobile) toggle.addEventListener('click', () => mobile.classList.toggle('open'));
    document.querySelectorAll('.mobile-nav a').forEach((link) => link.addEventListener('click', () => mobile && mobile.classList.remove('open')));
    const language = document.querySelector('#langToggle');
    if (language) language.addEventListener('click', (event) => { event.preventDefault(); language.textContent = language.textContent.startsWith('中') ? 'EN / 中' : '中 / EN'; });
  }

  function cardTemplate(article) {
    return `<a class="news-center-card" href="news-detail.html?id=${article.id}">
      <div class="news-center-media"><img src="${article.image}" alt="${article.title}" loading="lazy"><span class="news-center-category">${article.categoryLabel}</span></div>
      <div class="news-center-body"><div class="news-center-meta"><span>${article.categoryLabel}</span><time datetime="${article.date.replaceAll('.', '-')}">${article.date}</time></div><h3>${article.title}</h3><p>${article.excerpt}</p><span class="news-center-link">阅读详情 <span>↗</span></span></div>
    </a>`;
  }

  function initCatalog() {
    const root = document.querySelector('[data-news-catalog]');
    if (!root) return;
    const grid = root.querySelector('#newsGrid');
    const empty = root.querySelector('#newsEmpty');
    const search = root.querySelector('#newsSearch');
    const searchForm = root.querySelector('#newsSearchForm');
    const clear = root.querySelector('#newsSearchClear');
    const title = root.querySelector('#newsResultTitle');
    let category = 'all';

    function render() {
      const term = search ? search.value.trim().toLowerCase() : '';
      const matches = articles.filter((article) => {
        const text = `${article.title} ${article.excerpt} ${article.categoryLabel} ${article.location} ${article.body.join(' ')}`.toLowerCase();
        return (category === 'all' || article.category === category) && (!term || text.includes(term));
      });
      grid.innerHTML = matches.map(cardTemplate).join('');
      grid.hidden = !matches.length;
      empty.hidden = !!matches.length;
      title.textContent = term ? '搜索结果' : categoryLabels[category];
      if (clear) clear.hidden = !term;
    }

    root.querySelectorAll('[data-news-category]').forEach((button) => button.addEventListener('click', () => {
      category = button.dataset.newsCategory;
      root.querySelectorAll('[data-news-category]').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
      render();
    }));
    if (search) search.addEventListener('input', render);
    if (searchForm) searchForm.addEventListener('submit', (event) => { event.preventDefault(); render(); });
    if (clear) clear.addEventListener('click', () => { search.value = ''; search.focus(); render(); });
    render();
  }

  function detailTemplate(article) {
    document.title = `${article.title} | DEAOFU 德奥福`;
    const related = articles.filter((item) => item.id !== article.id).slice(0, 3);
    const content = article.body.map((paragraph) => `<p>${paragraph}</p>`).join('');
    document.querySelector('#newsDetailContent').innerHTML = `<div class="news-detail-wrap"><div class="news-detail-breadcrumb"><a href="index.html">首页</a><span>/</span><a href="news-center.html">公司动态</a><span>/</span>${article.categoryLabel}</div>
      <header class="news-article-head"><div class="news-article-meta"><span>${article.categoryLabel}</span><time datetime="${article.date.replaceAll('.', '-')}">${article.date}</time></div><h1>${article.title}</h1><p class="news-article-lede">${article.excerpt}</p></header>
      <img class="news-article-hero" src="${article.image}" alt="${article.title}">
      <div class="news-article-layout"><article class="news-article-content">${content}<h2>这次项目带来的三个确认</h2><ul>${article.points.map((point) => '<li>' + point + '</li>').join('')}</ul><p>如果您正在寻找适配车型的玻璃或商用车配件方案，欢迎把车型、尺寸或样件信息发送给我们，我们会根据实际应用给出清晰的产品建议。</p><a class="news-back-link" href="news-center.html">← 返回公司动态</a></article><aside class="news-article-aside"><b>ARTICLE INFO</b><dl><dt>文章分类</dt><dd>${article.categoryLabel}</dd><dt>发布日期</dt><dd>${article.date}</dd><dt>项目地区</dt><dd>${article.location}</dd><dt>咨询邮箱</dt><dd><a href="mailto:dafbusglass@163.com">dafbusglass@163.com</a></dd></dl></aside></div>
      <section class="news-related"><div class="news-related-head"><h2>继续阅读</h2><a class="text-link" href="news-center.html">查看全部动态 <span>→</span></a></div><div class="news-related-grid">${related.map((item) => '<a class="news-related-card" href="news-detail.html?id=' + item.id + '"><img src="' + item.image + '" alt="' + item.title + '" loading="lazy"><div><small>' + item.categoryLabel + ' · ' + item.date + '</small><h3>' + item.title + '</h3></div></a>').join('')}</div></section></div>`;
  }

  function initDetail() {
    const target = document.querySelector('[data-news-detail]');
    if (!target) return;
    const id = new URLSearchParams(location.search).get('id');
    const article = articles.find((item) => item.id === id) || articles[0];
    detailTemplate(article);
  }

  setupHeader();
  initCatalog();
  initDetail();
  window.DEAOFU_NEWS = articles;
})();
