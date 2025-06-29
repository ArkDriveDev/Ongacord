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
    VoiceService.setSystemAudioState(true); // Mark system audio as playing
    
    const audio = audioCache[sound] || new Audio(sound === 'hai' ? hai : womp);
    audio.currentTime = 0;
    
    await new Promise<void>((resolve) => {
      audio.play();
      audio.onended = () => {
        VoiceService.setSystemAudioState(false); // Clear flag when done
        resolve();
      };
      audio.onerror = () => {
        VoiceService.setSystemAudioState(false);
        resolve();
      };
    });

  } catch (error) {
    VoiceService.setSystemAudioState(false);
    console.error("Audio error:", error);
  }
};

export default CommandList;