class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResultCallback: ((command: string) => void) | null = null;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Continuous listening
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";
    } else {
      console.error("Speech Recognition not supported in this browser.");
    }
  }

  startListening(onResult: (command: string) => void) {
    if (!this.recognition || this.isListening) return;

    this.onResultCallback = onResult;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      this.pauseListening(); // Pause mic so the sound can play
      if (this.onResultCallback) {
        this.onResultCallback(transcript);
      }
    };

    this.recognition.onerror = (event: Event) => {
      console.error("Speech recognition error:", (event as SpeechRecognitionErrorEvent).error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      // Do not auto-restart here — control it manually after audio ends
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
  }

  pauseListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop(); // onend will be triggered
      this.isListening = false;
    }
  }

  resumeListening() {
    if (this.recognition && !this.isListening && this.onResultCallback) {
      this.startListening(this.onResultCallback);
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
