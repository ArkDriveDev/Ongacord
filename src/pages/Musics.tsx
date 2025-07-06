import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle
} from '@ionic/react';
import './Musics.css';

// Audio files
import Music1 from '../Musics/Bumble bee.mp3';
import Music2 from '../Musics/Chicken Dance.mp3';
import Music3 from '../Musics/Pretty little baby.mp3';
import Music4 from '../Musics/See tin.mp3';

// Images
import MusicImage from '../images/Music.png';

// Components
import ModelSearch from '../components/ModelsProps/ModelSearch';
import MusicPassBackward from '../components/MusicsProps/MusicPassBackward';
import MusicRestartButton from '../components/MusicsProps/MusicRestartButton';
import MusicPlayButton from '../components/MusicsProps/MusicPlayButton';
import MusicPassforward from '../components/MusicsProps/MusicPassforward';
import MusicRepeatButton from '../components/MusicsProps/MusicRepeatButton';
import MusicPlayAll from '../components/MusicsProps/MusicPlayAll';
import MusicSpectrum from '../components/MusicsProps/MusicSpectrum';

interface MusicItem {
  id: number;
  title: string;
  audioSrc: string;
  isPlaying: boolean;
}

const Musics: React.FC = () => {
  const audioRefs = [
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null),
    useRef<HTMLAudioElement>(null)
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [centeredCard, setCenteredCard] = useState<number | null>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [musicItems, setMusicItems] = useState<MusicItem[]>([
    { id: 1, title: 'Bumble Bee', audioSrc: Music1, isPlaying: false },
    { id: 2, title: 'Chicken Dance', audioSrc: Music2, isPlaying: false },
    { id: 3, title: 'Pretty Little Baby', audioSrc: Music3, isPlaying: false },
    { id: 4, title: 'See Tinh', audioSrc: Music4, isPlaying: false },
  ]);

  const [filteredMusicItems, setFilteredMusicItems] = useState<MusicItem[]>(musicItems);

  // Debounce function for smoother scroll handling
  const debounce = (func: Function, timeout = 100) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = debounce(() => {
      const containerCenter = container.offsetWidth / 2;
      const cards = Array.from(container.querySelectorAll('.music-card'));

      let closestCardId: number | null = null;
      let closestDistance = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestCardId = Number(card.getAttribute('data-id'));
        }
      });

      if (closestCardId !== centeredCard) {
        setCenteredCard(closestCardId);
      }
    });

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [centeredCard]);

  const handleSearch = (query: string) => {
    const filtered = musicItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMusicItems(filtered);
  };

  useEffect(() => {
    setFilteredMusicItems(musicItems);
  }, [musicItems]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const restartMusic = (id: number) => {
    const audioRef = audioRefs[id - 1].current;
    if (audioRef) {
      audioRef.currentTime = 0;
      if (musicItems.find(item => item.id === id)?.isPlaying) {
        audioRef.play().catch(console.error);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Musics</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <ModelSearch onSearch={handleSearch} />

        <div
          className={`music-container ${isDragging ? 'grabbing' : ''}`}
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="music-scroll-row">
            {/* Empty spacer for initial centering */}
            <div style={{ minWidth: 'calc(50vw - 40%)' }} />

            {filteredMusicItems.map((item, index) => (
              <div key={item.id} className="music-col">
                <IonCard
                  className={`music-card ${centeredCard === item.id ? 'snap-center' : ''}`}
                  data-id={item.id}
                >
                  <img
                    src={MusicImage}
                    className="music-image"
                    alt={item.title}
                  />
                  <IonCardHeader>
                    <IonCardTitle>{item.title}</IonCardTitle>
                  </IonCardHeader>
                  <audio ref={audioRefs[index]} src={item.audioSrc} />
                </IonCard>
              </div>
            ))}

            {/* Empty spacer for final centering */}
            <div style={{ minWidth: 'calc(50vw - 40%)' }} />
          </div>
        </div>

        {/* Slimmer Player Card */}
        <IonCard className="music-player-card">
          <div className="ion-padding">
            <div className="player-controls">
              <MusicPassBackward />
              <MusicRestartButton />
              <MusicPlayButton />
              <MusicPassforward />
              <MusicRepeatButton />
            </div>
            <div className="player-bottom-row">
              <MusicPlayAll />
              <MusicSpectrum />
            </div>
          </div>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Musics;