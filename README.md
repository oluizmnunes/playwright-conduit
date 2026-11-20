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

- Page objects in `pages/` hold the locators and actions for the login and editor screens.
- Article tests share one signed-in session. The setup project saves it to `playwright/.auth/user.json`, and the `chromium` project loads that state.
- Login tests stay signed out. Each one creates its own user and signs in through the UI, after the article tests, so a new login does not replace the saved token.

## Run

```bash
npm install
npx playwright install chromium
npx playwright test
```

GitHub Actions runs this suite on every push and pull request to `main`. Each run uploads the Playwright HTML report and the Allure report as artifacts. Pushes to `main` also publish the Allure report at https://oluizmnunes.github.io/playwright-conduit/.
