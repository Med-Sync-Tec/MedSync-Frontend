import React, { useState, useEffect } from 'react';
import { Activity, Moon, Sun, ChevronLeft, ChevronRight, Database, BookOpen, Stethoscope, Sparkles, Clock, ShieldCheck, FileText } from 'lucide-react';
import { LoginForm } from '@features/auth/components/LoginForm';
import { useTheme } from '@lib/theme';

interface FeaturePill {
  icon: React.ReactNode;
  label: string;
}

interface Slide {
  image: string;
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  pills?: FeaturePill[];
}

const SLIDES: Slide[] = [
  {
    image:
      'https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2500&auto=format&fit=crop',
    eyebrow: 'EXPEDIENTE CONECTADO',
    title: (
      <>
        El expediente del <em className="not-italic bg-gradient-to-r from-[#C8BCFF] to-white bg-clip-text text-transparent">hospital</em>, a un clic de tu consulta.
      </>
    ),
    description:
      'MedSync se conecta a la base de datos clínica del hospital para que tengas el contexto del paciente sin duplicar información sensible.',
    pills: [
      { icon: <Database size={14} strokeWidth={2} />, label: 'Datos en BD del hospital' },
      { icon: <Stethoscope size={14} strokeWidth={2} />, label: 'Notas SOAP integradas' },
    ],
  },
  {
    image:
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2535&auto=format&fit=crop',
    eyebrow: 'LITERATURA RELEVANTE',
    title: (
      <>
        Evidencia de <em className="not-italic bg-gradient-to-r from-[#C8BCFF] to-white bg-clip-text text-transparent">PubMed</em>, cruzada con el caso de tu paciente.
      </>
    ),
    description:
      'Sincronizamos artículos científicos desde NCBI y los emparejamos con el contexto clínico para sugerirte lecturas relevantes en segundos.',
    pills: [
      { icon: <BookOpen size={14} strokeWidth={2} />, label: 'Sincronización con PubMed' },
      { icon: <Sparkles size={14} strokeWidth={2} />, label: 'Análisis IA por artículo' },
      { icon: <Clock size={14} strokeWidth={2} />, label: 'Sugerencias en segundos' },
    ],
  },
  {
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2500&auto=format&fit=crop',
    eyebrow: 'ACCESO CONTROLADO',
    title: (
      <>
        Cuentas creadas por <em className="not-italic bg-gradient-to-r from-[#C8BCFF] to-white bg-clip-text text-transparent">administrador</em>, sin registro abierto.
      </>
    ),
    description:
      'Las cuentas se gestionan desde adentro del panel institucional. Cada acceso pasa por Firebase Authentication y respeta el rol asignado.',
    pills: [
      { icon: <ShieldCheck size={14} strokeWidth={2} />, label: 'Autenticación con Firebase' },
      { icon: <FileText size={14} strokeWidth={2} />, label: 'Roles diferenciados' },
    ],
  },
];

const SLIDE_INTERVAL_MS = 6500;

