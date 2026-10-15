import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { homeRedirectGuard, roleGuard } from './core/guards/role.guard';
import { ROLES } from './domain/rol.model';

/**
 * /login es publica. Todo lo demas vive dentro del shell, protegido por MsalGuard (exige sesion);
 * cada pantalla agrega roleGuard (exige rol). La raiz redirige a la pantalla de inicio del rol.
 *
 * TEMPORAL: mientras se construyen las vistas nuevas, algunas rutas usan las paginas antiguas de pages/.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [MsalGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
      {
        path: 'mis-tramites',
        canActivate: [roleGuard([ROLES.VECINO])],
        loadComponent: () =>
          import('./features/vecino/mis-tramites/mis-tramites.component').then((m) => m.MisTramitesComponent),
      },
      {
        path: 'bandeja',
        canActivate: [roleGuard([ROLES.FUNCIONARIO, ROLES.ADMIN])],
        loadComponent: () => import('./features/gestion/bandeja/bandeja.component').then((m) => m.BandejaComponent),
      },
      {
        path: 'ingresar',
        canActivate: [roleGuard([ROLES.FUNCIONARIO])],
        loadComponent: () =>
          import('./features/gestion/ingresar-tramite/ingresar-tramite.component').then((m) => m.IngresarTramiteComponent),
      },
      {
        path: 'resumen',
        canActivate: [roleGuard([ROLES.ADMIN])],
        loadComponent: () => import('./pages/requests/requests-list.component').then((m) => m.RequestsListComponent),
      },
      {
        path: 'registro',
        canActivate: [roleGuard([ROLES.AUDITOR])],
        loadComponent: () => import('./pages/requests/requests-list.component').then((m) => m.RequestsListComponent),
      },
      {
        path: 'sin-rol',
        loadComponent: () => import('./features/sin-rol/sin-rol.component').then((m) => m.SinRolComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
