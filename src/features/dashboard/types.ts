import { Article } from '../news/types';

export interface DashboardData {
  novedades_48h: Article[];
  no_leidos: Article[];
  por_especialidad: Article[];
  alta_evidencia: Article[];
}
