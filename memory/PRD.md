# SpoedKlus - Product Requirements Document

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

### Backend (FastAPI)
- User authentication (JWT-based)
- Vakman registration and management
- Booking CRUD operations
- Stripe payment integration
- Public stats and reviews API
- Service data endpoints

### Frontend (React)
- Landing page with bento grid services
- Complete booking flow with stepper
- Customer & Vakman dashboards
- Auth pages (login, register, vakman register)
- Service detail pages
- Responsive design with Tailwind CSS

### Database (MongoDB)
Collections: users, vakmannen, bookings, reviews, payment_transactions

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] Core booking flow
- [x] Payment integration
- [x] User authentication

### P1 (High Priority) - Next
- [ ] Admin dashboard for managing vakmannen and bookings
- [ ] Email notifications (booking confirmation, assignment)
- [ ] SMS notifications for emergency bookings
- [ ] Vakman approval workflow in admin

### P2 (Medium Priority)
- [ ] Customer can leave reviews after job completion
- [ ] Vakman profile pages with reviews
- [ ] Search/filter vakmannen by location
- [ ] Booking calendar view for vakmannen
- [ ] Invoice generation

### P3 (Nice to Have)
- [ ] Mobile app (React Native)
- [ ] Real-time chat between customer and vakman
- [ ] GPS tracking for vakman arrival
- [ ] Multi-language support

## Tech Stack
- **Backend**: FastAPI, MongoDB, emergentintegrations (Stripe)
- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Auth**: JWT tokens
- **Payments**: Stripe Checkout

## Next Tasks
1. Build admin dashboard for vakman approvals
2. Implement email notifications
3. Add customer review system
