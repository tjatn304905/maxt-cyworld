# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json* ./

# Copy shared package
COPY packages/shared/package.json packages/shared/
COPY packages/shared/src packages/shared/src/
COPY packages/shared/tsconfig.json packages/shared/

# Copy server package
COPY packages/server/package.json packages/server/
COPY packages/server/tsconfig.json packages/server/
COPY packages/server/src packages/server/src/

# Install all dependencies (workspace-aware)
RUN npm install --workspace=@maxt/server --include-workspace-root

# Build server
RUN npm run build --workspace=@maxt/server

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY packages/shared/src packages/shared/src/
COPY packages/server/package.json packages/server/

RUN npm install --workspace=@maxt/server --include-workspace-root --omit=dev

COPY --from=build /app/packages/server/dist packages/server/dist/

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "packages/server/dist/index.js"]
