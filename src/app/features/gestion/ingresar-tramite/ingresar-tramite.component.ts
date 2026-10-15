import { Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TramitesService } from '../../../core/api/tramites.service';
import { CrearTramiteRequest } from '../../../domain/tramite.model';
import { TramiteFormComponent } from '../../../shared/ui/tramite-form/tramite-form.component';

/** Atencion presencial: el Funcionario ingresa un tramite a nombre de un vecino. */
@Component({
  selector: 'app-ingresar-tramite',
  imports: [RouterLink, TramiteFormComponent],
  template: `
    <div class="pagina ingresar">
      <header class="pagina__encabezado">
        <h1 class="pagina__titulo">Ingresar trámite</h1>
        <p class="pagina__bajada">Para vecinos que llegan a atención presencial.</p>
      </header>

      <section class="tarjeta ingresar__formulario">
        @if (creadoId()) {
          <p class="ingresar__exito" role="status">
            Trámite N.º {{ creadoId() }} ingresado. <a routerLink="/bandeja">Ver en la bandeja</a>
          </p>
        }
        @if (error()) {
          <p class="mensaje mensaje--error" role="alert">{{ error() }}</p>
        }

        <app-tramite-form [enviando]="enviando()" (enviar)="crear($event)" />
      </section>
    </div>
  `,
  styles: `
    .ingresar {
      max-width: 560px;
    }

    .ingresar__formulario {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .ingresar__exito {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: var(--estado-resuelto-bg);
      color: var(--estado-resuelto-fg);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .ingresar__exito a {
      color: inherit;
    }
  `,
})
export class IngresarTramiteComponent {
  private readonly tramitesService = inject(TramitesService);
  private readonly formulario = viewChild.required(TramiteFormComponent);

  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);
  readonly creadoId = signal<number | null>(null);

  crear(request: CrearTramiteRequest): void {
    this.enviando.set(true);
    this.error.set(null);
    this.creadoId.set(null);

    this.tramitesService.crear(request).subscribe({
      next: (tramite) => {
        this.enviando.set(false);
        this.creadoId.set(tramite.id);
        this.formulario().reiniciar();
      },
      error: () => {
        this.enviando.set(false);
        this.error.set('No se pudo ingresar el trámite. Revisa los datos e intenta nuevamente.');
      },
    });
  }
}
