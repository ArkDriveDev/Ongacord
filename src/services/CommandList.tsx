import { useIonRouter } from "@ionic/react";
import hai from '../Responses/CuteResponse/hai.ogg';
import womp from '../Responses/CuteResponse/womp.ogg';

// Preloaded audio instances
const audioCache: Record<string, HTMLAudioElement> = {
  hai: new Audio(hai),
  womp: new Audio(womp)
};

// Initialize audio
Object.values(audioCache).forEach(audio => {
  audio.volume = 0.8;
  audio.preload = 'auto';
});

const CommandList = async (command: string, navigation: ReturnType<typeof useIonRouter>) => {
  const processed = command.trim().toLowerCase();
  const sound = processed.includes("hello") ? 'hai' : 'womp';

  try {
    // Get or create audio instance
    const audio = audioCache[sound] || new Audio(sound === 'hai' ? hai : womp);
    audio.currentTime = 0;
    
    await audio.play().catch(async (error) => {
      console.warn("Playback failed, trying fallback:", error);
      const fallback = new Audio(sound === 'hai' ? hai : womp);
      await fallback.play();
    });

    // Handle special commands
    if (processed.includes("go back")) {
      navigation.goBack();
    }
  } catch (error) {
    console.error("Audio error:", error);
  }
};

export default CommandList;