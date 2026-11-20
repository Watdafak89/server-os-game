/* Web Audio API Sound Synthesizer (Zero external dependencies, works 100% offline) */
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

  function playTone(freq, duration, type = 'sine', gainVal = 0.08, delay = 0) {
    const audio = ensureCtx();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audio.currentTime + delay);
    gain.gain.setValueAtTime(gainVal, audio.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(audio.currentTime + delay);
    osc.stop(audio.currentTime + delay + duration);
  }

  return {
    isEnabled: () => enabled,
    setEnabled(val) {
      enabled = Boolean(val);
    },
    click() {
      playTone(540, 0.04, 'triangle', 0.05);
    },
    correct() {
      playTone(587.33, 0.11, 'sine', 0.08, 0);
      playTone(880, 0.18, 'sine', 0.09, 0.09);
    },
    wrong() {
      playTone(220, 0.14, 'sawtooth', 0.07, 0);
      playTone(170, 0.22, 'sawtooth', 0.07, 0.11);
    },
    levelUp() {
      playTone(523.25, 0.1, 'triangle', 0.09, 0);
      playTone(659.25, 0.1, 'triangle', 0.09, 0.09);
      playTone(783.99, 0.12, 'triangle', 0.09, 0.18);
      playTone(1046.5, 0.25, 'triangle', 0.1, 0.28);
    },
    terminal() {
      playTone(760, 0.03, 'square', 0.025);
    }
  };
})();
