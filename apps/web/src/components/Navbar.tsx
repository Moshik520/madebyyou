import { Logo } from './Logo';
import './Logo.css';
import './Navbar.css';

const links = [
  { label: 'דף הבית', href: '#home' },
  { label: 'מוצרים', href: '#products' },
  { label: 'איך זה עובד', href: '#how' },
  { label: 'צור קשר', href: '#contact' },
];

export function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__inner container" aria-label="ניווט ראשי">
        <a className="navbar__brand" href="#home">
          <Logo />
        </a>

        <ul className="navbar__links">
          {links.map((link) => (
            <li key={link.href}>
              <a className="navbar__link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button className="navbar__cta" type="button">
          התחברות
        </button>
      </nav>
    </header>
  );
}
