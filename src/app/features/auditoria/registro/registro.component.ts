import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { TramitesService } from '../../../core/api/tramites.service';
import { ESTADOS, ESTADO_META } from '../../../domain/tramite-estado';
import { EstadoTramite, Tramite } from '../../../domain/tramite.model';
import { EstadoBadgeComponent } from '../../../shared/ui/estado-badge/estado-badge.component';
import { descargarCsv } from '../../../shared/utils/csv';

/** Pantalla del Auditor: registro completo de tramites, solo lectura, con exportacion a CSV. */
@Component({
  selector: 'app-registro',
  imports: [DatePipe, EstadoBadgeComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent implements OnInit {
  private readonly tramitesService = inject(TramitesService);
  private readonly locale = inject(LOCALE_ID);

  private readonly tramites = signal<Tramite[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly estados = ESTADOS.map((estado) => ({ valor: estado, etiqueta: ESTADO_META[estado].etiqueta }));
  readonly estadoFiltro = signal<EstadoTramite | ''>('');
  /** Fechas en formato yyyy-MM-dd (el que entrega <input type="date">). */
  readonly desde = signal('');
  readonly hasta = signal('');

  readonly total = computed(() => this.tramites().length);

  readonly filtrados = computed(() => {
    const estado = this.estadoFiltro();
    const desde = this.desde();
    const hasta = this.hasta();

    return this.tramites()
      .filter((t) => !estado || t.estado === estado)
      .filter((t) => {
        const dia = t.fechaCreacion.slice(0, 10); // yyyy-MM-dd; las fechas ISO se comparan como texto
        return (!desde || dia >= desde) && (!hasta || dia <= hasta);
      })
      .sort((a, b) => b.id - a.id);
  });

  ngOnInit(): void {
    this.tramitesService.listar().subscribe({
      next: (tramites) => {
        this.tramites.set(tramites);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el registro. Intenta nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  onEstado(evento: Event): void {
    this.estadoFiltro.set((evento.target as HTMLSelectElement).value as EstadoTramite | '');
  }

  onFecha(campo: 'desde' | 'hasta', evento: Event): void {
    this[campo].set((evento.target as HTMLInputElement).value);
  }

  limpiarFiltros(): void {
    this.estadoFiltro.set('');
    this.desde.set('');
    this.hasta.set('');
  }

  exportar(): void {
    const formato = (fecha: string) => formatDate(fecha, 'dd-MM-yyyy HH:mm', this.locale);
    const filas = this.filtrados().map((t) => [
      t.id,
      t.tipoTramite,
      t.vecinoEmail,
      ESTADO_META[t.estado].etiqueta,
      formato(t.fechaCreacion),
      formato(t.fechaActualizacion),
    ]);
    const hoy = formatDate(new Date(), 'yyyy-MM-dd', this.locale);

    descargarCsv(
      `registro-tramites-${hoy}.csv`,
      ['N.º', 'Tipo', 'Vecino', 'Estado', 'Creado', 'Última actualización'],
      filas,
    );
  }
}
