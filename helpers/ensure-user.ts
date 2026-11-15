import { APIRequestContext } from '@playwright/test';

const apiUrl = 'https://api.realworld.show/api';

export type TestUser = {
  email: string;
  password: string;
  username: string;
};

export const editorUser: TestUser = {
  email: 'automation.editor1234@test.com',
  password: 'AutoPassword123',
  username: 'automationeditor',
};

export function createLoginUser(): TestUser {
  const id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  return {
    email: `login${id}@test.com`,
    password: 'AutoPassword123',
    username: `login${id}`.slice(0, 20),
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
