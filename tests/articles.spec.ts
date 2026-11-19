import { test, expect } from '@playwright/test';
import { EditorPage } from '../pages/editor.page';
import { faker } from '@faker-js/faker';


test.describe('Articles', () => {
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

  test('author can edit an article', async ( {page} ) => {
    const editorPage = new EditorPage(page);

    const article = {
      title: faker.lorem.sentence(),
      about: 'Emulation',
      content: 'With Playwright you can test your app on any browser as well as emulate...',
      tags: ['Devices', 'Viewport', 'isMobile', 'Locale & Timezone'],
    };

    const updatedArticle = {
      title: article.title + ' Updated',
      about: 'Command line',
      content: 'Playwright provides a powerful command line interface for running tests...',
      tags: ['--debug', '--project <name>', '-g <grep>', '--workers'],
    };

    await editorPage.publishArticle(article);
    await page.getByRole('link', { name: 'Edit Article' }).first().click();

    const updateResponse = page.waitForResponse((response) =>
      response.request().method() === 'PUT' &&
      response.url().includes('/api/articles/') &&
      response.ok()
    );

    await editorPage.fillArticleFields(updatedArticle);
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await updateResponse;

    const feedResponse = page.waitForResponse((response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/api/articles?') &&
      response.ok()
    );

    await page.getByRole('navigation').getByRole('link', { name: 'Conduit' }).click();
    await feedResponse;

    await expect(page.getByRole('heading', { name: updatedArticle.title, level: 1 })).toBeVisible();
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

});