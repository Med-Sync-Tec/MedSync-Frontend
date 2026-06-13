import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { Article } from '@features/news/types';
import { useEspecialidades, useMatchingPatients } from '@features/matching/queries';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';
import { useAuthStore } from '@features/auth/store';

interface ArticleDetailDrawerProps {
  article: Article | null;
  onClose: () => void;
  /** Si true, el artículo pertenece a la categoría 'Alta Evidencia' del backend */
  isHighEvidence?: boolean;
  /** Si el artículo está guardado por el usuario actual */
  saved?: boolean;
  /** Callback para guardar/desguardar el artículo */
  onSave?: (e?: React.MouseEvent) => void;
  /** Slot para renderizar el botón "Analizar con IA" (viene del padre para respetar la regla ui→features) */
  analyzeButton?: React.ReactNode;
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

export const ArticleDetailDrawer: React.FC<ArticleDetailDrawerProps> = ({
  article,
  onClose,
  isHighEvidence = false,
  saved = false,
  onSave,
  analyzeButton,
}) => {
  const { byId: especialidadesById } = useEspecialidades();
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === 'DOCTOR';
  const { data: patients } = useMatchingPatients(article?.id, isDoctor);
  const [expanded, setExpanded] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    globalThis.addEventListener('keydown', fn);
    return () => globalThis.removeEventListener('keydown', fn);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = article ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [article]);

  if (!article) return null;

  const specialtyVisual = specialtyVisualById(article.especialidadId, especialidadesById);

  const mainTag    = article.tags?.[0];
  const catKey     = CATEGORY_MAP[mainTag?.tipo ?? ''] || 'default';
  const accentIcon = ACCENT_ICON[catKey] ?? ACCENT_ICON.default;
  
  // Confianza: Alta si el backend lo marcó como alta evidencia,
  // Media si tiene tags clínicos, Baja en otro caso
  const hasTags = (article.tags?.length ?? 0) > 0;
  const confidenceScore = isHighEvidence ? 3 : hasTags ? 1 : 0;
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
      <dialog
        open
        aria-modal="true"
        aria-label={article.titulo}
        className="fixed top-4 bottom-4 right-4 z-50 w-full max-w-[640px] flex flex-col
                   bg-white dark:bg-gray-900
                   rounded-2xl shadow-2xl overflow-hidden p-0 border-0"
        style={{ animation: 'slideInPanel 0.26s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* ── HEADER de especialidad ───────────────────────── */}
        <div
          className={`relative flex-shrink-0 px-5 pt-5 pb-6 overflow-hidden ${specialtyVisual.sidebar}`}
        >
          {/* Watermark icon */}
          <span
            className="material-symbols-outlined absolute -right-5 -bottom-5 select-none pointer-events-none text-[120px]"
            style={{ color: 'rgba(255,255,255,0.07)' }}
          >
            {specialtyVisual.Icon ? <specialtyVisual.Icon size={120} strokeWidth={1} /> : accentIcon}
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

          {/* ── Pacientes Relacionados (sólo doctores) ── */}
          {isDoctor && patients && patients.length > 0 && (
            <div className="px-6 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                Pacientes Relacionados
              </p>
              <div className="flex flex-wrap gap-2">
                {(expanded ? patients : patients.slice(0, 5)).map((p) => {
                  const initials = p.nombre
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  return (
                    <Link
                      key={p.id}
                      to={`/patients/${p.id}/history`}
                      title={p.nombre}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary hover:text-white transition-colors"
                    >
                      {initials}
                    </Link>
                  );
                })}
                {!expanded && patients.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    +{patients.length - 5}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Abstract ── */}
          {article.abstractText && (
            <div className="px-6 pt-5">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-1 h-4 rounded-full inline-block shrink-0 ${specialtyVisual.sidebar}`}
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

        {/* ── FOOTER: guardar + analizar + PubMed ─────────────────────── */}
        {(onSave || analyzeButton || article.url) && (
          <div className="flex-shrink-0 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
            {/* Fila de acciones */}
            {(onSave || analyzeButton) && (
              <div className="flex items-center gap-2">
                {onSave && (
                  <button
                    type="button"
                    onClick={onSave}
                    className={`inline-flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors focus:outline-none ${
                      saved
                        ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                        : 'bg-surface border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {saved
                      ? <BookmarkCheck size={15} aria-hidden="true" />
                      : <Bookmark size={15} aria-hidden="true" />
                    }
                    {saved ? 'Guardado' : 'Guardar'}
                  </button>
                )}
                {analyzeButton && (
                  <div className="flex-1">{analyzeButton}</div>
                )}
              </div>
            )}
            {/* Enlace a PubMed */}
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 active:scale-[0.98] ${specialtyVisual.sidebar}`}
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                {' '}Ver artículo original en PubMed
              </a>
            )}
          </div>
        )}
      </dialog>

      <style>{`
        @keyframes slideInPanel {
          from { transform: translateX(110%) scale(0.96); opacity: 0; }
          to   { transform: translateX(0)    scale(1);    opacity: 1; }
        }
      `}</style>
    </>
  );
};
