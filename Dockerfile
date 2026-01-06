FROM node:22-alpine AS development
WORKDIR /app
COPY --chown=node:node package*.json pnpm-lock.yaml ./

# Ensure Corepack and pnpm are enabled
RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure non-interactive mode
ENV CI=true

# Install dependencies (allow lockfile updates in development)
RUN pnpm install --no-frozen-lockfile

# Copy all files *except* node_modules (since it's already installed)
COPY --chown=node:node . .

EXPOSE 80
ENTRYPOINT ["./docker/dev/entrypoint"]

FROM node:22-alpine AS build
WORKDIR /app
COPY --chown=node:node package*.json pnpm-lock.yaml ./  # <-- DODAJ pnpm-lock.yaml

# Copy only node_modules from development
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node . .

# Enable Corepack again in this stage
RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure non-interactive mode
ENV CI=true

RUN chmod -R a+x ./node_modules
RUN pnpm run build
ENV NODE_ENV="production"
RUN pnpm install --prod --no-frozen-lockfile  # <-- dodaj --no-frozen-lockfile dla pewności
USER node

FROM node:22-alpine AS production
WORKDIR /app
COPY --chown=node:node docker/prod ./docker/prod
COPY --chown=node:node package.json pnpm-lock.yaml ./  # <-- dodaj też tutaj
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
EXPOSE 80
ENTRYPOINT ["./docker/prod/entrypoint"]