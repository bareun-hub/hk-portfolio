(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const pencilSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="body" x1="6" y1="7" x2="26" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ff6b8a"/>
          <stop offset=".24" stop-color="#ffb84d"/>
          <stop offset=".48" stop-color="#ffe66d"/>
          <stop offset=".7" stop-color="#55d6be"/>
          <stop offset="1" stop-color="#7b8cff"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx=".8" dy="1.1" stdDeviation=".7" flood-color="#17202a" flood-opacity=".35"/>
        </filter>
      </defs>
      <g filter="url(#shadow)" stroke="#252525" stroke-linejoin="round">
        <path d="M2.2 2.2 10.7 5 5 10.8Z" fill="#f2d3a7" stroke-width="1.15"/>
        <path d="m2.2 2.2 4 1.3-2.7 2.8Z" fill="#252525" stroke="none"/>
        <path d="m8.1 5.9 17.7 17.7-5.2 5.2L3 11.1Z" fill="url(#body)" stroke-width="1.2"/>
        <path d="m9.4 8 14.3 14.3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".65"/>
        <path d="m21.6 19.5 5 5-4.2 4.2-5-5Z" fill="#f7d36f" stroke-width="1.05"/>
        <path d="m25.2 23.1 4.5 4.5-2.2 2.2-4.5-4.5Z" fill="#ff82a4" stroke-width="1.05"/>
        <path d="m24.2 24.4 3.8 3.8" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".7"/>
      </g>
    </svg>
  `;

  const cursor = `url("data:image/svg+xml,${encodeURIComponent(pencilSvg)}") 2 2, auto`;
  const style = document.createElement('style');
  style.textContent = `
    html,body,body *{cursor:${cursor}!important}
    @media(pointer:coarse){html,body,body *{cursor:auto!important}}
  `;
  document.head.append(style);
})();