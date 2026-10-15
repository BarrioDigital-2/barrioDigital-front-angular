import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TIPOS_TRAMITE } from '../../../domain/tipos-tramite';
import { CrearTramiteRequest } from '../../../domain/tramite.model';

/**
 * Formulario para ingresar un tramite. No llama a la API: emite (enviar) y el padre decide.
 * - Vecino: recibe emailFijo (el de su cuenta) y el campo queda de solo lectura.
 * - Funcionario: sin emailFijo, escribe el email del vecino que atiende.
 */
@Component({
  selector: 'app-tramite-form',
  imports: [ReactiveFormsModule],
  templateUrl: './tramite-form.component.html',
  styleUrl: './tramite-form.component.css',
})
export class TramiteFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly emailFijo = input<string | null>(null);
  readonly enviando = input(false);
  readonly enviar = output<CrearTramiteRequest>();

  readonly tipos = TIPOS_TRAMITE;

  readonly form = this.formBuilder.nonNullable.group({
    tipoTramite: ['', Validators.required],
    vecinoEmail: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    // Con email fijo el control se deshabilita; getRawValue() igual lo incluye al enviar.
    effect(() => {
      const email = this.emailFijo();
      const control = this.form.controls.vecinoEmail;
      if (email) {
        control.setValue(email);
        control.disable();
      } else {
        control.enable();
      }
    });
  }

  campoInvalido(nombre: 'tipoTramite' | 'vecinoEmail'): boolean {
    const control = this.form.controls[nombre];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviar.emit(this.form.getRawValue());
  }

  /** El padre lo llama cuando el tramite se creo con exito. */
  reiniciar(): void {
    this.form.reset({ tipoTramite: '', vecinoEmail: this.emailFijo() ?? '' });
  }
}
