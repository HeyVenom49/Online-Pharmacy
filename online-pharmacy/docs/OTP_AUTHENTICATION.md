# OTP Authentication API Documentation

## Overview

The Online Pharmacy system implements email-based OTP (One-Time Password) authentication for enhanced security during user registration, login, and password reset flows.

## OTP Types

| Type | Purpose |
|------|---------|
| `SIGNUP` | Verify email during new user registration |
| `LOGIN` | Additional verification during login |
| `PASSWORD_RESET` | Verify identity for password reset |

## Endpoints

### 1. Signup with OTP

#### Step 1: Generate OTP for Signup
```
POST /auth/signup/otp/generate
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "mobile": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "email": "john@example.com",
    "message": "OTP sent to your email"
  }
}
```

#### Step 2: Verify OTP and Complete Registration
```
POST /auth/signup/otp/verify?email=john@example.com&otpCode=123456&name=John%20Doe&password=Password123!&mobile=+1234567890
```

**Response:**
```json
{
  "success": true,
  "message": "Registration and login successful",
  "data": {
    "token": "eyJhbGci...",
    "tokenType": "Bearer",
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

### 2. Login with OTP

#### Step 1: Standard Login (returns OTP required)
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER",
    "otpRequired": true
  }
}
```

#### Step 2: Verify Login OTP
```
POST /auth/otp/verify
Content-Type: application/json

{
  "email": "john@example.com",
  "otpCode": "123456",
  "otpType": "LOGIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "john@example.com",
    "otpType": "LOGIN",
    "verified": true
  }
}
```

#### Step 3: Complete Login with Verified OTP
```
POST /auth/verify-otp-login?email=john@example.com
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "tokenType": "Bearer",
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

### 3. Password Reset via OTP

#### Step 1: Request Password Reset OTP
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otpType": "PASSWORD_RESET"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email",
  "data": {
    "email": "john@example.com",
    "otpType": "PASSWORD_RESET",
    "expiresInMinutes": 5
  }
}
```

#### Step 2: Reset Password
```
POST /auth/reset-password?email=john@example.com&otpCode=123456&newPassword=NewPassword456!
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## OTP Configuration

| Property | Default | Description |
|----------|---------|-------------|
| `otp.expiry-minutes` | 5 | OTP validity duration |
| `otp.max-attempts` | 3 | Maximum failed verification attempts |

## Email Configuration

The system sends OTP emails via the notifications service. For development/demo:
- **Mailpit**: Access at `http://localhost:8025`
- Configure in `.env`:
  ```bash
  MAIL_HOST=mailpit
  MAIL_PORT=1025
  MAIL_SMTP_AUTH=false
  MAIL_SMTP_STARTTLS=false
  ```

## Security Considerations

1. **OTP Expiry**: OTPs expire after 5 minutes
2. **Attempt Limit**: Maximum 3 failed verification attempts per OTP
3. **One-Time Use**: Each OTP can only be used once
4. **Email Verification**: Email must be valid format
5. **Rate Limiting**: Consider implementing rate limiting on OTP generation endpoints

## Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | No OTP found | OTP not found, request a new one |
| 400 | OTP has expired | OTP expired, request a new one |
| 400 | Too many failed attempts | Max attempts exceeded |
| 400 | Invalid OTP | Incorrect OTP code |
| 400 | Email already registered | User already exists (signup) |
| 404 | User not found | Email not registered (login/reset) |