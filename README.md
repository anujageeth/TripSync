# TravelPlanner

A full‑stack MERN travel planning app with authentication, hotel discovery, budget planning, maps, and a personal planner.

## Features

- Email/password auth (login/signup)
- Travel planner: create/edit/view plans and budgets
- Searchable catalog: cities, hotels, meals
- Hotel details with images and info
- User profile management
- Map view for places
- Responsive UI

## Tech Stack

- Frontend: React, React Router, CSS modules/files
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)

## Monorepo Structure

```
TravelPlanner 1/
  frontend/
    src/ (React components/pages, CSS)
    public/
    package.json
  backend/
    controllers/ models/ routes/ config/
    .env (not committed)
    package.json
```

Key backend models: BudgetPlan, Cities, Hotels, Meals, VisitingPlaces, TravelData, Employee.

## Prerequisites

- Node.js 18+ and npm 9+
- A MongoDB instance (Atlas or local)

## API Overview (high level)

Base URL: (configurable via .env)

- Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me

- Catalog
  - GET /api/catalog/cities
  - GET /api/catalog/hotels
  - GET /api/catalog/hotels/:id
  - GET /api/catalog/meals

- Planner
  - GET /api/planner/plans
  - POST /api/planner/plans
  - GET /api/planner/plans/:id
  - PUT /api/planner/plans/:id
  - DELETE /api/planner/plans/:id

- Users
  - GET /api/users/me
  - PUT /api/users/me
  - GET /api/users/:id
