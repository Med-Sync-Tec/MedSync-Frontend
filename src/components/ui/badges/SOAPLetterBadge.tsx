import React from 'react';

type SOAPSection = 'S' | 'O' | 'A' | 'P';

interface SOAPLetterBadgeProps {
  section: SOAPSection;
  title: string;
  className?: string;
}

const sectionTitles: Record<SOAPSection, string> = {
  S: 'Subjetivo',
  O: 'Objetivo',
  A: 'Análisis',
  P: 'Plan',
};

const sectionColors: Record<SOAPSection, string> = {
  S: 'text-blue-600 dark:text-blue-400',
  O: 'text-teal-600 dark:text-teal-400',
  A: 'text-purple-600 dark:text-purple-400',
  P: 'text-green-600 dark:text-green-400',
};

export const SOAPLetterBadge: React.FC<SOAPLetterBadgeProps> = ({
  section,
  title,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`text-3xl font-black ${sectionColors[section]}`}>{section}</span>
      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{title || sectionTitles[section]}</span>
    </div>
  );
};
