# Sweet Crumbs Order Desk

An Angular standalone application for the Sweet Crumbs team board, customer enquiries, and cake orders.

## Features

- Team member search, selection, favorites, and updates, backed by `TeamService`.
- Shared recent activity through the root-provided `ActivityLogService`.
- Independent click counters through a card-scoped `CardClicksService`.
- Seeded orders and generated order numbers through `OrderService`.
- A template-driven customer enquiry form and a reactive new-order form.
- Central order-size rules provided with the `APP_CONFIG` injection token.
- Reusable validators for past delivery dates and the price required for delivered orders.

Services are in `src/app/services/`, shared interfaces and order types are in `src/app/models/`, and reusable validators are in `src/app/validators/`.

## Development

Install dependencies with `npm install`, then start the local server:

```bash
npm start
```

Open `http://localhost:4200/`. The development server reloads when source files change.

## Build and tests

```bash
npm run build
npm test -- --watch=false
```

The tests cover service behavior, injector scope, order numbering, form submission and reset behavior, configured size limits, and custom date and delivery-price validation.

## Order rules

Order size limits and the big-order threshold are defined once in `src/app/app.config.ts` through `APP_CONFIG`. An order is considered big when its size is at least `bigOrderKg`. Orders must have a valid delivery date that is not in the past, and a price is required when the status is `Delivered`.
