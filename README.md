# Smart Home

- `smart-home/` – Spring Boot service. It collects boiler data from econet24 and exposes it over REST (`/api/...`).
- `frontend/` – web app (React + TypeScript + Vite). It shows current boiler parameters.

## Web app pages

- `/dom` – opens the 3D house. A left sidebar (bottom bar on phones) and the glowing pins above the house select the view: **Ogrzewanie** (heating), **Elektryczność** (electricity) or **Piec** (boiler). Each view has its own address. `/dom` and `/` open the heating view.
- `/dom/ogrzewanie` – heating view of the 3D (isometric) house with live values: boiler, hot water and both mixers in the basement, each with its set value (for example `66,4 °C / 65 °C`). Each mixer also has a small gauge with its valve opening (0–100 %). A colour tag (M1, M2) shows which floor each mixer heats. Below it: cards with boiler, hot water, fuel, flue gas, heating circuits and device states. Click a floor or a value to open details.
- `/dom/elektrycznosc` – electricity view. For now only the house, with no data. The boiler status is hidden here (`boilerInfo: false` in `HOUSE_VIEWS`).
- To add a new view: create a component in `frontend/src/house/views/` that renders the shared `HouseScene`, then add it to `HOUSE_VIEWS` in `frontend/src/house/houseViews.ts`.
- `/dom/pietro`, `/dom/parter` – top view of one floor. `/dom/piwnica` – live heating diagram (boiler, buffer, hot water, mixers, pumps).
- `/piec` – all boiler parameters as tiles.
- `/historia` – history charts. Pick a parameter (boiler, hot water, mixers, valves, outdoor, power, fuel) and a range (3h, 6h, 12h, 24h, 7 days). Each chart shows last, min, average and max values. Data comes from `GET /api/history/{metric}?sourceId=&from=&to=&bucketMinutes=`. The backend saves a sample every minute, so charts fill up from the first run. There is no import of older data from econet24.

The house layout (rooms, staircase, which mixer heats which floor) is in `frontend/src/house/houseConfig.ts`. Room temperatures show "—" until room sensors are added.

## Development

1. Start PostgreSQL and the backend (port 55555):

   ```bash
   cd smart-home
   ./gradlew bootRun -PskipFrontend
   ```

2. Start the frontend dev server (port 5173). Vite forwards `/api` requests to `http://localhost:55555`.

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
The JAR serves the web app at http://localhost:55555 and the API at `/api/...`.

Use `-PskipFrontend` to build only the backend.
