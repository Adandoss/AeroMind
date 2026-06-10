# Stage 1: install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts requires DATABASE_URL to load; codegen never connects,
# so a placeholder is enough. The real URL is injected at runtime by compose.
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"
RUN npx prisma generate
RUN npm run build

# Stage 3: minimal runtime image (Next.js standalone output)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
