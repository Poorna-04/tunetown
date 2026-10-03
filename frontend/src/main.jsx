import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { store } from './app/store';
import { DeliveryLocationProvider } from './context/DeliveryLocationContext';
import { SessionProvider } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('TuneTown could not find the root element.');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <SessionProvider>
          <DeliveryLocationProvider>
            <RouterProvider router={router} />
          </DeliveryLocationProvider>
        </SessionProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
