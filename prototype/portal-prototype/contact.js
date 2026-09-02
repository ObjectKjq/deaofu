(() => {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('#menuToggle');
  const mobile = document.querySelector('#mobileNav');
  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }
  if (menu && mobile) {
    menu.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    mobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobile.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
      });
    });
  }
  const lang = document.querySelector('#langToggle');
  if (lang) lang.addEventListener('click', (event) => event.preventDefault());
})();
