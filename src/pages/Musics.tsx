import React, { useState, useRef } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonRow, IonCol, IonGrid 
} from '@ionic/react';
import { play, pause } from 'ionicons/icons';

// Import audio files (verify paths are correct!)
import Music1 from '../Musics/Bumble bee.mp3';
import Music2 from '../Musics/Chicken Dance.mp3';
import Music3 from '../Musics/Pretty little baby.mp3';
import Music4 from '../Musics/See tin.mp3';

// Import default music image
import MusicImage from '../images/Music.png';

interface MusicItem {
  id: number;
  title: string;
  audioSrc: string;
  isPlaying: boolean;
}

const Musics: React.FC = () => {
  // Audio refs for each track
  const audioRefs = [
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null)
  ];

  // Music data state
  const [musicItems, setMusicItems] = useState<MusicItem[]>([
    { id: 1, title: 'Bumble Bee', audioSrc: Music1, isPlaying: false },
    { id: 2, title: 'Chicken Dance', audioSrc: Music2, isPlaying: false },
    { id: 3, title: 'Pretty Little Baby', audioSrc: Music3, isPlaying: false },
    { id: 4, title: 'See Tinh', audioSrc: Music4, isPlaying: false },
  ]);

  const togglePlay = (id: number) => {
    setMusicItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          // Toggle play/pause for clicked item
          const audioRef = audioRefs[id-1].current;
          if (!item.isPlaying) {
            // Stop all other tracks
            prevItems.forEach((otherItem, index) => {
              if (otherItem.id !== id && audioRefs[index].current) {
                audioRefs[index].current?.pause();
              }
            });
            // Play this track
            audioRef?.play().catch(error => 
              console.error('Audio playback failed:', error)
            );
          } else {
            // Pause this track
            audioRef?.pause();
          }
          return { ...item, isPlaying: !item.isPlaying };
        }
        // Mark other tracks as not playing
        return { ...item, isPlaying: false };
      })
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Musics</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div className="music-container">
          <IonGrid>
            <IonRow>
              {musicItems.map((item, index) => (
                <IonCol key={item.id} size="6" sizeMd="4" sizeLg="3">
                  <IonCard className="music-card">
                    <img 
                      alt="Music cover" 
                      src={MusicImage} 
                      style={{ width: '100%', padding: '10px' }} 
                    />
                    <IonCardHeader>
                      <IonCardTitle>{item.title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonButton 
                        expand="block" 
                        onClick={() => togglePlay(item.id)}
                        color={item.isPlaying ? 'danger' : 'success'}
                      >
                        <IonIcon 
                          slot="start" 
                          icon={item.isPlaying ? pause : play} 
                        />
                        {item.isPlaying ? 'Pause' : 'Play'}
                      </IonButton>
                      <audio
                        ref={audioRefs[index]}
                        src={item.audioSrc}
                        onEnded={() => togglePlay(item.id)}
                        onError={(e) => console.error('Audio error:', e)}
                      />
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Musics;