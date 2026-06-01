# Auth Service Documentation

## Project

SecureBank – Secure Banking System

## Module

Authentication & Authorization Service

## Team Member

Member 1 – Authentication and Authorization

---

# 1. Overview

The Auth Service is responsible for managing user authentication and authorization within the SecureBank system.

This service provides:

* User Registration
* User Login
* Password Hashing
* JWT Token Generation
* User Profile Access
* Role-Based Access Control (RBAC)
* Protected Routes

The service is implemented using FastAPI and SQLite.

---

# 2. Technologies Used

## Backend

* Python 3.14
* FastAPI
* SQLAlchemy
* SQLite
* Passlib (bcrypt)
* Python-JOSE (JWT)

## Frontend

* React
* Vite
* React Router

---

# 3. System Architecture

Client (React Frontend)
↓
FastAPI Auth Service
↓
SQLite Database

The frontend sends authentication requests to the FastAPI backend.

The backend validates credentials, generates JWT tokens, and stores user information in the database.

---

# 4. Database Design

## Users Table

| Column   | Type    | Description          |
| -------- | ------- | -------------------- |
| id       | Integer | Primary Key          |
| username | String  | Unique Username      |
| email    | String  | Unique Email Address |
| password | String  | Hashed Password      |
| role     | String  | User Role            |

Default role:

customer

Available roles:

* customer
* admin

---

# 5. Security Features

## Password Hashing

Passwords are never stored in plain text.

The system uses bcrypt hashing through Passlib.

Example:

Original Password:

password123

Stored Password:

$2b$12$...

---

## JWT Authentication

After successful login, the server generates a JWT token.

The token contains:

* username
* role
* expiration time

Example Payload:

{
"sub": "eman",
"role": "customer"
}

The token is used to access protected endpoints.

---

# 6. API Endpoints

## GET /

Description:

Health check endpoint.

Response:

{
"message": "SecureBank Auth Service"
}

---

## POST /register

Description:

Creates a new user account.

Request:

{
"username": "eman",
"email": "[eman@example.com](mailto:eman@example.com)",
"password": "Password123!"
}

Response:

{
"message": "User registered successfully"
}

Validation:

* Username must be unique
* Email must be unique

---

## POST /login

Description:

Authenticates a user.

Request:

{
"username": "eman",
"password": "Password123!"
}

Response:

{
"access_token": "JWT_TOKEN",
"token_type": "bearer"
}

---

## GET /profile

Description:

Returns information about the currently authenticated user.

Headers:

Authorization: Bearer JWT_TOKEN

Response:

{
"username": "eman",
"role": "customer"
}

---

## GET /admin

Description:

Admin-only endpoint.

Headers:

Authorization: Bearer JWT_TOKEN

Response:

{
"message": "Welcome Admin"
}

Access Rules:

* Admin → Allowed
* Customer → Forbidden (403)

---

# 7. Frontend Authentication Flow

## Login Process

1. User enters username and password.
2. Frontend sends POST request to /login.
3. Backend validates credentials.
4. JWT token is generated.
5. Token is stored in localStorage.
6. User is redirected to Dashboard.

---

## Protected Routes

The application prevents unauthenticated users from accessing secure pages.

Protected pages:

* Dashboard
* Transfer
* Admin

If no token exists:

User is redirected to Login Page.

---

## Logout Process

1. User clicks Logout.
2. JWT token is removed from localStorage.
3. User session ends.
4. User returns to Login Page.

---

# 8. Role-Based Access Control (RBAC)

The system supports multiple user roles.

## Customer

Permissions:

* Login
* View Dashboard
* View Profile
* Perform Transfers

## Admin

Permissions:

* All Customer Permissions
* Access Admin Panel
* Manage System Functions

---

# 9. Testing Performed

## Registration Testing

Test Cases:

* New user registration
* Duplicate username
* Duplicate email

Result:

Passed

---

## Login Testing

Test Cases:

* Valid credentials
* Invalid username
* Invalid password

Result:

Passed

---

## JWT Testing

Test Cases:

* Valid token
* Expired token
* Missing token

Result:

Passed

---

## Role Testing

Test Cases:

* Customer accessing admin endpoint
* Admin accessing admin endpoint

Result:

Passed

---

# 10. Future Improvements

Future enhancements may include:

* Multi-Factor Authentication (MFA)
* Password Reset via Email
* Redis-Based Session Management
* Login Attempt Limiting
* Account Lockout Mechanism
* OAuth Integration
* Refresh Tokens

---

# Conclusion

The Auth Service successfully implements secure user authentication and authorization using FastAPI, SQLite, bcrypt password hashing, JWT tokens, and role-based access control. The module provides a secure foundation for the SecureBank application and ensures that only authorized users can access protected resources.
