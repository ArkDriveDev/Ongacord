class VoiceService {
    private recognition: SpeechRecognition | null = null;
    private isListening = false;
    private isSpeaking = false;
  
    constructor() {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = "en-US";
      } else {
        console.error("Speech Recognition not supported in this browser.");
      }
    }
  
    async startListening(onResult: (command: string) => Promise<void>) {
      if (!this.recognition) {
        throw new Error("Speech recognition not available");
      }
      
      if (this.isListening) return;
      
      this.recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("Recognized:", transcript);
        
        // Pause recognition while processing the command
        this.recognition?.stop();
        this.isListening = false;
        
        try {
          await onResult(transcript);
        } catch (error) {
          console.error("Error handling command:", error);
        } finally {
          // Restart listening after processing
          if (!this.isSpeaking) {
            this.recognition?.start();
            this.isListening = true;
          }
        }
      };
  
      this.recognition.onerror = (event: Event) => {
        console.error("Speech recognition error:", (event as SpeechRecognitionErrorEvent).error);
        this.stopListening();
      };
      
      this.recognition.onend = () => {
        if (this.isListening && !this.isSpeaking) {
          this.recognition?.start();
        }
      };
      
      this.recognition.start();
      this.isListening = true;
    }
  
    stopListening() {
      if (this.recognition && this.isListening) {
        this.isListening = false;
        this.recognition.stop();
      }
    }
    
    setSpeakingState(speaking: boolean) {
      this.isSpeaking = speaking;
      if (!speaking && this.isListening) {
        this.recognition?.start();
      }
    }
}
  
export default new VoiceService();