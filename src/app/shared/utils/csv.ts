/**
 * Genera un CSV y lo descarga en el navegador.
 * Usa ";" como separador y BOM UTF-8 para que Excel en español (Chile) lo abra
 * en columnas y con tildes correctas.
 */
export function descargarCsv(nombreArchivo: string, encabezados: string[], filas: (string | number)[][]): void {
  const lineas = [encabezados, ...filas].map((fila) => fila.map(escaparCelda).join(';'));
  const contenido = '﻿' + lineas.join('\r\n');

  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

/** Encierra en comillas las celdas con separador, comillas o saltos de linea. */
function escaparCelda(valor: string | number): string {
  const texto = String(valor ?? '');
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}
