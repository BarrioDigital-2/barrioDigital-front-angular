import { Component, computed, effect, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TIPOS_TRAMITE, requiereTerreno } from '../../../domain/tipos-tramite';
import { CrearTramiteRequest } from '../../../domain/tramite.model';

/** Largos maximos: los mismos que valida ms-requests. */
const MAX_DIRECCION = 200;
const MAX_DESCRIPCION = 500;

type Campo = 'tipoTramite' | 'vecinoEmail' | 'direccion' | 'descripcion';

/**
 * Formulario para ingresar un tramite. No llama a la API: emite (enviar) y el padre decide.
 * - Vecino: recibe emailFijo (el de su cuenta) y el campo queda de solo lectura.
 * - Funcionario: sin emailFijo, escribe el email del vecino que atiende.
 * La direccion solo se pide (y es obligatoria) en los tipos que requieren visita a terreno.
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
  readonly maxDescripcion = MAX_DESCRIPCION;

  readonly form = this.formBuilder.nonNullable.group({
    tipoTramite: ['', Validators.required],
    vecinoEmail: ['', [Validators.required, Validators.email]],
    direccion: ['', Validators.maxLength(MAX_DIRECCION)],
    descripcion: ['', Validators.maxLength(MAX_DESCRIPCION)],
  });

  private readonly tipoSeleccionado = toSignal(this.form.controls.tipoTramite.valueChanges, { initialValue: '' });
  private readonly descripcionActual = toSignal(this.form.controls.descripcion.valueChanges, { initialValue: '' });

  readonly pideDireccion = computed(() => requiereTerreno(this.tipoSeleccionado()));
  readonly largoDescripcion = computed(() => this.descripcionActual().length);

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

    // La direccion es obligatoria solo para los tipos con visita a terreno; para el resto se limpia.
    effect(() => {
      const control = this.form.controls.direccion;
      if (this.pideDireccion()) {
        control.setValidators([Validators.required, Validators.maxLength(MAX_DIRECCION)]);
      } else {
        control.setValidators(Validators.maxLength(MAX_DIRECCION));
        control.reset('');
      }
      control.updateValueAndValidity();
    });
  }

  campoInvalido(nombre: Campo): boolean {
    const control = this.form.controls[nombre];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.enviar.emit({
      tipoTramite: valores.tipoTramite,
      vecinoEmail: valores.vecinoEmail,
      direccion: this.pideDireccion() ? valores.direccion.trim() : null,
      descripcion: valores.descripcion.trim() || null,
    });
  }

  /** El padre lo llama cuando el tramite se creo con exito. */
  reiniciar(): void {
    this.form.reset({ tipoTramite: '', vecinoEmail: this.emailFijo() ?? '', direccion: '', descripcion: '' });
  }
}
