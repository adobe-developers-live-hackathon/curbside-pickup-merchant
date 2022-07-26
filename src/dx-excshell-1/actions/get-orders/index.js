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
    const token = await getCommerceToken(params);
    const openOrders = await getOrders(token, params);
    
    // Load orders data from state lib
    const state = await stateLib.init()
    const ordersData = await state.get('curbside-pickup')
    const orderObj = {}
    
    for (const order of openOrders.items) {
      const entityId = order.entity_id
      const productImage = await getProductImageUrl(order.items, params)
      let parkingSpace = "Waiting for pickup"
      if (ordersData?.value && ordersData.value[entityId]) parkingSpace = ordersData.value[entityId].parkingSpace
      orderObj[entityId] = {...order, productImage, parkingSpace}
    }

    await state.put('curbside-pickup', orderObj)
    return {
      statusCode: 200,
      body: {
        orders: orderObj
      }
    }
  } catch (error) {
    // log any server errors
    logger.error(error)
    // return with 500
    return errorResponse(500, 'server error', logger)
  }
}

async function getCommerceToken(params) {
  const data = {"username": params.user, "password": params.pw}

  // Get integration token from Adobe Commerce.
  const accessTokenRes = await fetch(`${params.url}/index.php/rest/V1/integration/admin/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  const token = await accessTokenRes.json()

  return token
}

async function getOrders(token, params) {
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
  const ordersEndpoint = `${params.url}/rest/V1/orders?${queryString}`

  // Get all orders from Adobe Commerce that have yet to be picked up
  const getOrderDataRes = await fetch(ordersEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })

  if (!getOrderDataRes.ok) {
    throw new Error('request to ' + ordersEndpoint + ' failed with status code ' + getOrderDataRes.status)
  }

  let orders = await getOrderDataRes.json()

  return orders
}

// Function to get a product's image URL by extracting its SKU, 
// which is then used to get the file path from Commerce
async function getProductImageUrl(order, params) {
  let sku;
  for (let items in order) sku = order[items].sku
  const mediaEndpoint = `${params.url}/rest/V1/products/${sku}/media`
  const getMediaDataRes = await fetch(mediaEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
 
  if (!getMediaDataRes.ok) {
    throw new Error('request failed with status code ' + getMediaDataRes.status)
  }

  const response = await getMediaDataRes.json()
  let file
  for (let items in response) file = response[items].file

  return `${params.url}/media/catalog/product${file}`
}

exports.main = main
