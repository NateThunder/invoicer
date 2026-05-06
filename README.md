# Invoicer

A standalone Vite React app for creating invoices in the browser.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Data Storage

Invoicer has no backend, account system, cloud sync, or external database dependency. Businesses, clients, uploaded logo data, the active business, and the invoice counter are saved in browser `localStorage`.

Clearing browser or site data for this app deletes all saved data.
