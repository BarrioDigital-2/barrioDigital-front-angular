export type EstadoTramite = 'INGRESADO' | 'ADMITIDO' | 'EN_GESTION' | 'EN_TERRENO' | 'RESUELTO' | 'RECHAZADO';

export interface Tramite {
  id: number;
  tipoTramite: string;
  vecinoEmail: string;
  /** Donde esta el problema; solo la traen los tipos que requieren visita a terreno. */
  direccion: string | null;
  descripcion: string | null;
  estado: EstadoTramite;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearTramiteRequest {
  tipoTramite: string;
  vecinoEmail: string;
  direccion: string | null;
  descripcion: string | null;
}
