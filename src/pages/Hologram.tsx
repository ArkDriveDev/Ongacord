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
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const haiSound = useRef(new Audio('../Responses/CuteResponse/hai.mp3'));

  // Initialize audio settings
  useEffect(() => {
    haiSound.current.volume = 0.8;
    haiSound.current.preload = 'auto';
  }, []);

  const handleVoiceCommand = (command: string) => {
    CommandList(command, navigation);
    
    if (command.includes('hello hologram')) {
      playHaiSound();
    }
    if (command.includes('show orb')) {
      // Add navigation logic here if needed
    }
  };

  const playHaiSound = () => {
    haiSound.current.play()
      .catch(error => console.error("Error playing hai sound:", error));
  };

  // Initialize voice service and play welcome sound
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        await VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(true);
        setPermissionGranted(true);
        
        // Play welcome sound after slight delay
        setTimeout(() => {
          playHaiSound();
        }, 300);
      } catch (error) {
        console.error("Voice initialization failed:", error);
        setIsVoiceActive(false);
      }
    };

    initializeVoice();

    return () => {
      VoiceService.stopListening();
    };
  }, []);

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
            {isVoiceActive ? 'Voice Active' : 'Voice Off'}
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

        {isVoiceActive && (
          <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.7rem'
          }}>
            ● Listening for commands
          </div>
        )}

        {!permissionGranted && (
          <div style={{
            position: 'fixed',
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            zIndex: 1000
          }}>
            Allow microphone access to enable voice commands
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Hologram;