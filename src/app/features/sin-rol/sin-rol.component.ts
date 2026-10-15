import { Component } from '@angular/core';

/** Pantalla para usuarios autenticados que aun no tienen un rol asignado en Azure AD. */
@Component({
  selector: 'app-sin-rol',
  template: `
    <section class="sin-rol">
      <h1 class="sin-rol__titulo">Tu cuenta aún no tiene un rol</h1>
      <p>
        Iniciaste sesión correctamente, pero la municipalidad todavía no te asigna un rol
        (Vecino, Funcionario, Admin o Auditor). Pídelo y vuelve a iniciar sesión.
      </p>
    </section>
  `,
  styles: `
    .sin-rol {
      max-width: 560px;
      margin: 3rem auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    .sin-rol__titulo {
      font-size: 1.5rem;
      font-weight: 700;
    }
  `,
})
export class SinRolComponent {}
