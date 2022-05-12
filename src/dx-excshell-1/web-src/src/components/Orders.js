import React, { useState, useEffect } from 'react';
import {Heading, Button, Text, Grid, View, Divider, Flex, StatusLight, ProgressCircle, Image} from '@adobe/react-spectrum'
import ErrorBoundary from 'react-error-boundary'
import actionWebInvoke from "../utils";
import actions from "../config.json";

const Orders = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [orderList, setOrderList] = useState([]);
    const [completingOrderId, setCompletingOrderId] = useState(undefined);
  
    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     (async () => await refreshOrders())();
    //   }, 5000)
  
    //   return () => clearInterval(interval)
    // }, []);

    useEffect(() => {
        (async () => await refreshOrders())()
    }, [])
  
    return (
      <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
            <Heading level={1}> Orders ready for curbside pickup</Heading>
            {isLoading ? (
              <Flex alignItems="center" justifyContent="center" height="50vh">
                <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
              </Flex>
            ) : (
              orderList.length ? (
                <Flex gap="size-50" direction="column">
                  {orderList.map(order => {
                    return (
                      <div key={order.entity_id}>
                        <Grid
                          areas={["orderNumber cta", "name  cta", "items cta", "parking  cta"]}
                          columns={["2fr", "auto"]}
                          rows={["size-500", "size-500", "size-500", "size-500"]}
                        >
                          <View gridArea="orderNumber"><h3>Order #{order.entity_id}</h3></View>
                          {/* <View gridArea="image"><Image src={order.productImage} alt="product image"/></View> */}
                          <View gridArea="name"><h4>{order.customer_firstname} {order.customer_lastname}</h4></View>
                          <View gridArea="items"><Text slot="description">Items: {order.items.map(e => e.name).join(", ")}</Text></View>
                          <View gridArea="parking">
                              {order.parking_space === "Waiting for pickup" 
                              ? <StatusLight variant="negative"><i>{order.parking_space}</i></StatusLight>
                              : <StatusLight variant="negative"><i>Parking space #{order.parking_space}</i></StatusLight>
                              }
                          </View>
                          <View gridArea="cta" alignSelf="center">
                            <Button
                              variant="cta"
                              onPress={async () => {
                                setCompletingOrderId(order.entity_id)
                                await closeOrder(order.entity_id);
                                await refreshOrders()
                                setCompletingOrderId(undefined)
                              }}
                              isDisabled={completingOrderId !== undefined}
                            >
                              Complete
                            </Button>
  
                            <ProgressCircle
                              aria-label="loading"
                              isIndeterminate
                              isHidden={order.entity_id !== completingOrderId}
                              marginStart="size-100"
                            />
                          </View>
                        </Grid>
                        <Divider size="M" />
                      </div>
                    )
                  })}
                </Flex>
              ) : (
                <Flex alignItems="center" justifyContent="center" height="50vh">
                  <Heading level={3}>There are no orders to process</Heading>
                </Flex>
              )
            )}
        
      </ErrorBoundary>
    )
  
    // Methods
  
    // error handler on UI rendering failure
    function onError(e, componentStack) {
    }
  
    // component to show if UI fails rendering
    function fallbackComponent({componentStack, error}) {
      return (
        <React.Fragment>
          <h1 style={{textAlign: 'center', marginTop: '20px'}}>
            Something went wrong :(
          </h1>
          <pre>{componentStack + '\n' + error.message}</pre>
        </React.Fragment>
      )
    }
  
    async function refreshOrders () {
      const orderList = await getOrders();
      if (orderList) {
        setOrderList(orderList);
        setIsLoading(false);
      }
    }
  
    async function getOrders () {
      try {
        const orders = await actionWebInvoke(actions['get-orders'])
        console.log(`Response from get-orders action:`, orders)
        return orders.orders ? orders.orders : []
      } catch (e) {
        console.error(e)
        return []
      }
    }
  
    async function closeOrder (orderId) {
      const params = {
        orderId: orderId,
      }
  
      try {
        const actionResponse = await actionWebInvoke(actions['close-order'], {}, params)
        console.log(`Response from close-order action:`, actionResponse)
        return actionResponse
      } catch (e) {
        console.error(e)
        return null
      }
    }
  }

export default Orders;