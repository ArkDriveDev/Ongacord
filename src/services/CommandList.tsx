import { useIonRouter } from "@ionic/react";
import hello1 from '../Responses/CuteResponse/hello1.mp3'
import womp from '../Responses/CuteResponse/womp.mp3'
import hai from '../Responses/CuteResponse/hai.mp3'

// Preload audio files
const helloSound = new Audio(hello1);
const defaultSound = new Audio(womp);
const haiSound = new Audio(hai);

// Set volumes
[helloSound, defaultSound, haiSound].forEach(sound => {
  sound.volume = 0.8;
  sound.load(); // Preload the audio files
});

const CommandList = (command: string, navigation: ReturnType<typeof useIonRouter>) => {
  if (command.includes("hello")) {
    helloSound.play().catch(error => console.error("Error playing hello sound:", error));
  } else {
    defaultSound.play().catch(error => console.error("Error playing default sound:", error));
  }
};

export const playHaiSound = () => {
  haiSound.play().catch(error => console.error("Error playing hai sound:", error));
};

export default CommandList;