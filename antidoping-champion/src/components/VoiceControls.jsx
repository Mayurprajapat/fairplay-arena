// Voice control buttons: Play / Pause / Replay / Mute
export default function VoiceControls({ speech, onReplayText }) {
  if (!speech.supported) return null;
  const btn =
    "glass rounded-full w-9 h-9 flex items-center justify-center text-base btn-show hover:border-amber-300/60";
  return (
    <div className="flex items-center gap-2">
      <button
        className={btn}
        title={speech.speaking && !speech.paused ? "Pause voice" : "Play voice"}
        onClick={() => {
          if (speech.speaking && !speech.paused) speech.pause();
          else if (speech.paused) speech.resume();
          else if (onReplayText) speech.speak(onReplayText);
        }}
      >
        {speech.speaking && !speech.paused ? "⏸" : "🔊"}
      </button>
      <button className={btn} title="Replay voice" onClick={() => speech.replay()}>
        🔁
      </button>
      <button
        className={btn}
        title={speech.voiceOff ? "Unmute voice" : "Mute voice"}
        onClick={() => speech.setVoiceOff(!speech.voiceOff)}
      >
        {speech.voiceOff ? "🔇" : "🎙️"}
      </button>
    </div>
  );
}
