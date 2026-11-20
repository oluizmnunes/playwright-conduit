import { faker } from "@faker-js/faker";
import { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function createArticle(page: Page) {
  await page.goto("/");

  const token = await page.evaluate(() => localStorage.getItem("jwtToken"));
  const response = await page.request.post(
    "https://api.realworld.show/api/articles",
    {
      headers: {
        Authorization: `Token ${token}`,
      },
      data: {
        article: {
          title: faker.lorem.sentence({ min: 1, max: 3 }),
          description: "APIRequest",
          body: "Exposes API that can be used for the Web API testing.",
          tagList: ["storageState", "ignoreHTTPSErrors", "failOnStatusCode"],
        },
      },
    },
  );

  expect(response.status()).toEqual(201);

  return (await response.json()).article;
}
