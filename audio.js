/* Web Audio API Game Sound Synthesizer (100% Offline, Zero Dependencies) */
const SoundFX = (() => {
  let ctx = null;
  let enabled = true;

  function ensureCtx() {
    if (!enabled) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.08, delay = 0, freqEnd = null) {
    const audio = ensureCtx();
    if (!audio) return;
    const t0 = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration);
    }
    gain.gain.setValueAtTime(gainVal, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  return {
    isEnabled: () => enabled,
    setEnabled(val) {
      enabled = Boolean(val);
    },
    click() {
      playTone(580, 0.04, 'triangle', 0.05);
    },
    attack() {
      playTone(320, 0.08, 'sawtooth', 0.06, 0, 880);
      playTone(740, 0.14, 'triangle', 0.08, 0.06, 1180);
    },
    correct() {
      playTone(587.33, 0.1, 'sine', 0.08, 0);
      playTone(880, 0.16, 'sine', 0.09, 0.08);
    },
    wrong() {
      playTone(210, 0.14, 'sawtooth', 0.08, 0, 140);
      playTone(150, 0.22, 'sawtooth', 0.08, 0.11, 90);
    },
    shield() {
      playTone(420, 0.1, 'sine', 0.08, 0, 680);
      playTone(680, 0.18, 'triangle', 0.07, 0.08, 920);
    },
    coin() {
      playTone(987.77, 0.07, 'square', 0.045, 0);
      playTone(1318.51, 0.16, 'square', 0.045, 0.07);
    },
    bossAlert() {
      playTone(280, 0.16, 'sawtooth', 0.07, 0, 220);
      playTone(280, 0.16, 'sawtooth', 0.07, 0.2, 220);
      playTone(340, 0.28, 'sawtooth', 0.08, 0.4, 180);
    },
    levelUp() {
      playTone(523.25, 0.1, 'triangle', 0.09, 0);
      playTone(659.25, 0.1, 'triangle', 0.09, 0.09);
      playTone(783.99, 0.12, 'triangle', 0.09, 0.18);
      playTone(1046.5, 0.28, 'triangle', 0.1, 0.28);
    },
    terminal() {
      playTone(780, 0.025, 'square', 0.022);
    }
  };
})();
