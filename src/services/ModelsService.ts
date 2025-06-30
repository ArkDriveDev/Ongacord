// src/services/ModelsService.ts
export interface ImageData { 
  id: number;
  name: string;
  src: string;
}

const LOCAL_MODELS: ImageData[] = [
  { id: 1, name: 'Orb 1', src: require('../images/Orb1.gif') },
  { id: 2, name: 'Orb 2', src: require('../images/Orb2.gif') },
  { id: 3, name: 'Orb 3', src: require('../images/Orb3.gif') },
  { id: 4, name: 'Orb 4', src: require('../images/Orb4.gif') },
  { id: 5, name: 'Jelly Fish 1', src: require('../images/JellyFish1.gif') },
  { id: 6, name: 'Jelly Fish 2', src: require('../images/JellyFish2.gif') },
  { id: 7, name: 'Jelly Fish 3', src: require('../images/JellyFish3.gif') },
  { id: 8, name: 'Jelly Fish 4', src: require('../images/JellyFish4.gif') },
];

export const fetchAvailableModels = async (): Promise<ImageData[]> => {
  return Promise.resolve(LOCAL_MODELS);
};

export const findModelByName = async (name: string): Promise<ImageData | null> => {
  const models = await fetchAvailableModels();
  const normalizedInput = name.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = models.find(m => m.name.toLowerCase() === normalizedInput);
  if (exactMatch) return exactMatch;
  
  // Then try partial match
  return models.find(m => 
    m.name.toLowerCase().includes(normalizedInput)
  ) || null;
};

export const getModelVoiceNames = (): string[] => {
  return LOCAL_MODELS.flatMap(model => [
    model.name.toLowerCase(),
    ...model.name.toLowerCase().split(' '),
    model.id.toString()
  ]);
};