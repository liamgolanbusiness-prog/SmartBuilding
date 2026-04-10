FROM node:18-alpine

# better-sqlite3 needs a C toolchain to build its native binding on Alpine
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Apply schema + seed demo data on first boot, then start the server
CMD ["sh", "-c", "node scripts/bootstrap.js && node dist/server.js"]
