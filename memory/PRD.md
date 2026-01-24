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

## Huidige Flow

### Klant Boekingsflow (4 stappen)
1. **Probleem** - Beschrijving + Regulier/Spoed keuze
2. **Datum** - Datum en tijdslot selecteren
3. **Adres** - Straat, postcode, plaats
4. **Contact** - Naam, email, telefoon + bevestigen

**Belangrijk**: De klant kiest GEEN monteur. Boekingen komen binnen bij admin.

### Admin Workflow
1. Admin ontvangt email bij nieuwe boeking
2. Admin opent dashboard (`/beheer`)
3. In de Boekingen tab ziet admin alle boekingen met een "Monteur" kolom
4. Boekingen zonder monteur tonen "⚠️ Wijs toe" dropdown
5. Admin selecteert een monteur → status wordt "confirmed"
6. Systeem stuurt email naar die specifieke monteur

### Vakman Workflow (NIEUW)
1. Vakman ziet opdracht in dashboard met status "Nieuw - Actie vereist"
2. Vakman bekijkt details (klant, locatie, datum, beschrijving)
3. Vakman kan:
   - **Accepteren** → status wordt "accepted", kan dan starten met klus
   - **Afwijzen** → status wordt "pending", vakman wordt verwijderd, admin krijgt email om opnieuw toe te wijzen

## Voltooide Features

### Kernfunctionaliteit
- [x] Service pagina's (elektricien, loodgieter, slotenmaker)
- [x] Boekingsflow met 4 stappen
- [x] Spoed vs Regulier prijzen
- [x] Betaling bij de monteur

### Admin Boeking Toewijzing
- [x] Boekingen komen binnen zonder toegewezen monteur
- [x] Admin Dashboard met "Monteur" kolom
- [x] Dropdown om boeking toe te wijzen aan vakman
- [x] `POST /api/admin/booking/{id}/assign` endpoint
- [x] Email notificatie naar toegewezen monteur

### Vakman Acceptatie Flow (NIEUW)
- [x] `POST /api/bookings/{id}/vakman-accept` - Vakman accepteert opdracht
- [x] `POST /api/bookings/{id}/vakman-reject` - Vakman wijst af
- [x] Bij afwijzing: vakman verwijderd van boeking, status terug naar "pending"
- [x] Email naar admin bij afwijzing met verzoek om opnieuw toe te wijzen
- [x] Vakman Dashboard toont "Nieuw - Actie vereist" badge
- [x] Accepteren/Afwijzen knoppen in opdracht detail

### Gebruikersbeheer
- [x] Klant registratie en login
- [x] Vakman registratie met KVK/BTW/Verzekering
- [x] Dubbele registratie preventie
- [x] Auto-login na vakman registratie
- [x] Wachtwoord vergeten flow
- [x] JWT authenticatie

### Dashboards
- [x] Klant dashboard
- [x] Vakman dashboard (opdrachten, agenda, profiel, acceptatie flow)
- [x] **Admin dashboard (BEVEILIGD)**
  - Overzicht met statistieken
  - Boekingen beheer + Monteur toewijzing
  - Vakmannen beheer (goedkeuren/afwijzen)
  - Reviews beheer
  - Financieel dashboard
  - Marketing dashboard (MOCKED)

### Email Systeem
- [x] Boekingsbevestiging naar klant
- [x] Boekingsnotificatie naar admin
- [x] Notificatie naar toegewezen monteur
- [x] **Email naar admin bij vakman afwijzing** (NIEUW)
- [x] Goedkeuring/afwijzing emails voor vakmannen
- [x] Wachtwoord reset emails

### Beveiliging
- [x] Admin endpoints beveiligd met role-based authenticatie
- [x] Admin link alleen zichtbaar voor admin gebruikers
- [x] JWT token verificatie

## Status Flow

```
[Klant boekt] → pending (geen vakman)
      ↓
[Admin wijst toe] → confirmed (vakman toegewezen, wacht op actie)
      ↓
[Vakman accepteert] → accepted → in_progress → completed
      of
[Vakman wijst af] → pending (vakman verwijderd, admin moet opnieuw toewijzen)
```

## API Endpoints

### Vakman Acceptatie (NIEUW)
- `POST /api/bookings/{id}/vakman-accept` - Vakman accepteert (status → accepted)
- `POST /api/bookings/{id}/vakman-reject` - Vakman wijst af (status → pending, vakman → null)

### Admin Toewijzing
- `POST /api/admin/booking/{id}/assign` - Admin wijst toe (status → confirmed)

### Overige
- `POST /api/bookings` - Nieuwe boeking (status = pending, geen vakman)
- `GET /api/vakman/dashboard` - Vakman dashboard data

## Database Schema

### bookings collectie
```json
{
  "id": "uuid",
  "vakman_id": "uuid | null",
  "vakman_name": "string | null",
  "service_type": "elektricien|loodgieter|slotenmaker",
  "status": "pending|confirmed|accepted|in_progress|completed|cancelled",
  ...
}
```

**Status betekenis:**
- `pending` - Wacht op admin toewijzing (of vakman heeft afgewezen)
- `confirmed` - Admin heeft toegewezen, wacht op vakman acceptatie
- `accepted` - Vakman heeft geaccepteerd
- `in_progress` - Vakman is bezig met klus
- `completed` - Klus afgerond

## Test Accounts
- **Admin**: admin@spoeddienst24.nl / Admin2024!
- **Monteur**: monteur@test.nl / Test1234
- **Klant**: klant@test.nl / Test1234

## Openstaande Items

### P1 - Hoog
- [ ] Google Ads API integratie (Marketing dashboard is MOCKED)

### P2 - Medium
- [ ] Component refactoring (AdminDashboard.jsx ~1400 regels)
- [ ] server.py opsplitsen in modules

### P3 - Laag (Backlog)
- [ ] Belgische versie (spoeddienst24.be)
- [ ] Native mobiele app

## Laatste Update
- **Datum**: 24 januari 2025
- **Sessie**: Vakman Acceptatie Flow voltooid
- **Features**: Vakman kan opdrachten accepteren of afwijzen, admin krijgt email bij afwijzing
