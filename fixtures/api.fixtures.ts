import { test as base, expect } from '@playwright/test';
import { CollectionsApi } from '../api/collections.api';

type Fixtures = {
  collectionsApi: CollectionsApi;
};

export const test = base.extend<Fixtures>({
  collectionsApi: async ({ request }, use) => {
    await use(new CollectionsApi(request));
  },
});

export { expect };
