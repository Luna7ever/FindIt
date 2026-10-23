// Web Speech & Audio Feedback Engine for Young Kids (4-10 years)
let isVoicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
      if (cachedVoices.length > 0) {
        isVoicesLoaded = true;
      }
    } catch (e) {
      // Safe fallback
    }
  };

  loadVoices();
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Play a cheerful, gentle marimba chime using Web Audio API
 * Ensures instant joyful auditory feedback on all devices
 */
export function playKidsChime(frequency = 523.25) { // C5 cheerful chime
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio context autoplay restriction
  }
}

/**
 * Speak child-friendly voice text with Arabic & English support
 */
export function speakKidsText(text: string) {
  if (typeof window === 'undefined') return;

  // 1. Play cheerful feedback chime
  playKidsChime();

  if (!('speechSynthesis' in window)) return;

  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Clean emojis and punctuation for smooth pronunciation
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[!؟?()._—–]/g, ' ')
      .trim();

    if (!cleanText) return;

    const isArabic = /[\u0600-\u06FF]/.test(cleanText);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isArabic ? 'ar-EG' : 'en-US';
    utterance.rate = 0.90; // Calm, clear tempo for primary school children
    utterance.pitch = 1.15; // Cheerful, friendly pitch

    // Load voices if not already cached
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    
    if (voices && voices.length > 0) {
      const selectedVoice = isArabic
        ? voices.find(v => v.lang === 'ar-EG' || v.lang.startsWith('ar') || v.name.includes('Arabic') || v.name.includes('Maged') || v.name.includes('Laila') || v.name.includes('Tarik') || v.name.includes('Hoda'))
        : voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Google')));
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Prevent Chromium garbage collection bug by pinning reference to window
    (window as any).__lastKidsUtterance = utterance;
    utterance.onend = () => {
      try {
        delete (window as any).__lastKidsUtterance;
      } catch (e) {
        // Safe cleanup
      }
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      try {
        delete (window as any).__lastKidsUtterance;
      } catch (err) {
        // Safe cleanup
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
