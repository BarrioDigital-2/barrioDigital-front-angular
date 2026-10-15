import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { TramitesService } from '../../../core/api/tramites.service';
import { estaCerrado } from '../../../domain/tramite-estado';
import { CrearTramiteRequest, Tramite } from '../../../domain/tramite.model';
import { EstadoBadgeComponent } from '../../../shared/ui/estado-badge/estado-badge.component';
import { EstadoProgresoComponent } from '../../../shared/ui/estado-progreso/estado-progreso.component';
import { TramiteFormComponent } from '../../../shared/ui/tramite-form/tramite-form.component';

type Filtro = 'todos' | 'en-curso' | 'cerrados';

/** Pantalla del Vecino: sus tramites con su avance y el formulario para ingresar uno nuevo. */
@Component({
  selector: 'app-mis-tramites',
  imports: [DatePipe, EstadoBadgeComponent, EstadoProgresoComponent, TramiteFormComponent],
  templateUrl: './mis-tramites.component.html',
  styleUrl: './mis-tramites.component.css',
})
export class MisTramitesComponent implements OnInit {
  private readonly tramitesService = inject(TramitesService);
  private readonly authService = inject(AuthService);
  private readonly formulario = viewChild.required(TramiteFormComponent);

  readonly email = this.authService.email;
  readonly primerNombre = computed(() => this.authService.displayName().split(' ')[0]);

  readonly tramites = signal<Tramite[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly enviando = signal(false);
  readonly errorEnvio = signal<string | null>(null);
  readonly creadoId = signal<number | null>(null);
  readonly filtro = signal<Filtro>('todos');

  readonly enCurso = computed(() => this.tramites().filter((t) => !estaCerrado(t)));
  readonly cerrados = computed(() => this.tramites().filter((t) => estaCerrado(t)));

  readonly filtrados = computed(() => {
    switch (this.filtro()) {
      case 'en-curso':
        return this.enCurso();
      case 'cerrados':
        return this.cerrados();
      default:
        return this.tramites();
    }
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.tramitesService.listarMios().subscribe({
      next: (tramites) => {
        // Mas recientes primero
        this.tramites.set([...tramites].sort((a, b) => b.id - a.id));
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No pudimos cargar tus trámites. Intenta nuevamente en unos minutos.');
        this.cargando.set(false);
      },
    });
  }

  crear(request: CrearTramiteRequest): void {
    this.enviando.set(true);
    this.errorEnvio.set(null);
    this.creadoId.set(null);

    this.tramitesService.crear(request).subscribe({
      next: (tramite) => {
        this.enviando.set(false);
        this.creadoId.set(tramite.id);
        this.formulario().reiniciar();
        this.filtro.set('todos');
        this.cargar();
      },
      error: () => {
        this.enviando.set(false);
        this.errorEnvio.set('No se pudo ingresar el trámite. Intenta nuevamente.');
      },
    });
  }
}
