#!/bin/bash

echo "Starting the PostgreSQL database with Docker..."
docker-compose up -d

echo "Building the project..."
npm run build

echo "Starting the NestJS server..."
npm run start
