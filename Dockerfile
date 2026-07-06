FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Build frontend assets and compile server
RUN npm run build

# Expose the app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/env-status || exit 1

# Start production server
CMD ["npm", "start"]
