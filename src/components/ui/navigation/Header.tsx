import React from 'react';
import { SearchBar } from '../inputs/SearchBar';
import { IconButton } from '../buttons/IconButton';

type HeaderRole = 'doctor' | 'coo';

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
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
  onNotificationsClick?: () => void;
  onSearch?: (value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  activeLink,
  notificationCount = 0,
  onNotificationsClick,
  onSearch,
}) => {
  const links = navLinks[role];

  return (
    <header className="w-full bg-[#1d2451] text-white px-6 py-3 flex items-center gap-6 shadow-lg">
      <div className="flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined text-2xl text-blue-300">medical_services</span>
        <span className="text-lg font-bold tracking-tight">MedSync</span>
      </div>

      <nav className="flex items-center gap-1">
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

      <div className="flex-1 max-w-xs">
        <SearchBar
          onSearch={onSearch}
          className="[&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder-blue-300"
        />
      </div>

      <div className="relative ml-auto">
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
    </header>
  );
};
