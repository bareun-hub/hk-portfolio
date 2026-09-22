(() => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sound-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', '기분 좋은 배경 음악 켜기');
  button.innerHTML = '<span class="sound-dot" aria-hidden="true"></span><span class="sound-label">음악 켜기</span>';
  document.body.append(button);

  const style = document.createElement('style');
  style.textContent = `
    .sound-toggle{position:fixed;right:24px;bottom:24px;z-index:20;display:flex;align-items:center;gap:9px;min-height:44px;padding:10px 15px;border:1px solid #20211f;background:#f9f9f6;color:#20211f;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.04em;box-shadow:0 8px 24px #0000001a;transition:background-color .2s,color .2s,transform .2s}
    .sound-toggle:hover{transform:translateY(-2px)}
    .sound-toggle:focus-visible{outline:2px solid #526d59;outline-offset:4px}
    .sound-toggle[aria-pressed="true"]{background:#20211f;color:#fff}
    .sound-dot{width:8px;height:8px;border:1px solid currentColor;border-radius:50%}
    .sound-toggle[aria-pressed="true"] .sound-dot{background:currentColor;animation:sound-pulse 1.6s ease-in-out infinite}
    @keyframes sound-pulse{0%,100%{opacity:.45;transform:scale(.8)}50%{opacity:1;transform:scale(1.18)}}
    @media(max-width:600px){.sound-toggle{right:14px;bottom:14px}}
    @media(prefers-reduced-motion:reduce){.sound-toggle,.sound-dot{transition:none!important;animation:none!important}}
  `;
  document.head.append(style);

  if (!AudioContextClass) {
    button.disabled = true;
    button.querySelector('.sound-label').textContent = '음악 미지원';
    return;
  }

  const progressions = [
    [261.63, 329.63, 392.00, 493.88],
    [220.00, 261.63, 329.63, 392.00],
    [174.61, 220.00, 261.63, 329.63],
    [196.00, 246.94, 293.66, 329.63]
  ];
  const melodySteps = [0, 1, 2, 1, 3, 2, 1, 2];

  let context;
  let master;
  let timer;
  let chordIndex = 0;
  let isStarting = false;
  const activeSources = new Set();

  function register(source) {
    activeSources.add(source);
    source.addEventListener('ended', () => activeSources.delete(source), { once: true });
    return source;
  }

  function addPad(frequency, start, duration, position) {
    const oscillator = register(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = position % 2 ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency / 2;
    oscillator.detune.value = (position - 1.5) * 2;
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    filter.Q.value = 0.25;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.018, start + 0.8);
    gain.gain.setValueAtTime(0.018, start + duration - 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(filter).connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function addBell(frequency, start, accent = false) {
    const oscillator = register(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency * 2;
    filter.type = 'lowpass';
    filter.frequency.value = 2600;

    const volume = accent ? 0.06 : 0.042;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.75);

    oscillator.connect(filter).connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + 0.8);
  }

  function schedulePhrase() {
    if (!context || context.state === 'closed') return;
    const start = context.currentTime + 0.06;
    const chord = progressions[chordIndex];

    chord.forEach((frequency, position) => addPad(frequency, start, 4.8, position));
    melodySteps.forEach((step, index) => {
      addBell(chord[step], start + index * 0.52, index === 0 || index === 4);
    });

    chordIndex = (chordIndex + 1) % progressions.length;
  }

  async function startMusic() {
    if (isStarting || context) return;
    isStarting = true;
    const nextContext = new AudioContextClass();
    const nextMaster = nextContext.createGain();

    context = nextContext;
    master = nextMaster;
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.9, context.currentTime + 0.8);
    master.connect(context.destination);

    try {
      await context.resume();
      if (context !== nextContext) {
        await nextContext.close();
        return;
      }
      schedulePhrase();
      timer = window.setInterval(schedulePhrase, 4200);
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', '기분 좋은 배경 음악 끄기');
      button.querySelector('.sound-label').textContent = '음악 끄기';
    } finally {
      isStarting = false;
    }
  }

  function stopMusic() {
    window.clearInterval(timer);
    timer = undefined;

    const closingContext = context;
    const closingMaster = master;
    context = undefined;
    master = undefined;
    chordIndex = 0;
    isStarting = false;

    if (closingContext && closingContext.state !== 'closed') {
      const now = closingContext.currentTime;
      if (closingMaster) {
        closingMaster.gain.cancelScheduledValues(now);
        closingMaster.gain.setValueAtTime(0.0001, now);
      }
      activeSources.forEach((source) => {
        try { source.stop(now); } catch {}
      });
      activeSources.clear();
      closingContext.close().catch(() => {});
    }

    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', '기분 좋은 배경 음악 켜기');
    button.querySelector('.sound-label').textContent = '음악 켜기';
  }

  button.addEventListener('click', async () => {
    if (button.getAttribute('aria-pressed') === 'true' || context) {
      stopMusic();
    } else {
      await startMusic();
    }
  });

  window.addEventListener('pagehide', stopMusic, { once: true });
})();