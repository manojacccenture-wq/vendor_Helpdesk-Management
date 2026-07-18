import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.jsx';
import { AppInitGate } from './router/AppInitGate.jsx';

export const App = () => {
  return (
    <AppInitGate>
      <RouterProvider router={router} />
    </AppInitGate>
  );
};
