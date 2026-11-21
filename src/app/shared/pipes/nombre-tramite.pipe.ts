import { Pipe, PipeTransform } from '@angular/core';
import { nombreTramite } from '../../domain/tipos-tramite';

// En plantillas: {{ tramite.tipoTramite | nombreTramite }} → "Poda de árboles"
@Pipe({ name: 'nombreTramite' })
export class NombreTramitePipe implements PipeTransform {
  transform(tipoTramite: string): string {
    return nombreTramite(tipoTramite);
  }
}
