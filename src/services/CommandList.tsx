import { useIonRouter } from "@ionic/react";
import hello1 from '../Responses/CuteResponse/hello1.wav';
import womp from '../Responses/CuteResponse/womp.wav';
import VoiceService from './VoiceService';

const playSoundForCommand = (command: string): Promise<void> => {
  return new Promise((resolve) => {
    const isHello = command.includes("hello");
    const soundFile = isHello ? hello1 : womp;
    const audio = new Audio(soundFile);
    audio.volume = 0.8;
    audio.preload = 'auto';

    audio.play()
      .then(() => {
        audio.onended = () => resolve();
      })
      .catch(err => {
        console.warn("⚠️ Sound failed to play:", err);
        resolve();
      });
  });
};

const CommandList = async (command: string, navigation: ReturnType<typeof useIonRouter>) => {
  const processed = command.trim().toLowerCase();

  try {
    VoiceService.pauseListening();
    await playSoundForCommand(processed);
    VoiceService.resumeListening();
  } catch (e) {
    console.error("CommandList Error:", e);
    VoiceService.resumeListening();
  }
};

export default CommandList;
