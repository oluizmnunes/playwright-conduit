import { test, expect } from '@playwright/test';
import { EditorPage } from '../pages/editor.page';
import { faker } from '@faker-js/faker';
import { createArticle } from '../helpers/articles';
import { editorUser } from '../helpers/ensure-user';


test.describe('Articles', () => {
  test.describe('valid article', () => {
    test('user can create a new article and it is visible on the Global Feed', async ({ page }) => {
      const editorPage = new EditorPage(page);

      const article = {
        title: faker.lorem.sentence( { min: 1, max: 3 }),
        about: 'Auto-waiting',
        content: 'Playwright performs a range of actionability checks...',
        tags: ['Visible', 'Stable', 'Receives Events', 'Enable', 'Editable'],
      };

      await page.goto('/');
      await page.getByRole('link', { name: 'New Article' }).click();
      await editorPage.fillArticleFields(article);
      await page.getByRole('button', { name: 'Publish Article' }).click();

      await expect(page.getByRole('heading', { name: article.title, level: 1 })).toBeVisible();
    });

    test('user can delete a new article and it is removed from the Global Feed', async ({ page }) => {
      const editorPage = new EditorPage(page);

      const article = {
        title: faker.lorem.sentence( { min: 1, max: 3 }),
        about: 'Trace viewer',
        content: 'Playwright Trace Viewer is a GUI tool that lets you explore recorded...',
        tags: ['HTML report', 'Traces'],
      };

      await editorPage.publishArticle(article);
      await page.getByRole('button', { name: 'Delete Article' }).first().click();
      await page.getByRole('navigation').getByRole('link', { name: 'Conduit' }).click();

      await expect(page.getByRole('heading', { name: article.title, level: 1 })).not.toBeVisible();
    });

    test('author can edit an article', async ( {page} ) => {
      const editorPage = new EditorPage(page);
      const article = await createArticle(page);
      const updatedArticle = {
        title: article.title + ' Updated',
        about: 'Command line',
        content: 'Playwright provides a powerful command line interface for running tests...',
        tags: ['--debug', '--project <name>', '-g <grep>', '--workers'],
      };
      const updateResponse = page.waitForResponse((response) =>
        response.request().method() === 'PUT' &&
        response.url().includes('/api/articles/') &&
        response.ok()
      );

      await page.getByRole('heading', { name: article.title, level: 1 }).click();
      await page.getByRole('link', { name: 'Edit Article' }).first().click();
      await expect(editorPage.articleTitleInput).toHaveValue(article.title);
      await editorPage.fillArticleFields(updatedArticle);
      await editorPage.publishArticleButton.click();
      await updateResponse;

      const authorArticlesResponse = page.waitForResponse((response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/articles?') &&
        response.url().includes(`author=${editorUser.username}`) &&
        response.ok()
      );

      await page.getByRole('navigation').getByRole('link', { name: editorUser.username }).click();
      await authorArticlesResponse;

      await expect(page.getByRole('heading', { name: updatedArticle.title, level: 1 })).toBeVisible();

      await page.getByRole('heading', { name: updatedArticle.title}).click();

      await expect(page.getByText(updatedArticle.title)).toBeVisible();
      await expect(page.getByText(updatedArticle.about)).toBeVisible();
      await expect(page.getByText(updatedArticle.content)).toBeVisible();

      await editorPage.expectTags(updatedArticle.tags);
    });

    test('article body is rendered as markdown', async ( {page} ) => {
      const editorPage = new EditorPage(page);

      const article = {
        title: faker.lorem.sentence( { min: 1, max: 3 }),
        about: 'Markdown',
        content: [
          '# Playwright',
          '',
          '## Actionability',
          '',
          'An element must be **visible**, *stable*, and enabled.',
          '',
          '| Check | Result |',
          '| --- | --- |',
          '| Visible | Pass |',
          '| Stable | Pass |',
          '| Enabled | Pass |',
        ].join('\n'),
        tags: ['Markdown', 'Formatting', 'Syntax'],
      };

      await editorPage.publishArticle(article);

      const articleContent = page.locator('.article-content');

      await expect(articleContent.getByRole('heading', { level: 1, name: 'Playwright' })).toBeVisible();
      await expect(articleContent.getByRole('heading', { level: 2, name: 'Actionability' })).toBeVisible();
      await expect(articleContent.locator('p')).toHaveText('An element must be visible, stable, and enabled.');
      await expect(articleContent.locator('strong')).toHaveText('visible');
      await expect(articleContent.locator('em')).toHaveText('stable');
      await expect(articleContent.locator('th')).toHaveText(['Check', 'Result']);
      await expect(articleContent.locator('td')).toHaveText(['Visible', 'Pass', 'Stable', 'Pass', 'Enabled', 'Pass']);
    });

    test('user can favorite and unfavorite an article', async ({ page }) => {
      const article = await createArticle(page);
      await page.goto(`/profile/${editorUser.username}`);
      const preview = page.locator('.article-preview').filter({ has: page.getByRole('heading', { name: article.title, level: 1 }) });
      const favoriteButton = preview.getByRole('button');

      await expect(favoriteButton).toContainText('0');
      await favoriteButton.click();
      await expect(favoriteButton).toContainText('1');

      await page.reload();
      await expect(favoriteButton).toContainText('1');

      await favoriteButton.click();
      await expect(favoriteButton).toContainText('0');

      await page.reload();
      await expect(favoriteButton).toContainText('0');
    });
  });

  test.describe('invalid article', () => {
    test('should show a validation error when the article title is empty', async ( {page} ) => {
      const editorPage = new EditorPage(page);

      const article = {
        title: '',
        about: 'Fixtures',
        content: 'Playwright Test is based on the concept of test fixtures.',
        tags: ['page', 'context', 'browser', 'request'],
      };

      await editorPage.publishArticle(article);

      await expect(page.getByText('title can\'t be blank')).toBeVisible();
    });

    test('should show a validation error when a tag is too long', async ( {page} ) => {
      const editorPage = new EditorPage(page);
      const article = {
        title: faker.lorem.sentence( { min: 1, max: 3 }),
        about: 'Tags',
        content: 'A tag must be shorter than the limit.',
        tags: ['c'.repeat(21)],
      };

      await editorPage.publishArticle(article);

      await expect(page.getByText('body tagList is an optional list of less than 10 strings of less than 20 chars')).toBeVisible();
    });

    test('should show validation errors when fields are empty', async ( {page} ) => {
      const editorPage = new EditorPage(page);
      const article = {
        title: '',
        about: '',
        content: '',
        tags: [],
      };

      await editorPage.publishArticle(article);

      await expect(page.getByText('title can\'t be blank')).toBeVisible();
      await expect(page.getByText('description can\'t be blank')).toBeVisible();
      await expect(page.getByText('body can\'t be blank')).toBeVisible();
    });

    test('should show a validation error when title is too long', async ( {page} ) => {
      const editorPage = new EditorPage(page);
      const article = {
        title: 't'.repeat(101),
        about: 'Title',
        content: 'A title must be shorter than the limit.',
        tags: [],
      };
      await editorPage.publishArticle(article);

      await expect(page.getByText('body title is a string of less than 100 chars')).toBeVisible();
    });
  });

  test.describe('signed-out user', () => {
    test('should not be able to publish article logged out', async ( {page} ) => {
      const editorPage = new EditorPage(page);
      const article = {
        title: faker.lorem.sentence( { min: 1, max: 3 }),
        about: 'Logged out',
        content: 'You must be logged in to publish an article.',
        tags: [],
      };

      await editorPage.goto();
      await editorPage.fillArticleFields(article);
      await page.evaluate(() => localStorage.clear());
      await page.getByRole('button', { name: 'Publish Article' }).click();

      await expect(page.getByText('token is missing')).toBeVisible();
    });
  });

  test.describe('server error', () => {
    test('keeps the draft and allows retry when publish returns 500', async ({ page }) => {
      const editorPage = new EditorPage(page);
      const article = {
        title: faker.lorem.sentence({ min: 1, max: 3 }),
        about: 'Server error',
        content: 'The draft should stay on the page when publish fails.',
        tags: ['Retry', 'Banner'],
      };

      await editorPage.goto();
      await editorPage.fillArticleFields(article);
      await page.route('https://api.realworld.show/api/articles', (route) => {
        if (route.request().method() !== 'POST') {
          return route.continue();
        }
        return route.fulfill({ status: 500 });
      });
      await editorPage.publishArticleButton.click();

      await editorPage.expectDraftKept(article);

      await page.unroute('https://api.realworld.show/api/articles');
      await editorPage.publishArticleButton.click();

      await expect(page.getByRole('heading', { name: article.title, level: 1 })).toBeVisible();
    });

    test('keeps the draft and allows retry when update returns 500', async ({ page }) => {
      const editorPage = new EditorPage(page);
      const article = await createArticle(page);
      const updatedArticle = {
        title: faker.lorem.sentence({ min: 1, max: 3 }),
        about: 'Unavailable',
        content: 'The edited draft should stay on the page when update fails.',
        tags: ['Retry', 'Banner'],
      };

      await page.goto(`/editor/${article.slug}`);

      await expect(editorPage.articleTitleInput).toHaveValue(article.title);

      await editorPage.fillArticleFields(updatedArticle);
      await page.route(`https://api.realworld.show/api/articles/${article.slug}`, (route) => route.fulfill({ status: 500 }));
      await editorPage.publishArticleButton.click();

      await editorPage.expectDraftKept(updatedArticle);

      await page.unroute(`https://api.realworld.show/api/articles/${article.slug}`);
      await editorPage.publishArticleButton.click();

      await expect(page.getByRole('heading', { name: updatedArticle.title, level: 1 })).toBeVisible();
    });
  });
});
