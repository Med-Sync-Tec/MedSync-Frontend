import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Sparkles, Bookmark, User as UserIcon, BookOpen, AlertCircle } from 'lucide-react';
import { usePatients } from '@features/patients/queries';
import { useRecentArticles, useSavedArticles } from '@features/news/queries';
import { useEspecialidades } from '@features/matching/queries';
import { specialtyVisualById } from '@features/matching/specialtyVisuals';
import { useAuthStore } from '@features/auth/store';
import type { Article } from '@features/news/types';

const SEARCH_WRAPPER_STYLES =
  'group relative hidden md:flex items-center h-9 w-full max-w-2xl rounded-lg border border-border-subtle bg-surface-subtle hover:bg-surface-muted focus-within:bg-surface focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-colors';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
  const { data: recentNews, isLoading: isLoadingNews } = useRecentArticles(0, 50);
  const { data: savedNews } = useSavedArticles(0, 100);
  const { byId: specialtiesById } = useEspecialidades();
  const role = useAuthStore((s) => s.user?.role?.toLowerCase() ?? 'doctor');

  const savedArticleIds = useMemo(() => {
    return new Set(savedNews?.items?.map((a) => a.id) ?? []);
  }, [savedNews]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  /** Strip diacritics (accents) and lowercase for fuzzy matching */
  const normalize = (str?: string | null) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const filteredPatients = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);
    return patients
      .filter((p) => normalize(p.nombre).includes(q) || normalize(p.expedienteExternoId).includes(q))
      .slice(0, 5);
  }, [patients, query]);

  const filteredNews = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalize(query);
    return (recentNews?.items ?? [])
      .filter((a) => {
        if (normalize(a.titulo).includes(q)) return true;
        if (a.tags?.some(t => normalize(t.valor).includes(q))) return true;
        // Match by specialty name
        if (a.especialidadId) {
          const spec = specialtiesById.get(a.especialidadId);
          if (spec && normalize(spec.nombre).includes(q)) return true;
        }
        if (normalize(a.revista).includes(q)) return true;
        if (normalize(a.autores).includes(q)) return true;
        return false;
      })
      .slice(0, 5);
  }, [recentNews, query, specialtiesById]);

  const isLoading = isLoadingPatients || isLoadingNews;
  const hasResults = filteredPatients.length > 0 || filteredNews.length > 0;
  const showDropdown = isOpen && query.trim().length > 0;

  const handleSelectPatient = (id: string) => {
    setIsOpen(false);
    navigate(`/patients/${id}/history`);
  };

  const handleSelectArticle = (article: Article, isSaved: boolean) => {
    setIsOpen(false);
    const basePath = role === 'coo' ? '/coo/dashboard' : '/doctor/dashboard';
    
    // Pass the article directly through router state to open it in the drawer.
    // Also pass the target viewMode so the dashboard flips the toggle if needed.
    navigate(basePath, { 
      state: { 
        openArticle: article,
        targetViewMode: isSaved ? 'guardadas' : 'noticias'
      } 
    });
  };

  return (
    <div className="relative ml-auto lg:ml-4 flex-1 max-w-2xl" ref={containerRef}>
      <label className={SEARCH_WRAPPER_STYLES}>
        <span className="pl-3 text-text-subtle flex items-center">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
        </span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          placeholder="Buscar pacientes, artículos, noticias..."
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="flex-1 min-w-0 bg-transparent border-0 text-sm text-text-primary placeholder-text-subtle px-2 focus:outline-none focus:ring-0"
        />
        <kbd
          aria-hidden="true"
          className="hidden sm:inline-flex items-center gap-0.5 mr-2 px-1.5 h-5 rounded border border-border-subtle bg-surface text-[10px] font-mono font-medium text-text-muted tracking-tight shadow-[inset_0_-1px_0_0_var(--color-border-strong)]"
        >
          {typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac') ? (
            <>
              <span className="text-[12px] leading-none">⌘</span>
              <span>K</span>
            </>
          ) : (
            <>
              <span>Ctrl</span>
              <span className="text-text-subtle">+</span>
              <span>K</span>
            </>
          )}
        </kbd>
      </label>

      {showDropdown && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-surface border border-border-subtle rounded-xl shadow-popover z-50 overflow-hidden flex flex-col max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" />
              Buscando...
            </div>
          ) : hasResults ? (
            <div className="overflow-y-auto py-2">
              {filteredPatients.length > 0 && (
                <div className="px-3 pb-2">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                    <UserIcon size={14} />
                    Pacientes
                  </h3>
                  <ul className="space-y-1">
                    {filteredPatients.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => handleSelectPatient(p.id)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors focus:outline-none focus:bg-surface-muted"
                        >
                          <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-subtle text-primary text-xs font-semibold ring-1 ring-primary/20">
                            {getInitials(p.nombre)}
                          </span>
                          <div className="min-w-0 flex flex-col">
                            <span className="text-sm font-medium text-text-primary truncate">
                              {p.nombre}
                            </span>
                            <span className="text-xs text-text-muted">
                              Expediente: {p.expedienteExternoId}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {filteredPatients.length > 0 && filteredNews.length > 0 && (
                <hr className="border-border-subtle my-2" />
              )}

              {filteredNews.length > 0 && (
                <div className="px-3">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                    <BookOpen size={14} />
                    Noticias y Artículos
                  </h3>
                  <ul className="space-y-1">
                    {filteredNews.map((a) => {
                      const isSaved = savedArticleIds.has(a.id);
                      const sv = specialtyVisualById(a.especialidadId, specialtiesById);

                      return (
                        <li key={a.id}>
                          <button
                            onClick={() => handleSelectArticle(a, isSaved)}
                            className="w-full text-left flex rounded-lg overflow-hidden hover:bg-surface-muted transition-colors focus:outline-none focus:bg-surface-muted"
                          >
                            {/* Specialty color sidebar */}
                            <span
                              aria-hidden="true"
                              className={`shrink-0 w-1 self-stretch rounded-l-lg ${sv.sidebar}`}
                            />
                            <div className="flex-1 min-w-0 flex flex-col gap-1.5 px-3 py-2">
                              <span className="text-sm font-medium text-text-primary line-clamp-2 leading-snug">
                                {a.titulo}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {isSaved && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">
                                    <Bookmark size={10} className="fill-primary" />
                                    Guardado
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${sv.badgeBg} ${sv.badgeText} border ${sv.badgeBorder}`}>
                                  <Sparkles size={10} />
                                  {sv.name}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                  {a.revista || 'Sin revista'}
                                </span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-sm text-text-muted text-center flex flex-col items-center gap-2">
              <AlertCircle size={24} className="text-text-subtle" />
              No se encontraron resultados para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
