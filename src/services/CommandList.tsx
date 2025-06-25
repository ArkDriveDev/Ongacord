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
    VoiceService.setSpeakingState(true); // Pause mic while playing sound
    
    const audio = audioCache[sound] || new Audio(sound === 'hai' ? hai : womp);
    audio.currentTime = 0;
    
    await audio.play();
    
    audio.onended = () => {
      VoiceService.setSpeakingState(false); // Resume mic
    };

    if (processed.includes("go back")) {
      navigation.goBack();
    }
  } catch (error) {
    console.error("Audio error:", error);
    VoiceService.setSpeakingState(false); // Ensure mic resumes on error
  }
};

export default CommandList;