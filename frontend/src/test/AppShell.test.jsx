import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { router } from '../app/router';
import { store } from '../app/store';
import { DeliveryLocationProvider } from '../context/DeliveryLocationContext';
import { SessionProvider } from '../context/SessionContext';
import { ThemeProvider } from '../context/ThemeContext';
import { updateServiceSettings } from '../services/serviceConfig';

afterEach(cleanup);

function renderApp() {
  return render(
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
}

describe('application shell', () => {
  it('renders semantic navigation and one page heading', async () => {
    await router.navigate('/');

    renderApp();

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Beginner guitar kits');
    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument();
  });

  it('redirects a shopper on the cart page to the manager dashboard after switching roles', async () => {
    window.localStorage.clear();
    updateServiceSettings({ minDelay: 0, maxDelay: 0, failureRate: 0 });
    await router.navigate('/cart');
    const view = renderApp();

    fireEvent.click(await view.findByRole('button', { name: /switch to store manager/i }));

    expect(
      await view.findByRole('heading', { level: 1, name: 'Store manager' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/admin/products');
    expect(view.queryByRole('link', { name: /wishlist/i })).not.toBeInTheDocument();
    expect(view.queryByRole('link', { name: /^cart/i })).not.toBeInTheDocument();
  });
});
