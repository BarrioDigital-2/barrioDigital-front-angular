import { requiereTerreno } from './tipos-tramite';
import { EstadoTramite, Tramite } from './tramite.model';

/**
 * Unica fuente de verdad sobre los estados de un tramite: como se muestran,
 * en que orden avanzan y que acciones permite cada uno.
 * Las vistas consultan este archivo en vez de repetir condiciones por estado.
 */

export interface EstadoMeta {
  etiqueta: string;
  /** Modificador CSS: estado-badge--{clase}, etc. */
  clase: string;
  cerrado: boolean;
}

export const ESTADOS: readonly EstadoTramite[] = [
  'INGRESADO',
  'ADMITIDO',
  'EN_GESTION',
  'EN_TERRENO',
  'RESUELTO',
  'RECHAZADO',
];

export const ESTADO_META: Record<EstadoTramite, EstadoMeta> = {
  INGRESADO: { etiqueta: 'Ingresado', clase: 'ingresado', cerrado: false },
  ADMITIDO: { etiqueta: 'Admitido', clase: 'admitido', cerrado: false },
  EN_GESTION: { etiqueta: 'En gestión', clase: 'en-gestion', cerrado: false },
  EN_TERRENO: { etiqueta: 'En terreno', clase: 'en-terreno', cerrado: false },
  RESUELTO: { etiqueta: 'Resuelto', clase: 'resuelto', cerrado: true },
  RECHAZADO: { etiqueta: 'Rechazado', clase: 'rechazado', cerrado: true },
};

/**
 * Camino normal de un tramite. Regla de ms-requests: a EN_TERRENO solo se llega desde ADMITIDO.
 * - Con visita (luminaria, hoyo...): Ingresado → Admitido → En terreno → Resuelto
 * - Sin visita (certificado):        Ingresado → Admitido → En gestión → Resuelto
 */
export function pasosDelFlujo(tramite: Tramite): EstadoTramite[] {
  // Un tramite que ya esta EN_TERRENO sigue ese camino aunque su tipo no este en la lista
  return requiereTerreno(tramite.tipoTramite) || tramite.estado === 'EN_TERRENO'
    ? ['INGRESADO', 'ADMITIDO', 'EN_TERRENO', 'RESUELTO']
    : ['INGRESADO', 'ADMITIDO', 'EN_GESTION', 'RESUELTO'];
}

export type VarianteAccion = 'primary' | 'secondary' | 'danger';

export interface AccionEstado {
  etiqueta: string;
  destino: EstadoTramite;
  variante: VarianteAccion;
}

const RECHAZAR: AccionEstado = { etiqueta: 'Rechazar', destino: 'RECHAZADO', variante: 'danger' };
const ADMITIR: AccionEstado = { etiqueta: 'Admitir', destino: 'ADMITIDO', variante: 'primary' };
const A_GESTION: AccionEstado = { etiqueta: 'Pasar a gestión', destino: 'EN_GESTION', variante: 'primary' };
const A_TERRENO: AccionEstado = { etiqueta: 'Enviar a terreno', destino: 'EN_TERRENO', variante: 'primary' };
const RESOLVER: AccionEstado = { etiqueta: 'Resolver', destino: 'RESUELTO', variante: 'primary' };

/** Siguiente paso posible desde el estado actual. Los estados cerrados no tienen acciones. */
export function accionesDisponibles(tramite: Tramite): AccionEstado[] {
  switch (tramite.estado) {
    case 'INGRESADO':
      return [RECHAZAR, ADMITIR];
    case 'ADMITIDO':
      return requiereTerreno(tramite.tipoTramite) ? [A_TERRENO] : [A_GESTION];
    case 'EN_GESTION':
      return [RESOLVER];
    case 'EN_TERRENO':
      return [RESOLVER];
    default:
      return [];
  }
}

export function estaCerrado(tramite: Tramite): boolean {
  return ESTADO_META[tramite.estado].cerrado;
}

export function contarPorEstado(tramites: readonly Tramite[]): Record<EstadoTramite, number> {
  const conteo = Object.fromEntries(ESTADOS.map((estado) => [estado, 0])) as Record<EstadoTramite, number>;
  for (const tramite of tramites) {
    conteo[tramite.estado]++;
  }
  return conteo;
}
