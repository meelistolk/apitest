import type { APIRequestContext, APIResponse } from '@playwright/test';

export class CollectionsApi {
  constructor(private readonly request: APIRequestContext) {}

  getAll(projectId: string): Promise<APIResponse> {
    return this.request.get('collections', {
      params: { project_id: projectId },
    });
  }

  getRecord(
    collection: string,
    recordId: string,
    projectId: string,
  ): Promise<APIResponse> {
    return this.request.get(`collections/${collection}/records/${recordId}`, {
      params: { project_id: projectId },
    });
  }

  async createRecord<T extends object>(
    collection: string,
    projectId: string,
    data: T,
  ): Promise<APIResponse> {
    return this.request.post(`collections/${collection}/records`, {
      params: { project_id: projectId },
      data: { data },
    });
  }

  updateRecord<T>(
    collection: string,
    recordId: string,
    projectId: string,
    data: T,
  ): Promise<APIResponse> {
    return this.request.put(`collections/${collection}/records/${recordId}`, {
      params: { project_id: projectId },
      data: { data },
    });
  }

  deleteRecord(
    collection: string,
    recordId: string,
    projectId: string,
  ): Promise<APIResponse> {
    return this.request.delete(`collections/${collection}/records/${recordId}`, {
      params: { project_id: projectId },
    });
  }
}
