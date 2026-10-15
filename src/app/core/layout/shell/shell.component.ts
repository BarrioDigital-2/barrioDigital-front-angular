import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { navItemsPara } from '../../navigation/navegacion';

/**
 * Estructura comun de todas las pantallas autenticadas:
 * header con el menu segun los roles del usuario y el contenido de la ruta activa.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  private readonly authService = inject(AuthService);

  readonly nombre = this.authService.displayName;
  readonly navItems = computed(() => navItemsPara(this.authService.roles()));
  readonly rolesTexto = computed(() => this.authService.roles().join(' · ') || 'Sin rol asignado');

  logout(): void {
    this.authService.logout();
  }
}
