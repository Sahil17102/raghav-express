import {
  Box,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { BRAND } from '../../constants/brand'
import AdminNavbarLinks from './AdminNavbarLinks'

export default function AdminNavbar(props) {
  const { variant, children, fixed, secondary, brandText, onOpen, sidebarWidth = 275, ...rest } = props

  const mainText = useColorModeValue('gray.800', 'gray.100')
  const paddingX = '18px'

  const fixedNavbarShadow = useColorModeValue(
    '0 10px 30px rgba(6, 26, 51, 0.06)',
    '0 16px 38px rgba(5, 4, 10, 0.42)',
  )
  const fixedNavbarBg = useColorModeValue(
    'rgba(255,255,255,0.94)',
    'rgba(4,26,56,0.92)',
  )
  const fixedNavbarBorder = useColorModeValue(BRAND.colors.border, 'rgba(134, 168, 211, 0.18)')

  return (
    <Flex
      position="relative"
      zIndex="20"
      boxShadow={fixedNavbarShadow}
      bg={fixedNavbarBg}
      borderColor={fixedNavbarBorder}
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderStyle="solid"
      transition="all 0.3s ease"
      alignItems={{ xl: 'center' }}
      borderRadius="0"
      display="flex"
      minH="64px"
      justifyContent={{ xl: 'center' }}
      mx="0"
      mt="0"
      px={{ sm: paddingX, md: '18px' }}
      py="8px"
      w={{
        base: '100%',
        xl: '100%',
      }}
    >
      <Flex w="100%" flexDirection={{ sm: 'column', md: 'row' }} alignItems={{ xl: 'center' }} gap={{ sm: 2, md: 0 }}>
        <Box mb={{ sm: '4px', md: '0px' }} display="flex" alignItems="center" gap="12px">
          <Box w="4px" h="38px" borderRadius="full" bg={`linear-gradient(180deg, ${BRAND.colors.teal}, ${BRAND.colors.orange})`} />
          <Box>
            <Text color="accent.500" fontSize="10px" lineHeight="1" fontWeight="800" letterSpacing="0.16em" textTransform="uppercase" mb="5px">
              Admin workspace
            </Text>
            <Text color={mainText} fontWeight="800" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1" letterSpacing="-0.025em">
              {brandText}
            </Text>
          </Box>
        </Box>

        <Box ms="auto" w={{ sm: '100%', md: 'unset' }}>
          <AdminNavbarLinks onOpen={onOpen} logoText={props.logoText} secondary={false} fixed={true} />
        </Box>
      </Flex>
    </Flex>
  )
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
  sidebarWidth: PropTypes.number,
}
