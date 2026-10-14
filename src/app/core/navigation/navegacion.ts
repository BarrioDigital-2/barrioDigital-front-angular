import { ROLES, Rol } from '../../domain/rol.model';

export interface NavItem {
  etiqueta: string;
  ruta: string;
  roles: readonly Rol[];
}

/** Menu principal. Un usuario ve los items de todos sus roles, sin repetir. */
export const NAV_ITEMS: readonly NavItem[] = [
  { etiqueta: 'Resumen', ruta: '/resumen', roles: [ROLES.ADMIN] },
  { etiqueta: 'Bandeja', ruta: '/bandeja', roles: [ROLES.FUNCIONARIO, ROLES.ADMIN] },
  { etiqueta: 'Ingresar trámite', ruta: '/ingresar', roles: [ROLES.FUNCIONARIO] },
  { etiqueta: 'Mis trámites', ruta: '/mis-tramites', roles: [ROLES.VECINO] },
  { etiqueta: 'Registro', ruta: '/registro', roles: [ROLES.AUDITOR] },
];

/** Pantalla de inicio segun el rol de mayor responsabilidad que tenga el usuario. */
const INICIO_POR_ROL: readonly [Rol, string][] = [
  [ROLES.ADMIN, '/resumen'],
  [ROLES.FUNCIONARIO, '/bandeja'],
  [ROLES.AUDITOR, '/registro'],
  [ROLES.VECINO, '/mis-tramites'],
];

export function navItemsPara(roles: readonly Rol[]): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.some((rol) => roles.includes(rol)));
}

export function rutaInicio(roles: readonly Rol[]): string {
  return INICIO_POR_ROL.find(([rol]) => roles.includes(rol))?.[1] ?? '/sin-rol';
}
