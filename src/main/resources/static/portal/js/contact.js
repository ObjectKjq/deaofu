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

  /* ============================================================
   * 咨询表单：本地校验 + JSON 提交 POST /api/consultations
   * ============================================================ */
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const status = form.querySelector('#formStatus');
  const submitBtn = form.querySelector('.btn-submit');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fields = {
    topics: () => Array.from(form.querySelectorAll('input[name="topic"]:checked')).map((el) => el.value),
    message: form.querySelector('#msg'),
    name: form.querySelector('#name'),
    phone: form.querySelector('#phone'),
    email: form.querySelector('#email')
  };

  function setError(input, hasError) {
    const wrap = input ? input.closest('div') : null;
    if (wrap) wrap.classList.toggle('has-error', hasError);
  }

  function validate() {
    let ok = true;
    const topics = fields.topics();
    const topicGroup = form.querySelector('#topicGroup');
    if (topicGroup) topicGroup.classList.toggle('has-error', !topics.length);
    if (!topics.length) ok = false;

    const messageOk = !!(fields.message && fields.message.value.trim());
    setError(fields.message, !messageOk);
    if (!messageOk) ok = false;

    const nameOk = !!(fields.name && fields.name.value.trim());
    setError(fields.name, !nameOk);
    if (!nameOk) ok = false;

    const emailOk = !!(fields.email && emailPattern.test(fields.email.value.trim()));
    setError(fields.email, !emailOk);
    if (!emailOk) ok = false;

    return ok;
  }

  function showStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('is-success', 'is-error');
    if (type) status.classList.add(type);
  }

  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => {
      const wrap = el.closest('.has-error');
      if (wrap) wrap.classList.remove('has-error');
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) {
      showStatus('请完善表单中标红的必填项', 'is-error');
      return;
    }

    const phoneValue = fields.phone && fields.phone.value.trim();
    const payload = {
      subjects: fields.topics(),
      content: fields.message.value.trim(),
      contactName: fields.name.value.trim(),
      phone: phoneValue ? (phoneValue.startsWith('+') ? phoneValue : '+86 ' + phoneValue) : null,
      email: fields.email.value.trim()
    };

    if (submitBtn) submitBtn.disabled = true;
    showStatus('正在提交…');
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok && result.code === 0) {
        showStatus('提交成功，我们的顾问将尽快与您联系。', 'is-success');
        form.reset();
      } else {
        showStatus((result && result.message) || '提交失败，请稍后重试。', 'is-error');
      }
    } catch (error) {
      showStatus('网络异常，请稍后重试。', 'is-error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
