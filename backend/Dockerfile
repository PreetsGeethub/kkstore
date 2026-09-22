# Use Node.js 22
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the application source code
COPY src ./src

# Start the application
CMD ["npm", "start"]