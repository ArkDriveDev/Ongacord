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
  const isHello = processed.includes("hello");
  const sound = isHello ? commandSounds.hello : commandSounds.default;

  try {
    console.log("🔊 Command:", processed, "| Playing:", isHello ? "hello1" : "womp");

    VoiceService.pauseListening();

    sound.onended = () => {
      console.log("✅ Sound ended, resuming voice recognition");
      VoiceService.resumeListening();
    };

    sound.currentTime = 0;
    sound.play().catch((e) => {
      console.error("❌ Audio failed to play:", e);
      VoiceService.resumeListening();
    });

  } catch (e) {
    console.error("CommandList Error:", e);
    VoiceService.resumeListening();
  }
};

export default CommandList;
