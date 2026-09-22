(() => {
  if (!window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pencil = document.createElement('div');
  pencil.className = 'rainbow-pencil';
  pencil.setAttribute('aria-hidden', 'true');
  pencil.innerHTML = `
    <svg viewBox="0 0 72 72" role="presentation">
      <defs>
        <linearGradient id="rainbow-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ff3b30"/>
          <stop offset=".2" stop-color="#ff9500"/>
          <stop offset=".4" stop-color="#ffd60a"/>
          <stop offset=".6" stop-color="#34c759"/>
          <stop offset=".8" stop-color="#0a84ff"/>
          <stop offset="1" stop-color="#bf5af2"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-42 36 36)" stroke="#20211f" stroke-width="2" stroke-linejoin="round">
        <path d="M29 9h14a4 4 0 0 1 4 4v39H25V13a4 4 0 0 1 4-4Z" fill="#ffd447"/>
        <path d="M25 18h22v7H25z" fill="url(#rainbow-stripe)" stroke="none"/>
        <path d="M25 45h22v7H25z" fill="#f4f0df"/>
        <path d="M25 52h22L36 68 25 52Z" fill="#e8c79d"/>
        <path d="m32.5 63 3.5 5 3.5-5Z" fill="#20211f" stroke="none"/>
        <path d="M29 9h14a4 4 0 0 1 4 4v5H25v-5a4 4 0 0 1 4-4Z" fill="#ff7c9c"/>
        <path d="M31 27v15" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".72"/>
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