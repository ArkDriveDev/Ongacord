import hai from '../Responses/CuteResponse/hai.ogg';
import womp from '../Responses/CuteResponse/womp.ogg';
import hi from '../Responses/CuteResponse/Hi.mp3';
import womp2x from '../Responses/CuteResponse/womp.ogg';
import { findModelByName, ImageData } from './ModelsService';
import VoiceService from './VoiceService';

// Audio cache
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload audio
['hai', hai, 'womp', womp, 'hi', hi, 'womp2x', womp2x].forEach(([key, url]) => {
  const audio = new Audio(url);
  audio.volume = 0.8;
  audio.preload = 'auto';
  audioCache[key] = audio;
});

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

export const initiateModelChange = async (): Promise<string | null> => {
  await playAudio('hi');
  return new Promise((resolve) => {
    VoiceService.startModelSelection(6000, (modelName) => {
      resolve(modelName?.trim() || null);
    });
  });
};

export const CommandList = async (command: string): Promise<{
  action: 'changeModel' | 'hello' | 'unknown' | 'timeout' | 'invalidModel';
  model?: ImageData;
}> => {
  // Normalize command
  const normalized = command.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(one)\b/g, '1')
    .replace(/\b(two)\b/g, '2')
    .replace(/\b(three)\b/g, '3')
    .replace(/\b(four)\b/g, '4');

  console.log('Processing command:', normalized);

  // 1. Handle model change command
  if (normalized.includes("change")) {
    const modelName = await initiateModelChange();
    
    if (!modelName) {
      await playAudio('womp2x');
      return { action: 'timeout' };
    }

    const model = await findModelByName(modelName);
    if (model) {
      console.log('Model changed to:', model.name);
      return { action: 'changeModel', model };
    }

    await playAudio('womp2x');
    return { action: 'invalidModel' };
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