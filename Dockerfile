# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for TypeScript build)
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Copy resources
COPY resources/ ./resources/

# Build the application
RUN npm run build

# Remove dev dependencies after build (reduce image size)
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S mcp -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R mcp:nodejs /app
USER mcp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8082
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({hostname: 'localhost', port: 8082, path: '/status', method: 'GET'}, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Default command (can be overridden)
CMD ["npm", "run", "start:http"]
