import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { router } from '../app/router';
import { store } from '../app/store';
import { DeliveryLocationProvider } from '../context/DeliveryLocationContext';
import { SessionProvider } from '../context/SessionContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('application shell', () => {
  it('renders semantic navigation and one page heading', async () => {
    await router.navigate('/');

    render(
      <Provider store={store}>
        <ThemeProvider>
          <SessionProvider>
            <DeliveryLocationProvider>
              <RouterProvider router={router} />
            </DeliveryLocationProvider>
          </SessionProvider>
        </ThemeProvider>
      </Provider>,
    );

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Beginner guitar kits');
    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument();
  });
});
