import { Component, computed, input } from '@angular/core';
import { ESTADO_META, pasosDelFlujo } from '../../../domain/tramite-estado';
import { Tramite } from '../../../domain/tramite.model';

interface Paso {
  etiqueta: string;
  alcanzado: boolean;
  actual: boolean;
}

/**
 * Barra de avance de un tramite por los pasos de su flujo.
 * Un tramite rechazado no avanza, asi que muestra un aviso en lugar de la barra.
 */
@Component({
  selector: 'app-estado-progreso',
  template: `
    @if (rechazado()) {
      <p class="progreso__rechazo">La municipalidad rechazó este trámite.</p>
    } @else {
      <ol class="progreso" aria-label="Avance del trámite">
        @for (paso of pasos(); track paso.etiqueta) {
          <li
            class="progreso__paso"
            [class.progreso__paso--alcanzado]="paso.alcanzado"
            [class.progreso__paso--actual]="paso.actual"
            [attr.aria-current]="paso.actual ? 'step' : null"
          >
            <span class="progreso__barra" aria-hidden="true"></span>
            <span class="progreso__etiqueta">{{ paso.etiqueta }}</span>
          </li>
        }
      </ol>
    }
  `,
  styles: `
    .progreso {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      gap: 0.375rem;
    }

    .progreso__paso {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progreso__barra {
      height: 6px;
      border-radius: 3px;
      background: var(--color-border);
    }

    .progreso__etiqueta {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .progreso__paso--alcanzado .progreso__barra {
      background: var(--color-primary);
    }

    .progreso__paso--alcanzado .progreso__etiqueta {
      color: var(--color-text);
    }

    .progreso__paso--actual .progreso__etiqueta {
      font-weight: 700;
    }

    .progreso__rechazo {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: var(--estado-rechazado-bg);
      color: var(--estado-rechazado-fg);
      font-size: 0.875rem;
    }
  `,
})
export class EstadoProgresoComponent {
  readonly tramite = input.required<Tramite>();

  readonly rechazado = computed(() => this.tramite().estado === 'RECHAZADO');

  readonly pasos = computed((): Paso[] => {
    const tramite = this.tramite();
    const flujo = pasosDelFlujo(tramite);
    const indiceActual = flujo.indexOf(tramite.estado);

    return flujo.map((estado, indice) => ({
      etiqueta: ESTADO_META[estado].etiqueta,
      alcanzado: indice <= indiceActual,
      actual: indice === indiceActual,
    }));
  });
}
