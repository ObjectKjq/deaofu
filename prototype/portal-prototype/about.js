(() => {
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.progress');
  const menu = document.querySelector('#menuToggle');
  const mobile = document.querySelector('#mobileNav');
  const update = () => {
    if (header) header.classList.toggle('scrolled', scrollY > 20);
    if (progress) { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleX(${max ? scrollY / max : 0})`; }
  };
  addEventListener('scroll', update, { passive: true }); update();
  if (menu && mobile) { menu.addEventListener('click', () => mobile.classList.toggle('open')); mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('open'))); }
  const lang = document.querySelector('#langToggle'); if (lang) lang.addEventListener('click', e => e.preventDefault());
})();
