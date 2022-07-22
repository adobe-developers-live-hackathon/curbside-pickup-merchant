/* 
* <license header>
*/

import React from 'react'
import { NavLink } from 'react-router-dom'
import Home from '@spectrum-icons/workflow/Home'
import PeopleGroup from '@spectrum-icons/workflow/PeopleGroup'
import Box from '@spectrum-icons/workflow/Box'
import ShoppingCart from '@spectrum-icons/workflow/ShoppingCart'
import Report from '@spectrum-icons/workflow/Report'
import Shield from '@spectrum-icons/workflow/Shield'
import {Flex, Text, Divider, Image, View} from '@adobe/react-spectrum'

function Sidebar () {
  return (
    <ul className="SideNav">
      <li className="SideNav-item">
        <Image width="200px" marginBottom="27px" src="https://textilesinside.com/wp-content/uploads/2021/05/Logo_brueckner_20191106.png"/>
      </li>
      {/* <li className="SideNav-item">
        <NavLink className="SideNav-itemLink" aria-current="page" exact to="/">Home</NavLink>
      </li> */}
      <li className="SideNav-item">
        <Flex>
          <Home marginTop="7px" marginLeft="7px" aria-label="S" size="S"/>
          <NavLink className="SideNav-itemLink" aria-current="page" to="/">Home</NavLink>
        </Flex>
      </li>
      <li className="SideNav-item">
       <View backgroundColor="gray-300" paddingRight="7px" paddingLeft="5px" borderRadius="6px">
        <Flex>
          <ShoppingCart marginTop="7px" marginLeft="7px" aria-label="S" size="S"/>
          <NavLink className="SideNav-itemLink" aria-current="page" to="/">Orders</NavLink>
            <Text marginTop="4px">2</Text>
        </Flex> 
       </View> 
      </li>
      <Divider size="M"/>
      <li className="SideNav-item">
        <Flex>
          <Box marginTop="7px" marginLeft="7px" aria-label="S" size="S"/>
          <NavLink className="SideNav-itemLink" aria-current="page" to="/">Products</NavLink>
        </Flex>
      </li>
      <li className="SideNav-item">
        <Flex>
          <PeopleGroup marginTop="7px" marginLeft="7px" aria-label="S" size="S"/>
          <NavLink className="SideNav-itemLink" aria-current="page" to="/">Customers</NavLink>
        </Flex>
      </li>
      <Divider size="M"/>
      <li className="SideNav-item">
        <Flex>
          <Report marginTop="7px" marginLeft="7px" aria-label="S" size="S"/>
          <NavLink className="SideNav-itemLink" aria-current="page" to="/">Reports</NavLink>
        </Flex>
      </li>
      <li className="SideNav-item">
        <Flex>
          <Shield marginTop="7px" marginLeft="7px" aria-label="S" size="S"/>
          <NavLink className="SideNav-itemLink" aria-current="page" to="/">Security</NavLink>
        </Flex>
      </li>
    </ul>
  )
}

export default Sidebar
