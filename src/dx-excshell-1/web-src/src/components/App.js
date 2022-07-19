/*
* <license header>
*/

import React from 'react';
import {Provider, defaultTheme, Grid, View} from '@adobe/react-spectrum'
import ErrorBoundary from 'react-error-boundary'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import Orders from './Orders';
import Sidebar from './Sidebar';


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
                  // width={{base: 'auto', L: 'size-6000'}}
                  // margin={'40px auto'}
                  UNSAFE_className={'list-box-wrapper'}
        >
          <Grid
            areas={['sidebar content']}
            columns={['256px', '500px']}
            rows={['auto']}
            height='100vh'
            gap='size-100'
          >
            <View
              gridArea='sidebar'
              backgroundColor='gray-200'
              padding='size-300'
            >
              <Sidebar></Sidebar>
            </View>
            <View gridArea='content'paddingLeft='size-400' paddingTop='size-100'>        
                  <Orders></Orders>
            </View>
           </Grid>
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
