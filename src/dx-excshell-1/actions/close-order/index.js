/*
* <license header>
*/

const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs, getCommerceToken } = require('../utils')
const stateLib = require('@adobe/aio-lib-state');

// Fill out for faster local development. Otherwise the app will attempt to use the url passed from DSN.  
const ADOBE_COMMERCE_DOMAIN = 'https://pmayer-dev-sjvtvai-fafgbxywgtx5w.demo.magentosite.cloud'

const ORDERS_PATH = '/rest/V1/orders'

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

    const ordersEndpoint = `${params.url || ADOBE_COMMERCE_DOMAIN}${ORDERS_PATH}`
    logger.debug('ordersEndpoint: ' + ordersEndpoint)
    let token
    params.url ? token = await getCommerceToken(params) 
               : token = params.ADOBE_COMMERCE_INTEGRATION_ACCESS_TOKEN // Fill out in .env file, if using

    const closeOrderRes = await fetch(ordersEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
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

    // Save data in state
    const state = await stateLib.init()
    let orders = await state.get(`curbside-pickup`);
    if (orders?.value) {
      orders = orders.value;
    } else {
      orders = {};
    }

    if (orders[params.orderId]) {
      orders[params.orderId] = undefined
      await state.put(`curbside-pickup`, orders, { ttl: -1 });
      logger.debug('Orders: ' + JSON.stringify(orders))
    }

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
