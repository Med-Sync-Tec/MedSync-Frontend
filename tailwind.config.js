/**
 * Tailwind 4 reads most configuration from CSS (@theme, @plugin, @custom-variant).
 * This file is kept for tools that still expect a config object.
 * Design tokens live in src/index.css.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
