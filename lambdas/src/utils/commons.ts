import { fetchJson } from 'dcl-catalyst-commons'
import { Logger } from 'log4js'

export async function getCommsServerUrl(
  logger: Logger,
  internalCommsServerUrl: string,
  externalCommsServerUrl?: string
): Promise<string> {
  try {

    //console.log( "JDEBUG: ","Utils:common.ts", "fetchJson", internalCommsServerUrl );

    await fetchJson(`${internalCommsServerUrl}/status`, {
      attempts: 6,
      waitTime: '10s'
    })
    return internalCommsServerUrl
  } catch {
    logger.info('Defaulting to external comms server url')
  }

  return externalCommsServerUrl || internalCommsServerUrl
}
