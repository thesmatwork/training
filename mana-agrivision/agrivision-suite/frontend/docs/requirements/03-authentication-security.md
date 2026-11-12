# 03. Authentication and Security

## Login methods requested
1. Email/username + password
2. Google sign-in
3. Mobile number + OTP

## Requirements
- Registration, login, logout, and current-user profile endpoints
- Password hashing; never store plain-text passwords
- JWT access/session validation on protected API routes
- Server-side authorization for farmer, expert, and admin actions
- Google sign-in must validate the provider token on the backend
- OTP flow needs a real provider or clearly labelled development-only mock
- Rate limits and expiry for OTP/password reset flows
- Safe validation and useful error messages
- Secrets kept in environment variables, never committed to source control

## Acceptance checks
- Invalid credentials are rejected
- Protected endpoints reject missing/expired tokens
- A user cannot read or edit another user's private farm records
- Google and OTP are labelled as configuration-dependent until real providers are connected
