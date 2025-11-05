# VibeCoding Fitness Tracker

A React Native + Expo workout tracker with logging, history, progress insights, and PR tracking. Built with Expo Router and Zustand, backed by SQLite.

## Testing

We use Jest with ts-jest for unit tests.

- Run all tests:

```bash
npm test
```

- Watch mode:

```bash
npm run test:watch
```

- TypeScript typecheck:

```bash
npm run typecheck
```

- CI run (includes coverage):

```bash
npm run test:ci
```

### Troubleshooting

- Expo SQLite ESM in tests: Some stores/services import the database layer, which uses `expo-sqlite` (ESM). Tests mock `services/database` to avoid loading it. If you add tests that import modules pulling in `expo-sqlite`, add this mock at the top of the test file:

```ts
jest.mock('../services/database', () => ({
  databaseService: {
    getDatabase: () => ({
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
      execAsync: jest.fn(),
    }),
  },
}));
```

- Mocking services: Prefer mocking `workoutService`, `prService`, and `exerciseService` to keep tests fast and deterministic.

## Scripts

- `npm start` – Run the Expo dev server
- `npm run android` / `npm run ios` / `npm run web` – Platform targets
- `npm run lint` / `npm run format` – Lint and format

## Tech

- Expo, React Native, Expo Router
- Zustand for state management
- SQLite via `expo-sqlite`
- Tailwind via NativeWind
