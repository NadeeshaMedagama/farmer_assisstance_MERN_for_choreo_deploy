# Farmer Assistance Backend

A modular Node.js/Express + MongoDB backend for the Farmer Assistance Platform.

## Features
- Auth: register, login, verify email, forgot/reset password, profile
- Crops: CRUD per user
- Forum: threads, replies
- Weather: proxy to Open‑Meteo by coordinates
- Market: list, admin/expert upsert, optional external lookup
- Notifications: stored + email/SMS sending (requires creds)
- Security: Helmet, CORS, rate-limit, compression, logging, global errors

## Requirements
- Node.js 18+
- MongoDB 6+

## Getting Started
```
npm install
cp example.env .env
# edit .env with your values
npm run dev
```

- For quick boot without DB (routes that don’t hit DB will work):
```
SKIP_DB=true npm run start
```

## Environment Variables
See `example.env` for all keys:
- PORT, NODE_ENV, CLIENT_URL
- MONGODB_URI
- JWT_SECRET, JWT_EXPIRE
- OIDC_ISSUER, OIDC_AUDIENCE, OIDC_LOGOUT_REDIRECT
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- WEATHER_API_KEY (optional for some providers; Open‑Meteo demo works)
- MARKET_API_URL (optional)
- TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM (optional)

### Asgardeo OIDC Setup
1. Create an application in Asgardeo (OIDC).
2. Enable Authorization Code Flow and configure allowed callback URLs for your frontend.
3. For APIs, configure an audience or use the client ID as audience depending on your setup.
4. Set in `.env`:
```
OIDC_ISSUER=https://api.asgardeo.io/t/<org_name>/o
OIDC_AUDIENCE=<your API identifier or client id>
OIDC_LOGOUT_REDIRECT=http://localhost:3000
```
5. Clients must obtain an access token from Asgardeo and call this API with `Authorization: Bearer <token>`.

### HTTPS (Self‑signed) for Local Dev
1. Create certs:
```
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=localhost"
```
2. In `.env`:
```
HTTPS_ENABLE=true
SSL_KEY_PATH=certs/key.pem
SSL_CERT_PATH=certs/cert.pem
```
3. Start the server and use `https://localhost:5000`.

### OIDC Endpoints
- `GET /api/oidc/profile` – returns token user info
- `GET /api/oidc/options` – returns allowed districts, products, delivery times
- `GET /api/oidc/purchases` – list current user's purchases (by token subject)
- `POST /api/oidc/purchases` – create purchase. Body:
```
{
  "dateOfPurchase": "2025-12-01",
  "deliveryTime": "10 AM",
  "deliveryDistrict": "Colombo",
  "productName": "Rice",
  "quantity": 2,
  "message": "Leave at gate"
}
```
- `GET /api/oidc/logout-url` – returns an IDP logout URL (client should redirect).

### Postman Collection
Import `postman/FarmerAssistance.postman_collection.json` and set an environment variable `token` with an Asgardeo access token.
- Auth: In each request, header `Authorization: Bearer {{token}}`.
- Try `GET /api/oidc/profile`, then `POST /api/oidc/purchases`, then `GET /api/oidc/purchases`.

### Submission JSON
Fill `SE2021XXX.json` with your details per the assessment instructions.

## Scripts
- `npm run dev` – start with nodemon
- `npm start` – start

## API Overview
- Health: `GET /health`
- Auth: `/api/auth` – register, login, verify-email, forgot-password, reset-password, me
- Users: `/api/users/me`
- Crops: `/api/crops`
- Forum: `/api/forum`
- Weather: `/api/weather?lat=..&lon=..`
- Market: `/api/market` (GET list), `/api/market/external` (GET), `/api/market` (POST admin/expert)
- Notifications: `/api/notifications`

JWT required for protected routes via `Authorization: Bearer <token>`.

## Notes
- Email/SMS sending requires valid SMTP/Twilio credentials.
- Input validation via express-validator on auth endpoints.
- Logs written to `logs/` and console (non‑prod).
