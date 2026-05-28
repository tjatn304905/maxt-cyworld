# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json* ./

# Copy shared package
COPY packages/shared/package.json packages/shared/
COPY packages/shared/src packages/shared/src/
COPY packages/shared/tsconfig.json packages/shared/

# Copy client package
COPY packages/client/package.json packages/client/
COPY packages/client/tsconfig.json packages/client/
COPY packages/client/vite.config.js packages/client/
COPY packages/client/index.html packages/client/
COPY packages/client/vite-env.d.ts packages/client/
COPY packages/client/src packages/client/src/
COPY packages/client/public packages/client/public/

# Install all dependencies (workspace-aware)
RUN npm install --workspace=@maxt/client --include-workspace-root

# Build client
RUN npm run build --workspace=@maxt/client

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
