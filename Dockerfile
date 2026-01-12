# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy env vars for build time (overridden at runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV GARAGE_ENDPOINT="http://localhost:3900"
ENV GARAGE_REGION="garage"
ENV GARAGE_ACCESS_KEY_ID="dummy"
ENV GARAGE_SECRET_ACCESS_KEY="dummy"
ENV GARAGE_BUCKET="dummy"
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy schema and migration script
COPY --chown=nextjs:nodejs schema.sql ./schema.sql
COPY --chown=nextjs:nodejs scripts/run-migrations.sh ./run-migrations.sh
RUN chmod +x ./run-migrations.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./run-migrations.sh"]
