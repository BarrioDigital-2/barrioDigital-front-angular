import { Injectable, computed, inject, signal } from '@angular/core';
import { TramitesService } from '../../../core/api/tramites.service';
import { ESTADOS, ESTADO_META, contarPorEstado, estaCerrado } from '../../../domain/tramite-estado';
import { EstadoTramite, Tramite } from '../../../domain/tramite.model';

export interface FiltroEstado {
  estado: EstadoTramite | null;
  etiqueta: string;
  cantidad: number;
}

/**
 * Estado de la bandeja: tramites, filtros y cambios de estado.
 * Se provee en el componente, asi cada visita a la bandeja parte con su propio estado.
 */
@Injectable()
export class BandejaStore {
  private readonly tramitesService = inject(TramitesService);

  private readonly tramites = signal<Tramite[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly estadoFiltro = signal<EstadoTramite | null>(null);
  readonly busqueda = signal('');
  /** Id del tramite cuyo cambio de estado esta en curso (deshabilita sus botones). */
  readonly procesandoId = signal<number | null>(null);

  readonly abiertos = computed(() => this.tramites().filter((t) => !estaCerrado(t)).length);
  readonly porAdmitir = computed(() => this.tramites().filter((t) => t.estado === 'INGRESADO').length);

  readonly filtros = computed((): FiltroEstado[] => {
    const conteo = contarPorEstado(this.tramites());
    return [
      { estado: null, etiqueta: 'Todos', cantidad: this.tramites().length },
      ...ESTADOS.map((estado) => ({ estado, etiqueta: ESTADO_META[estado].etiqueta, cantidad: conteo[estado] })),
    ];
  });

  readonly filtrados = computed(() => {
    const estado = this.estadoFiltro();
    const texto = this.busqueda().trim().toLowerCase();

    return this.tramites()
      .filter((t) => !estado || t.estado === estado)
      .filter((t) => !texto || String(t.id).includes(texto) || t.vecinoEmail.toLowerCase().includes(texto))
      .sort((a, b) => b.id - a.id);
  });

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.tramitesService.listar().subscribe({
      next: (tramites) => {
        this.tramites.set(tramites);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los trámites. Intenta nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  cambiarEstado(tramite: Tramite, destino: EstadoTramite): void {
    this.procesandoId.set(tramite.id);
    this.error.set(null);

    this.tramitesService.cambiarEstado(tramite.id, destino).subscribe({
      next: (actualizado) => {
        // Se reemplaza solo la fila cambiada, sin recargar toda la lista
        this.tramites.update((lista) => lista.map((t) => (t.id === actualizado.id ? actualizado : t)));
        this.procesandoId.set(null);
      },
      error: () => {
        this.error.set(`No se pudo cambiar el estado del trámite N.º ${tramite.id}.`);
        this.procesandoId.set(null);
      },
    });
  }
}
