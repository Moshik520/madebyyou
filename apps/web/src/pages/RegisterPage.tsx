import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import './AuthPages.css';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים');
      return;
    }

    setSubmitting(true);

    try {
      await signUp(email, password, name.trim() || undefined);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ההרשמה נכשלה');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">הרשמה</h1>
        <p className="auth__subtitle">חשבון חדש, ומתחילים לעצב.</p>

        {error && <div className="auth__error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label className="auth__field">
            <span className="auth__label">שם (אופציונלי)</span>
            <input
              className="auth__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
              dir="ltr"
              minLength={8}
              required
            />
          </label>

          <button
            className="btn btn--primary auth__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'נרשם…' : 'יצירת חשבון'}
          </button>
        </form>

        <p className="auth__switch">
          כבר יש לכם חשבון? <Link to="/login">התחברות</Link>
        </p>
      </div>
    </div>
  );
}
