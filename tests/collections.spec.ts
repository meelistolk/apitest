import { test, expect } from '../fixtures/api.fixtures';
import { ProductFactory } from '../factories/product.factory';

const projectId = process.env.REQRES_PROJECT_ID ?? '51253';
const product = ProductFactory.create();
const expectedProduct = { ...product };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('GET /collections returns project collections @smoke', async ({ collectionsApi }) => {
  const response = await collectionsApi.getAll(projectId);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const body = await response.json();
  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBeTruthy();
});

test('product can be created @smoke', async ({ collectionsApi }) => {
  const createResponse = await collectionsApi.createRecord('products', projectId, product);

  expect(createResponse.status()).toBe(201);
  expect(createResponse.headers()['content-type']).toContain('application/json');
  const created = await createResponse.json();
  expect(created).toHaveProperty('data');

  const createdRecord = created.data;
  expect(createdRecord).toEqual(expect.objectContaining({
    id: expect.stringMatching(uuidPattern),
    collection_id: expect.stringMatching(uuidPattern),
    project_id: Number(projectId),
    app_user_id: null,
    created_by: expect.any(Number),
    created_at: expect.any(String),
    updated_at: expect.any(String),
    deleted_at: null,
    data: expectedProduct,
  }));
  expect(Date.parse(createdRecord.created_at)).not.toBeNaN();
  expect(Date.parse(createdRecord.updated_at)).not.toBeNaN();
  expect(createdRecord.updated_at).toBe(createdRecord.created_at);

  try {
    const getResponse = await collectionsApi.getRecord(
      'products',
      createdRecord.id,
      projectId,
    );
    expect(getResponse.status()).toBe(200);
  } finally {
    const deleteResponse = await collectionsApi.deleteRecord(
      'products',
      createdRecord.id,
      projectId,
    );
    expect(deleteResponse.status()).toBe(204);
  }
});

test('product cannot be created with an invalid API key @negative', async ({ request }) => {
  const response = await request.post('collections/products/records', {
    params: { project_id: projectId },
    headers: {
      'x-api-key': 'invalid-api-key',
    },
    data: { data: expectedProduct },
  });

  expect([401, 403]).toContain(response.status());
});

test('product cannot be created without an API key @negative', async ({ request }) => {
  const response = await request.post('collections/products/records', {
    params: { project_id: projectId },
    headers: {
      'x-api-key': '',
    },
    data: { data: expectedProduct },
  });

  expect([401, 403]).toContain(response.status());
});

test('product cannot be created with an invalid payload @negative', async ({ request }) => {
  let createdRecordId: string | undefined;

  try {
    const response = await request.post('collections/products/records', {
      params: { project_id: projectId },
      data: {
        name: 'Invalid Product',
        price: 10,
      },
    });

    if (response.status() === 201) {
      const body = await response.json();
      createdRecordId = body.data?.id;
    }

    expect([400, 422]).toContain(response.status());
  } finally {
    if (createdRecordId) {
      await request.delete(`collections/products/records/${createdRecordId}`, {
        params: { project_id: projectId },
      });
    }
  }
});

test('product can be updated @smoke', async ({ collectionsApi }) => {
  const createResponse = await collectionsApi.createRecord(
    'products',
    projectId,
    product,
  );
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  const recordId = created.data.id as string;
  const updatedProduct = ProductFactory.create({
    name: 'Wireless Headphones Pro',
    price: 79.99,
    in_stock: false,
  });

  try {
    const updateResponse = await collectionsApi.updateRecord(
      'products',
      recordId,
      projectId,
      updatedProduct,
    );

    expect(updateResponse.status()).toBe(200);
    await expect(updateResponse.json()).resolves.toMatchObject({
      data: expect.objectContaining({
        id: recordId,
        data: { ...updatedProduct },
      }),
    });

    const getResponse = await collectionsApi.getRecord(
      'products',
      recordId,
      projectId,
    );
    expect(getResponse.status()).toBe(200);
    await expect(getResponse.json()).resolves.toMatchObject({
      data: expect.objectContaining({
        id: recordId,
        data: { ...updatedProduct },
      }),
    });
  } finally {
    await collectionsApi.deleteRecord('products', recordId, projectId);
  }
});

test('product can be retrieved @smoke', async ({ collectionsApi }) => {
  const createResponse = await collectionsApi.createRecord(
    'products',
    projectId,
    product,
  );
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  const recordId = created.data.id as string;

  try {
    const getResponse = await collectionsApi.getRecord(
      'products',
      recordId,
      projectId,
    );

    expect(getResponse.ok()).toBeTruthy();
    await expect(getResponse.json()).resolves.toMatchObject({
      data: expect.objectContaining({
        id: recordId,
        data: expectedProduct,
      }),
    });
  } finally {
    await collectionsApi.deleteRecord('products', recordId, projectId);
  }
});

test('product can be deleted @smoke', async ({ collectionsApi }) => {
  const createResponse = await collectionsApi.createRecord(
    'products',
    projectId,
    product,
  );
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  const recordId = created.data.id as string;

  let deleted = false;
  try {
    const deleteResponse = await collectionsApi.deleteRecord(
      'products',
      recordId,
      projectId,
    );
    expect(deleteResponse.status()).toBe(204);
    deleted = true;

    const deletedResponse = await collectionsApi.getRecord(
      'products',
      recordId,
      projectId,
    );
    expect(deletedResponse.status()).toBe(404);
  } finally {
    if (!deleted) {
      await collectionsApi.deleteRecord('products', recordId, projectId);
    }
  }
});

test('GET returns 404 for an unknown product @negative', async ({ collectionsApi }) => {
  const response = await collectionsApi.getRecord(
    'products',
    '00000000-0000-0000-0000-000000000000',
    projectId,
  );

  expect(response.status()).toBe(404);
});

test('GET fails for an unknown collection @regression @negative', async ({ request }) => {
  const response = await request.get('collections/unknown-collection/records', {
    params: { project_id: projectId },
  });

  expect(response.status()).toBe(404);
});

test('PUT fails for an unknown product @regression @negative', async ({ collectionsApi }) => {
  const response = await collectionsApi.updateRecord(
    'products',
    '00000000-0000-0000-0000-000000000000',
    projectId,
    expectedProduct,
  );

  expect(response.status()).toBe(404);
});

test('DELETE fails for an unknown product @regression @negative', async ({ collectionsApi }) => {
  const response = await collectionsApi.deleteRecord(
    'products',
    '00000000-0000-0000-0000-000000000000',
    projectId,
  );

  expect(response.status()).toBe(404);
});
