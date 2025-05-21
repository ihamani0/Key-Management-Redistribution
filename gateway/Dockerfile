# Use Node.js 23 Alpine as the base image
FROM node:22-alpine

# Create non‑root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Fix permissions for the app directory (for compatibility with volume mounts)
RUN chown -R appuser:appgroup /usr/src/app

# Expose the port the app runs on (for documentation)
EXPOSE 3000

# Command to run the app (overridden in docker-compose.yaml for dev)
CMD ["sh","-c","npm run boot && npm start"]