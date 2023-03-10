import { bufferToStream } from '@dcl/catalyst-storage/dist/content-item'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import { Controller } from '../../../src/controller/Controller'
import { EnvironmentConfig } from '../../../src/Environment'
import { makeNoopValidator } from '../../helpers/service/validations/NoOpValidator'
import { setupTestEnvironment } from '../E2ETestEnvironment'

describe('Integration - Get Content', () => {
  const getTestEnv = setupTestEnvironment()

  it('calls the headContent controller when the head endpoint is requested', async () => {
    const testFilePath = path.resolve(__dirname, '../', 'resources', 'some-text-file.txt')
    const content = await fs.promises.readFile(testFilePath)
    const id = 'some-id'

    const headContentSpy = jest.spyOn(Controller.prototype, 'headContent')
    const getContentSpy = jest.spyOn(Controller.prototype, 'getContent')

    const server = await getTestEnv()
      .configServer()
      .withConfig(EnvironmentConfig.DISABLE_SYNCHRONIZATION, true)
      .andBuild()
    await server.components.storage.storeStream(id, bufferToStream(content))

    makeNoopValidator(server.components)

    await server.startProgram()

    const url = server.getUrl() + `/contents/${id}`
    const res = await fetch(url, { method: 'HEAD' })

    expect(res.status).toBe(200)
    expect(res.headers.get('content-length')).toBe(content.length.toString())

    expect(headContentSpy).toHaveBeenCalledTimes(1)
    expect(getContentSpy).toHaveBeenCalledTimes(0)
  })

  it('returns 404 when the content file does not exist', async () => {
    const server = await getTestEnv()
      .configServer()
      .withConfig(EnvironmentConfig.DISABLE_SYNCHRONIZATION, true)
      .andBuild()

    makeNoopValidator(server.components)

    await server.startProgram()

    const url = server.getUrl() + `/contents/non-existent-file`
    const res = await fetch(url)

    expect(res.status).toBe(404)
  })

  it('returns 404 when the content file does not exist for the head method', async () => {
    const server = await getTestEnv()
      .configServer()
      .withConfig(EnvironmentConfig.DISABLE_SYNCHRONIZATION, true)
      .andBuild()

    makeNoopValidator(server.components)

    await server.startProgram()

    const url = server.getUrl() + `/contents/non-existent-file`
    const res = await fetch(url, { method: 'HEAD' })

    expect(res.status).toBe(404)
  })
})
