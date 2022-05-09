/*
* <license header>
*/

import React, { useState, useEffect } from 'react';
import {Provider, defaultTheme, Heading, Button, Text, Grid, View, Divider, Flex, StatusLight, ProgressCircle} from '@adobe/react-spectrum'
import ErrorBoundary from 'react-error-boundary'
import {HashRouter as Router} from 'react-router-dom'

import actionWebInvoke from "../utils";
import actions from "../config.json";
import Orders from './Orders';

function App(props) {
  console.log('runtime object:', props.runtime)
  console.log('ims object:', props.ims)

  // use exc runtime event handlers
  // respond to configuration change events (e.g. user switches org)
  props.runtime.on('configuration', ({imsOrg, imsToken, locale}) => {
    console.log('configuration change', {imsOrg, imsToken, locale})
  })
  // respond to history change events
  props.runtime.on('history', ({type, path}) => {
    console.log('history change', {type, path})
  })

  return (
    <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
      <Router>
        <Provider theme={defaultTheme}
                  colorScheme="light"
                  width={{base: 'auto', L: 'size-6000'}}
                  margin={'40px auto'}
                  UNSAFE_className={'list-box-wrapper'}
        >
          <Orders/>
        </Provider>
      </Router>
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
}

export default App
