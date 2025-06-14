import React, { useState } from 'react';
import { IonSearchbar } from '@ionic/react';

const ModelSearch: React.FC = () => {
  const [query, setQuery] = useState('');

  const handleInput = (e: CustomEvent) => {
    const value = e.detail.value || '';
    setQuery(value);
    console.log('Searching for:', value);

  };

  return (
    <IonSearchbar
      style={{ width: '50%',  marginTop: '30px', display: 'block' }}
      value={query}
      onIonInput={handleInput}
      placeholder="Search Model..."
      debounce={300}
    />
  );
};

export default ModelSearch;
