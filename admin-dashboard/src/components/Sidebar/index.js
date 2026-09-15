/*eslint-disable*/
// chakra imports
import { Box, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import SidebarContent from './SidebarContent'
import { BRAND } from '../../constants/brand'

function Sidebar(props) {
  const mainPanel = React.useRef()
  let variantChange = '0.2s linear'

  const { logoText, routes, sidebarVariant, sidebarWidth } = props

  //  BRAND
  let sidebarBg = useColorModeValue('#FFFFFF', BRAND.colors.tealDark)
  let sidebarRadius = '0px'
  let sidebarMargins = '0px'
  if (sidebarVariant === 'opaque') {
    sidebarBg = useColorModeValue('#FFFFFF', BRAND.colors.tealDark)
    sidebarRadius = '0px'
    sidebarMargins = '0px'
  }

  // SIDEBAR
  return (
    <Box ref={mainPanel}>
      <Box
        display={{ sm: 'none', xl: 'block' }}
        position="fixed"
        inset="0 auto 0 0"
        h="100dvh"
        zIndex="1200"
        overflow="hidden"
      >
        <Box
          bg={sidebarBg}
          transition={variantChange}
          w={`${sidebarWidth}px`} // ✅ dynamic width from Dashboard
          maxW="400px"
          minW={`${sidebarWidth}px`}
          ms={{ sm: '16px' }}
          my={{ sm: '16px' }}
          h="100dvh"
          ps="8px"
          pe="8px"
          m={sidebarMargins}
          borderRadius={sidebarRadius}
          borderRight="1px solid"
          borderRightColor={useColorModeValue(BRAND.colors.border, 'rgba(255,255,255,0.12)')}
        >
          <SidebarContent
            sidebarWidth={sidebarWidth}
            routes={routes}
            logoText={logoText || BRAND.name}
            sidebarVariant={sidebarVariant}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar
