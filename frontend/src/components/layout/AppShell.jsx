import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../feedback/ErrorBoundary';
import DeveloperPanel from '../developer/DeveloperPanel';
import Footer from './Footer';
import Header from './Header';
import ToastViewport from '../feedback/ToastViewport';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateShopping } from '../../features/shopping/shoppingSlice';

export default function AppShell() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateShopping());
  }, [dispatch]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="main-content" tabIndex="-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <ToastViewport />
      {import.meta.env.DEV ? <DeveloperPanel /> : null}
    </div>
  );
}
