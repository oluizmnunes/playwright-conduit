import { faker } from '@faker-js/faker';
import { APIRequestContext } from '@playwright/test';

const apiUrl = 'https://api.realworld.show/api';

export type TestUser = {
  email: string;
  password: string;
  username: string;
};

export const editorUser: TestUser = {
  email: 'automation.editor@test.com',
  password: 'AutoPassword123',
  username: 'automationeditor',
};

export function createLoginUser(): TestUser {
  return {
    email: `${faker.string.alphanumeric(6).toLowerCase()}@automation.com`.toLowerCase(),
    password: faker.internet.password({ length: 8 }),
    username: faker.internet.username().toLowerCase(),
  };
}

export async function ensureUser(request: APIRequestContext, user: TestUser) {
  const loginResponse = await request.post(`${apiUrl}/users/login`, {
    data: {
      user: {
        email: user.email,
        password: user.password,
      },
    },
  });

  if (loginResponse.ok()) {
    return;
  }

  const registerResponse = await request.post(`${apiUrl}/users`, {
    data: { user },
  });

  if (!registerResponse.ok()) {
    throw new Error(`Could not create user ${user.email}: ${await registerResponse.text()}`);
  }
}
