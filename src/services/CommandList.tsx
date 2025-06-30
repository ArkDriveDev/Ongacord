import hai from '../Responses/CuteResponse/hai.ogg';
import womp from '../Responses/CuteResponse/womp.ogg';
import VoiceService from './VoiceService';
import hi from '../Responses/CuteResponse/Hi.mp3';

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
preloadAudio('hi', hi);

const CommandList = async (command: string) => {
  const processed = command.trim().toLowerCase();
  
  // Determine which sound to play based on the command
  let sound;
  if (processed.includes("hello")) {
    sound = 'hai';
  } else if (processed.includes("change")) {
    sound = 'hi';
  } else {
    sound = 'womp';
  }

  try {
    VoiceService.setSystemAudioState(true);
    
    const audio = audioCache[sound] || new Audio(
      sound === 'hai' ? hai : 
      sound === 'hi' ? hi : 
      womp
    );
    audio.currentTime = 0;
    
    await new Promise<void>((resolve) => {
      audio.play();
      audio.onended = () => {
        VoiceService.setSystemAudioState(false);
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