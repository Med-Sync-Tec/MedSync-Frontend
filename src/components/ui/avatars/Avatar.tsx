import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const colorPool = [
  'bg-blue-500',
  'bg-teal-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-green-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-pink-500',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (name.codePointAt(i) ?? 0) + ((hash << 5) - hash);
  return colorPool[Math.abs(hash) % colorPool.length];
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${sizeStyles[size]} ${getColor(name)} ${className}`}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
