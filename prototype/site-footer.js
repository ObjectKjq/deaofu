(function () {
  const fallback = document.querySelector('[data-site-footer]') || document.querySelector('footer.footer');
  if (!fallback) return;

  fetch('footer.html')
    .then((response) => {
      if (!response.ok) throw new Error(`Footer request failed: ${response.status}`);
      return response.text();
    })
    .then((markup) => {
      const template = document.createElement('template');
      template.innerHTML = markup.trim();
      const footer = template.content.firstElementChild;
      if (footer) fallback.replaceWith(footer);
    })
    .catch(() => {
      // Keep the page's inline footer as a no-network fallback.
    });
})();
