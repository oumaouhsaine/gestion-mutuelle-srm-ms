import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Un composant simple pour valider le bon fonctionnement de React Testing Library
const SimpleCounter = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Compteur : {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrementer</button>
    </div>
  );
};

test('incremente le compteur lors du clic sur le bouton', () => {
  render(<SimpleCounter />);
  
  // Vérification de la valeur initiale
  expect(screen.getByText('Compteur : 0')).toBeInTheDocument();
  
  // Simulation du clic sur le bouton
  const button = screen.getByRole('button', { name: /incrementer/i });
  fireEvent.click(button);
  
  // Vérification du changement d'état
  expect(screen.getByText('Compteur : 1')).toBeInTheDocument();
});

