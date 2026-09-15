import { Badge, Flex, useColorModeValue } from '@chakra-ui/react'
import {
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineCloseCircle,
  AiOutlineInfoCircle,
} from 'react-icons/ai'

const StatusBadge = ({ status, type = 'neutral', onClick = null }) => {
  const isLight = useColorModeValue(true, false)

  // Map types to colors and icons - using theme colors
  const badgeStyles = {
    success: { bg: 'green.500', color: 'white', Icon: AiOutlineCheckCircle },
    info: { bg: 'brand.500', color: 'white', Icon: AiOutlineInfoCircle }, // Use primary (blue) for info
    warning: { bg: '#F59E0B', color: isLight ? '#3B2500' : 'white', Icon: AiOutlineClockCircle },
    error: { bg: 'accent.500', color: 'white', Icon: AiOutlineCloseCircle },
    neutral: {
      bg: isLight ? 'gray.100' : 'whiteAlpha.100',
      color: isLight ? 'gray.700' : 'white',
      Icon: AiOutlineInfoCircle,
    },
  }

  const { bg, color, Icon } = badgeStyles[type] || badgeStyles.neutral

  return (
    <Badge
      bg={bg}
      color={color}
      fontSize="14px"
      px="10px"
      py="3px"
      borderRadius="8px"
      textTransform="capitalize"
      fontWeight="medium"
      w="fit-content"
      onClick={() => onClick?.()}
    >
      <Flex align="center" gap={1}>
        <Icon />
        {status}
      </Flex>
    </Badge>
  )
}

export default StatusBadge
