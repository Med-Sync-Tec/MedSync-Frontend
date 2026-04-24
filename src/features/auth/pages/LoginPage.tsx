import React, { useState, useEffect } from 'react';
import { RoleSelector } from '@ui/selectors/RoleSelector';
import type { RoleType } from '@ui/selectors/RoleSelector';
import { IconButton } from '@ui/buttons/IconButton';
import { LoginForm } from '@features/auth/components/LoginForm';
import { useTheme } from '@lib/theme';

interface Slide {
  image: string;
  title: React.ReactNode;
  description: string;
}

const SLIDES: Slide[] = [
  {
    image:
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2535&auto=format&fit=crop',
    title: (
      <>
        Sincroniza tus <br />
        operaciones médicas <br />
        sin esfuerzo.
      </>
    ),
    description:
      'Med Sync agiliza los flujos de trabajo clínicos asignando tareas, monitoreando el progreso del paciente y logrando hitos operativos juntos.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2500&auto=format&fit=crop',
    title: (
      <>
        Historiales clínicos <br />
        centralizados en <br />
        la palma de tu mano.
      </>
    ),
    description:
      'Accede a datos en tiempo real de forma segura. Todo tu entorno bajo protocolos médicos e integraciones precisas en un solo lugar.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2500&auto=format&fit=crop',
    title: (
      <>
        Inteligencia Artificial <br />
        conectada contra <br />
        riesgos médicos.
      </>
    ),
    description:
      'Obtén notificaciones inteligentes enlazadas a bases de datos actualizadas para prevenir interacciones farmacéuticas negativas.',
  },
];

const SLIDE_INTERVAL_MS = 6000;

export const LoginPage: React.FC = () => {
  const [role, setRole] = useState<RoleType>('doctor');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:bg-background dark:bg-none min-h-[100dvh] sm:h-[100dvh] w-full overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <main className="w-full max-w-[1200px] flex flex-col lg:flex-row bg-surface rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-200/40 dark:shadow-black/40 h-full max-h-[900px] relative">
        <div className="w-full lg:w-[58%] flex flex-col p-6 sm:p-8 lg:p-10 xl:px-14 xl:py-6 relative z-10 overflow-hidden">
          <div className="w-full flex items-center justify-between shrink-0 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-400/40">
                <span className="material-symbols-outlined text-[20px]">medical_services</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Med<span className="text-indigo-600">Sync</span>
              </span>
            </div>

            <IconButton
              onClick={toggle}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              icon={
                <span className="material-symbols-outlined text-[22px]">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              }
            />
          </div>

          <div className="w-full max-w-[420px] mx-auto flex-1 flex flex-col justify-center gap-5">
            <div className="text-center sm:text-left space-y-1 shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 bg-clip-text text-transparent dark:from-white dark:via-gray-100 dark:to-gray-400">
                ¡Bienvenido de vuelta!
              </h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Ingresa tus credenciales para acceder a tu panel.
              </p>
            </div>

            <div className="shrink-0">
              <RoleSelector role={role} onChange={setRole} />
            </div>

            <div className="shrink-0">
              <LoginForm />
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-[42%] p-4 pl-0 bg-surface">
          <div className="h-full w-full rounded-[2.2rem] overflow-hidden relative bg-black flex flex-col justify-end p-10 xl:p-12">
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-gradient-to-br from-indigo-900 via-blue-900 to-black opacity-90 z-10 pointer-events-none" />
              <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse z-10 pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[100px] opacity-30 mix-blend-screen z-10 pointer-events-none" />

              {SLIDES.map((slide, idx) => (
                <div
                  key={`img-${idx}`}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                    currentSlide === idx ? 'opacity-40 z-0' : 'opacity-0 -z-10'
                  }`}
                  style={{ backgroundImage: `url('${slide.image}')`, mixBlendMode: 'overlay' }}
                />
              ))}
            </div>

            <div className="relative z-20 w-full mb-5" style={{ height: '185px' }}>
              {SLIDES.map((slide, idx) => (
                <div
                  key={`text-${idx}`}
                  className={`absolute bottom-0 left-0 w-full transition-all duration-700 transform ease-out ${
                    currentSlide === idx
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <h2 className="text-3xl xl:text-4xl font-bold mb-3 leading-[1.15] text-white">
                    {slide.title}
                  </h2>
                  <p className="text-sm xl:text-base text-gray-300/80 font-light leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative z-20 flex gap-2 h-6 items-center">
              {SLIDES.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Ir a la diapositiva ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                    currentSlide === idx ? 'w-8 bg-blue-400' : 'w-1.5 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
