import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom'
import { Heading, Button, Text, Grid, View, Divider, Flex, StatusLight, ProgressCircle, Image, SearchField } from '@adobe/react-spectrum'
import ErrorBoundary from 'react-error-boundary'
import actionWebInvoke from "../utils";
import actions from "../config.json";

const Orders = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [orderList, setOrderList] = useState([]);
    const [completingOrderId, setCompletingOrderId] = useState(undefined);
    const isInitialMount = useRef(true);
    
    const [searchParams] = useSearchParams();
    const commerceCreds = {};
    commerceCreds.user = searchParams.get("user")
    commerceCreds.pw = searchParams.get("pw")
    commerceCreds.url = searchParams.get("url")
    
    useEffect(() => {
        if (isInitialMount.current) {
            (async () => await refreshOrders(commerceCreds))();
            isInitialMount.current = false;
        } else {
            const interval = setInterval(() => {
                (async () => await refreshOrders())();
              }, 10000)
          
              return () => clearInterval(interval)
        }
    })
  
    return (
      <ErrorBoundary FallbackComponent={fallbackComponent}>
            <Heading level={1}> Orders ready for curbside pickup</Heading>
            <SearchField defaultValue="search" width="460px" marginBottom="10px" marginTop="10px"/>
            {isLoading ? (
              <Flex alignItems="center" justifyContent="center" height="50vh">
                <ProgressCircle size="L" aria-label="Loading…" isIndeterminate />
              </Flex>
            ) : (
              Object.keys(orderList).length? (
              
                <Flex gap="size-50" direction="column">
                  {Object.keys(orderList).map(orderId => {
                    const order = orderList[orderId]
                    return (
                      <div key={order.entity_id}>
                        <Grid
                          areas={[
                                    "orderNumber image", 
                                    "name        image", 
                                    "items       image", 
                                    "parking     image",
                                    "complete    image"]}
                          columns={["2fr", "1fr"]}
                          rows={["size-500", "size-500", "size-500", "size-500", "size-500","size-500"]}
                        >
                          <View gridArea="image" alignSelf="center" maxWidth="145px" marginEnd="10px"><Image src={order.productImage} alt="product image"/></View>
                          <View gridArea="orderNumber"><h3>Order #{order.entity_id}</h3></View>
                          <View gridArea="name"><h4>{order.customer_firstname} {order.customer_lastname}</h4></View>
                          <View gridArea="items"><Text slot="description">Items: {order.items.map(e => e.name).join(", ")}</Text></View>
                          <View gridArea="parking">
                              {order.parkingSpace === "Waiting for pickup" 
                              ? <StatusLight variant="negative"><i>{order.parkingSpace}</i></StatusLight>
                              : <StatusLight variant="negative"><i>Parking space #{order.parkingSpace}</i></StatusLight>
                              }
                          </View>
                          <View gridArea="complete">
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
                          </View>
                          <View gridArea="cta" alignSelf="center">
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
    // function onError(e, componentStack) {
    // }
  
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
  
    async function refreshOrders (commerceCreds) {
      let action;
      commerceCreds ? action = 'get-orders' : action = 'get-orders-from-state'

      try {
        const orders = await actionWebInvoke(actions[action], {}, commerceCreds)
        if (orders.orders) {
          setOrderList(orders.orders);
          setIsLoading(false);
        }
      } catch (e) {
        console.error(e)
        return []
      }
    }
  
    async function closeOrder (orderId) {
      const params = {
        orderId: orderId,
        ...commerceCreds
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