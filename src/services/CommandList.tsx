import { useIonRouter } from "@ionic/react";
import hai from '../Responses/CuteResponse/hai.ogg';
import womp from '../Responses/CuteResponse/womp.ogg';

import VoiceService from './VoiceService';

const audioCache: Record<string, HTMLAudioElement> = {};

const preloadAudio = (sound: string, url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.8;
  audio.preload = 'auto';
  audioCache[sound] = audio;
};

// Preload sounds
preloadAudio('hai', hai);
preloadAudio('womp', womp);

const CommandList = async (command: string, navigation: ReturnType<typeof useIonRouter>) => {
  const processed = command.trim().toLowerCase();
  const sound = processed.includes("hello") ? 'hai' : 'womp';

  try {
    // Force mic off before any audio plays
    VoiceService.setSpeakingState(true);
    
    const audio = audioCache[sound] || new Audio(sound === 'hai' ? hai : womp);
    audio.currentTime = 0;
    
    // Create promise to wait for playback completion
    await new Promise<void>((resolve) => {
      audio.play();
      audio.onended = () => {
        VoiceService.setSpeakingState(false); // Only turn mic back on after sound completes
        resolve();
      };
      audio.onerror = () => {
        VoiceService.setSpeakingState(false); // Ensure mic comes back on error
        resolve();
      };
    });

    if (processed.includes("go back")) {
      navigation.goBack();
    }
  } catch (error) {
    console.error("Audio error:", error);
    VoiceService.setSpeakingState(false);
  }
};

export default CommandList;