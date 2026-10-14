import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { rutaInicio } from '../navigation/navegacion';
import { Rol } from '../../domain/rol.model';

/**
 * Fabrica de guards: roleGuard(['Admin']) protege una ruta solo para ese rol.
 * Se usa bajo el MsalGuard del shell (MsalGuard exige sesion, este exige rol).
 * Si el usuario no tiene el rol, lo devuelve a su pantalla de inicio.
 */
export function roleGuard(allowedRoles: readonly Rol[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    authService.sincronizarCuenta();

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }
    return inject(Router).parseUrl(rutaInicio(authService.roles()));
  };
}

/** Redirige la ruta raiz a la pantalla de inicio del rol del usuario. */
export const homeRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  authService.sincronizarCuenta();
  return inject(Router).parseUrl(rutaInicio(authService.roles()));
};
