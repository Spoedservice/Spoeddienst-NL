# SpoedDienst24 - Product Requirements Document

## Original Problem Statement
Build a platform like Zoofy.nl - a marketplace where customers can book handymen (vakmannen) for jobs. The platform focuses primarily on EMERGENCY services (spoedklussen) for three main categories: Electrician (Elektricien), Plumber (Loodgieter), and Locksmith (Slotenmaker).

## User Personas
1. **Klant (Customer)** - Homeowners needing urgent or regular home repair services
2. **Vakman (Handyman)** - Professionals (elektricien, loodgieter, slotenmaker) offering services
3. **Admin** - Platform administrators managing vakmannen approvals and bookings

## Core Requirements
### Functional Requirements
- [x] Landing page with hero, services, how it works, testimonials, stats
- [x] Three service categories: Elektricien, Loodgieter, Slotenmaker
- [x] Emergency (spoed) toggle with different pricing
- [x] 4-step booking flow: Problem → Date/Time → Address → Contact
- [x] Stripe payment integration
- [x] Customer registration and login
- [x] Vakman registration (pending approval)
- [x] Customer dashboard with booking history
- [x] Vakman dashboard with job management
- [x] Service detail pages

### Non-Functional Requirements
- Dutch language interface
- Mobile responsive design
- 24/7 availability for emergency services

## What's Been Implemented (January 2025)

### Latest Session (24 Jan 2025)
**Admin Dashboard Enhancements:**
- [x] Fixed API authentication issues (removed duplicate routes)
- [x] Added Financial Dashboard tab with:
  - Period selector (Vandaag/Week/Maand/Jaar)
  - Totale Omzet, Betaald, Openstaand, Gem. Orderwaarde
  - Omzet Laatste 7 Dagen chart
  - Omzet per Dienst breakdown
  - Betalingsstatus overzicht
  - Boekingen per Status
  - CSV Export functionaliteit
- [x] Added Marketing Dashboard tab with:
  - Totale Boekingen, Spoed/Regulier breakdown
  - Conversie Ratio
  - Dienst Prestaties (boekingen + omzet per dienst)
  - Top Steden ranking
  - Populaire Tijdsloten

**Vakman Dashboard Improvements:**
- [x] Redesigned with 3 tabs: Opdrachten, Agenda, Profiel
- [x] Opdrachten tab: Booking list with status filters, detail panel with klantgegevens
- [x] Agenda tab: Week view with navigation, today highlight, booking preview
- [x] Profiel tab: Profile info, availability toggle, rating display, earnings

### Backend (FastAPI)
- User authentication (JWT-based)
- Vakman registration and management
- Booking CRUD operations
- Stripe payment integration
- Public stats and reviews API
- Service data endpoints
- **NEW**: Admin financial statistics API (`/api/admin/financial`)
- **NEW**: Admin marketing statistics API (`/api/admin/marketing`)
- **NEW**: CSV export API (`/api/admin/export/bookings`)
- Email notifications (TransIP SMTP)

### Frontend (React)
- Landing page with bento grid services
- Complete booking flow with stepper
- Customer & Vakman dashboards
- Auth pages (login, register, vakman register)
- Service detail pages
- Responsive design with Tailwind CSS
- **NEW**: Enhanced Admin Dashboard (6 tabs)
- **NEW**: Enhanced Vakman Dashboard (3 tabs)

### Database (MongoDB)
Collections: users, vakmannen, bookings, reviews, payment_transactions, public_reviews, premium_subscriptions

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] Core booking flow
- [x] Payment integration
- [x] User authentication
- [x] Admin dashboard for managing vakmannen and bookings
- [x] Financial & Marketing dashboards
- [x] Vakman dashboard improvements

### P1 (High Priority)
- [x] Email notifications (booking confirmation, vakman registration)
- [x] Vakman approval workflow in admin
- [ ] Admin endpoint authentication (currently unprotected)
- [ ] SMS notifications for emergency bookings

### P2 (Medium Priority)
- [x] Customer can leave reviews after job completion
- [ ] Vakman profile pages with reviews
- [ ] Search/filter vakmannen by location
- [x] Booking calendar view for vakmannen (Agenda tab)
- [ ] Invoice generation

### P3 (Nice to Have)
- [ ] Belgian version (spoeddienst24.be)
- [ ] Mobile app (React Native)
- [ ] Real-time chat between customer and vakman
- [ ] GPS tracking for vakman arrival
- [ ] Multi-language support

## Tech Stack
- **Backend**: FastAPI, MongoDB, emergentintegrations (Stripe)
- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Auth**: JWT tokens
- **Payments**: Stripe Checkout
- **Email**: TransIP SMTP via aiosmtplib
- **Analytics**: Google Analytics, Google Ads

## API Endpoints

### Admin APIs (Currently Unprotected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/vakmannen` - All vakmannen
- `GET /api/admin/reviews` - All reviews
- `GET /api/admin/financial?period=month` - Financial statistics
- `GET /api/admin/marketing` - Marketing statistics
- `GET /api/admin/export/bookings` - CSV export
- `POST /api/admin/vakman/{id}/approve` - Approve vakman
- `POST /api/admin/vakman/{id}/reject` - Reject vakman
- `POST /api/admin/review/{id}/approve` - Approve review
- `POST /api/admin/review/{id}/reject` - Reject review
- `PUT /api/admin/booking/{id}/status` - Update booking status

### Test Credentials
- Vakman: test.vakman@demo.nl / test123

## Next Tasks
1. **P0**: Secure admin endpoints with authentication
2. **P1**: Implement SMS notifications for emergency bookings
3. **P2**: Build vakman profile pages with reviews
4. **P3**: Create Belgian version
