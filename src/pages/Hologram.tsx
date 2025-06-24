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
  const location = useLocation<{ model?: HologramModel }>();
  const navigation = useIonRouter();
  const [selectedModel, setSelectedModel] = useState<HologramModel>(DEFAULT_MODEL);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
      responseTimeoutRef.current = setTimeout(() => {
        setIsResponding(false);
      }, 2000);
    }
  };

  const handleReverseClick = () => {
    setIsReversed(!isReversed);
  };

  const handleVoiceCommand = useCallback(async (command: string) => {
    try {
      setIsResponding(true);

      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }

      await CommandList(command, navigation);

      responseTimeoutRef.current = setTimeout(() => {
        setIsResponding(false);
      }, 2000);
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
        <div className="hologram-center">
          <img
            src={reverseImage}
            alt="Reverse Hologram"
            className="center-image"
            onClick={handleReverseClick}
            onError={(e) => console.error("Failed to load center image")}
          />
          <div className={`reflection-base ${isReversed ? 'reversed' : ''}`}>
            {['top', 'right', 'bottom', 'left'].map((position) => (
              <div
                key={position}
                className={`reflection-image ${position}`}
              >
                <img
                  src={selectedModel.src}
                  alt={`${position} Reflection`}
                  className={isReversed ? 'mirrored' : ''}
                  onError={(e) => (e.currentTarget.src = DEFAULT_MODEL.src)}
                />
              </div>
            ))}
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