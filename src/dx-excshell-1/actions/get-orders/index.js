/*
* <license header>
*/

const fetch = require('node-fetch')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')
const stateLib = require('@adobe/aio-lib-state');
const qs = require('qs')

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' })

  try {
    // 'info' is the default level if not set
    logger.info('Calling the get-orders action')

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params))

    // Load orders data from state lib
    const state = await stateLib.init()
    const ordersData = await state.get('curbside-pickup')
    // logger.debug(`Orders from storage: ${JSON.stringify(ordersData)}`)
    // if (!ordersData || !ordersData.value || ordersData.value.length === 0) {
    //   return {
    //     statusCode: 200,
    //     body: {
    //       orders: []
    //     }
    //   }
    // }

    // Make call to Adobe Commerce
    // console.log(`VALUES: ${Object.keys(ordersData.value).join(',')}`)
    // Build query string
    // const queryStringParameters = {
    //   "searchCriteria": {
    //     "filter_groups": [
    //       {
    //         "filters": [
    //           {
    //             "field": "entity_id",
    //             "value": Object.keys(ordersData.value).join(','),
    //             "condition_type": "in"
    //           }
    //         ]
    //       }
    //     ]
    //   }
    // }

    const queryStringParameters = {
      "searchCriteria": {
        "filter_groups": [
          {
            "filters": [
              {
                "field": "status",
                "value": "pending",
                "condition_type": "eq"
              }
            ]
          }
        ]
      }
    }
    const queryString = qs.stringify(queryStringParameters)
    logger.debug(`Query string: ${queryString}`)
    // Result should be:
    // searchCriteria[filterGroups][0][filters][0][field]=entity_id&searchCriteria[filterGroups][0][filters][0][value]=3,5&searchCriteria[filterGroups][0][filters][0][conditionType]=in

    const ordersEndpoint = `${params.ADOBE_COMMERCE_ORDERS_REST_ENDPOINT}?${queryString}`
    // const ordersEndpoint = `${params.ADOBE_COMMERCE_ORDERS_REST_ENDPOINT}?searchCriteria=all`

    logger.debug(`ordersEndpoint: ${ordersEndpoint}`)
    const getOrderDataRes = await fetch(ordersEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + params.ADOBE_COMMERCE_INTEGRATION_ACCESS_TOKEN
      }
    })
    if (!getOrderDataRes.ok) {
      throw new Error('request to ' + ordersEndpoint + ' failed with status code ' + getOrderDataRes.status)
    }
    let orders = await getOrderDataRes.json()
    // logger.debug(`Orders: ${JSON.stringify(orders)}`)
    orders = orders.items.map(obj=> ({ ...obj, parking_space: ordersData.value[obj.entity_id] ?  ordersData.value[obj.entity_id].parking_space : "Waiting for pickup"}))
    // logger.debug(`ORDERS WITH PARKING: ${JSON.stringify(orders)}`)

    await state.put('curbside-pickup', orders, { ttl: 600 });
    const newState = await state.get('curbside-pickup')
    logger.debug(`NEW STATE: ${JSON.stringify(newState)}`)    
    
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
