# 01. Project Overview — Mana Polam / AgriVision Suite

## Purpose
A responsive, beginner-friendly agricultural web platform for Indian farmers to manage farms, understand crop issues, check weather and market information, learn modern farming, connect with experts, and discover government schemes.

## Required technology
- Frontend: React + Vite + JavaScript + HTML/CSS
- Backend: Python + FastAPI
- Database: Amazon DynamoDB only
- Authentication: JWT-based sessions and server-side authorization
- Image storage: private Amazon S3 objects with presigned uploads where appropriate
- Deployment target: AWS; frontend on S3 + CloudFront, backend on API Gateway/Lambda or a suitable FastAPI host

## Design principles
- Mobile-first and responsive
- Simple language and clear navigation
- Free-first services; document any paid provider or AWS usage cost
- Clear errors and loading states
- Never show private farm data to another user
- AI responses must communicate uncertainty and should not replace qualified agricultural advice

## Main user types
- Farmer
- Agricultural expert
- Administrator
