# ========== ETAPA 1: COMPILAR ANGULAR ==========
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo las dependencias: Docker reutiliza esta capa si package.json no cambia
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Valores propios de cada despliegue (cada cuenta AWS y cada app de Azure tiene los suyos).
# Se inyectan en environment.prod.ts al construir; el archivo del repo no se modifica.
# AZURE_CLIENT_ID y AZURE_TENANT_ID son opcionales: si no se pasan, quedan los del repo.
ARG API_URL
ARG REDIRECT_URI
ARG AZURE_CLIENT_ID
ARG AZURE_TENANT_ID
RUN test -n "$API_URL" && test -n "$REDIRECT_URI" \
    || (echo "ERROR: faltan los build args API_URL y REDIRECT_URI" && exit 1)
RUN sed -i \
      -e "s#redirectUri: '[^']*'#redirectUri: '${REDIRECT_URI}'#" \
      -e "s#baseUrl: '[^']*'#baseUrl: '${API_URL}'#" \
      src/environments/environment.prod.ts \
 && if [ -n "$AZURE_CLIENT_ID" ]; then sed -i "s#clientId: '[^']*'#clientId: '${AZURE_CLIENT_ID}'#" src/environments/environment.prod.ts; fi \
 && if [ -n "$AZURE_TENANT_ID" ]; then sed -i "s#tenantId: '[^']*'#tenantId: '${AZURE_TENANT_ID}'#" src/environments/environment.prod.ts; fi \
 && cat src/environments/environment.prod.ts

RUN npx ng build --configuration production

# ========== ETAPA 2: SERVIR CON NGINX (HTTPS) ==========
FROM nginx:1.27-alpine

# openssl para generar el certificado autofirmado al arrancar
RUN apk add --no-cache openssl

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# Los scripts de /docker-entrypoint.d/ los ejecuta la imagen oficial de nginx antes de arrancar
COPY nginx/generar-certificado.sh /docker-entrypoint.d/40-generar-certificado.sh
RUN chmod +x /docker-entrypoint.d/40-generar-certificado.sh

COPY --from=build /app/dist/mi-app-angular-msal/browser /usr/share/nginx/html

EXPOSE 80 443
