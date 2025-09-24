'use client';
import { useEffect } from 'react';
import './fish.css';

export default function Aquarium() {
  useEffect(() => {
    Promise.all([
      import('./Fish.jsx'),
      import('./BackgroundFish.jsx')
    ]).then(([fishModule, backgroundModule]) => {
      const FishController = fishModule.default;
      const BackgroundFishController = backgroundModule.default;
      new FishController();
      new BackgroundFishController();
    });
  }, []);

  return (
    <div className="aquarium">
      <div className="background-layer sub-bg"></div>
      
      {/* Background fish container */}
      <div className="background-fish-container">
        {[...Array(10)].map((_, index) => (
          <div key={`bg-${index}`} className="background-fish">
            <div className="fish-wrapper">
              <img src={`/fish/fish${(index % 10) + 1}.png`} alt="Background Fish" />
            </div>
          </div>
        ))}
      </div>

      <div className="background-layer main-bg"></div>
      
      {/* Interactive fish container */}
      <div className="fish-container">
        {[...Array(20)].map((_, index) => (
          <div key={index} className="fish">
            <div className="fish-wrapper">
              <img src={`/fish/fish${(index % 20) + 1}.png`} alt="Fish" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}