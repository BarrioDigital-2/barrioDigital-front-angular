import { Component, computed, input } from '@angular/core';
import { ESTADO_META } from '../../../domain/tramite-estado';
import { EstadoTramite } from '../../../domain/tramite.model';

/** Etiqueta de color con el estado de un tramite. */
@Component({
  selector: 'app-estado-badge',
  template: `<span class="estado-badge" [class]="'estado-badge--' + meta().clase">{{ meta().etiqueta }}</span>`,
  styles: `
    .estado-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      font-size: 0.8125rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .estado-badge--ingresado { background: var(--estado-ingresado-bg); color: var(--estado-ingresado-fg); }
    .estado-badge--admitido { background: var(--estado-admitido-bg); color: var(--estado-admitido-fg); }
    .estado-badge--en-gestion { background: var(--estado-en-gestion-bg); color: var(--estado-en-gestion-fg); }
    .estado-badge--en-terreno { background: var(--estado-en-terreno-bg); color: var(--estado-en-terreno-fg); }
    .estado-badge--resuelto { background: var(--estado-resuelto-bg); color: var(--estado-resuelto-fg); }
    .estado-badge--rechazado { background: var(--estado-rechazado-bg); color: var(--estado-rechazado-fg); }
  `,
})
export class EstadoBadgeComponent {
  readonly estado = input.required<EstadoTramite>();

  readonly meta = computed(() => ESTADO_META[this.estado()]);
}
