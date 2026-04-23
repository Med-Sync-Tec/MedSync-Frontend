import React, { useState } from 'react';
import { SearchBar } from '../inputs/SearchBar';
import { IconButton } from '../buttons/IconButton';
import { useAuthStore } from '@features/auth/store';

type HeaderRole = 'doctor' | 'coo';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: Record<HeaderRole, NavLink[]> = {
  doctor: [
    { label: 'Inicio', href: '#' },
    { label: 'Pacientes', href: '#' },
    { label: 'Noticias Guardadas', href: '#' },
  ],
  coo: [
    { label: 'Inicio', href: '#' },
    { label: 'Inventario', href: '#' },
    { label: 'Reportes', href: '#' },
  ],
};

interface HeaderProps {
  role: HeaderRole;
  activeLink?: string;
  notificationCount?: number;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  onSearch?: (value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  activeLink,
  notificationCount = 0,
  showNotifications = true,
  onNotificationsClick,
  onSearch,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navLinks[role];
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="w-full bg-accent text-white shadow-lg">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-2xl text-blue-300">medical_services</span>
          <span className="text-lg font-bold tracking-tight">MedSync</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeLink === link.label
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop searchbar */}
        <div className="hidden lg:block flex-1 max-w-xs">
          <SearchBar
            onSearch={onSearch}
            className="[&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder-blue-300"
          />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {showNotifications && (
            <div className="relative">
              <IconButton
                icon={<span className="material-symbols-outlined text-[22px]">notifications</span>}
                onClick={onNotificationsClick}
                className="bg-white/10 hover:bg-white/20 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                title="Notificaciones"
              />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
          )}

          {user && (
            <>
              <span
                className="hidden md:inline text-sm font-medium text-blue-100 ml-2 mr-1 truncate max-w-[140px]"
                title={user.email}
              >
                {user.name}
              </span>
              <IconButton
                icon={<span className="material-symbols-outlined text-[22px]">logout</span>}
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              />
            </>
          )}

          {/* Hamburger — mobile/tablet only */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 px-4 pb-4 pt-3 flex flex-col gap-2">
          <SearchBar
            onSearch={onSearch}
            className="mb-2 [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder-blue-300"
          />
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeLink === link.label
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
