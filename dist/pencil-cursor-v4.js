(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const pencilSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 72 72">
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
      <g transform="rotate(138 36 36)" stroke="#20211f" stroke-width="2" stroke-linejoin="round">
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

  const cursor = `url("data:image/svg+xml,${encodeURIComponent(pencilSvg)}") 6 5, auto`;
  const style = document.createElement('style');
  style.textContent = `
    html,body,body *{cursor:${cursor}!important}
    @media(pointer:coarse){html,body,body *{cursor:auto!important}}
  `;
  document.head.append(style);
})();