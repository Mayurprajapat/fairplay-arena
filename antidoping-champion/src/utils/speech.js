import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API wrapper: speak / pause / resume / replay / stop / mute
function pickVoice() {
  try {
    const vs = window.speechSynthesis?.getVoices?.() || [];
    return (
      vs.find((v) => v.lang?.toLowerCase().startsWith("en-in")) ||
      vs.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
      vs[0] ||
      null
    );
  } catch {
    return null;
  }
}

export function speakOnce(text, opts = {}) {
  try {
    if (!("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = opts.rate ?? 0.98;
    u.pitch = opts.pitch ?? 1.02;
    u.onend = opts.onend;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch { /* noop */ }
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported] = useState(() => "speechSynthesis" in window);
  const [voiceOff, setVoiceOff] = useState(false);
  const lastText = useRef("");

  useEffect(() => {
    try {
      window.speechSynthesis?.getVoices?.();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis?.getVoices?.();
    } catch { /* noop */ }
    return () => stopSpeech();
  }, []);

  const speak = useCallback(
    (text, opts = {}) => {
      lastText.current = text;
      if (voiceOff || !supported) {
        opts.onend?.();
        return;
      }
      setSpeaking(true);
      setPaused(false);
      speakOnce(text, {
        ...opts,
        onend: () => {
          setSpeaking(false);
          setPaused(false);
          opts.onend?.();
        },
      });
    },
    [supported, voiceOff]
  );

  const pause = useCallback(() => {
    try {
      window.speechSynthesis?.pause();
      setPaused(true);
    } catch { /* noop */ }
  }, []);

  const resume = useCallback(() => {
    try {
      window.speechSynthesis?.resume();
      setPaused(false);
    } catch { /* noop */ }
  }, []);

  const replay = useCallback(() => {
    if (lastText.current) speak(lastText.current);
  }, [speak]);

  const stop = useCallback(() => {
    stopSpeech();
    setSpeaking(false);
    setPaused(false);
  }, []);

  return { speak, pause, resume, replay, stop, speaking, paused, supported, voiceOff, setVoiceOff };
}
