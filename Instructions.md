# Popcorn Palace - Movie Ticket Booking System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Setting Up Database](#setting-up-database)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)
6. [Termination](#terminating-the-application-and-docker-container)


---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: Version 18.x or higher. You can check if you have it installed with:
  ```bash
  node -v
  ```
  If it's not installed, you can install it from the [official Node.js website](https://nodejs.org/en). Follow the installation instructions for your operating system.

- **npm**: Node.js package manager. Check if it's installed with:
    ```bash
    npm -v
    ```
    If npm is not installed, it will usually be installed along with Node.js. If not, you can install it separately by following the instructions on the [npm website](https://www.npmjs.com/get-npm).

- **Docker**: For running PostgreSQL in a container (optional if you already have PostgreSQL set up). You can check if Docker is installed with:
    ```bash
    docker -v
    ```
    If Docker is not installed, follow these instructions to install it:

- **Linux**: Follow the [official Docker installation guide for Linux](https://docs.docker.com/engine/install/ubuntu/).

- **macOS**: Follow the [official Docker installation guide for macOS](https://docs.docker.com/desktop/setup/install/mac-install/).

Once Docker is installed, you can verify the installation by running:

```bash
docker --version
```

## Installation
Follow these steps to install and set up the project:

- Clone the repository:

```bash
git clone https://github.com/ShiriAdany/tdp-popcorn-palace.git
```
- Install dependencies:

    For the backend (NestJS):

```bash
npm install
```

## Setting Up Database
This project uses PostgreSQL for database management. To run it locally, you can use Docker:

**Run PostgreSQL using Docker** (optional if you have PostgreSQL installed locally):

```bash
docker-compose up -d
```


## Running the Application
Once everything is set up, you can run the application:

- **Start the application:**

```bash
npm run start
````
This will start the NestJS application. By default, the backend will be available on http://localhost:3000.

- **Optional - Run in Development Mode:**

To run the app in development mode (with live-reloading):

```bash
npm run start:dev
```
This will start the app and automatically reload on file changes.

- **Alternative: Use the start.sh Script (Linux/macOS Only)**

If you'd like to automate the setup process, you can use the ```start.sh``` script. This script will handle setting up the environment and running the application with a single command.

**Note**: This script is designed to work on **Linux/macOS** only. Windows users will need to manually run the setup steps.

To use the script:

1. Make the script executable:

```bash
chmod +x start.sh
```

2. Run the script:

```bash
./start.sh
```

This will automatically run the application with the necessary setup (like starting PostgreSQL with Docker).

## Testing
To run tests for your application, follow these steps:

- **Run Unit Tests:**

```bash
npm run test
```

## Terminating the Application and Docker Container
To stop the **Popcorn Palace** backend and the PostgreSQL container, follow these steps:

1. **Stop the NestJS application:**

- In the terminal where the app is running, press ```Ctrl + C``` to stop the server.

2. ***Stop and remove the PostgreSQL Docker container:***

- Run the following command to stop and remove the container:

```bash
docker-compose down
```

3. ***Stop the Docker container (without removing it):***

- If you want to stop the container without removing it, use:

```bash
docker-compose stop
```


