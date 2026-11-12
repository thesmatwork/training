# 11. Testing and Acceptance Checklist

## Frontend
- [ ] `npm install` completes successfully
- [ ] `npm run build` completes successfully
- [ ] Responsive layout works on mobile and desktop
- [ ] Beginner, Intermediate, and Expert dashboards are visually distinct
- [ ] Forms validate required fields and display API errors
- [ ] Loading, empty, success, and failure states are present

## Backend and security
- [ ] API health endpoint responds
- [ ] Password authentication uses secure hashing
- [ ] Google login validates provider credentials
- [ ] OTP flow uses a real configured provider outside development
- [ ] JWT-protected routes reject unauthenticated requests
- [ ] Cross-user farm/crop access tests fail safely
- [ ] DynamoDB create/read/update/delete flows work
- [ ] S3 upload is private and uses expiring presigned URLs

## Integrations and deployment
- [ ] Weather and market values are sourced and timestamped
- [ ] AI provider failure fallback works
- [ ] Scheme links and deadlines are verified against official sources
- [ ] PDF/Excel exports are tested
- [ ] Deployment configuration and costs are documented

**Status note:** This checklist describes acceptance requirements; it does not claim every backend integration is already implemented in the frontend ZIP.
