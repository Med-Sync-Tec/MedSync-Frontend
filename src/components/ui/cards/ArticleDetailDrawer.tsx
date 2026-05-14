import React, { useEffect } from 'react';
import type { Article } from '@features/news/types';

interface ArticleDetailDrawerProps {
  article: Article | null;
  onClose: () => void;
  /** Si true, el artículo pertenece a la categoría 'Alta Evidencia' del backend */
  isHighEvidence?: boolean;
}

const CATEGORY_MAP: Record<string, string> = {
  enfermedad: 'cardiologia',
  sintoma: 'neurologia',
  tratamiento: 'endocrinologia',
  medicamento: 'farmacologia',
};


const ACCENT_ICON: Record<string, string> = {
  cardiologia: 'favorite',
  farmacologia: 'medication',
  endocrinologia: 'water_drop',
  infecciosas: 'coronavirus',
  neurologia: 'neurology',
  default: 'article',
};

const TAG_BG: Record<string, string> = {
  enfermedad: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  sintoma: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  tratamiento: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medicamento: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

function getConfidence(score: number): { label: string; color: string; bg: string; icon: string } {
  if (score >= 3) return { label: 'Alto', color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: 'signal_cellular_alt' };
  if (score >= 1) return { label: 'Medio', color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: 'signal_cellular_alt_2_bar' };
  return             { label: 'Bajo',  color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: 'signal_cellular_alt_1_bar' };
}

export const ArticleDetailDrawer: React.FC<ArticleDetailDrawerProps> = ({ article, onClose, isHighEvidence = false }) => {
  // Cerrar con Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = article ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [article]);

  if (!article) return null;

  const mainTag    = article.tags?.[0];
  const catKey     = CATEGORY_MAP[mainTag?.tipo ?? ''] || 'default';
  const accentIcon = ACCENT_ICON[catKey]  ?? ACCENT_ICON.default;
  // Confianza: Alta si el backend lo marcó como alta evidencia,
  // Media si tiene tags clínicos, Baja en otro caso
  const confidenceScore = isHighEvidence ? 3 : (article.tags?.length ?? 0) > 0 ? 1 : 0;
  const confidence = getConfidence(confidenceScore);

  const formatDate = () => {
    if (!article.anioPub) return 'Fecha desconocida';
    return article.mesPub ? `${article.mesPub} ${article.anioPub}` : String(article.anioPub);
  };

  return (
    <>
      {/* Backdrop semitransparente */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel flotante — margen en todos los lados, esquinas redondeadas */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={article.titulo}
        className="fixed top-4 bottom-4 right-4 z-50 w-full max-w-[640px] flex flex-col
                   bg-white dark:bg-gray-900
                   rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideInPanel 0.26s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* ── HEADER azul (igual al welcome card) ───────────────────────── */}
        <div
          className="relative flex-shrink-0 px-5 pt-5 pb-6 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--color-welcome-from) 0%, var(--color-welcome-to) 100%)' }}
        >
          {/* Watermark icon */}
          <span
            className="material-symbols-outlined absolute -right-5 -bottom-5 select-none pointer-events-none text-[120px]"
            style={{ color: 'rgba(255,255,255,0.07)' }}
          >
            {accentIcon}
          </span>

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-white text-[18px]">close</span>
          </button>

          {/* Pill de categoría */}
          {mainTag && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full mb-3 tracking-wide">
              <span className="material-symbols-outlined text-[12px]">{accentIcon}</span>
              {mainTag.valor.toUpperCase()}
            </span>
          )}

          {/* Título */}
          <h2 className="text-white font-bold text-base leading-snug pr-8 line-clamp-3">
            {article.titulo}
          </h2>
        </div>

        {/* ── BODY scrollable ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Metadata strip — grid 2 col en pantallas anchas */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 grid grid-cols-2 gap-x-6 gap-y-2">
            {article.revista && (
              <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-[16px] text-gray-400">auto_stories</span>
                <span className="font-medium truncate">{article.revista}</span>
              </span>
            )}
            <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-[16px] text-gray-400">calendar_month</span>
              {formatDate()}
            </span>
            {article.autores && (
              <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 col-span-2">
                <span className="material-symbols-outlined text-[16px] text-gray-400">person</span>
                <span className="truncate">{article.autores}</span>
              </span>
            )}
            {article.tipoPublicacion && (
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 self-center w-fit">
                {article.tipoPublicacion}
              </span>
            )}
          </div>

          {/* ── Confianza + Tags en fila ── */}
          <div className="px-6 pt-5 grid grid-cols-2 gap-4">
            {/* Confianza */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                Nivel de Confianza
              </p>
              <div className={`flex items-center justify-between rounded-xl border px-4 py-3 h-[68px] ${confidence.bg}`}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: confidence.color }}
                  >
                    {confidence.icon}
                  </span>
                  <span className="text-xl font-extrabold" style={{ color: confidence.color }}>
                    {confidence.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {['Alto', 'Medio', 'Bajo'].map((lvl) => (
                    <span
                      key={lvl}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          (confidence.label === 'Alto') ||
                          (confidence.label === 'Medio' && lvl !== 'Alto') ||
                          (confidence.label === 'Bajo' && lvl === 'Bajo')
                            ? confidence.color
                            : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            {(article.tags?.length ?? 0) > 0 ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  Etiquetas Clínicas
                </p>
                <div className="flex flex-wrap gap-1.5 content-start h-[68px] overflow-hidden">
                  {article.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full h-fit ${TAG_BG[tag.tipo] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {tag.valor}
                    </span>
                  ))}
                </div>
              </div>
            ) : <div />}
          </div>

          {/* ── Abstract ── */}
          {article.abstractText && (
            <div className="px-6 pt-5">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1 h-4 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: 'var(--color-welcome-to)' }}
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Resumen del Estudio
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {article.abstractText}
              </p>
            </div>
          )}

          {/* ── Keywords + DOI ── */}
          {(article.keywords || article.doi) && (
            <div className="px-6 pt-4 pb-2 grid grid-cols-2 gap-4">
              {article.keywords && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                    Palabras Clave
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">{article.keywords}</p>
                </div>
              )}
              {article.doi && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                    DOI
                  </p>
                  <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 break-all">{article.doi}</p>
                </div>
              )}
            </div>
          )}

          {/* Spacer bottom */}
          <div className="h-8" />
        </div>

        {/* ── FOOTER con botón PubMed ──────────────────────────────────── */}
        {article.url && (
          <div className="flex-shrink-0 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm
                         transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, var(--color-welcome-from) 0%, var(--color-welcome-to) 100%)' }}
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Ver artículo original en PubMed
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInPanel {
          from { transform: translateX(110%) scale(0.96); opacity: 0; }
          to   { transform: translateX(0)    scale(1);    opacity: 1; }
        }
      `}</style>
    </>
  );
};
