/*
* <license header>
*/

const stateLib = require('@adobe/aio-lib-state');
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')
const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')

async function main(params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // check for missing request input parameters and headers
    const requiredParams = ['orderNumber', 'parkingSpace', 'customerEmail']
    const requiredHeaders = []
    const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders)
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    // Hackathon TODO: Implement retrieval of an order by incoming parameters into orderData from Adobe Commerce instance
    // Also implement checks returning 400 error if the order doesn't and if the order's e-mail differs from the specified one

    // Save data in state
    const state = await stateLib.init()
    let orders = await state.get(`curbside-pickup`);
    if (orders?.value) {
      orders = orders.value;
    } else {
      orders = {};
    }

    orders[params.orderNumber] = {
      parking_space: params.parkingSpace,
      created_at: (new Date()).getTime()
    }
    await state.put(`curbside-pickup`, orders, { ttl: -1 });
    logger.debug('Orders: ' + JSON.stringify(orderData))

    return {
      statusCode: 200,
      body: {
        payload: "success",
      }
    }
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main;
