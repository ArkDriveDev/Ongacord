import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg,
  IonButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModelSearch from '../components/ModelsProps/ModelSearch';

interface ImageData {
  id: number;
  name: string;
  src: string;
}

// Predefined list of images (can be moved to a separate config file)
const IMAGE_MANIFEST = [
  { filename: 'Orb1.gif', displayName: 'Orb 1' },
  { filename: 'Orb2.gif', displayName: 'Orb 2' },
  { filename: 'Orb3.gif', displayName: 'Orb 3' },
  { filename: 'Orb4.gif', displayName: 'Orb 4' },
  { filename: 'JellyFish1.gif', displayName: 'Jelly Fish 1' },
  { filename: 'JellyFish2.gif', displayName: 'Jelly Fish 2' },
  { filename: 'JellyFish3.gif', displayName: 'Jelly Fish 3' },
  { filename: 'JellyFish4.gif', displayName: 'Jelly Fish 4' },
];

const Models: React.FC = () => {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [allImages, setAllImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const loadedImages = await Promise.all(
          IMAGE_MANIFEST.map(async (img, index) => {
            try {
              // Dynamically import each image
              const src = (await import(`../images/${img.filename}`)).default;
              return {
                id: index + 1,
                name: img.displayName,
                src
              };
            } catch (error) {
              console.error(`Error loading ${img.filename}:`, error);
              return null;
            }
          })
        );
        
        setAllImages(loadedImages.filter(Boolean) as ImageData[]);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, []);

  const filteredImages = allImages.filter(image =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFromGallery = async () => {
    // Your implementation for adding from gallery
    const newImage = {
      id: Date.now(),
      name: `Custom ${allImages.length + 1}`,
      src: 'path/to/uploaded/image' // Set this from your image picker
    };
    setAllImages(prev => [...prev, newImage]);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>3D Models</IonTitle>
          <IonButton slot="end" onClick={handleAddFromGallery}>
            Add from Gallery
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <ModelSearch onSearch={setSearchQuery} />
        
        <IonGrid style={{ paddingTop: '20px' }}>
          {filteredImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No models found</h3>
            </div>
          ) : (
            Array.from({ length: Math.ceil(filteredImages.length / 4) }).map((_, rowIndex) => (
              <IonRow key={rowIndex}>
                {filteredImages.slice(rowIndex * 4, rowIndex * 4 + 4).map((image) => (
                  <IonCol size="6" size-md="3" key={image.id}>
                    <IonCard 
                      button 
                      onClick={() => history.push(`/model-detail/${image.id}`)}
                      style={{ 
                        height: '100%',
                        margin: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <IonCardContent style={{ textAlign: 'center' }}>
                        <IonImg 
                          src={image.src} 
                          alt={image.name}
                          style={{ 
                            width: '100%', 
                            height: '150px', 
                            objectFit: 'contain',
                            padding: '10px'
                          }}
                        />
                        <h3 style={{ 
                          margin: '10px 0 5px',
                          fontSize: '1rem',
                          color: '#333'
                        }}>{image.name}</h3>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            ))
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Models;