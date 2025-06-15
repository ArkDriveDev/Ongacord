import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton, useIonRouter
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceService from '../services/VoiceService';
import CommandList from '../services/CommandList';

interface ModelData {
  id: number;
  name: string;
  src: string;
}

interface LocationState {
  model: ModelData;
}

let globalSelectedModel: ModelData | null = null;

const DEFAULT_MODEL = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const location = useLocation<LocationState>();
  const navigation = useIonRouter();
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(globalSelectedModel || DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceActiveRef = useRef(isVoiceActive);

  // Update ref when state changes
  useEffect(() => {
    voiceActiveRef.current = isVoiceActive;
  }, [isVoiceActive]);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    const speakWelcome = async () => {
      await speakResponse("Hello! I'm ready to help!");
    };

    speakWelcome();

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      VoiceService.stopListening();
    };
  }, []);

  const speakResponse = useCallback(async (text: string) => {
    if (!synthRef.current) return;

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      
      utterance.onend = () => {
        VoiceService.setSpeakingState(false);
        resolve();
      };
      
      utterance.onerror = () => {
        VoiceService.setSpeakingState(false);
        resolve();
      };

      VoiceService.setSpeakingState(true);
      synthRef.current?.speak(utterance);
    });
  }, []);

  const handleVoiceCommand = useCallback(async (command: string) => {
    console.log("Processing command:", command);
    await CommandList(command, navigation, speakResponse);
  }, [navigation, speakResponse]);

  // Initialize voice service
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        await VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(true);
        setPermissionGranted(true);
        await speakResponse("Hello! I'm listening!");
      } catch (error) {
        console.error("Voice initialization failed:", error);
        setIsVoiceActive(false);
        setPermissionGranted(false);
        
        // Try again after failure
        setTimeout(() => {
          if (voiceActiveRef.current) {
            initializeVoice();
          }
        }, 2000);
      }
    };

    initializeVoice();

    return () => {
      VoiceService.stopListening();
    };
  }, [handleVoiceCommand]);

  // Handle model changes
  useEffect(() => {
    if (location.state?.model) {
      globalSelectedModel = location.state.model;
      setSelectedModel(location.state.model);
    } else if (!globalSelectedModel) {
      globalSelectedModel = DEFAULT_MODEL;
      setSelectedModel(DEFAULT_MODEL);
    }
  }, [location.state]);

  if (!selectedModel) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/models" text="Back" />
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Loading hologram viewer</h3>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/models" text="Back" />
          </IonButtons>
          <IonTitle>{selectedModel.name}</IonTitle>
          <div slot="end" style={{ 
            color: isVoiceActive ? '#4CAF50' : '#ccc',
            padding: '0 16px',
            fontSize: '0.8rem'
          }}>
            {isVoiceActive ? 'Active' : 'Off'}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <div className="hologram-center">
          <div className="reflection-base">
            <div className="reflection-image top">
              <img src={selectedModel.src} alt="Top" />
            </div>
            <div className="reflection-image right">
              <img src={selectedModel.src} alt="Right" />
            </div>
            <div className="reflection-image bottom">
              <img src={selectedModel.src} alt="Bottom" />
            </div>
            <div className="reflection-image left">
              <img src={selectedModel.src} alt="Left" />
            </div>
          </div>
        </div>

        {!permissionGranted && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            zIndex: 1000,
            textAlign: 'center'
          }}>
            Microphone access required for voice commands
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Hologram;