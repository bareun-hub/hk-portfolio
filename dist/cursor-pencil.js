(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const pencilSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path d="M2 2 11 5 5 11Z" fill="#e8c79d" stroke="#20211f" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="m2 2 4 1.4-2.6 2.7Z" fill="#20211f"/>
      <path d="m8 6 20 20-4 4L4 10Z" fill="#ffd447" stroke="#20211f" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="m10 8 20 20-2 2L8 10Z" fill="#ff9500" opacity=".78"/>
      <path d="m12 10 3 3" stroke="#34c759" stroke-width="1.5"/>
      <path d="m15 13 3 3" stroke="#0a84ff" stroke-width="1.5"/>
      <path d="m18 16 3 3" stroke="#bf5af2" stroke-width="1.5"/>
      <path d="m22 20 8 8-2 2-8-8Z" fill="#ff7c9c" stroke="#20211f" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="m21 21 2-2" stroke="#f7f7f2" stroke-width="1.4"/>
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