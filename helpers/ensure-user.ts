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

async function loginUser(request: APIRequestContext, user: TestUser) {
  return request.post(`${apiUrl}/users/login`, {
    data: {
      user: {
        email: user.email,
        password: user.password,
      },
    },
  });
}

export async function ensureUser(request: APIRequestContext, user: TestUser) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const loginResponse = await loginUser(request, user);
    if (loginResponse.ok()) {
      return;
    }

    const registerResponse = await request.post(`${apiUrl}/users`, {
      data: { user },
    });

    if (!registerResponse.ok() && attempt === maxAttempts) {
      throw new Error(`Could not create user ${user.email}: ${await registerResponse.text()}`);
    }

    const verifyResponse = await loginUser(request, user);
    if (verifyResponse.ok()) {
      return;
    }

    if (attempt === maxAttempts) {
      throw new Error(`User ${user.email} was registered but login failed: ${await verifyResponse.text()}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
  }
}
