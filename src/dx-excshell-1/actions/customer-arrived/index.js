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

    // get order data from Adobe Commerce
    const getOrderDataEndpoint = `${params.ADOBE_COMMERCE_ORDERS_REST_ENDPOINT}/${params.orderNumber}`
    logger.debug(`getOrderDataEndpoint: ${getOrderDataEndpoint}`)
    const getOrderDataRes = await fetch(getOrderDataEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + params.ADOBE_COMMERCE_INTEGRATION_ACCESS_TOKEN
      }
    })
    if (!getOrderDataRes.ok) {
      // checking the existence of an order
      if (getOrderDataRes.status === 404) {
        return errorResponse(400, 'Order not found', logger)
      }
      throw new Error('request to ' + getOrderDataEndpoint + ' failed with status code ' + getOrderDataRes.status)
    }
    const orderData = await getOrderDataRes.json()
    logger.debug('Order data: ' + stringParameters(orderData))

    // check customer email
    if (params.customerEmail !== orderData.customer_email) {
      return errorResponse(400, 'This Email does not match the one the order was placed with', logger)
    }

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
