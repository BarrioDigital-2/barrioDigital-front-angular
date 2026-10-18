#!/bin/sh
# Genera un certificado HTTPS autofirmado la primera vez que arranca el contenedor.
# El navegador mostrara una advertencia (no es de una autoridad certificadora); se acepta una vez.
set -e

CERT_DIR=/etc/nginx/certs

if [ ! -f "$CERT_DIR/selfsigned.crt" ]; then
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/selfsigned.key" \
    -out "$CERT_DIR/selfsigned.crt" \
    -subj "/CN=barriodigital"
  echo "[certificado] Certificado autofirmado generado"
fi
