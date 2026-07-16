// Generates a looping two-tone alert sound using the Web Audio API, so the
// reminder popup has a real ringtone without bundling an audio file.
// Call startRingtone() when a reminder fires and stopRingtone() when the
// person dismisses it - it will keep playing in between, on a loop, until
// explicitly stopped.

let audioContext: AudioContext | null = null;
let loopTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new Ctor();
  }
  return audioContext;
}

function playTone(freq: number, startTime: number, duration: number, ctx: AudioContext) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = freq;

  // Quick fade in/out so each beep doesn't click
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
  gain.gain.linearRampToValueAtTime(0.25, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playPattern() {
  if (!isPlaying) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Two-tone "ring" pattern, repeated
    playTone(880, now, 0.35, ctx);
    playTone(660, now + 0.4, 0.35, ctx);
  } catch {
    // Audio can fail in some environments (autoplay restrictions before any
    // user gesture, unsupported browser) - the visual popup still works.
  }

  loopTimeoutId = setTimeout(playPattern, 1200);
}

export function startRingtone() {
  if (isPlaying) return;
  isPlaying = true;
  playPattern();
}

export function stopRingtone() {
  isPlaying = false;
  if (loopTimeoutId) {
    clearTimeout(loopTimeoutId);
    loopTimeoutId = null;
  }
}
