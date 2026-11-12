# Sweet Crumbs order server

A small training server for the Sweet Crumbs Order Desk. It has no dependencies, so there is no `npm install`.

## Run it

You need Node.js 18 or newer. Check with `node --version`.

```
cd server
node server.js
```

(`npm start` does the same.) You should see:

```
Sweet Crumbs server running at http://localhost:3000/api
```

Leave this terminal open while you work. Your Angular app runs in a **second** terminal (`ng serve`, port 4200). If you close the server, your app will show a network error.

Check it works: open <http://localhost:3000/api/health> in your browser. You should see `{"status":"ok"}`.

## The rules

- **Address:** `http://localhost:3000/api`
- **Token:** every call except `/api/health` must send the header `Authorization: Bearer sweetcrumbs-token`. Without it the server answers **401**.
- **Delay:** every answer takes about 0.4 seconds, on purpose, so you can see your loading indicator. To change it, start the server with `DELAY_MS=1500 node server.js` (on Windows PowerShell: `$env:DELAY_MS=1500; node server.js`).
- **Data:** orders are kept in `orders.json`, which the server creates next to `server.js`. They survive restarting the server. Do not commit `orders.json` (add `server/orders.json` to `.gitignore`).
- **Port:** to use another port, start with `PORT=3001 node server.js`.

## The endpoints

| Method | Address | What it does | Success |
| --- | --- | --- | --- |
| GET | `/api/health` | Connection check. No token needed. | 200 |
| GET | `/api/orders` | List all orders. Optional filters: `?town=Northfield` and `?q=blue` (part of the customer name). They can be combined. | 200 and a list |
| GET | `/api/orders/:id` | One order. | 200 |
| POST | `/api/orders` | Create an order. | 201 and the new order |
| PUT | `/api/orders/:id` | Replace an order. Send all the fields. | 200 and the order |
| PATCH | `/api/orders/:id` | Change only the fields you send, for example `{ "status": "Baking" }`. | 200 and the order |
| DELETE | `/api/orders/:id` | Delete an order. | 204 and no body |
| POST | `/api/reset` | Put the five starting orders back. | 204 |
| GET | `/api/fail/:code` | Always answers with that error code (400 to 599). For testing your error handling. | the code you asked for |

## An order

```
{
  "id": "1",
  "orderNumber": "SCO-0001",
  "accountName": "Hotel Bluebell",
  "flavour": "Chocolate",
  "sizeKg": 2,
  "deliveryDate": "2026-11-07",
  "deliveryTown": "Northfield",
  "status": "New",
  "price": 1800,
  "bigOrder": false,
  "webReference": null
}
```

When you create or change an order, send only these fields: `accountName`, `flavour`, `sizeKg`, `deliveryDate`, `deliveryTown`, `status`, `price`. The server creates `id` and `orderNumber`, and works out `bigOrder` (true when `sizeKg` is 5 or more). Anything else you send is ignored.

## Server rules and errors

| Field | Rule |
| --- | --- |
| `accountName` | Required. |
| `flavour` | Chocolate, Vanilla, Red Velvet or Butterscotch. |
| `sizeKg` | A number from 0.5 to 10. |
| `deliveryDate` | Like `2026-11-20`. Not in the past when you **create** an order. |
| `deliveryTown` | Northfield or Southbay. |
| `status` | New, Baking, Out for Delivery, Delivered or Cancelled. |
| `price` | Empty or a number that is not negative. Required when the status is Delivered. |

A rule that is broken gives **400** and this body:

```
{
  "message": "Validation failed.",
  "errors": [
    { "field": "sizeKg", "message": "Size must be between 0.5 and 10 kg." }
  ]
}
```

Other errors have just a message, for example `{ "message": "Order 99 not found." }` with **404**, or **401** for a missing token. When the server is not running at all, the browser reports status **0** (no answer).

## Try it without Angular

```
curl http://localhost:3000/api/health

curl -H "Authorization: Bearer sweetcrumbs-token" http://localhost:3000/api/orders

curl -X PATCH -H "Authorization: Bearer sweetcrumbs-token" -H "Content-Type: application/json" \
  -d '{"status":"Baking"}' http://localhost:3000/api/orders/1
```

## Notes

This server is for training. The token is the same for everyone and the data has no protection, so never use it for anything real.
