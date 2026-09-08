import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import './AuthPages.css';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ההתחברות נכשלה');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">התחברות</h1>
        <p className="auth__subtitle">שמחים לראות אתכם שוב.</p>

        {error && <div className="auth__error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label className="auth__field">
            <span className="auth__label">אימייל</span>
            <input
              className="auth__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              dir="ltr"
              required
            />
          </label>

          <label className="auth__field">
            <span className="auth__label">סיסמה</span>
            <input
              className="auth__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              dir="ltr"
              required
            />
          </label>

          <button
            className="btn btn--primary auth__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'מתחבר…' : 'התחברות'}
          </button>
        </form>

        <p className="auth__switch">
          אין לכם חשבון? <Link to="/register">הרשמה</Link>
        </p>
      </div>
    </div>
  );
}
