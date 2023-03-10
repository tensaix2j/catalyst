import { IFetchComponent } from '@well-known-components/http-server'
import * as nodeFetch from 'node-fetch'

export function createFetchComponent(): IFetchComponent {
  const fetch: IFetchComponent = {
    async fetch(url: nodeFetch.RequestInfo, init?: nodeFetch.RequestInit): Promise<nodeFetch.Response> {
      return nodeFetch.default(url, init)
    }
  }
  return fetch
}
