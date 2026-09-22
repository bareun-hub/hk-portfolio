(() => {
  if (!window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pencil = document.createElement('div');
  pencil.className = 'rainbow-pencil';
  pencil.setAttribute('aria-hidden', 'true');
  pencil.innerHTML = `
    <svg viewBox="0 0 64 64" role="presentation">
      <defs>
        <linearGradient id="pencil-rainbow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ff3b30"/>
          <stop offset=".2" stop-color="#ff9500"/>
          <stop offset=".4" stop-color="#ffd60a"/>
          <stop offset=".6" stop-color="#34c759"/>
          <stop offset=".8" stop-color="#0a84ff"/>
          <stop offset="1" stop-color="#bf5af2"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-42 32 32)">
        <path d="M27 8h10a4 4 0 0 1 4 4v34H23V12a4 4 0 0 1 4-4Z" fill="url(#pencil-rainbow)"/>
        <path d="M23 46h18l-9 14-9-14Z" fill="#efd5ae"/>
        <path d="m29 55 3 5 3-5Z" fill="#20211f"/>
        <path d="M23 42h18v4H23z" fill="#f7f7f2" opacity=".9"/>
        <path d="M27 8h10a4 4 0 0 1 4 4v3H23v-3a4 4 0 0 1 4-4Z" fill="#ff6b8a"/>
        <path d="M28 18v21" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      </g>
    </svg>
  `;
  document.body.append(pencil);

  const style = document.createElement('style');
  style.textContent = `
    .rainbow-pencil{position:fixed;left:0;top:0;width:46px;height:46px;z-index:9999;pointer-events:none;opacity:0;filter:drop-shadow(0 4px 5px #0003);will-change:transform;transition:opacity .18s ease}
    .rainbow-pencil.is-visible{opacity:1}
    .rainbow-pencil.is-hovering svg{transform:scale(1.18) rotate(7deg)}
    .rainbow-pencil svg{display:block;width:100%;height:100%;transition:transform .18s ease}
    @media(pointer:coarse),(prefers-reduced-motion:reduce){.rainbow-pencil{display:none!important}}
  `;
  document.head.append(style);

  let targetX = -80;
  let targetY = -80;
  let currentX = -80;
  let currentY = -80;
  let frame;

  function animate() {
    currentX += (targetX - currentX) * 0.24;
    currentY += (targetY - currentY) * 0.24;
    pencil.style.transform = `translate3d(${currentX + 8}px,${currentY + 8}px,0)`;
    frame = requestAnimationFrame(animate);
  }

  document.addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    targetX = event.clientX;
    targetY = event.clientY;
    pencil.classList.add('is-visible');
    const interactive = event.target.closest('a,button,input,textarea,select,[role="button"]');
    pencil.classList.toggle('is-hovering', Boolean(interactive));
    if (!frame) animate();
  }, { passive: true });

  document.addEventListener('pointerleave', () => pencil.classList.remove('is-visible'));
  document.addEventListener('pointerenter', () => pencil.classList.add('is-visible'));
  window.addEventListener('pagehide', () => {
    if (frame) cancelAnimationFrame(frame);
  }, { once: true });
})();