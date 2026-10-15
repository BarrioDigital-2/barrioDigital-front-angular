import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AccionEstado, accionesDisponibles } from '../../../domain/tramite-estado';
import { Tramite } from '../../../domain/tramite.model';
import { EstadoBadgeComponent } from '../../../shared/ui/estado-badge/estado-badge.component';
import { BandejaStore } from './bandeja.store';

/** Bandeja de gestion (Funcionario y Admin): filtra, busca y avanza los tramites por su flujo. */
@Component({
  selector: 'app-bandeja',
  imports: [DatePipe, EstadoBadgeComponent],
  providers: [BandejaStore],
  templateUrl: './bandeja.component.html',
  styleUrl: './bandeja.component.css',
})
export class BandejaComponent implements OnInit {
  readonly store = inject(BandejaStore);

  readonly acciones = accionesDisponibles;

  ngOnInit(): void {
    this.store.cargar();
  }

  onBuscar(evento: Event): void {
    this.store.busqueda.set((evento.target as HTMLInputElement).value);
  }

  ejecutar(tramite: Tramite, accion: AccionEstado): void {
    if (accion.destino === 'RECHAZADO' && !confirm(`¿Rechazar el trámite N.º ${tramite.id}? No se puede deshacer.`)) {
      return;
    }
    this.store.cambiarEstado(tramite, accion.destino);
  }
}
