/**
 * draft-sound.js — Web Audio API Sound Layer for "Pool of Experts"
 * No external audio files. All sounds generated via Web Audio API.
 * Load via <script src="draft-sound.js"></script> BEFORE game.js
 */

const SFX = (function () {

  let ctx = null;
  let masterGain = null;
  let _muted = false;
  let _ambientSource = null;
  let _ambientGain = null;
  let _kitchenTimer = null;
  let _pitchLFO = null;

  // ─── Init ──────────────────────────────────────────────────────────────────

  function _init() {
    if (ctx) return true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.gain.value = _muted ? 0 : 1;
      masterGain.connect(ctx.destination);

      // Resume on next user interaction if browser suspended context
      if (ctx.state === 'suspended') {
        const resume = () => {
          ctx.resume();
          window.removeEventListener('click', resume);
          window.removeEventListener('keydown', resume);
        };
        window.addEventListener('click', resume);
        window.addEventListener('keydown', resume);
      }

      return true;
    } catch (e) {
      ctx = null;
      return false;
    }
  }

  // ─── Noise Buffer ──────────────────────────────────────────────────────────

  function _noise(type) {
    // 2 seconds of noise, looped
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5; // scale up
      }
    } else {
      // white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }

  // ─── Stop Ambient ──────────────────────────────────────────────────────────

  function _stopAmbient() {
    if (_ambientSource) {
      try { _ambientSource.stop(); } catch (e) {}
      _ambientSource = null;
    }
    if (_ambientGain) {
      _ambientGain.disconnect();
      _ambientGain = null;
    }
    if (_pitchLFO) {
      try { _pitchLFO.stop(); } catch (e) {}
      _pitchLFO = null;
    }
    if (_kitchenTimer) {
      clearInterval(_kitchenTimer);
      _kitchenTimer = null;
    }
  }

  // ─── Pool Ambient ──────────────────────────────────────────────────────────
  // Brown noise + deep low-pass + gentle pitch modulation → water feel

  function pool() {
    if (!_init()) return;
    _stopAmbient();

    const now = ctx.currentTime;

    // Noise source
    const source = ctx.createBufferSource();
    source.buffer = _noise('brown');
    source.loop = true;

    // Low-pass filter — deep, muffled, water-like
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 400;
    lpf.Q.value = 0.8;

    // Subtle pitch modulation via LFO on filter frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // very slow wobble
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 60; // modulation depth in Hz
    lfo.connect(lfoGain);
    lfoGain.connect(lpf.frequency);
    lfo.start(now);

    // Ambient gain (for fade-in)
    const ambGain = ctx.createGain();
    ambGain.gain.setValueAtTime(0, now);
    ambGain.gain.linearRampToValueAtTime(0.35, now + 1.5);

    source.connect(lpf);
    lpf.connect(ambGain);
    ambGain.connect(masterGain);

    source.start(now);

    _ambientSource = source;
    _ambientGain = ambGain;
    _pitchLFO = lfo;
  }

  // ─── Kitchen Ambient ───────────────────────────────────────────────────────
  // White noise + mid-range filter + periodic 70Hz coffee-machine hum

  function kitchen() {
    if (!_init()) return;
    _stopAmbient();

    const now = ctx.currentTime;

    // White noise for ambient chatter/hiss
    const source = ctx.createBufferSource();
    source.buffer = _noise('white');
    source.loop = true;

    // Band-pass — livelier than pool, kitchen presence
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 1200;
    bpf.Q.value = 0.4;

    // A light low-pass on top to soften
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 3500;

    const ambGain = ctx.createGain();
    ambGain.gain.setValueAtTime(0, now);
    ambGain.gain.linearRampToValueAtTime(0.18, now + 1.2);

    source.connect(bpf);
    bpf.connect(lpf);
    lpf.connect(ambGain);
    ambGain.connect(masterGain);

    source.start(now);

    _ambientSource = source;
    _ambientGain = ambGain;

    // Periodic coffee machine hum: 70Hz oscillator, 0.5s on, 3s off
    function _coffeeHum() {
      if (!ctx || !masterGain) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 70;

      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0, t);
      humGain.gain.linearRampToValueAtTime(0.12, t + 0.08);
      humGain.gain.setValueAtTime(0.12, t + 0.42);
      humGain.gain.linearRampToValueAtTime(0, t + 0.5);

      osc.connect(humGain);
      humGain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.55);
    }

    // Fire once immediately, then every ~3.5s
    _coffeeHum();
    _kitchenTimer = setInterval(_coffeeHum, 3500);
  }

  // ─── Plop ──────────────────────────────────────────────────────────────────
  // Sine sweep 300Hz → 80Hz, 0.15s, soft envelope

  function plop() {
    if (!_init()) return;

    const now = ctx.currentTime;
    const duration = 0.15;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);        // attack
    gain.gain.setValueAtTime(0.5, now + duration - 0.12);
    gain.gain.linearRampToValueAtTime(0, now + duration);       // release

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  // ─── Letter ────────────────────────────────────────────────────────────────
  // White noise + high-pass → papery texture, 0.1s, soft envelope

  function letter() {
    if (!_init()) return;

    const now = ctx.currentTime;
    const duration = 0.1;

    const bufferSize = Math.ceil(ctx.sampleRate * (duration + 0.05));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // High-pass for papery crispness
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 3000;
    hpf.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain.gain.setValueAtTime(0.4, now + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    source.connect(hpf);
    hpf.connect(gain);
    gain.connect(masterGain);

    source.start(now);
    source.stop(now + duration + 0.01);
  }

  // ─── Stop ──────────────────────────────────────────────────────────────────

  function stop() {
    _stopAmbient();
  }

  // ─── Mute Toggle ───────────────────────────────────────────────────────────

  function mute() {
    _muted = !_muted;
    if (masterGain) {
      const now = ctx ? ctx.currentTime : 0;
      masterGain.gain.setTargetAtTime(_muted ? 0 : 1, now, 0.05);
    }
    return _muted;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  return {
    pool,
    kitchen,
    plop,
    letter,
    stop,
    mute,
    get isMuted() { return _muted; }
  };

})();

/*
 * ── game.js integration notes ──────────────────────────────────────────────
 *
 * In rReveal()      → add at top:  SFX.pool();
 * In rKitchen()     → add at top:  SFX.kitchen();
 * In rIntermezzo()  → add at top:  SFX.stop();
 * In rSendLetter()  → when brief-screen appears: SFX.letter();
 *
 * Plop calls → add later in draft-reveal.js when paper figures appear:
 *   SFX.plop();   (call once per figure reveal)
 *
 * Optional mute button example:
 *   document.getElementById('btn-mute').addEventListener('click', () => {
 *     const muted = SFX.mute();
 *     document.getElementById('btn-mute').textContent = muted ? '🔇' : '🔊';
 *   });
 */
