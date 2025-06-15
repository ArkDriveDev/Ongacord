import { useIonRouter } from "@ionic/react";

// Preload audio files
const helloSound = new Audio('../Responses/CuteResponse/hello1.mp3');
const defaultSound = new Audio('../Responses/CuteResponse/womp.mp3');
const haiSound = new Audio('../Responses/CuteResponse/hai.mp3');

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