// src/services/CommandList.ts
import hai from '../Responses/CuteResponse/hai.ogg';
import womp from '../Responses/CuteResponse/womp.ogg';
import hi from '../Responses/CuteResponse/Hi.mp3';
import pikmin from '../Responses/CuteResponse/Pikmin.mp3';
import { findModelByName, ImageData } from './ModelsService';
import VoiceService from './VoiceService';

// Audio cache
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload all audio files
const preloadAudio = (sound: string, url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.8;
  audio.preload = 'auto';
  audioCache[sound] = audio;
};

// Initialize audio cache
preloadAudio('hai', hai);
preloadAudio('womp', womp);
preloadAudio('hi', hi);
preloadAudio('pikmin', pikmin);

const playAudio = async (sound: string): Promise<void> => {
  try {
    VoiceService.setSystemAudioState(true);
    const audio = audioCache[sound].cloneNode(true) as HTMLAudioElement;
    await audio.play();
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
    });
  } catch (err) {
    console.error("Audio playback error:", err);
  } finally {
    VoiceService.setSystemAudioState(false);
  }
};

export const initiateModelChange = async (): Promise<{
  modelName: string | null;
  onListeningStart: () => void;  // Callback when ready to listen
}> => {
  // Play Hi.mp3 and wait for it to finish
  await playAudio('hi');

  return {
    modelName: await new Promise<string | null>((resolve) => {
      VoiceService.startModelSelection(6000, resolve);
    }),
    onListeningStart: () => { }  // No-op, just for type safety
  };
};

export const CommandList = async (command: string): Promise<{
  action: 'changeModel' | 'hello' | 'unknown' | 'timeout' | 'invalidModel';
  model?: ImageData;
  onListeningStart?: () => void;  // Callback trigger
}> => {
  const normalized = command.trim().toLowerCase();

  if (normalized.includes("change")) {
    const { modelName, onListeningStart } = await initiateModelChange();

    // Signal that Hi.mp3 is done and we're listening
    if (onListeningStart) onListeningStart();

    if (!modelName) {
      await playAudio('pikmin');
      return { action: 'timeout' };
    }

    const model = await findModelByName(modelName);
    return model
      ? { action: 'changeModel', model }
      : { action: 'invalidModel' };
  }

  // 2. Handle hello command
  if (normalized.includes("hello")) {
    await playAudio('hai');
    return { action: 'hello' };
  }

  // 3. Default unknown command
  await playAudio('womp');
  return { action: 'unknown' };
};

export default CommandList;