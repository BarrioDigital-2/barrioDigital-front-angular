import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TramitesService } from '../../../core/api/tramites.service';
import { ESTADOS, ESTADO_META, contarPorEstado, estaCerrado } from '../../../domain/tramite-estado';
import { Tramite } from '../../../domain/tramite.model';
import { EstadoBadgeComponent } from '../../../shared/ui/estado-badge/estado-badge.component';

interface Indicador {
  etiqueta: string;
  valor: number;
}

interface FilaDistribucion {
  etiqueta: string;
  clase: string;
  cantidad: number;
}

const MAX_PENDIENTES = 5;
const MAX_RECIENTES = 6;

/** Pantalla del Admin: vista general de la operacion y atajo para admitir lo pendiente. */
@Component({
  selector: 'app-resumen',
  imports: [DatePipe, RouterLink, EstadoBadgeComponent],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.css',
})
export class ResumenComponent implements OnInit {
  private readonly tramitesService = inject(TramitesService);

  private readonly tramites = signal<Tramite[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly procesandoId = signal<number | null>(null);

  readonly total = computed(() => this.tramites().length);

  readonly indicadores = computed((): Indicador[] => {
    const lista = this.tramites();
    const cerrados = lista.filter((t) => estaCerrado(t)).length;
    return [
      { etiqueta: 'Abiertos', valor: lista.length - cerrados },
      { etiqueta: 'Esperan admisión', valor: lista.filter((t) => t.estado === 'INGRESADO').length },
      { etiqueta: 'Cerrados', valor: cerrados },
      { etiqueta: 'Total', valor: lista.length },
    ];
  });

  readonly distribucion = computed((): FilaDistribucion[] => {
    const conteo = contarPorEstado(this.tramites());
    return ESTADOS.map((estado) => ({ ...ESTADO_META[estado], cantidad: conteo[estado] }));
  });

  /** Ingresados sin admitir, del mas antiguo al mas nuevo. */
  readonly pendientes = computed(() =>
    this.tramites()
      .filter((t) => t.estado === 'INGRESADO')
      .sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion))
      .slice(0, MAX_PENDIENTES),
  );

  readonly recientes = computed(() =>
    [...this.tramites()]
      .sort((a, b) => b.fechaActualizacion.localeCompare(a.fechaActualizacion))
      .slice(0, MAX_RECIENTES),
  );

  ngOnInit(): void {
    this.tramitesService.listar().subscribe({
      next: (tramites) => {
        this.tramites.set(tramites);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen. Intenta nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  admitir(tramite: Tramite): void {
    this.procesandoId.set(tramite.id);
    this.error.set(null);

    this.tramitesService.cambiarEstado(tramite.id, 'ADMITIDO').subscribe({
      next: (actualizado) => {
        this.tramites.update((lista) => lista.map((t) => (t.id === actualizado.id ? actualizado : t)));
        this.procesandoId.set(null);
      },
      error: () => {
        this.error.set(`No se pudo admitir el trámite N.º ${tramite.id}.`);
        this.procesandoId.set(null);
      },
    });
  }
}
