# RealWorld (Conduit) – Playwright + TypeScript

> 🚧 **Work in progress.** Tests are being added step by step, and the code will be refactored in later commits.

E2E and API tests for the [RealWorld demo app](https://demo.realworld.show/) and its [API](https://node-express-conduit.appspot.com/).

## Scope

| Area | Type | Status |
|------|------|--------|
| Auth | UI | In progress |
| Articles | UI | Done |
| Comments | UI | In progress |
| API | API | In progress |

## Reports

GitHub Actions runs the suite on every push and pull request to `main`.

The [Allure report](https://oluizmnunes.github.io/playwright-conduit/) is the latest result from `main`. Each workflow run also keeps the Playwright HTML report and the Allure report as artifacts.

## Article scenarios

| # | Type | API | Scenario | Why it matters |
|---|------|-----|----------|----------------|
| 1 | Happy path | Live | Publish an article and see its title | The article is created |
| 2 | Happy path | Live | Delete an article and leave the feed | The article is removed |
| 3 | Happy path | Live | Edit an article and see the new fields | The update is saved |
| 4 | Happy path | Live | Render the article body as markdown | Formatting is shown, not the raw text |
| 5 | Happy path | Live | Favorite and unfavorite, then reload | The counter updates and persists |
| 6 | Negative | Live | Publish with an empty title | A blank title is rejected |
| 7 | Negative | Live | Publish with a tag that is too long | A tag over the limit is rejected |
| 8 | Negative | Live | Publish with empty title, description, and body | Blank fields are rejected |
| 9 | Negative | Live | Publish with a title that is too long | A title over the limit is rejected |
| 10 | Negative | Live | Publish while signed out | A signed-out user cannot publish |
| 11 | Resilience | Mocked | Publish returns 500 | The draft is kept and a retry can succeed |
| 12 | Resilience | Mocked | Update returns 500 | The edited draft is kept and a retry can succeed |
| 13 | Resilience | Mocked | Click publish again while the request is in flight | Only one article is posted |

## Approach

- Page objects in `pages/` hold the locators and actions for the login and editor screens.
- Article tests share one signed-in session. The setup project saves it to `playwright/.auth/user.json`, and the `chromium` project loads that state.
- Login tests stay signed out. Each one creates its own user and signs in through the UI, after the article tests, so a new login does not replace the saved token.

## Run

Tests hit the public [demo](https://demo.realworld.show/). There is no app to start locally.

**1. Install** (once per machine)

```bash
npm install
npx playwright install chromium
```

**2. Run the suite**

```bash
npx playwright test
npx playwright test --headed               # watch the browser
npx playwright show-report                 # last HTML report
```
