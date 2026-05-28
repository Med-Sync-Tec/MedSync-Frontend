import React from 'react';
import { Activity } from 'lucide-react';

interface LegalPageShellProps {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalPageShell: React.FC<LegalPageShellProps> = ({
  eyebrow,
  title,
  lastUpdated,
  children,
}) => {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-border-subtle">
        <div className="max-w-[820px] mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="MedSync — Inicio">
            <span
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #7C68FF 0%, #5B4BE8 100%)',
                boxShadow:
                  '0 6px 16px -4px rgba(91,75,232,.45), inset 0 1px 0 rgba(255,255,255,.25)',
              }}
              aria-hidden="true"
            >
              <Activity size={18} strokeWidth={2.5} />
            </span>
            <span className="text-[16px] font-bold tracking-[-0.01em]">
              Med<span className="text-primary">Sync</span>
            </span>
          </a>
          <a
            href="/"
            className="text-[13px] font-semibold text-primary hover:underline underline-offset-[3px]"
          >
            ← Volver al inicio
          </a>
        </div>
      </header>

      <main className="max-w-[820px] mx-auto px-6 sm:px-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 pl-2 mb-5 rounded-full text-[12.5px] font-semibold border bg-primary/[0.08] text-primary border-primary/15">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            style={{ boxShadow: '0 0 0 4px rgba(108,92,252,.18)' }}
            aria-hidden="true"
          />
          {eyebrow}
        </div>

        <h1 className="text-[36px] sm:text-[40px] font-bold leading-[1.1] tracking-[-0.025em] mb-3">
          {title}
        </h1>
        <p className="text-[13.5px] text-text-subtle mb-10">Última actualización: {lastUpdated}</p>

        <div className="prose-content space-y-7 text-[15px] leading-[1.65] text-text-muted">
          {children}
        </div>
      </main>

      <footer className="border-t border-border-subtle mt-12">
        <div className="max-w-[820px] mx-auto px-6 sm:px-10 py-6 flex items-center justify-between text-[12.5px] text-text-subtle">
          <div>© {new Date().getFullYear()} MedSync. Todos los derechos reservados.</div>
          <div className="hidden sm:flex gap-[18px]">
            <a href="/privacidad" className="hover:text-text-muted transition-colors">Privacidad</a>
            <a href="/terminos" className="hover:text-text-muted transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const LegalSection: React.FC<SectionProps> = ({ title, children }) => (
  <section>
    <h2 className="text-[20px] font-bold text-text-primary tracking-[-0.015em] mb-3">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);
