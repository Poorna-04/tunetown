import { Link, useRouteError } from 'react-router-dom';

export default function RouteErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'The requested page could not load.';

  return (
    <main className="main-content">
      <section className="error-panel" aria-labelledby="route-error-title">
        <h1 id="route-error-title">We could not open this page</h1>
        <p>{message}</p>
        <Link className="button-link" to="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
