# Hoagie Hub Backend

This is the backend API for the Hoagie Hub application, built with [NestJS](https://nestjs.com/) and [MongoDB](https://www.mongodb.com/).

## Technologies

- **Framework**: NestJS
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JWT (Passport)
- **Validation**: class-validator

## Prerequisites

- [Node.js] (v22 recommended)
- [Docker](https://docs.docker.com/get-docker/) Includes compose functionality
- MongoDB (running locally or accessible via URL if not using Docker)

## Installation

```bash
$ npm install
```

## Environment Variables

Create a `.env` file in the `backend` directory based on `.env.example`.

Required variables:

- `MONGODB_URL`: Connection string for MongoDB (e.g., `mongodb://localhost:27017/hoagiehub`)
- `JWT_SECRET`: Secret key for JWT signing

For Mongo Express:

- `MONGO_EXPRESS_USERNAME`: Username for Mongo Express login
- `MONGO_EXPRESS_PASSWORD`: Password for Mongo Express login

### Database Management (Mongo Express)

When running with Docker Compose, **Mongo Express** is available at [http://localhost:8082](http://localhost:8082) to help you interact with the database.

**Authentication:**

- **Username**: Value of `MONGO_EXPRESS_USERNAME` in `.env`
- **Password**: Value of `MONGO_EXPRESS_PASSWORD` in `.env`

## Running the app

### Using Docker (Recommended)

To run the entire backend stack (API, MongoDB, and Mongo Express) using Docker Compose:

```bash
# Start all services
$ docker compose up -d

# View logs
$ docker compose logs -f

# Stop services
$ docker compose down
```

### Manual Setup

If you prefer to run the application manually:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

```
