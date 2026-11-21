/* Web Audio API Adaptive Game BGM & SFX Synthesizer (100% Offline, Copyright-Free, Classroom-Friendly) */
const SoundFX = (() => {
  let ctx = null;
  let sfxEnabled = true;
  let bgmEnabled = true;
  let currentTrack = 'town';
  let bgmTimer = null;
  let stepIdx = 0;
  let bgmMasterGain = null;
  let bgmFilter = null;
  let userUnlocked = false;

  /* Musical Note Frequencies (Hz) */
  const N = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.00, B5: 987.77
  };

  /* 4 Adaptive Classroom-Appropriate Tracks */
  const TRACKS = {
    /* 1. Ragnarok-inspired Peaceful Town / World Map (C Major, warm harp & soft bass) */
    town: {
      tempoMs: 310,
      cutoff: 1350,
      melody: [
        N.E5, null, N.G5, N.A5,  N.G5, null, N.E5, N.D5,
        N.C5, null, N.D5, N.E5,  N.D5, null, null, null,
        N.F5, null, N.E5, N.D5,  N.E5, null, N.C5, N.A4,
        N.B4, null, N.D5, N.G5,  N.E5, null, null, null
      ],
      bass: [
        N.C3, null, null, null,  N.G3, null, null, null,
        N.A3, null, null, null,  N.G3, null, null, null,
        N.F3, null, null, null,  N.C3, null, null, null,
        N.G3, null, null, null,  N.C3, null, null, null
      ],
      chords: {
        0: [N.C4, N.E4, N.G4],
        8: [N.A3, N.C4, N.E4],
        16: [N.F3, N.A3, N.C4],
        24: [N.G3, N.B3, N.D4]
      }
    },

    /* 2. Lo-Fi Study / Codex Library / CLI / Exam Focus (Calm A-Minor / Fmaj7 ambient) */
    study: {
      tempoMs: 390,
      cutoff: 950,
      melody: [
        N.E5, null, null, N.C5,  null, N.B4, N.A4, null,
        N.A4, null, null, N.C5,  N.E5, null, null, null,
        N.G5, null, null, N.E5,  null, N.D5, N.C5, null,
        N.D5, null, N.C5, null,  N.B4, null, null, null
      ],
      bass: [
        N.A3, null, null, null,  null, null, null, null,
        N.F3, null, null, null,  null, null, null, null,
        N.C3, null, null, null,  null, null, null, null,
        N.G3, null, null, null,  null, null, null, null
      ],
      chords: {
        0: [N.A3, N.C4, N.E4],
        8: [N.F3, N.A3, N.C4, N.E4],
        16: [N.C4, N.E4, N.G4],
        24: [N.G3, N.B3, N.D4]
      }
    },

    /* 3. Tactical RPG Battle & Arcade (Upbeat D-Minor, crisp yet soft) */
    battle: {
      tempoMs: 225,
      cutoff: 1650,
      melody: [
        N.D5, N.F5, N.A5, null,  N.G5, N.F5, N.E5, null,
        N.F5, N.E5, N.D5, N.A4,  N.C5, null, N.D5, null,
        N.Bb4, N.D5, N.F5, null, N.E5, N.D5, N.C5, null,
        N.A4, N.C5, N.E5, N.G5,  N.F5, null, N.E5, null
      ],
      bass: [
        N.D3, null, N.D3, null,  N.A3, null, N.D3, null,
        N.F3, null, N.F3, null,  N.C3, null, N.D3, null,
        N.G3, null, N.G3, null,  N.C3, null, N.C3, null,
        N.A3, null, N.A3, null,  N.A3, null, N.G3, null
      ],
      chords: {
        0: [N.D4, N.F4, N.A4],
        8: [N.F4, N.A4, N.C5],
        16: [N.G3, N.Bb4, N.D4],
        24: [N.A3, N.C4, N.E4]
      }
    },

    /* 4. MVP / Zone Boss Battle (Dramatic E-Minor Cyber-RPG pulse) */
    boss: {
      tempoMs: 195,
      cutoff: 1850,
      melody: [
        N.E5, N.G5, N.B5, N.A5,  N.G5, N.Fs5, N.E5, null,
        N.D5, N.Fs5, N.A5, N.G5, N.Fs5, null, N.E5, null,
        N.C5, N.E5, N.G5, N.B5,  N.A5, N.G5, N.Fs5, null,
        N.B4, N.D5, N.Fs5, N.A5, N.B5, null, N.G5, null
      ],
      bass: [
        N.E3, N.E3, null, N.E3,  N.B3, null, N.E3, null,
        N.D3, N.D3, null, N.D3,  N.A3, null, N.D3, null,
        N.C3, N.C3, null, N.C3,  N.G3, null, N.C3, null,
        N.B3, N.B3, null, N.B3,  N.B3, null, N.A3, null
      ],
      chords: {
        0: [N.E4, N.G4, N.B4],
        8: [N.D4, N.Fs4, N.A4],
        16: [N.C4, N.E4, N.G4],
        24: [N.B3, N.D4, N.Fs4]
      }
    }
  };

  function ensureCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      bgmFilter = ctx.createBiquadFilter();
      bgmFilter.type = 'lowpass';
      bgmFilter.frequency.setValueAtTime(1350, ctx.currentTime);
      bgmMasterGain = ctx.createGain();
      bgmMasterGain.gain.setValueAtTime(0.24, ctx.currentTime);
      bgmFilter.connect(bgmMasterGain);
      bgmMasterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playSfxTone(freq, duration, type = 'sine', gainVal = 0.08, delay = 0, freqEnd = null) {
    if (!sfxEnabled) return;
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

  function playBgmNote(freq, duration, type, peakGain, attack = 0.02) {
    const audio = ensureCtx();
    if (!audio || !bgmFilter || !freq) return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peakGain, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0005, now + duration);
    osc.connect(g);
    g.connect(bgmFilter);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function tickBgm() {
    if (!bgmEnabled || !userUnlocked) return;
    const audio = ensureCtx();
    if (!audio || audio.state !== 'running') return;
    const track = TRACKS[currentTrack] || TRACKS.town;
    const idx = stepIdx % track.melody.length;

    const lead = track.melody[idx];
    const bass = track.bass[idx];
    const chord = track.chords[idx];

    const stepSec = track.tempoMs / 1000;
    if (lead) {
      const wave = currentTrack === 'study' ? 'sine' : 'triangle';
      playBgmNote(lead, stepSec * 1.45, wave, 0.14, 0.015);
    }
    if (bass) {
      playBgmNote(bass, stepSec * 1.8, 'sine', 0.16, 0.02);
    }
    if (chord) {
      chord.forEach((f) => playBgmNote(f, stepSec * 7.2, 'sine', 0.045, 0.08));
    }
    stepIdx = (stepIdx + 1) % track.melody.length;
  }

  function stopBgmLoop() {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }

  function startBgmLoop() {
    stopBgmLoop();
    if (!bgmEnabled || !userUnlocked) return;
    const audio = ensureCtx();
    if (!audio) return;
    const track = TRACKS[currentTrack] || TRACKS.town;
    if (bgmFilter) {
      bgmFilter.frequency.setTargetAtTime(track.cutoff, audio.currentTime, 0.15);
    }
    tickBgm();
    bgmTimer = setInterval(tickBgm, track.tempoMs);
  }

  /* Auto-unlock audio cleanly on first user interaction */
  function handleFirstGesture() {
    if (userUnlocked) return;
    userUnlocked = true;
    ensureCtx();
    if (bgmEnabled) startBgmLoop();
  }
  window.addEventListener('pointerdown', handleFirstGesture, { once: true });
  window.addEventListener('keydown', handleFirstGesture, { once: true });

  return {
    isEnabled: () => sfxEnabled,
    setEnabled(val) {
      sfxEnabled = Boolean(val);
    },
    isBgmEnabled: () => bgmEnabled,
    setBgmEnabled(val) {
      bgmEnabled = Boolean(val);
      if (bgmEnabled) {
        userUnlocked = true;
        ensureCtx();
        startBgmLoop();
      } else {
        stopBgmLoop();
      }
    },
    setBgmTrack(trackName) {
      if (!TRACKS[trackName]) return;
      if (currentTrack === trackName && bgmTimer) return;
      currentTrack = trackName;
      stepIdx = 0;
      if (bgmEnabled && userUnlocked) {
        startBgmLoop();
      }
    },
    getBgmTrack: () => currentTrack,
    click() {
      playSfxTone(580, 0.04, 'triangle', 0.05);
    },
    attack() {
      playSfxTone(320, 0.08, 'sawtooth', 0.06, 0, 880);
      playSfxTone(740, 0.14, 'triangle', 0.08, 0.06, 1180);
    },
    correct() {
      playSfxTone(587.33, 0.1, 'sine', 0.08, 0);
      playSfxTone(880, 0.16, 'sine', 0.09, 0.08);
    },
    wrong() {
      playSfxTone(210, 0.14, 'sawtooth', 0.08, 0, 140);
      playSfxTone(150, 0.22, 'sawtooth', 0.08, 0.11, 90);
    },
    shield() {
      playSfxTone(420, 0.1, 'sine', 0.08, 0, 680);
      playSfxTone(680, 0.18, 'triangle', 0.07, 0.08, 920);
    },
    coin() {
      playSfxTone(987.77, 0.07, 'square', 0.045, 0);
      playSfxTone(1318.51, 0.16, 'square', 0.045, 0.07);
    },
    bossAlert() {
      playSfxTone(280, 0.16, 'sawtooth', 0.07, 0, 220);
      playSfxTone(280, 0.16, 'sawtooth', 0.07, 0.2, 220);
      playSfxTone(340, 0.28, 'sawtooth', 0.08, 0.4, 180);
    },
    levelUp() {
      playSfxTone(523.25, 0.1, 'triangle', 0.09, 0);
      playSfxTone(659.25, 0.1, 'triangle', 0.09, 0.09);
      playSfxTone(783.99, 0.12, 'triangle', 0.09, 0.18);
      playSfxTone(1046.5, 0.28, 'triangle', 0.1, 0.28);
    },
    terminal() {
      playSfxTone(780, 0.025, 'square', 0.022);
    }
  };
})();
