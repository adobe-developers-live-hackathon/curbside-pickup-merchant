/*
* <license header>
*/

const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')
const stateLib = require('@adobe/aio-lib-state');

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the close-order action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing request input parameters and headers
    const requiredParams = ['orderId']
    const requiredHeaders = []
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger)
    }

    const ordersEndpoint = params.ADOBE_COMMERCE_ORDERS_REST_ENDPOINT
    logger.debug('ordersEndpoint: ' + ordersEndpoint)
    const closeOrderRes = await fetch(ordersEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + params.ADOBE_COMMERCE_INTEGRATION_ACCESS_TOKEN
      },
      body: JSON.stringify({
        entity: {
          entity_id: params.orderId,
          status: 'closed'
        }
      })
    })
    if (!closeOrderRes.ok) {
      throw new Error('request to ' + ordersEndpoint + ' failed with status code ' + closeOrderRes.status)
    }

    logger.debug('closeOrderRes: ' + JSON.stringify(closeOrderRes))

    // Hackathon TODO: Implement removal of the closed order from the state (storage)

    return {
      statusCode: 200,
      body: closeOrderRes
    }
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
