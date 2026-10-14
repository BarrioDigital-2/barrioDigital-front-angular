/**
 * Tipos de tramite que ofrece la municipalidad.
 * El backend acepta texto libre; la lista fija evita variantes del mismo tipo.
 *
 * requiereTerreno: el tramite necesita que una cuadrilla o inspector vaya al lugar
 * (estado EN_TERRENO). Los que no lo requieren pasan de EN_GESTION a RESUELTO.
 */
export interface TipoTramite {
  nombre: string;
  requiereTerreno: boolean;
}

export const TIPOS_TRAMITE: readonly TipoTramite[] = [
  { nombre: 'Certificado de residencia', requiereTerreno: false },
  { nombre: 'Luminaria apagada', requiereTerreno: true },
  { nombre: 'Hoyo en la calle', requiereTerreno: true },
  { nombre: 'Poda de árboles', requiereTerreno: true },
  { nombre: 'Retiro de cachureos', requiereTerreno: true },
];

/** Tipos desconocidos (datos antiguos en texto libre) se tratan como que requieren terreno. */
export function requiereTerreno(tipoTramite: string): boolean {
  return TIPOS_TRAMITE.find((tipo) => tipo.nombre === tipoTramite)?.requiereTerreno ?? true;
}
