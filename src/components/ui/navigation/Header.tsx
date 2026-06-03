import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';
import {
  Activity,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuthStore } from '@features/auth/store';
import { ThemeContext } from '@lib/theme/ThemeContext';

type HeaderRole = 'doctor' | 'coo';

interface NavLink {
  label: string;
  href: string;
}

const HOME_BY_ROLE: Record<HeaderRole, string> = {
  doctor: '/doctor/dashboard',
  coo: '/coo/dashboard',
};

const NAV_LINKS: Record<HeaderRole, NavLink[]> = {
  doctor: [
    { label: 'Inicio', href: '/doctor/dashboard' },
    { label: 'Pacientes', href: '/doctor/patients' },
  ],
  coo: [
    { label: 'Inicio', href: '/coo/dashboard' },
    { label: 'Por Medicamento', href: '/coo/medication-news' },
    { label: 'Inventario', href: '/coo/inventory' },
    { label: 'Médicos', href: '/coo/doctors/new' },
  ],
};

interface HeaderProps {
  role: HeaderRole;
  activeLink?: string;
}

const SHELL_STYLES =
  'sticky top-0 z-40 w-full bg-nav-surface/85 backdrop-blur-xl border-b border-nav-border text-nav-foreground';
const INNER_STYLES = 'mx-auto max-w-[1400px] h-16 px-4 sm:px-6 flex items-center gap-4 lg:gap-6';

const NAV_LINK_BASE =
  'relative inline-flex items-center h-9 px-3 rounded-md text-sm font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring';
const NAV_LINK_IDLE = 'text-nav-foreground-muted hover:text-nav-foreground hover:bg-nav-surface-hover';
const NAV_LINK_ACTIVE = 'text-nav-active';

const ICON_BTN_STYLES =
  'relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-nav-foreground-muted hover:text-nav-foreground hover:bg-nav-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring';



function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({
  role,
  activeLink,
}) => {
  const links = NAV_LINKS[role];
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme ?? 'light';
  const toggleTheme = themeCtx?.toggle;

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const location = useLocation();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMobileNavOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const initials = user ? getInitials(user.name) : '';

  return (
    <header className={SHELL_STYLES}>
      <div className={INNER_STYLES}>
        <Link
          to={HOME_BY_ROLE[role]}
          className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-md px-1"
          aria-label="MedSync — Inicio"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white">
            <Activity size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-nav-foreground">MedSync</span>
        </Link>

        <span aria-hidden="true" className="hidden lg:block h-6 w-px bg-nav-border shrink-0" />

        <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => {
            const isActive = activeLink === link.label;
            return (
              <Link
                key={link.label}
                to={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE}`}
              >
                {link.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-3 right-3 -bottom-[13px] h-0.5 rounded-full bg-nav-active"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <GlobalSearch />

        <div className="ml-auto flex items-center gap-1 shrink-0">
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className={`${ICON_BTN_STYLES} hidden sm:inline-flex`}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? (
                <Sun size={18} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Moon size={18} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          )}

          <span aria-hidden="true" className="hidden sm:block h-6 w-px bg-nav-border mx-1" />

          {user && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-10 pl-1 pr-2 rounded-lg hover:bg-nav-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Menú de usuario — ${user.name}`}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-subtle text-primary text-xs font-semibold ring-1 ring-primary/20">
                  {initials}
                </span>
                <span className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-nav-foreground max-w-[140px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-nav-foreground-muted max-w-[140px] truncate">
                    {user.email}
                  </span>
                </span>
                <ChevronDown
                  size={14}
                  strokeWidth={2.25}
                  aria-hidden="true"
                  className={`hidden md:inline text-nav-foreground-muted transition-transform ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Menú de usuario"
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-56 origin-top-right rounded-xl border border-border-subtle bg-surface shadow-popover overflow-hidden"
                >
                  <div className="px-3 py-3 border-b border-border-subtle">
                    <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link
                        to={`/${role}/profile`}
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors"
                        role="menuitem"
                      >
                        <UserIcon size={16} strokeWidth={2} aria-hidden="true" />
                        Perfil
                      </Link>
                    </li>

                  </ul>
                  <div className="border-t border-border-subtle py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-subtle transition-colors"
                    >
                      <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className={`${ICON_BTN_STYLES} lg:hidden`}
            aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? (
              <X size={18} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu size={18} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <nav
          aria-label="Navegación móvil"
          className="lg:hidden border-t border-nav-border bg-nav-surface px-4 py-3 space-y-1"
        >
          {links.map((link) => {
            const isActive = activeLink === link.label;
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileNavOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center h-10 px-3 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-nav-active-subtle text-nav-active'
                    : 'text-nav-foreground-muted hover:bg-nav-surface-hover hover:text-nav-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
};
