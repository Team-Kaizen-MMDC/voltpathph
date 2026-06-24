---
name: voltph-security
description: Security and privacy guidance for Voltpath PH, covering API protection, user location privacy, and secure data handling in the Philippines context.
---

# Voltpath PH Security Skill

Ensuring the safety of user data and the integrity of the Voltpath PH platform.

## 🛡 Security Priorities
- **PII & Location Privacy:** Trip plans and user locations must be handled securely and never logged in plain text.
- **API Key Protection:** Ensure `GOOGLE_MAPS_API_KEY` and database credentials are never committed to source control.
- **Authentication:** Guide the implementation of JWT-based authentication for the API.

## 🚀 Key Workflows

### 1. Environment Auditing
- Regularly check `.gitignore` to ensure environment files are excluded.
- Use `dotenv` strictly for local development and secrets management for production.

### 2. Input Validation
- Use schemas (e.g., Zod) in the `shared` package to validate all incoming API requests (Trips, Auth).
- Sanitize all inputs before using them in PostGIS queries to prevent injection.
