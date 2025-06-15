import { useIonRouter } from "@ionic/react";
import hello1 from '../Responses/CuteResponse/hello1.mp3';
import womp from '../Responses/CuteResponse/womp.mp3';

// Audio instances for commands only
const commandSounds = {
  hello: new Audio(hello1),
  default: new Audio(womp)
};

// Initialize command sounds
Object.values(commandSounds).forEach(sound => {
  sound.volume = 0.8;
  sound.preload = 'auto';
});

const CommandList = (command: string, navigation: ReturnType<typeof useIonRouter>) => {
  const processedCommand = command.toLowerCase().trim();
  
  if (processedCommand.includes("hello")) {
    commandSounds.hello.currentTime = 0;
    commandSounds.hello.play().catch(e => console.error("Hello sound error:", e));
  } else {
    commandSounds.default.currentTime = 0;
    commandSounds.default.play().catch(e => console.error("Default sound error:", e));
  }
};

export default CommandList;