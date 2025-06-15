import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton, useIonRouter
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const haiSound = useRef(new Audio('../Responses/CuteResponse/hai.mp3'));

  // Initialize audio settings
  useEffect(() => {
    haiSound.current.volume = 0.8;
    haiSound.current.preload = 'auto';
  }, []);

  const playHaiSound = () => {
    haiSound.current.currentTime = 0; // Rewind in case it's already playing
    haiSound.current.play()
      .catch(error => console.error("Error playing hai sound:", error));
  };

  const handleVoiceCommand = (command: string) => {
    if (!command) return;
    
    setIsProcessing(true);
    CommandList(command, navigation);
    
    // Special hologram commands
    if (command.includes('hello hologram')) {
      playHaiSound();
    }
    
    // Ready for next command after short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  // Initialize voice service
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(true);
        setPermissionGranted(true);
        
        // Play welcome sound after slight delay
        setTimeout(() => {
          playHaiSound();
        }, 500);
      } catch (error) {
        console.error("Voice initialization failed:", error);
        setIsVoiceActive(false);
      }
    };

    if (isVoiceActive) {
      initializeVoice();
    }

    return () => {
      VoiceService.stopListening();
    };
  }, [isVoiceActive]);

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
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: isVoiceActive ? 
                (isProcessing ? '#FFC107' : '#4CAF50') : '#ccc',
              borderRadius: '50%',
              animation: isVoiceActive ? 'pulse 1.5s infinite' : 'none'
            }}></div>
            {isVoiceActive ? (isProcessing ? 'Processing...' : 'Listening') : 'Voice Off'}
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
            Allow microphone access to enable voice commands
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Hologram;