# SpoedDienst24.nl - Product Requirements Document

## Project Overzicht
Een platform voor het boeken van vakmannen (elektricien, loodgieter, slotenmaker) met focus op spoedklussen, vergelijkbaar met zoofy.nl.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Email**: aiosmtplib met TransIP SMTP
- **Payments**: Stripe
- **Authenticatie**: JWT

## Voltooide Features

### Kernfunctionaliteit
- [x] Service pagina's (elektricien, loodgieter, slotenmaker)
- [x] Boekingsflow met 5 stappen (Probleem → Monteur → Datum → Adres → Contact)
- [x] **Kies een monteur feature** - Klant kan specifieke vakman selecteren
- [x] Spoed vs Regulier prijzen
- [x] Betaling bij de monteur

### Gebruikersbeheer
- [x] Klant registratie en login
- [x] Vakman registratie met KVK/BTW/Verzekering gegevens
- [x] Dubbele registratie preventie
- [x] Auto-login na vakman registratie
- [x] Wachtwoord vergeten flow
- [x] JWT authenticatie

### Dashboards
- [x] Klant dashboard
- [x] Vakman dashboard (opdrachten, agenda, profiel)
- [x] **Admin dashboard (BEVEILIGD)**
  - Overzicht met statistieken
  - Boekingen beheer
  - Vakmannen beheer (goedkeuren/afwijzen)
  - Reviews beheer
  - Financieel dashboard
  - Marketing dashboard (MOCKED - geen Google Ads integratie)

### Email Systeem
- [x] Boekingsbevestiging naar klant
- [x] Boekingsnotificatie naar admin
- [x] Notificatie naar beschikbare vakmannen
- [x] **Specifieke vakman notificatie** (als klant een monteur kiest)
- [x] Goedkeuring/afwijzing emails voor vakmannen
- [x] Wachtwoord reset emails

### Beveiliging
- [x] **Admin endpoints beveiligd** met role-based authenticatie
- [x] Admin link alleen zichtbaar voor admin gebruikers
- [x] JWT token verificatie

### Content Pagina's
- [x] Landing page
- [x] Over ons, Garantie, Prijzen
- [x] Premium lidmaatschap
- [x] Zakelijke pagina's (VVE, Horeca, Kantoor, Winkel)
- [x] Vakman info pagina's
- [x] Review pagina
- [x] Juridische pagina's (Privacy, Voorwaarden, Cookies)

## API Endpoints

### Nieuw toegevoegd (deze sessie)
- `GET /api/vakmannen/available?service_type={type}` - Beschikbare monteurs per dienst
- Alle `/api/admin/*` endpoints zijn nu beveiligd met `get_admin_user` dependency

### Belangrijke endpoints
- `POST /api/bookings` - Accepteert nu `assigned_vakman_id` en `assigned_vakman_name`
- `POST /api/auth/login` - Retourneert token en user info inclusief role
- `GET /api/admin/stats` - Admin statistieken (beveiligd)
- `GET /api/admin/financial` - Financiële data (beveiligd)
- `GET /api/admin/marketing` - Marketing data (beveiligd)

## Database Schema

### bookings collectie
```json
{
  "id": "uuid",
  "vakman_id": "uuid | null",
  "vakman_name": "string | null",
  "service_type": "elektricien|loodgieter|slotenmaker",
  "is_emergency": "boolean",
  "customer_name": "string",
  "customer_email": "string",
  "customer_phone": "string",
  "address": "string",
  "postal_code": "string",
  "city": "string",
  "preferred_date": "string",
  "preferred_time": "string",
  "description": "string",
  "price": "float",
  "status": "pending|accepted|in_progress|completed|cancelled",
  "payment_status": "unpaid|paid"
}
```

### vakmannen collectie
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "phone": "string",
  "service_type": "string",
  "location": "string",
  "hourly_rate": "float",
  "kvk_nummer": "string",
  "btw_nummer": "string",
  "verzekering": "string",
  "verzekering_maatschappij": "string",
  "is_approved": "boolean",
  "is_available": "boolean",
  "rating": "float",
  "total_reviews": "int"
}
```

## Test Accounts
- **Admin**: admin@spoeddienst24.nl / Admin2024!
- **Monteur**: monteur@test.nl / Test1234
- **Klant**: klant@test.nl / Test1234

## Openstaande Items

### P1 - Hoog
- [ ] Google Ads API integratie (Marketing dashboard is nu MOCKED)

### P2 - Medium
- [ ] Component refactoring (AdminDashboard.jsx ~1400 regels)
- [ ] server.py opsplitsen in modules

### P3 - Laag (Backlog)
- [ ] Belgische versie (spoeddienst24.be)
- [ ] Native mobiele app

## Laatste Update
- **Datum**: 24 januari 2025
- **Sessie**: "Kies een monteur" feature voltooid, Admin beveiliging toegevoegd
- **Tests**: 100% geslaagd (22 backend, 4 frontend)
