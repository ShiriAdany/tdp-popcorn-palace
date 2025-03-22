# Use Node.js 18 as base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 (default for NestJS)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
