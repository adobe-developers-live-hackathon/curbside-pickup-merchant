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
    const ordersEndpoint = `${params.ADOBE_COMMERCE_ORDERS_REST_ENDPOINT}?${queryString}`
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
    // console.log("GET ORDERS:", orders)

    // Load orders data from state lib
    const state = await stateLib.init()
    const ordersData = await state.get('curbside-pickup')
    
    // Great explanation of Promis.all here: https://advancedweb.hu/how-to-use-async-functions-with-array-map-in-javascript
    orders = await Promise.all(orders.items.map( async (obj) => {
      const productImage = await getProductImage(obj.items, params)

      const entityId = obj.entity_id
      let parkingSpace;
      if (ordersData?.value && ordersData.value[entityId]) parkingSpace = ordersData.value[entityId].parkingSpace;

      if (obj) return {[entityId]: { ...obj, productImage, parkingSpace: parkingSpace || "Waiting for pickup"}}
    }))

    await state.put('curbside-pickup', orders, { ttl: 30 });
   
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

async function getProductImage(order, params) {
  let sku;
  for (let items in order) sku = order[items].sku
  const mediaEndpoint = `${params.ADOBE_COMMERCE_PRODUCTS_REST_ENDPOINT}/${sku}/media`
  const getMediaDataRes = await fetch(mediaEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + params.ADOBE_COMMERCE_INTEGRATION_ACCESS_TOKEN
    }
  })
 
  if (!getMediaDataRes.ok) {
    throw new Error('request failed with status code ' + getMediaDataRes.status)
  }

  const response = await getMediaDataRes.json();
  let file
  for (let items in response) file = response[items].file

  return `${params.IMAGE_ADDRESS_PREFIX}${file}`
}

exports.main = main
