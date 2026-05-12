export interface ArticleTag {
  id: string;
  tipo: 'enfermedad' | 'sintoma' | 'tratamiento' | 'medicamento';
  valor: string;
  createdAt: string;
}

export interface Article {
  id: string;
  titulo: string;
  autores: string;
  revista: string;
  anioPub: string;
  mesPub: string;
  doi: string;
  abstractText: string;
  keywords: string;
  tipoPublicacion: string;
  url: string;
  tags: ArticleTag[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedArticlesResponse {
  items: Article[];
  total: number;
  page: number;
  size: number;
}
