import Orb1 from '../images/Orb1.gif';
import Orb2 from '../images/Orb2.gif';
import Orb3 from '../images/Orb3.gif';
import Orb4 from '../images/Orb4.gif';
import JellyFish1 from '../images/JellyFish1.gif';
import JellyFish2 from '../images/JellyFish2.gif';
import JellyFish3 from '../images/JellyFish3.gif';
import JellyFish4 from '../images/JellyFish4.gif';

export interface ImageData {
  id: number;
  name: string;
  src: string;
  searchTerms: string[]; // Added for better voice matching
}

const LOCAL_MODELS: ImageData[] = [
  {
    id: 1,
    name: 'Orb One',
    src: Orb1,
    searchTerms: ['orb one', 'orb 1', 'orb1', 'one', '1']
  },
  {
    id: 2,
    name: 'Orb Two', 
    src: Orb2,
    searchTerms: ['orb two', 'orb 2', 'orb2', 'two', '2']
  },
  {
    id: 3,
    name: 'Orb Three',
    src: Orb3,
    searchTerms: ['orb three', 'orb 3', 'orb3', 'three', '3']
  },
  {
    id: 4,
    name: 'Orb Four',
    src: Orb4,
    searchTerms: ['orb four', 'orb 4', 'orb4', 'four', '4']
  },
  {
    id: 5,
    name: 'Jelly Fish One',
    src: JellyFish1,
    searchTerms: ['jelly fish one', 'jelly 1', 'jellyfish one', 'jelly one']
  },
  // ... similar for other jelly fish models
];

export const fetchAvailableModels = async (): Promise<ImageData[]> => {
  return Promise.resolve(LOCAL_MODELS);
};

export const findModelByName = async (name: string): Promise<ImageData | null> => {
  const models = await fetchAvailableModels();
  const normalizedInput = name.toLowerCase().trim().replace(/\s+/g, ' ');

  // Check against all search terms
  for (const model of models) {
    for (const term of model.searchTerms) {
      if (normalizedInput.includes(term) || term.includes(normalizedInput)) {
        console.log(`Matched "${normalizedInput}" to model "${model.name}" via term "${term}"`);
        return model;
      }
    }
  }

  console.warn(`No model found for "${normalizedInput}"`);
  return null;
};

export const getModelVoiceNames = (): string[] => {
  return LOCAL_MODELS.flatMap(model => model.searchTerms);
};