FROM node:22-bookworm AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY package-lock.json* ./

# Instalar dependencias y bindings nativos
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm ci --include=optional --no-audit --no-fund \
  && node -e "const v=require('./package-lock.json').packages['node_modules/lightningcss']?.version; if(!v){process.exit(1)}; process.stdout.write(v)" > .lightningcss-version \
  && node -e "const v=require('./package-lock.json').packages['node_modules/@tailwindcss/oxide']?.version; if(!v){process.exit(1)}; process.stdout.write(v)" > .tailwindcss-oxide-version \
  && node -e "const p=require('./package-lock.json').packages['node_modules/sharp']; if(!p?.version){process.exit(1)}; process.stdout.write(p.version)" > .sharp-version \
  && node -e "const p=require('./package-lock.json').packages['node_modules/sharp']; const v=p?.optionalDependencies?.['@img/sharp-libvips-linux-x64']; if(!v){process.exit(1)}; process.stdout.write(v)" > .sharp-libvips-version \
  && npm install --no-save --no-audit --no-fund \
    "lightningcss-linux-x64-gnu@$(cat .lightningcss-version)" \
    "@tailwindcss/oxide-linux-x64-gnu@$(cat .tailwindcss-oxide-version)" \
    "sharp@$(cat .sharp-version)" \
    "@img/sharp-linux-x64@$(cat .sharp-version)" \
    "@img/sharp-libvips-linux-x64@$(cat .sharp-libvips-version)" \
  && rm .lightningcss-version .tailwindcss-oxide-version .sharp-version .sharp-libvips-version

FROM deps AS builder
WORKDIR /app

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación (ya tiene node_modules con los bindings)
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos necesarios para el modo standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
