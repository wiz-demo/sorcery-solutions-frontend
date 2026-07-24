# Sorcery Solutions Frontend

Frontend for the Sorcery Solutions web app. Visitors can submit spell requests, upload spellbook YAML files, and browse submitted spells from the spellbook page.

The app is built with Next.js and includes API routes that proxy requests to the Sorcery Solutions backend.

## Getting Started

Install dependencies and start the local development server:

```bash
cd src
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Configuration

Set `API_BASE_URL` to point the frontend API routes at the backend service:

```bash
export API_BASE_URL=http://localhost:3000
```

If unset, the app defaults to `http://localhost:3000`.

## Scripts

Run commands from the `src` directory:

```bash
npm run dev     # start the development server
npm run build   # create a production build
npm run start   # run the production server
```

## Deployment

Dockerfiles are available under `docker/` for container builds. The Helm chart for Kubernetes deployments is located at `helm/sorcery-solutions-frontend`.
