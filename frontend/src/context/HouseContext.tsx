import React, { createContext, useContext, useState, useEffect } from 'react';

export type HouseType = 'ALL' | 'LOK_SABHA' | 'RAJYA_SABHA';

interface HouseContextType {
  selectedHouse: HouseType;
  setSelectedHouse: (house: HouseType) => void;
  houseLabel: string;
  isLokSabha: boolean;
  isRajyaSabha: boolean;
  isAllHouses: boolean;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

export const HouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedHouse, setSelectedHouse] = useState<HouseType>(() => {
    const saved = localStorage.getItem('mplads_selected_house');
    return (saved === 'LOK_SABHA' || saved === 'RAJYA_SABHA' || saved === 'ALL') ? (saved as HouseType) : 'ALL';
  });

  useEffect(() => {
    localStorage.setItem('mplads_selected_house', selectedHouse);
  }, [selectedHouse]);

  const houseLabel = selectedHouse === 'LOK_SABHA' 
    ? 'Lok Sabha' 
    : selectedHouse === 'RAJYA_SABHA' 
    ? 'Rajya Sabha' 
    : 'All Houses';

  return (
    <HouseContext.Provider
      value={{
        selectedHouse,
        setSelectedHouse,
        houseLabel,
        isLokSabha: selectedHouse === 'LOK_SABHA',
        isRajyaSabha: selectedHouse === 'RAJYA_SABHA',
        isAllHouses: selectedHouse === 'ALL',
      }}
    >
      {children}
    </HouseContext.Provider>
  );
};

export const useHouse = (): HouseContextType => {
  const context = useContext(HouseContext);
  if (!context) {
    throw new Error('useHouse must be used within a HouseProvider');
  }
  return context;
};
