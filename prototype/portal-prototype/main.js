(() => {
    const enhancementStyles = document.createElement('link');
    enhancementStyles.rel = 'stylesheet';
    enhancementStyles.href = 'overrides.css';
    document.head.append(enhancementStyles);

    const header = document.querySelector('.site-header');
    const progress = document.querySelector('.progress');
    const menu = document.querySelector('#menuToggle');
    const mobile = document.querySelector('#mobileNav');

    function scrollState() {
        const max = document.documentElement.scrollHeight - innerHeight;
        header.classList.toggle('scrolled', scrollY > 40);
        progress.style.transform = `scaleX(${max ? scrollY / max : 0})`;

        let anyActive = false;
        document.querySelectorAll('.desktop-nav a').forEach((link) => {
            const section = document.querySelector(link.getAttribute('href'));
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

    menu.addEventListener('click', () => mobile.classList.toggle('open'));
    mobile.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => mobile.classList.remove('open'));
    });

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
            countryGroup.setAttribute('data-name', COUNTRY_NAMES[code] || code.toUpperCase());

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

    const language = document.querySelector('#langToggle');
    language.addEventListener('click', (event) => {
        event.preventDefault();
        language.textContent = language.textContent.startsWith('中') ? 'EN / 中' : '中 / EN';
    });

    /* ============================================================
     * GSAP 滚动叙事：通用 reveal 入场动画
     * ============================================================ */
    function initRevealAnimations() {
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

    /* ============================================================
     * 数字计数：GSAP 增强版（更平滑 + 易维护）
     * ============================================================ */
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        if (window.gsap) {
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
