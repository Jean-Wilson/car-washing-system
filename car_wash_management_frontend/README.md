# ShineWash — Car Wash Management System (Frontend)

A responsive frontend starter for managing a car wash business.

## Features
- Dashboard with booking, customer and paid-revenue summaries
- Create bookings with customer, vehicle, service, date and time details
- Update booking status: Pending, In progress, Completed or Cancelled
- Customer records and search
- Service packages and prices
- Payment overview
- Browser localStorage persistence (data remains in the same browser)

## Run the project
Install dependencies once from the repository root, then start the Vite development server:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Run with Docker
From the repository root, build and start the frontend:

```sh
docker build -t car-wash-frontend .
docker run --rm -p 8080:80 car-wash-frontend
```

Then open `http://localhost:8080`.

## Project structure
```text
car_wash_management_frontend/
├── index.html
├── src/
│   ├── App.jsx
│   └── main.jsx
├── styles.css
└── README.md
```

## Important
This is a frontend demonstration. It stores data in browser localStorage and does not yet have a backend, database, authentication, or real payment processing. Connect it to your API/database before using it for a real business.

## Suggested next step
Build a backend API (for example, PHP/MySQL or Node.js/MySQL) for users, customers, services, bookings and payments.
