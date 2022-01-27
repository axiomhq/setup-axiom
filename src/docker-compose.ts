export const Content = `version: '3.2'

volumes:
  postgres_data:
  axiomdb_data:

services:
  axiom-db:
    image: \${AXIOM_DB_IMAGE}:\${AXIOM_VERSION}
    environment:
      AXIOM_POSTGRES_URL: "postgres://axiom:axiom@postgres?sslmode=disable&connect_timeout=5"
      AXIOM_STORAGE: "file:///data"
      AXIOM_LICENSE_TOKEN: \${AXIOM_LICENSE_TOKEN}
    depends_on:
      - minio
      - postgres
    restart: unless-stopped
    volumes:
      - axiomdb_data:/data
  axiom-core:
    image: \${AXIOM_CORE_IMAGE}:\${AXIOM_VERSION}
    environment:
      AXIOM_POSTGRES_URL: "postgres://axiom:axiom@postgres?sslmode=disable&connect_timeout=5"
      AXIOM_DB_URL: "http://axiom-db"
      AXIOM_LICENSE_TOKEN: \${AXIOM_LICENSE_TOKEN}
    ports:
      - \${AXIOM_PORT}:80
    depends_on:
      - axiom-db
    restart: unless-stopped
  postgres: 
    image: postgres:13-alpine
    environment:
      POSTGRES_USER: axiom
      POSTGRES_PASSWORD: axiom
    volumes:
      - postgres_data:/var/lib/postgresql/data`;
