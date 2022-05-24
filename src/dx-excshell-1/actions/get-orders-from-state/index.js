/*
* <license header>
*/

const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse } = require('../utils')
const stateLib = require('@adobe/aio-lib-state');

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // Load orders data from state lib
    const state = await stateLib.init()
    const ordersData = await state.get('curbside-pickup')
    const orders = ordersData.value
    
    return {
      statusCode: 200,
      body: {
        orders: orders
      }
    }

  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

exports.main = main
