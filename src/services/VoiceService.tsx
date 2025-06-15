class VoiceService {
    private recognition: SpeechRecognition | null = null;
    private isListening = false;
  
    constructor() {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true; // Changed to true for continuous listening
        this.recognition.interimResults = false;
        this.recognition.lang = "en-US";
      } else {
        console.error("Speech Recognition not supported in this browser.");
      }
    }
  
    startListening(onResult: (command: string) => void) {
      if (this.recognition && !this.isListening) {
        this.recognition.start();
        this.isListening = true;
  
        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
          onResult(transcript);
          // Don't stop listening here!
        };
  
        this.recognition.onerror = (event: Event) => {
          console.error("Speech recognition error:", (event as SpeechRecognitionErrorEvent).error);
          this.stopListening();
        };
        
        this.recognition.onend = () => {
          // Automatically restart listening if it ended unexpectedly
          if (this.isListening) {
            this.recognition?.start();
          }
        };
      }
    }
  
    stopListening() {
      if (this.recognition && this.isListening) {
        this.isListening = false;
        this.recognition.stop();
      }
    }
}
  
export default new VoiceService();