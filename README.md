# Community Service Finder - Backend

Backend API for the Community Service Finder platform built using Node.js, Express.js, MongoDB Atlas, JWT Authentication, and bcrypt.js.

This backend handles user authentication, service management, database operations, and secure communication between the frontend and database.

## Live API

Backend URL:

https://community-backend-mf36.onrender.com

---

## Overview

The Community Service Finder backend provides RESTful APIs that allow users to:

* Register and log in securely
* Manage community service listings
* Search for available services
* Update and delete their own services
* Access protected resources using JWT authentication

---

## Features

### Authentication

* User Registration
* User Login
* JWT Token Generation
* Protected Routes
* Password Encryption using bcrypt.js

### Service Management

* Add Service
* View Services
* Search Services
* Update Service
* Delete Service
* Manage User-Specific Services

### Database Features

* MongoDB Atlas Integration
* Mongoose ODM
* Data Validation
* Relationship Between Users and Services

---

## Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT (JSON Web Token)
* bcrypt.js
* CORS
* dotenv

---

## API Endpoints

### Authentication APIs

POST /register

Register a new user.

POST /login

Authenticate user and generate JWT token.

---

### Service APIs

GET /services

Fetch all available services.

POST /add-service

Add a new service.

GET /my-services

Fetch services created by the logged-in user.

PUT /update-service/:id

Update an existing service.

DELETE /delete-service/:id

Delete a service.

---

## Database Collections

### Users Collection

Fields:

* name
* email
* password
* phone

### Services Collection

Fields:

* serviceName
* category
* address
* city
* phone
* description
* userId

---

## Project Structure

backend/
│
├── server.js
├── package.json
├── .env
│
├── routes/
├── models/
├── controllers/
├── middleware/
│
└── config/

---

## Environment Variables

Create a .env file:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

---

## Installation

### Clone Repository

git clone https://github.com/Annu-arch-blip/community-backend

### Install Dependencies

npm install

### Start Development Server

npm start

or

npm run dev

---

## Security Features

* JWT Authentication
* Password Hashing with bcrypt.js
* Protected Routes
* Authorization Headers
* Secure API Communication

---

## Future Enhancements

* Google Authentication
* Real-Time Notifications
* Service Reviews and Ratings
* AI-Based Recommendations
* Payment Gateway Integration
* GPS-Based Service Discovery
* Chat Support System

---

## Author

Annu

B.Tech Computer Science Engineering

---

## License

This project is developed for educational and learning purposes.
