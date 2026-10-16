export interface ConfigFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const generateDockerCompose = (config: ProjectConfig): string => {
  return `
services:
  # ============================================
  # n8n - Workflow Automation
  # ============================================
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "${config.n8nPort}:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${config.n8nUser}
      - N8N_BASIC_AUTH_PASSWORD=${config.n8nPassword}
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:${config.n8nPort}/
      - GENERIC_TIMEZONE=${config.timezone}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=supabase-db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=${config.dbPassword}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      supabase-db:
        condition: service_healthy
    networks:
      - n8n-supabase-network

  # ============================================
  # Supabase - PostgreSQL Database
  # ============================================
  supabase-db:
    image: supabase/postgres:15.1.0.147
    container_name: supabase-db
    restart: unless-stopped
    ports:
      - "${config.dbPort}:5432"
    environment:
      - POSTGRES_PASSWORD=${config.dbPassword}
      - POSTGRES_DB=supabase
    volumes:
      - supabase_db_data:/var/lib/postgresql/data
      - ./volumes/db/roles.sql:/docker-entrypoint-initdb.d/roles.sql
    healthcheck:
      test: pg_isready -U postgres -h localhost
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - n8n-supabase-network

  # ============================================
  # Supabase Studio - Admin UI
  # ============================================
  supabase-studio:
    image: supabase/studio:20240101
    container_name: supabase-studio
    restart: unless-stopped
    ports:
      - "${config.studioPort}:3000"
    environment:
      - STUDIO_PG_META_URL=http://supabase-meta:8080
      - POSTGRES_PASSWORD=${config.dbPassword}
      - DEFAULT_ORGANIZATION_NAME=${config.orgName}
      - DEFAULT_PROJECT_NAME=${config.projectName}
      - SUPABASE_URL=http://kong:8000
      - SUPABASE_PUBLIC_URL=http://localhost:${config.kongPort}
      - SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
    depends_on:
      supabase-db:
        condition: service_healthy
      supabase-meta:
        condition: service_started
    networks:
      - n8n-supabase-network

  # ============================================
  # Supabase Auth (GoTrue)
  # ============================================
  supabase-auth:
    image: supabase/gotrue:v2.143.0
    container_name: supabase-auth
    restart: unless-stopped
    ports:
      - "${config.authPort}:9999"
    environment:
      - GOTRUE_API_HOST=0.0.0.0
      - GOTRUE_API_PORT=9999
      - API_EXTERNAL_URL=http://localhost:${config.kongPort}
      - GOTRUE_DB_DRIVER=postgres
      - GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:${config.dbPassword}@supabase-db:5432/supabase
      - GOTRUE_SITE_URL=http://localhost:${config.studioPort}
      - GOTRUE_JWT_SECRET=${config.jwtSecret}
      - GOTRUE_JWT_EXP=3600
      - GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
      - GOTRUE_DISABLE_SIGNUP=false
      - GOTRUE_EXTERNAL_EMAIL_ENABLED=true
      - GOTRUE_MAILER_AUTOCONFIRM=true
    depends_on:
      supabase-db:
        condition: service_healthy
    networks:
      - n8n-supabase-network

  # ============================================
  # Supabase REST API (PostgREST)
  # ============================================
  supabase-rest:
    image: postgrest/postgrest:v12.0.1
    container_name: supabase-rest
    restart: unless-stopped
    ports:
      - "${config.restPort}:3000"
    environment:
      - PGRST_DB_URI=postgres://authenticator:${config.dbPassword}@supabase-db:5432/supabase
      - PGRST_DB_SCHEMAS=public,storage,graphql_public
      - PGRST_DB_ANON_ROLE=anon
      - PGRST_JWT_SECRET=${config.jwtSecret}
      - PGRST_DB_USE_LEGACY_GUCS=false
      - PGRST_APP_SETTINGS_JWT_SECRET=${config.jwtSecret}
      - PGRST_APP_SETTINGS_JWT_EXP=3600
    depends_on:
      supabase-db:
        condition: service_healthy
    networks:
      - n8n-supabase-network

  # ============================================
  # Supabase Realtime
  # ============================================
  supabase-realtime:
    image: supabase/realtime:v2.28.32
    container_name: supabase-realtime
    restart: unless-stopped
    ports:
      - "${config.realtimePort}:4000"
    environment:
      - PORT=4000
      - DB_HOST=supabase-db
      - DB_PORT=5432
      - DB_USER=supabase_admin
      - DB_PASSWORD=${config.dbPassword}
      - DB_NAME=supabase
      - DB_AFTER_CONNECT_QUERY=SET search_path TO _realtime
      - DB_ENC_KEY=supabaserealtime
      - API_JWT_SECRET=${config.jwtSecret}
      - SECRET_KEY_BASE=${config.secretKeyBase}
      - ERL_AFLAGS=-proto_dist inet_tcp
      - ENABLE_TAILSCALE=false
      - DNS_NODES=''
    depends_on:
      supabase-db:
        condition: service_healthy
    networks:
      - n8n-supabase-network

  # ============================================
  # Supabase Storage
  # ============================================
  supabase-storage:
    image: supabase/storage-api:v0.46.4
    container_name: supabase-storage
    restart: unless-stopped
    ports:
      - "${config.storagePort}:5000"
    environment:
      - ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      - SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
      - POSTGREST_URL=http://supabase-rest:3000
      - PGRST_JWT_SECRET=${config.jwtSecret}
      - DATABASE_URL=postgres://supabase_storage_admin:${config.dbPassword}@supabase-db:5432/supabase
      - FILE_SIZE_LIMIT=52428800
      - STORAGE_BACKEND=file
      - FILE_STORAGE_BACKEND_PATH=/var/lib/storage
      - TENANT_ID=stub
      - REGION=local
      - GLOBAL_S3_BUCKET=stub
    volumes:
      - supabase_storage_data:/var/lib/storage
    depends_on:
      supabase-db:
        condition: service_healthy
      supabase-rest:
        condition: service_started
    networks:
      - n8n-supabase-network

  # ============================================
  # Supabase Meta (PG Meta)
  # ============================================
  supabase-meta:
    image: supabase/postgres-meta:v0.80.0
    container_name: supabase-meta
    restart: unless-stopped
    ports:
      - "${config.metaPort}:8080"
    environment:
      - PG_META_PORT=8080
      - PG_META_DB_HOST=supabase-db
      - PG_META_DB_PORT=5432
      - PG_META_DB_NAME=supabase
      - PG_META_DB_USER=supabase_admin
      - PG_META_DB_PASSWORD=${config.dbPassword}
    depends_on:
      supabase-db:
        condition: service_healthy
    networks:
      - n8n-supabase-network

  # ============================================
  # Kong - API Gateway
  # ============================================
  supabase-kong:
    image: kong:2.8.1
    container_name: supabase-kong
    restart: unless-stopped
    ports:
      - "${config.kongPort}:8000"
      - "8443:8443"
    environment:
      - KONG_DATABASE=off
      - KONG_DECLARATIVE_CONFIG=/var/lib/kong/kong.yml
      - KONG_DNS_ORDER=LAST,A,CNAME
      - KONG_PLUGINS=request-transformer,cors,key-auth,acl,basic-auth
      - KONG_NGINX_PROXY_PROXY_BUFFER_SIZE=160k
      - KONG_NGINX_PROXY_PROXY_BUFFERS=64 160k
    volumes:
      - ./volumes/api/kong.yml:/var/lib/kong/kong.yml
    depends_on:
      supabase-auth:
        condition: service_started
      supabase-rest:
        condition: service_started
      supabase-realtime:
        condition: service_started
      supabase-storage:
        condition: service_started
    networks:
      - n8n-supabase-network

volumes:
  n8n_data:
  supabase_db_data:
  supabase_storage_data:

networks:
  n8n-supabase-network:
    driver: bridge
`;
};

