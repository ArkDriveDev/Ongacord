import { useIonRouter } from "@ionic/react";
import hello1 from '../Responses/CuteResponse/hello1.wav';
import womp from '../Responses/CuteResponse/womp.wav';
import VoiceService from './VoiceService';

const commandSounds = {
  hello: new Audio(hello1),
  default: new Audio(womp)
};

Object.values(commandSounds).forEach(sound => {
  sound.volume = 0.8;
  sound.preload = 'auto';
});

const CommandList = (command: string, navigation: ReturnType<typeof useIonRouter>) => {
  const processed = command.trim().toLowerCase();
  const sound = processed.includes("hello") ? commandSounds.hello : commandSounds.default;

  try {
    VoiceService.pauseListening(); // Temporarily stop listening

    sound.currentTime = 0;
    sound.play()
      .then(() => {
        // Resume listening after sound ends
        sound.onended = () => {
          VoiceService.resumeListening();
        };
      })
      .catch((e) => {
        console.error("Audio play failed:", e);
        VoiceService.resumeListening(); // Resume anyway
      });
  } catch (e) {
    console.error("CommandList Error:", e);
    VoiceService.resumeListening();
  }
};

export default CommandList;
