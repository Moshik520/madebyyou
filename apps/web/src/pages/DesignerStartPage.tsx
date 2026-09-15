import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { createDesignProject } from '../lib/api';

/**
 * Entry point for "start designing". Creates the project, then redirects to a
 * stable /design/:projectId URL so a refresh resumes the same conversation
 * instead of creating a second project.
 */
export function DesignerStartPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (loading || !user || !slug) return;

    // StrictMode runs effects twice in development — this guard keeps us from
    // creating two projects.
    if (started.current) return;
    started.current = true;

    createDesignProject(slug)
      .then((data) => navigate(`/design/${data.project.id}`, { replace: true }))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'לא הצלחנו לפתוח עיצוב');
      });
  }, [loading, user, slug, navigate]);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section__title">{error}</h1>
          <Link className="btn btn--primary" to="/">
            חזרה לקטלוג
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center' }}>
        <p className="section__subtitle" style={{ marginInline: 'auto' }}>
          פותח עיצוב חדש…
        </p>
      </div>
    </section>
  );
}