export const generateEnvFile = (config: ProjectConfig): string => {
  return `# ============================================
# n8n + Supabase Docker Configuration
# ============================================
# Generated configuration file
# Edit these values before running docker-compose up

# --- n8n Settings ---
N8N_PORT=${config.n8nPort}
N8N_USER=${config.n8nUser}
N8N_PASSWORD=${config.n8nPassword}

# --- Database Settings ---
DB_PORT=${config.dbPort}
DB_PASSWORD=${config.dbPassword}

# --- Supabase Settings ---
SUPABASE_STUDIO_PORT=${config.studioPort}
SUPABASE_AUTH_PORT=${config.authPort}
SUPABASE_REST_PORT=${config.restPort}
SUPABASE_REALTIME_PORT=${config.realtimePort}
SUPABASE_STORAGE_PORT=${config.storagePort}
SUPABASE_META_PORT=${config.metaPort}
SUPABASE_KONG_PORT=${config.kongPort}

# --- Security ---
JWT_SECRET=${config.jwtSecret}
SECRET_KEY_BASE=${config.secretKeyBase}

# --- Organization ---
ORGANIZATION_NAME=${config.orgName}
PROJECT_NAME=${config.projectName}

# --- General ---
TIMEZONE=${config.timezone}
`;
};

export const generateRolesSql = (): string => {
  return `-- Supabase roles initialization
-- This script creates the necessary roles for Supabase services

-- Create authenticator role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator WITH NOINHERIT LOGIN PASSWORD 'postgres';
  END IF;
END $$;

-- Create anon role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
END $$;

-- Create authenticated role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
END $$;

-- Create service_role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT;
  END IF;
END $$;

-- Create supabase_admin role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin WITH LOGIN SUPERUSER PASSWORD 'postgres';
  END IF;
END $$;

-- Create supabase_auth_admin role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin WITH BYPASSRLS NOINHERIT CREATEROLE LOGIN PASSWORD 'postgres';
  END IF;
END $$;

-- Create supabase_storage_admin role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin WITH BYPASSRLS NOINHERIT CREATEROLE LOGIN PASSWORD 'postgres';
  END IF;
END $$;

-- Create supabase_replication_admin role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_replication_admin') THEN
    CREATE ROLE supabase_replication_admin WITH LOGIN REPLICATION;
  END IF;
END $$;

-- Create supabase_read_only_user role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_read_only_user') THEN
    CREATE ROLE supabase_read_only_user WITH BYPASSRLS LOGIN PASSWORD 'postgres';
    GRANT USAGE ON SCHEMA public TO supabase_read_only_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO supabase_read_only_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO supabase_read_only_user;
  END IF;
END $$;

-- Grant roles to authenticator
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;

-- Grant supabase_admin to postgres
GRANT supabase_admin TO postgres;
`;
};

