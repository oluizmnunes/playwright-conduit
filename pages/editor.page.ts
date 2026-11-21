import { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type Article = {
    title: string;
    about: string;
    content: string;
    tags: string[];
};

export class EditorPage {
    readonly articleTitleInput: Locator;
    readonly articleAboutInput: Locator;
    readonly articleContentInput: Locator;
    readonly enterTagsInput: Locator;
    readonly publishArticleButton: Locator;

    constructor(private readonly page: Page) {
        this.articleTitleInput = this.page.getByPlaceholder('Article Title');
        this.articleAboutInput = this.page.getByPlaceholder("What's this article about?");
        this.articleContentInput = this.page.getByPlaceholder('Write your article (in markdown)');
        this.enterTagsInput = this.page.getByPlaceholder('Enter tags');
        this.publishArticleButton = this.page.getByRole('button', { name: 'Publish Article'});
    }

    async goto() {
        await this.page.goto('/editor');
    }

    async fillArticleFields({title, about, content, tags}: Article) {
        await this.articleTitleInput.fill(title);
        await this.articleAboutInput.fill(about);
        await this.articleContentInput.fill(content);

        for (const tag of tags) {
            await this.enterTagsInput.fill(tag);
            await this.enterTagsInput.press('Enter');
        }
    }

    async publishArticle({title, about, content, tags}: Article) {
        await this.goto();
        await this.fillArticleFields({title, about, content, tags});
        await this.publishArticleButton.click();
    }

    async expectTags(tags: string[]) {
        const tagList = this.page.locator('.tag-list .tag-pill');

        for (const tag of tags) {
            await expect(tagList.filter({ hasText: tag })).toBeVisible();
        }
    }
}