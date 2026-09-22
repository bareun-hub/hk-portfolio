(() => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sound-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', '잔잔한 배경 음악 켜기');
  button.innerHTML = '<span class="sound-dot" aria-hidden="true"></span><span class="sound-label">음악 켜기</span>';
  document.body.append(button);

  const style = document.createElement('style');
  style.textContent = `
    .sound-toggle{position:fixed;right:24px;bottom:24px;z-index:20;display:flex;align-items:center;gap:9px;min-height:44px;padding:10px 15px;border:1px solid #20211f;background:#f9f9f6;color:#20211f;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.04em;box-shadow:0 8px 24px #0000001a;transition:background-color .2s,color .2s,transform .2s}
    .sound-toggle:hover{transform:translateY(-2px)}
    .sound-toggle:focus-visible{outline:2px solid #526d59;outline-offset:4px}
    .sound-toggle[aria-pressed="true"]{background:#20211f;color:#fff}
    .sound-dot{width:8px;height:8px;border:1px solid currentColor;border-radius:50%}
    .sound-toggle[aria-pressed="true"] .sound-dot{background:currentColor;animation:sound-pulse 2.4s ease-in-out infinite}
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

  const chords = [
    [130.81, 164.81, 196.00, 246.94],
    [110.00, 130.81, 164.81, 196.00],
    [87.31, 130.81, 164.81, 196.00],
    [98.00, 123.47, 146.83, 164.81]
  ];

  let context;
  let master;
  let timer;
  let chordIndex = 0;

  function addVoice(frequency, start, duration, position) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = position % 2 ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency;
    oscillator.detune.value = (position - 1.5) * 2.5;
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.35;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.023, start + 1.8);
    gain.gain.setValueAtTime(0.023, start + duration - 2.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(filter).connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.1);
  }

  function scheduleChord() {
    const start = context.currentTime + 0.08;
    chords[chordIndex].forEach((frequency, position) => {
      addVoice(frequency, start + position * 0.08, 7.2, position);
    });
    chordIndex = (chordIndex + 1) % chords.length;
  }

  async function startMusic() {
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.72, context.currentTime + 2.5);
    master.connect(context.destination);
    await context.resume();
    scheduleChord();
    timer = window.setInterval(scheduleChord, 5600);
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-label', '잔잔한 배경 음악 끄기');
    button.querySelector('.sound-label').textContent = '음악 끄기';
  }

  function stopMusic() {
    window.clearInterval(timer);
    timer = undefined;
    if (context && master) {
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      window.setTimeout(() => context?.close(), 750);
    }
    context = undefined;
    master = undefined;
    chordIndex = 0;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', '잔잔한 배경 음악 켜기');
    button.querySelector('.sound-label').textContent = '음악 켜기';
  }

  button.addEventListener('click', async () => {
    if (button.getAttribute('aria-pressed') === 'true') {
      stopMusic();
    } else {
      await startMusic();
    }
  });

  window.addEventListener('pagehide', stopMusic, { once: true });
})();