export const generateKongYml = (config: ProjectConfig): string => {
  return `_format_version: '2.1'
_transform: true

###
### Consumers / Users
###
consumers:
  - username: anon
    keyauth_credentials:
      - key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
  - username: service_role
    keyauth_credentials:
      - key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

###
### Access Control List
###
acls:
  - consumer: anon
    group: anon
  - consumer: service_role
    group: admin

###
### API Routes
###
services:
  ## GoTrue (Auth)
  - name: auth-v1-open
    url: http://supabase-auth:9999/verify
    routes:
      - name: auth-v1-all
        paths:
          - '/auth/v1/verify*'
    plugins:
      - name: cors
  - name: auth-v1-open-callback
    url: http://supabase-auth:9999/callback
    routes:
      - name: auth-v1-callback
        paths:
          - '/auth/v1/callback*'
    plugins:
      - name: cors
  - name: auth-v1-open-authorize
    url: http://supabase-auth:9999/authorize
    routes:
      - name: auth-v1-authorize
        paths:
          - '/auth/v1/authorize*'
    plugins:
      - name: cors
  - name: auth-v1
    url: http://supabase-auth:9999/
    routes:
      - name: auth-v1-all
        paths:
          - '/auth/v1/*'
    plugins:
      - name: key-auth
        config:
          hide_credentials: false
      - name: cors
      - name: acl
        config:
          hide_groups_header: true
          allow_groups:
            - anon
            - admin

  ## REST (PostgREST)
  - name: rest-v1
    url: http://supabase-rest:3000/
    routes:
      - name: rest-v1-all
        paths:
          - '/rest/v1/*'
    plugins:
      - name: key-auth
        config:
          hide_credentials: false
      - name: cors
      - name: acl
        config:
          hide_groups_header: true
          allow_groups:
            - anon
            - admin
      - name: request-transformer
        config:
          add:
            headers:
              - Content-Profile:public
              - Accept-Profile:public

  ## Realtime
  - name: realtime-v1
    url: http://supabase-realtime:4000/socket
    routes:
      - name: realtime-v1-all
        paths:
          - '/realtime/v1/*'
    plugins:
      - name: key-auth
        config:
          hide_credentials: false
      - name: cors
      - name: acl
        config:
          hide_groups_header: true
          allow_groups:
            - anon
            - admin

  ## Storage
  - name: storage-v1
    url: http://supabase-storage:5000/
    routes:
      - name: storage-v1-all
        paths:
          - '/storage/v1/*'
    plugins:
      - name: key-auth
        config:
          hide_credentials: false
      - name: cors
      - name: acl
        config:
          hide_groups_header: true
          allow_groups:
            - anon
            - admin
`;
};

export interface ProjectConfig {
  n8nPort: string;
  n8nUser: string;
  n8nPassword: string;
  dbPort: string;
  dbPassword: string;
  studioPort: string;
  authPort: string;
  restPort: string;
  realtimePort: string;
  storagePort: string;
  metaPort: string;
  kongPort: string;
  jwtSecret: string;
  secretKeyBase: string;
  orgName: string;
  projectName: string;
  timezone: string;
}

export const defaultConfig: ProjectConfig = {
  n8nPort: '5678',
  n8nUser: 'admin',
  n8nPassword: 'secure_n8n_password',
  dbPort: '5432',
  dbPassword: 'super_secret_db_password',
  studioPort: '3000',
  authPort: '54321',
  restPort: '54322',
  realtimePort: '54323',
  storagePort: '54324',
  metaPort: '54325',
  kongPort: '8000',
  jwtSecret: 'super-secret-jwt-token-with-at-least-32-characters-long',
  secretKeyBase: 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP',
  orgName: 'My Organization',
  projectName: 'n8n-supabase',
  timezone: 'Europe/Moscow',
};
