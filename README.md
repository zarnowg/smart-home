# Smart Home

- `smart-home/` – Spring Boot service. It collects boiler data from econet24 and exposes it over REST (`/api/...`).
- `frontend/` – web app (React + TypeScript + Vite). It shows current boiler parameters.

## Web app pages

- `/dom` – 3D (isometric) house with live values: boiler, hot water and both mixers in the basement. A colour tag (M1, M2) shows which floor each mixer heats. Below it: cards with boiler, hot water, fuel, flue gas, heating circuits and device states. Click a floor or a value to open details.
- `/dom/pietro`, `/dom/parter` – top view of one floor. `/dom/piwnica` – live heating diagram (boiler, buffer, hot water, mixers, pumps).
- `/piec` – all boiler parameters as tiles.

The house layout (rooms, staircase, which mixer heats which floor) is in `frontend/src/house/houseConfig.ts`. Room temperatures show "—" until room sensors are added.

## Development

1. Start PostgreSQL and the backend (port 8080):

   ```bash
   cd smart-home
   ./gradlew bootRun -PskipFrontend
   ```

2. Start the frontend dev server (port 5173). Vite forwards `/api` requests to `http://localhost:8080`.

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173.

Frontend checks: `npm test`, `npm run lint`, `npm run build`.

Note: `frontend/.npmrc` sets `legacy-peer-deps=true` to avoid an npm bug when resolving Vitest peer dependencies.

## Build

```bash
cd smart-home
./gradlew build
```

Gradle downloads Node.js, builds the frontend and puts it into the JAR (`static/`).
`./gradlew check` also runs the frontend tests.
The JAR serves the web app at http://localhost:8080 and the API at `/api/...`.

Use `-PskipFrontend` to build only the backend.
