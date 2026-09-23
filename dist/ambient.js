(() => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sound-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', '잔잔한 클래식 피아노 배경 음악 켜기');
  button.innerHTML = '<span class="sound-dot" aria-hidden="true"></span><span class="sound-label">음악 켜기</span>';
  document.body.append(button);

  const style = document.createElement('style');
  style.textContent = `
    .sound-toggle{position:fixed;right:24px;bottom:24px;z-index:20;display:flex;align-items:center;gap:9px;min-height:44px;padding:10px 15px;border:1px solid #20211f;background:#f9f9f6;color:#20211f;font-family:inherit;font-size:12px;font-weight:500;letter-spacing:.04em;box-shadow:0 8px 24px #0000001a;transition:background-color .2s,color .2s,transform .2s}
    .sound-toggle:hover{transform:translateY(-2px)}
    .sound-toggle:focus-visible{outline:2px solid #526d59;outline-offset:4px}
    .sound-toggle[aria-pressed="true"]{background:#20211f;color:#fff}
    .sound-dot{width:8px;height:8px;border:1px solid currentColor;border-radius:50%}
    .sound-toggle[aria-pressed="true"] .sound-dot{background:currentColor;animation:sound-pulse 1.05s ease-in-out infinite}
    @keyframes sound-pulse{0%,100%{opacity:.45;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
    @media(max-width:600px){.sound-toggle{right:14px;bottom:14px}}
    @media(prefers-reduced-motion:reduce){.sound-toggle,.sound-dot{transition:none!important;animation:none!important}}
  `;
  document.head.append(style);

  if (!AudioContextClass) {
    button.disabled = true;
    button.querySelector('.sound-label').textContent = '음악 미지원';
    return;
  }

  const classicalMeasures = [
    {
      bass: 130.81,
      chord: [261.63, 329.63, 392.00],
      melody: [659.25, null, 587.33, 523.25, null, 493.88]
    },
    {
      bass: 123.47,
      chord: [293.66, 392.00, 493.88],
      melody: [587.33, null, 659.25, 783.99, null, 659.25]
    },
    {
      bass: 110.00,
      chord: [261.63, 329.63, 440.00],
      melody: [659.25, null, 783.99, 880.00, null, 783.99]
    },
    {
      bass: 98.00,
      chord: [246.94, 329.63, 392.00],
      melody: [783.99, null, 659.25, 587.33, null, 523.25]
    },
    {
      bass: 87.31,
      chord: [261.63, 349.23, 440.00],
      melody: [698.46, null, 659.25, 587.33, null, 523.25]
    },
    {
      bass: 82.41,
      chord: [261.63, 329.63, 392.00],
      melody: [659.25, null, 587.33, 523.25, null, 493.88]
    },
    {
      bass: 73.42,
      chord: [261.63, 293.66, 349.23, 440.00],
      melody: [587.33, null, 523.25, 493.88, null, 440.00]
    },
    {
      bass: 98.00,
      chord: [246.94, 293.66, 349.23, 392.00],
      melody: [493.88, null, 587.33, 659.25, 523.25, 493.88]
    }
  ];

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

  function addPianoNote(frequency, start, volume = 0.05, duration = 1.1) {
    const filter = context.createBiquadFilter();
    const noteGain = context.createGain();
    const harmonics = [
      { multiplier: 1, type: 'sine', level: 1 },
      { multiplier: 2, type: 'triangle', level: 0.13 },
      { multiplier: 3, type: 'sine', level: 0.04 }
    ];

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4200, start);
    filter.frequency.exponentialRampToValueAtTime(1500, start + duration);
    filter.Q.value = 0.55;

    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.34, start + 0.16);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    filter.connect(noteGain).connect(master);

    harmonics.forEach(({ multiplier, type, level }) => {
      const oscillator = register(context.createOscillator());
      const harmonicGain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency * multiplier, start);
      oscillator.detune.value = multiplier === 1 ? -2 : 2;
      harmonicGain.gain.value = level;
      oscillator.connect(harmonicGain).connect(filter);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.04);
    });
  }

  function schedulePhrase() {
    if (!context || context.state === 'closed') return;
    const start = context.currentTime + 0.05;
    const measure = classicalMeasures[chordIndex];

    addPianoNote(measure.bass, start, 0.045, 2.75);
    const arpeggio = [0, 1, 2, 1, 2, 1];
    arpeggio.forEach((toneIndex, index) => {
      const frequency = measure.chord[toneIndex % measure.chord.length];
      addPianoNote(frequency, start + index * 0.48, index === 0 ? 0.018 : 0.014, 1.3);
    });
    measure.melody.forEach((frequency, index) => {
      if (!frequency) return;
      const phraseEnding = chordIndex === classicalMeasures.length - 1 && index === measure.melody.length - 1;
      addPianoNote(frequency, start + index * 0.48, index === 0 ? 0.032 : 0.027, phraseEnding ? 1.8 : 1.35);
    });

    chordIndex = (chordIndex + 1) % classicalMeasures.length;
  }

  async function startMusic() {
    if (isStarting || context) return;
    isStarting = true;
    const nextContext = new AudioContextClass();
    const nextMaster = nextContext.createGain();

    context = nextContext;
    master = nextMaster;
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.58, context.currentTime + 0.65);
    master.connect(context.destination);

    try {
      await context.resume();
      if (context !== nextContext) {
        await nextContext.close();
        return;
      }
      schedulePhrase();
      timer = window.setInterval(schedulePhrase, 2880);
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', '잔잔한 클래식 피아노 배경 음악 끄기');
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
    button.setAttribute('aria-label', '잔잔한 클래식 피아노 배경 음악 켜기');
    button.querySelector('.sound-label').textContent = '음악 켜기';
  }

  button.addEventListener('click', async () => {
    if (button.getAttribute('aria-pressed') === 'true' || context) stopMusic();
    else await startMusic();
  });

  window.addEventListener('pagehide', stopMusic, { once: true });
})();
