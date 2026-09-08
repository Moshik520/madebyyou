import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Logo } from './Logo';
import './Logo.css';
import './Navbar.css';

const links = [
  { label: 'דף הבית', to: '/' },
  { label: 'מוצרים', to: '/#products' },
  { label: 'איך זה עובד', to: '/#how' },
];

export function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="navbar">
      <nav className="navbar__inner container" aria-label="ניווט ראשי">
        <Link className="navbar__brand" to="/">
          <Logo />
        </Link>

        <ul className="navbar__links">
          {links.map((link) => (
            <li key={link.to}>
              <Link className="navbar__link" to={link.to}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar__account">
          {loading ? null : user ? (
            <>
              <span className="navbar__user">
                שלום, {user.name ?? user.email}
              </span>
              <button className="navbar__cta" type="button" onClick={signOut}>
                התנתקות
              </button>
            </>
          ) : (
            <Link className="navbar__cta" to="/login">
              התחברות
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
