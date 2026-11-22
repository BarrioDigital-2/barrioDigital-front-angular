/**
 * Tipos de tramite que ofrece la municipalidad.
 * codigo: lo que se envia al backend y se guarda (ms-catalog lo usa para los cupos).
 * nombre: lo que ve el usuario.
 *
 * requiereTerreno: el tramite necesita que una cuadrilla o inspector vaya al lugar
 * (estado EN_TERRENO). Los que no lo requieren pasan de EN_GESTION a RESUELTO.
 */
export interface TipoTramite {
  codigo: string;
  nombre: string;
  requiereTerreno: boolean;
}

export const TIPOS_TRAMITE: readonly TipoTramite[] = [
  { codigo: 'CERTIFICADO_RESIDENCIA', nombre: 'Certificado de residencia', requiereTerreno: false },
  { codigo: 'LUMINARIA_APAGADA', nombre: 'Luminaria apagada', requiereTerreno: true },
  { codigo: 'HOYO_CALLE', nombre: 'Hoyo en la calle', requiereTerreno: true },
  { codigo: 'PODA_ARBOLES', nombre: 'Poda de árboles', requiereTerreno: true },
  { codigo: 'RETIRO_CACHUREOS', nombre: 'Retiro de cachureos', requiereTerreno: true },
];

// Acepta el codigo o el nombre: los tramites antiguos se guardaron con el nombre
function buscarTipo(valor: string): TipoTramite | undefined {
  return TIPOS_TRAMITE.find((tipo) => tipo.codigo === valor || tipo.nombre === valor);
}

/** Solo los tipos marcados en la lista van a terreno; cualquier otro (incluido texto libre antiguo) va por gestion. */
export function requiereTerreno(tipoTramite: string): boolean {
  return buscarTipo(tipoTramite)?.requiereTerreno ?? false;
}

/** Nombre para mostrar; si no esta en la lista, devuelve el valor tal cual. */
export function nombreTramite(tipoTramite: string): string {
  return buscarTipo(tipoTramite)?.nombre ?? tipoTramite;
}
