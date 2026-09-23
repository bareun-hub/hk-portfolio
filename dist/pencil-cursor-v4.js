(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dipPenSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 72 72">
      <defs>
        <linearGradient id="pen-handle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#171915"/>
          <stop offset=".48" stop-color="#4f3528"/>
          <stop offset=".72" stop-color="#251d18"/>
          <stop offset="1" stop-color="#0d0f0c"/>
        </linearGradient>
        <linearGradient id="nib-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff8cf"/>
          <stop offset=".34" stop-color="#c8a651"/>
          <stop offset=".62" stop-color="#f3dfa0"/>
          <stop offset="1" stop-color="#8d6e2f"/>
        </linearGradient>
      </defs>
      <g transform="rotate(135 36 36)" stroke="#151713" stroke-width="2" stroke-linejoin="round">
        <path d="M29 4h14c2 0 3 1.7 2.5 3.6L42 38H30L26.5 7.6C26 5.7 27 4 29 4Z" fill="url(#pen-handle)"/>
        <path d="M28.5 33h15l3 9H25.5l3-9Z" fill="#b78e3f"/>
        <path d="M25.5 42h21L42 52l-6 16-6-16-4.5-10Z" fill="url(#nib-metal)"/>
        <path d="M25.5 42 36 51l10.5-9M36 51v17" fill="none" stroke="#6e5424" stroke-width="1.7"/>
        <circle cx="36" cy="52" r="3.1" fill="#20211f" stroke="#f3dfa0" stroke-width="1.2"/>
        <path d="M31 9.5h2.7L31.5 29h-2.6Z" fill="#fff" stroke="none" opacity=".25"/>
        <path d="M34.2 66.2 36 69l1.8-2.8" fill="#171915" stroke="none"/>
      </g>
    </svg>
  `;

  const cursor = `url("data:image/svg+xml,${encodeURIComponent(dipPenSvg)}") 6 6, auto`;
  const style = document.createElement('style');
  style.textContent = `
    html,body,body *{cursor:${cursor}!important}
    .pencil-sparkle{
      position:fixed;
      z-index:2147483647;
      width:var(--sparkle-size);
      height:var(--sparkle-size);
      left:0;
      top:0;
      pointer-events:none;
      background:var(--sparkle-color);
      box-shadow:0 0 0 1px rgba(255,255,255,.4);
      transform:translate3d(var(--sparkle-x),var(--sparkle-y),0) rotate(var(--sparkle-rotation));
      animation:pencil-sparkle-fall var(--sparkle-duration) cubic-bezier(.2,.7,.3,1) forwards;
    }
    @keyframes pencil-sparkle-fall{
      0%{opacity:0;transform:translate3d(var(--sparkle-x),var(--sparkle-y),0) scale(.35) rotate(var(--sparkle-rotation))}
      18%{opacity:1;transform:translate3d(calc(var(--sparkle-x) + var(--sparkle-drift-x) * .18),calc(var(--sparkle-y) + var(--sparkle-drift-y) * .18),0) scale(1) rotate(calc(var(--sparkle-rotation) + 35deg))}
      100%{opacity:0;transform:translate3d(calc(var(--sparkle-x) + var(--sparkle-drift-x)),calc(var(--sparkle-y) + var(--sparkle-drift-y)),0) scale(.15) rotate(calc(var(--sparkle-rotation) + 120deg))}
    }
    @media(pointer:coarse){html,body,body *{cursor:auto!important}}
    @media(prefers-reduced-motion:reduce){.pencil-sparkle{display:none!important}}
  `;
  document.head.append(style);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sparkleColors = ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#bf5af2', '#ffffff'];
  let lastX = -100;
  let lastY = -100;
  let lastSpawn = 0;

  const makeSparkle = (x, y, index) => {
    const sparkle = document.createElement('i');
    const angle = Math.random() * Math.PI * 2;
    const distance = 9 + Math.random() * 18;
    const size = 3 + Math.floor(Math.random() * 4);
    const offsetX = -11 + Math.random() * 10;
    const offsetY = 7 + Math.random() * 10;

    sparkle.className = 'pencil-sparkle';
    sparkle.setAttribute('aria-hidden', 'true');
    sparkle.style.setProperty('--sparkle-x', `${x + offsetX}px`);
    sparkle.style.setProperty('--sparkle-y', `${y + offsetY}px`);
    sparkle.style.setProperty('--sparkle-drift-x', `${Math.cos(angle) * distance - 7}px`);
    sparkle.style.setProperty('--sparkle-drift-y', `${Math.sin(angle) * distance + 13}px`);
    sparkle.style.setProperty('--sparkle-size', `${size}px`);
    sparkle.style.setProperty('--sparkle-color', sparkleColors[(index + Math.floor(Math.random() * sparkleColors.length)) % sparkleColors.length]);
    sparkle.style.setProperty('--sparkle-rotation', `${Math.floor(Math.random() * 90)}deg`);
    sparkle.style.setProperty('--sparkle-duration', `${430 + Math.floor(Math.random() * 260)}ms`);
    document.body.append(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
  };

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

    const now = performance.now();
    const moved = Math.hypot(event.clientX - lastX, event.clientY - lastY);
    if (moved < 7 || now - lastSpawn < 18) return;

    const amount = moved > 34 ? 3 : 2;
    for (let index = 0; index < amount; index += 1) makeSparkle(event.clientX, event.clientY, index);

    lastX = event.clientX;
    lastY = event.clientY;
    lastSpawn = now;
  }, { passive: true });
})();
