import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page-section" aria-labelledby="not-found-title">
      <p className="eyebrow">404</p>
      <h1 id="not-found-title">Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link className="button-link" to="/">
        Return to the shop
      </Link>
    </section>
  );
}
