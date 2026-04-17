import React, { useState, useEffect } from 'react';
import { RoleSelector } from '../../components/ui/selectors/RoleSelector';
import type { RoleType } from '../../components/ui/selectors/RoleSelector';
import { IconButton } from '../../components/ui/buttons/IconButton';
import { LoginForm } from '../../components/auth/LoginForm';

// Data para el Carousel
interface Slide {
  image: string;
  title: React.ReactNode;
  description: string;
}

const slides: Slide[] = [
  {
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2535&auto=format&fit=crop",
    title: <>Sincroniza tus <br />operaciones médicas <br />sin esfuerzo.</>,
    description: "Med Sync agiliza los flujos de trabajo clínicos asignando tareas, monitoreando el progreso del paciente y logrando hitos operativos juntos."
  },
  {
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2500&auto=format&fit=crop",
    title: <>Historiales clínicos <br />centralizados en <br />la palma de tu mano.</>,
    description: "Accede a datos en tiempo real de forma segura. Todo tu entorno bajo protocolos médicos e integraciones precisas en un solo lugar."
  },
  {
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2500&auto=format&fit=crop",
    title: <>Inteligencia Artificial <br />conectada contra <br />riesgos médicos.</>,
    description: "Obtén notificaciones inteligentes enlazadas a bases de datos actualizadas para prevenir interacciones farmacéuticas negativas."
  }
];

export const Login: React.FC = () => {
  const [role, setRole] = useState<RoleType>('doctor');
  const [isDark, setIsDark] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Lógica de autoplay del carousel (cambia cada 6s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    // 'h-[100dvh] overflow-hidden' en el contenedor principal anula matemáticamente el scroll de página.
    <div className="bg-gray-50 dark:bg-[#0f172a] min-h-[100dvh] sm:h-[100dvh] w-full overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      
      {/* La tarjeta tomará exactamente el 100% del espacio disponible tras el padding. */}
      <main className="w-full max-w-[1500px] flex flex-col lg:flex-row bg-white dark:bg-[#1e293b] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl h-full max-h-[960px] relative">
        
        {/* Panel Izquierdo (Formulario) */}
        {/* Redujimos xl:py-16 a xl:py-8 para dar más espacio al contenido y no aplastar el Footer */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-10 lg:p-12 xl:px-24 xl:py-10 relative z-10 overflow-y-auto lg:overflow-y-hidden custom-scrollbar">
          
          <div className="w-full flex items-center justify-between shrink-0 mb-4 lg:mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <span className="material-symbols-outlined text-2xl font-bold">medical_services</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Med Sync
              </span>
            </div>
            
            <IconButton 
              onClick={toggleDarkMode}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              icon={
                <span className="material-symbols-outlined text-[22px]">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              }
            />
          </div>

          <div className="w-full max-w-[460px] mx-auto flex-1 flex flex-col justify-center py-2 h-full">
            <div className="text-center sm:text-left space-y-1 mb-6 shrink-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                ¡Bienvenido!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base font-medium">
                Por favor ingresa tus datos para iniciar sesión.
              </p>
            </div>

            <div className="shrink-0 mb-4">
              <RoleSelector role={role} onChange={setRole} />
            </div>
            
            <div className="shrink-0">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Panel Derecho (Carrusel de Imagen) */}
        <div className="hidden lg:block w-1/2 p-4 pl-0 bg-white dark:bg-[#1e293b]">
          <div className="h-full w-full rounded-[2.2rem] overflow-hidden relative bg-black flex flex-col justify-end p-12 xl:p-16">
            
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-gradient-to-br from-indigo-900 via-blue-900 to-black opacity-90 z-10 pointer-events-none"></div>
              <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse z-10 pointer-events-none"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[100px] opacity-30 mix-blend-screen z-10 pointer-events-none"></div>
              
              {/* Fotos del carrusel difuminadas */}
              {slides.map((slide, idx) => (
                <div 
                  key={`img-${idx}`}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-40 z-0' : 'opacity-0 -z-10'}`}
                  style={{ backgroundImage: `url('${slide.image}')`, mixBlendMode: 'overlay' }}
                />
              ))}
            </div>
            
            {/* Textos del carrusel */}
            <div className="relative z-20 w-full mb-6" style={{ height: '220px' }}>
              {slides.map((slide, idx) => (
                <div 
                  key={`text-${idx}`}
                  className={`absolute bottom-0 left-0 w-full transition-all duration-700 transform ease-out ${
                    currentSlide === idx 
                      ? 'opacity-100 translate-y-0 translate-x-0 pointer-events-auto' 
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-[1.15] text-white">
                    {slide.title}
                  </h2>
                  <p className="text-base xl:text-lg text-gray-300 font-light leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Controles (Puntitos) del carrusel */}
            <div className="relative z-20 flex gap-3 h-8 items-center cursor-pointer">
              {slides.map((_, idx) => (
                <button 
                  key={`dot-${idx}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Ir a la diapositiva ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                    currentSlide === idx ? 'w-10 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/70'
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
