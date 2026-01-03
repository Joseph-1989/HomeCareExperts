# Dependencies stage
FROM node:20.10.0-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Builder stage
FROM node:20.10.0-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code and tsconfig files
COPY apps/ ./apps/

# Build the application
RUN npm run build

# Runner stage
FROM node:20.10.0-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy production dependencies from deps stage
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy package.json for runtime reference
COPY --chown=nestjs:nodejs package.json ./

# Copy uploads directory for static file serving
# Note: For production, consider using Google Cloud Storage instead of local files
COPY --chown=nestjs:nodejs uploads/ ./uploads/

# Switch to non-root user
USER nestjs

# Expose port (Cloud Run will set PORT env var, map it to PORT_API)
EXPOSE 3000

# Start the application
# Cloud Run sets PORT env var, we map it to PORT_API for the NestJS app
CMD ["sh", "-c", "PORT_API=${PORT:-3000} node dist/apps/homecareexperts-api/main"]