export const LoginPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const goPrev = () => setCurrentSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  const goNext = () => setCurrentSlide((p) => (p + 1) % SLIDES.length);

  return (
    <div className="w-full min-h-screen bg-background grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300">

      {/* ── Left pane: form ── */}
      <section className="relative flex flex-col px-6 sm:px-10 lg:px-14 py-9 bg-background">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group" aria-label="MedSync — Inicio">
            <span
              className="w-10 h-10 rounded-[11px] flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #7C68FF 0%, #5B4BE8 100%)',
                boxShadow:
                  '0 6px 16px -4px rgba(91,75,232,.45), inset 0 1px 0 rgba(255,255,255,.25)',
              }}
              aria-hidden="true"
            >
              <Activity size={22} strokeWidth={2.5} />
            </span>
            <span className="text-[18px] font-bold tracking-[-0.01em] text-text-primary">
              Med<span className="text-primary">Sync</span>
            </span>
          </a>

          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className="w-[38px] h-[38px] rounded-[10px] bg-surface-muted border border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-subtle hover:border-border-strong inline-flex items-center justify-center transition-all"
          >
            {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="w-full max-w-[420px]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 pl-2 mb-[22px] rounded-full text-[12.5px] font-semibold border bg-primary/[0.08] text-primary border-primary/15">
              <span
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{ boxShadow: '0 0 0 4px rgba(108,92,252,.18)' }}
                aria-hidden="true"
              />
              {' '}Plataforma para profesionales de la salud
            </div>

            <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.025em] text-text-primary mb-2.5">
              Bienvenido de vuelta
            </h1>
            <p className="text-[15px] leading-[1.5] text-text-muted mb-8">
              Accede a tu panel clínico para consultar historiales, gestionar pacientes y dar continuidad a tus consultas.
            </p>

            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 text-[12.5px] text-text-subtle pt-6">
          <div>© {new Date().getFullYear()} MedSync. Todos los derechos reservados.</div>
          <div className="hidden sm:flex gap-[18px]">
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-muted transition-colors"
            >
              Privacidad
            </a>
            <a
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-muted transition-colors"
            >
              Términos
            </a>
          </div>
        </div>
      </section>

      {/* ── Right pane: carousel ── */}
      <aside
        className="hidden lg:block relative overflow-hidden text-white"
        style={{
          background:
            'radial-gradient(120% 80% at 100% 0%, rgba(124,104,255,.35) 0%, transparent 55%), radial-gradient(110% 90% at 0% 100%, rgba(60,90,200,.45) 0%, transparent 55%), linear-gradient(135deg, #1B1A4D 0%, #2A2783 40%, #3B3FCF 100%)',
        }}
      >
        <div className="relative h-full">
          {/* Image layers */}
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.eyebrow}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-[900ms] mix-blend-luminosity"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(40,30,120,.4), rgba(15,12,60,.5)), url('${slide.image}')`,
                opacity: currentSlide === idx ? 0.55 : 0,
                filter: 'brightness(.55) saturate(1.1)',
              }}
            />
          ))}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(15,12,60,0) 35%, rgba(15,12,60,.55) 75%, rgba(15,12,60,.85) 100%), linear-gradient(135deg, rgba(108,92,252,.45) 0%, rgba(48,30,140,.45) 100%)',
            }}
          />

          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(60% 60% at 50% 50%, #000 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(60% 60% at 50% 50%, #000 30%, transparent 80%)',
            }}
          />

          {/* Orbs */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 280,
              height: 280,
              background: '#9C7BFF',
              filter: 'blur(40px)',
              opacity: 0.6,
              top: -60,
              right: -40,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 340,
              height: 340,
              background: '#4F8DFC',
              filter: 'blur(40px)',
              opacity: 0.45,
              bottom: -100,
              left: -80,
            }}
          />

          {/* Body */}
          <div className="absolute left-0 right-0 bottom-0 z-10 px-10 pt-8 pb-9">
            {SLIDES.map((slide, idx) => (
              <div
                key={slide.eyebrow}
                className={`transition-all duration-500 ${
                  currentSlide === idx ? 'block opacity-100' : 'hidden opacity-0'
                }`}
              >
                <span
                  className="inline-block px-2.5 py-1 mb-[18px] rounded-md text-[11.5px] font-bold tracking-[0.08em] text-white border border-white/[0.22] backdrop-blur-md"
                  style={{ background: 'rgba(255,255,255,.14)' }}
                >
                  {slide.eyebrow}
                </span>
                <h2 className="text-[38px] font-bold leading-[1.08] tracking-[-0.03em] mb-3.5 max-w-[520px] text-balance">
                  {slide.title}
                </h2>
                <p className="text-[15px] leading-[1.55] text-white/[0.78] max-w-[480px] mb-7">
                  {slide.description}
                </p>
                {slide.pills && (
                  <div className="flex flex-wrap gap-2.5 mb-7">
                    {slide.pills.map((pill) => (
                      <span
                        key={pill.label}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12.5px] font-medium text-white/[0.92] border border-white/[0.16] backdrop-blur-md"
                        style={{ background: 'rgba(255,255,255,.08)' }}
                      >
                        <span className="text-[#C8BCFF]" aria-hidden="true">{pill.icon}</span>
                        {pill.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Foot: dots + nav */}
            <div className="flex items-center justify-between gap-4 mt-3.5">
              <div className="flex gap-2 items-center" role="tablist">
                {SLIDES.map((slide, idx) => (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    role="tab"
                    aria-selected={currentSlide === idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Ir a la diapositiva ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-9 bg-white' : 'w-[22px] bg-white/[0.22] hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Anterior"
                  className="w-[38px] h-[38px] rounded-[10px] border border-white/20 text-white inline-flex items-center justify-center backdrop-blur-md hover:bg-white/[0.16] hover:border-white/30 transition-all"
                  style={{ background: 'rgba(255,255,255,.08)' }}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Siguiente"
                  className="w-[38px] h-[38px] rounded-[10px] border border-white/20 text-white inline-flex items-center justify-center backdrop-blur-md hover:bg-white/[0.16] hover:border-white/30 transition-all"
                  style={{ background: 'rgba(255,255,255,.08)' }}
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
};
