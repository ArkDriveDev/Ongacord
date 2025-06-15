import { 
  IonContent, IonPage, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonBackButton, useIonRouter
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

// Persistent selected model outside component
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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [scale, setScale] = useState(1);

  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    // First process general commands
    CommandList(command, navigation);
    
    // Then process hologram-specific commands
    if (command.includes('rotate')) {
      const newAngle = rotationAngle + 45;
      setRotationAngle(newAngle);
    }
    else if (command.includes('spin')) {
      setRotationAngle(prev => prev + 180);
    }
    else if (command.includes('zoom in') || command.includes('larger')) {
      setScale(prev => Math.min(prev + 0.2, 2.5));
    }
    else if (command.includes('zoom out') || command.includes('smaller')) {
      setScale(prev => Math.max(prev - 0.2, 0.5));
    }
    else if (command.includes('reset')) {
      setRotationAngle(0);
      setScale(1);
    }
  };

  // Toggle voice control
  const toggleVoiceControl = () => {
    if (isVoiceActive) {
      VoiceService.stopListening();
    } else {
      VoiceService.startListening(handleVoiceCommand);
    }
    setIsVoiceActive(!isVoiceActive);
  };

  // Update model when navigation state changes
  useEffect(() => {
    if (location.state?.model) {
      globalSelectedModel = location.state.model;
      setSelectedModel(location.state.model);
    } else if (!globalSelectedModel) {
      globalSelectedModel = DEFAULT_MODEL;
      setSelectedModel(DEFAULT_MODEL);
    }
    
    // Clean up voice recognition on unmount
    return () => {
      VoiceService.stopListening();
    };
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

  // Apply rotation and scale transforms
  const imageStyle = {
    transform: `rotate(${rotationAngle}deg) scale(${scale})`,
    transition: 'transform 0.3s ease'
  };

  return (
    <IonPage style={{ backgroundColor: 'black' }}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/models" text="Back" />
          </IonButtons>
          <IonTitle>{selectedModel.name}</IonTitle>
          <IonButtons slot="end">
            <button 
              onClick={toggleVoiceControl}
              style={{
                background: 'transparent',
                border: 'none',
                color: isVoiceActive ? '#4CAF50' : 'white',
                fontSize: '24px',
                padding: '10px',
                cursor: 'pointer'
              }}
              aria-label={isVoiceActive ? 'Stop listening' : 'Start listening'}
            >
              🎤
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="hologram-container">
        <div className="hologram-center">
          <div className="reflection-base">
            <div className="reflection-image top" style={imageStyle}>
              <img src={selectedModel.src} alt="Top" />
            </div>
            <div className="reflection-image right" style={imageStyle}>
              <img src={selectedModel.src} alt="Right" />
            </div>
            <div className="reflection-image bottom" style={imageStyle}>
              <img src={selectedModel.src} alt="Bottom" />
            </div>
            <div className="reflection-image left" style={imageStyle}>
              <img src={selectedModel.src} alt="Left" />
            </div>
          </div>
        </div>

        {isVoiceActive && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#ff3b30',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite'
            }}></div>
            Listening...
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Hologram;