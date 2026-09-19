#!/bin/bash

# ==========================================
# MYNEXT - AUTOMATIZACIÓN DE ENTORNO LOCAL
# ==========================================
echo "🚀 Iniciando el entorno de desarrollo Pro de MYNEXT..."

# 1. Cambiar a rama de desarrollo para evitar despliegues accidentales en Cloudflare / Producción
echo "🌿 Cambiando a la rama de desarrollo (dev)..."
git checkout dev 2>/dev/null || git checkout -b dev

# 2. Instalar dependencias por si acaso
echo "📦 Comprobando dependencias..."
if [ ! -d "node_modules" ]; then
  npm install
fi

# 3. Configurar Keep-Alive para Supabase (para evitar auto-pausado en plan gratuito)
ENV_FILE=""
if [ -f .env.local ]; then
  ENV_FILE=".env.local"
elif [ -f .env ]; then
  ENV_FILE=".env"
fi

if [ -n "$ENV_FILE" ]; then
  echo "🔍 Detectado archivo $ENV_FILE, configurando Keep-Alive para Supabase..."
  SB_URL=$(grep -E "^(VITE_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL)" "$ENV_FILE" | head -n1 | cut -d'=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'" | xargs)
  SB_KEY=$(grep -E "^(VITE_SUPABASE_ANON_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_ANON_KEY)" "$ENV_FILE" | head -n1 | cut -d'=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'" | xargs)
  
  if [ -n "$SB_URL" ] && [ -n "$SB_KEY" ]; then
    mkdir -p .github/workflows
    
    cat <<EOF > .github/workflows/keep-alive.yml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 0 * * 2,5'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase Health Endpoint
        run: |
          URL="\${{ secrets.SUPABASE_URL }}"
          KEY="\${{ secrets.SUPABASE_ANON_KEY }}"
          if [ -z "\$URL" ]; then
            URL="$SB_URL"
          fi
          if [ -z "\$KEY" ]; then
            KEY="$SB_KEY"
          fi
          echo "Pinging Supabase at \$URL..."
          curl --fail -s -X GET "\$URL/auth/v1/health" \\
            -H "apikey: \$KEY" > /dev/null
          echo "Ping successful!"
EOF
    echo "✅ Archivo .github/workflows/keep-alive.yml creado/actualizado."

    cat <<EOF > .gitlab-ci.yml
keep_alive:
  stage: deploy
  rules:
    - if: \$CI_PIPELINE_SOURCE == "schedule"
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - |
      URL="\${SUPABASE_URL}"
      KEY="\${SUPABASE_ANON_KEY}"
      if [ -z "\$URL" ]; then
        URL="$SB_URL"
      fi
      if [ -z "\$KEY" ]; then
        KEY="$SB_KEY"
      fi
      echo "Pinging Supabase at \$URL..."
      curl --fail -s -X GET "\$URL/auth/v1/health" \\
        -H "apikey: \$KEY" > /dev/null
      echo "Ping successful!"
EOF
    echo "✅ Archivo .gitlab-ci.yml creado/actualizado."
  fi
fi

chmod +x "$0"
