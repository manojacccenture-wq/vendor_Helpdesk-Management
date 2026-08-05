import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { NotificationProvider } from '../shared/notifications';

export const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </Provider>
  );
};
