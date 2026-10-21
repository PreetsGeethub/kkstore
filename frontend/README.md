# KK Store Frontend

The customer-facing Next.js application for [KK Store](https://www.kkstore.in/), including the storefront and the KK AI shopping-assistant interface.

- **Live storefront:** https://www.kkstore.in/
- **Repository:** https://github.com/PreetsGeethub/kkstore
- **Framework:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS

> The live site can be on a different deployment revision from the repository's `main` branch. Confirm a hosting deployment before assuming a newly merged UI change is visible in production.

## Features

- Storefront product browsing and product detail experiences.
- Existing account and commerce UI.
- **KK AI assistant launcher** in the bottom-left corner, opposite the WhatsApp widget.
- **First-visit introduction:** an animated SVG robot enters the center of the screen and greets the visitor.
- **Visitor controls:** “Let's shop”, “Skip intro”, and close controls.
- **Persistent launcher presence:** hover/focus greeting and subtle pulsing glow.
- **Assistant panel:** slides in from the left and provides the existing conversational interface.
- **AI integration:** sends chat messages to the FastAPI AI service; product cards can be rendered from the response.
- **Accessibility considerations:** keyboard focus styles and reduced-motion support.

The AI assistant currently depends on the tools exposed by the AI service. Product search, product details, authenticated order lookup, and store-policy retrieval are the intended assistant capabilities. Cart management, address changes, and checkout/payment execution through conversation require additional implemented and tested agent tools; they should not be inferred from the storefront's existing commerce flows.

## Run locally

### Prerequisites

- Node.js and npm
- The Node.js/Express backend configured and running if using API-backed store features
- The Python/FastAPI AI service configured and running if using chat
- Valid local environment variables for the API endpoints

### Install dependencies

From the repository root:

```bash
cd frontend
npm install
```

### Configure environment variables

Copy the example file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux**
```bash
cp .env.example .env.local
```

Set the frontend's public API variables in `.env.local`:

- `NEXT_PUBLIC_API_URL` — Node.js/Express API base URL. Match the prefix expected by the existing API client (commonly `http://localhost:5000/api/v1` locally).
- `NEXT_PUBLIC_AI_URL` — FastAPI AI service base URL (commonly `http://localhost:8000` locally).

Only expose values intended to be public in variables prefixed with `NEXT_PUBLIC_`. Never put secrets in frontend environment variables.

### Start the development server

```bash
npm run dev
```

Open http://localhost:3000.

### Validate before submitting changes

```bash
npm run lint
npm run build
```

## Assistant behavior notes

- The AI launcher and greeting are presentation components; they do not independently provide commerce capabilities.
- The first-visit introduction is session-aware and offers explicit controls to open the assistant, skip, or close the introduction.
- The launcher greeting is available on hover and keyboard focus; its glow animation respects the user's reduced-motion preference.
- The assistant sends messages through the existing AI API client. Changes to the greeting animation should not alter the chat API contract or backend tool behavior.
- Product and order data must continue to come from trusted backend APIs. The frontend should not be treated as an authorization boundary.

## Related documentation

See the [root README](../README.md) for system architecture, backend and AI service setup, retrieval evaluation, security notes, and project roadmap.
