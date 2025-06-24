import {
  IonContent, IonPage, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonBackButton, useIonRouter,
  useIonViewWillEnter, useIonViewWillLeave
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import './Hologram.css';
import Orb1 from '../images/Orb1.gif';
import VoiceService from '../services/VoiceService';
import CommandList from '../services/CommandList';
import hello from '../Responses/CuteResponse/hello1.ogg';
import reverseImage from '../images/reverse.png';

interface HologramModel {
  id: number;
  name: string;
  src: string;
}

const DEFAULT_MODEL: HologramModel = {
  id: 1,
  name: 'Orb 1',
  src: Orb1
};

const Hologram: React.FC = () => {
  const [isReversed, setIsReversed] = useState(false);
  const location = useLocation<{ model?: HologramModel }>();
  const navigation = useIonRouter();
  const [selectedModel, setSelectedModel] = useState<HologramModel>(DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe model loading
  useEffect(() => {
    if (location.state?.model) {
      setSelectedModel(location.state.model);
    }
  }, [location.state]);

  const playHelloSound = () => {
    if (audioRef.current) {
      setIsResponding(true);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio play error:", e));

      // Set timeout to match hello sound duration
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
      responseTimeoutRef.current = setTimeout(() => {
        setIsResponding(false);
      }, 2000); // Adjust to match your hello sound length
    }
  };

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      // Activate response effect
      setIsResponding(true);

      // Clear any previous timeout
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }

      // Process command and play sound
      await CommandList(command, navigation);

      // Set timeout to deactivate effect after response completes
      responseTimeoutRef.current = setTimeout(() => {
        setIsResponding(false);
      }, 2000); // Match this with your longest sound duration
    } catch (error) {
      console.error("Command error:", error);
      setIsResponding(false);
    }
  }, [navigation]);

  useIonViewWillEnter(() => {
    audioRef.current = new Audio(hello);
    audioRef.current.preload = 'auto';

    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);

        const started = await VoiceService.startListening(handleVoiceCommand);
        setIsVoiceActive(started);

        if (started) {
          playHelloSound();
        }
      } catch (error) {
        console.error("Voice init error:", error);
        setPermissionGranted(false);
        setIsVoiceActive(false);
      }
    };
    initialize();

    // Set up audio event listeners
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsResponding(false);
      };
      audioRef.current.onplay = () => {
        setIsResponding(true);
      };
    }
  });

  useIonViewWillLeave(() => {
    VoiceService.stopListening();
    setIsVoiceActive(false);
    setIsResponding(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
  });

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
        <div className={`hologram-center ${isResponding ? 'pulse-effect' : ''}`}>
          <img
            src={reverseImage}
            alt="Center Hologram"
            className="center-image"
            onError={(e) => console.error("Failed to load center image")}
          />
          <div className="reflection-base">
            <div className="reflection-image top">
              <img
                src={selectedModel.src}
                alt="Top Reflection"
                onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
              />
            </div>
            <div className="reflection-image right">
              <img
                src={selectedModel.src}
                alt="Right Reflection"
                onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
              />
            </div>
            <div className="reflection-image bottom">
              <img
                src={selectedModel.src}
                alt="Bottom Reflection"
                onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
              />
            </div>
            <div className="reflection-image left">
              <img
                src={selectedModel.src}
                alt="Left Reflection"
                onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
              />
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