# RealWorld (Conduit) – Playwright + TypeScript

> 🚧 **Work in progress.** Tests are being added step by step, and the code will be refactored in later commits.

E2E and API tests for the [RealWorld demo app](https://demo.realworld.show/) and its [API](https://node-express-conduit.appspot.com/).

## Scope

| Area | Type | Status |
|------|------|--------|
| Auth | UI | In progress |
| Articles | UI | In progress |
| Comments | UI | In progress |
| API | API | In progress |

## Approach

- Each test is self-contained: it creates its own user and data, with no shared authentication state.
- The first version intentionally has no helpers or custom fixtures. Duplication will be removed in later commits.

## Run

```bash
npm install
npx playwright install chromium
npx playwright test
```

GitHub Actions already runs this suite on every push and pull request to `main`, and uploads Playwright's HTML report. An Allure report will be added later.
