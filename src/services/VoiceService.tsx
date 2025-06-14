class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    // Handle permission denial
    this.recognition.onerror = (event) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      if (errorEvent.error === "not-allowed") {
        console.error("Microphone access denied by user or browser");
      }
      this.stopListening();
    };
  }

  // ✅ Only call this AFTER user interaction (e.g., button click)
  async startListening(onResult: (command: string) => void): Promise<void> {
    if (!this.recognition || this.isListening) return;

    try {
      // First ensure mic permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.recognition.start();
      this.isListening = true;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        onResult(transcript);
        this.stopListening();
      };

    } catch (err) {
      console.error("Microphone access failed:", err);
      throw new Error("MICROPHONE_ACCESS_DENIED");
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export default new VoiceService();