import { useIonRouter } from "@ionic/react";

const CommandList = (
  command: string, 
  navigation: ReturnType<typeof useIonRouter>,
  speak: (text: string) => void
) => {
  const processedCommand = command.toLowerCase().trim();
  
  if (processedCommand.includes("hello")) {
    speak("Hello there! How can I help you?");
  } 
  else if (processedCommand.includes("what's your name") || processedCommand.includes("who are you")) {
    speak("I'm your cute virtual assistant! Nice to meet you!");
  }
  else {
    speak("I didn't understand that command. Can you try again?");
  }
};

export default CommandList;