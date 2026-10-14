import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

/** Descripcion de cada rol que se muestra en el panel de bienvenida. */
interface RolDescripcion {
  rol: string;
  descripcion: string;
}

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  readonly isLoggedIn = this.authService.isLoggedIn;

  readonly roles: readonly RolDescripcion[] = [
    { rol: 'Vecino', descripcion: 'Ingresa trámites y revisa su avance' },
    { rol: 'Funcionario', descripcion: 'Gestiona la bandeja de solicitudes' },
    { rol: 'Admin', descripcion: 'Supervisa la operación completa' },
    { rol: 'Auditor', descripcion: 'Consulta el registro, solo lectura' },
  ];

  login(): void {
    this.authService.login();
  }
}
