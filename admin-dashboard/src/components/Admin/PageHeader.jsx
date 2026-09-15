import { Badge, Box, Flex, HStack, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { BRAND } from '../../constants/brand'
import BrandMark from '../Brand/BrandMark'

export default function PageHeader({
  eyebrow = `${BRAND.name} Admin`,
  title,
  description,
  actions = null,
  meta = [],
}) {
  const panelBg = useColorModeValue('rgba(255,255,255,0.96)', 'rgba(4, 26, 56, 0.94)')
  const borderColor = useColorModeValue(BRAND.colors.border, 'rgba(134, 168, 211, 0.18)')
  const titleColor = useColorModeValue(BRAND.colors.ink, 'white')
  const textColor = useColorModeValue(BRAND.colors.muted, 'gray.300')
  const lightMetaTones = [
    { bg: 'rgba(6, 42, 91, 0.07)', border: 'rgba(6, 42, 91, 0.18)', value: 'brand.600' },
    { bg: 'rgba(15, 90, 138, 0.08)', border: 'rgba(15, 90, 138, 0.2)', value: '#0F5A8A' },
    { bg: 'rgba(237, 28, 36, 0.07)', border: 'rgba(237, 28, 36, 0.18)', value: 'accent.600' },
  ]
  const darkMetaTones = lightMetaTones.map(() => ({
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(134, 168, 211, 0.18)',
    value: 'white',
  }))
  const metaTones = useColorModeValue(lightMetaTones, darkMetaTones)

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg={panelBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="8px"
      px={{ base: 3, md: 4 }}
      py={{ base: 3, md: 4 }}
      boxShadow={useColorModeValue('0 10px 28px rgba(6, 42, 91, 0.07)', '0 16px 40px rgba(2, 6, 23, 0.38)')}
      backdropFilter="blur(14px)"
      backgroundImage="linear-gradient(135deg, rgba(238,244,251,0.7) 0%, rgba(255,255,255,0.98) 48%, rgba(253,231,234,0.32) 100%)"
    >
      <Flex
        position="relative"
        zIndex="1"
        justify="space-between"
        align={{ base: 'flex-start', xl: 'center' }}
        direction={{ base: 'column', xl: 'row' }}
        gap={3}
      >
        <Stack spacing={2} maxW="900px">
          <Badge
            alignSelf="flex-start"
            borderRadius="8px"
            px={3}
            py={1}
            fontSize="11px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            bg="accent.50"
            color="accent.600"
          >
            <HStack spacing={2}>
              <BrandMark markOnly size={18} />
              <Text as="span">{eyebrow}</Text>
            </HStack>
          </Badge>
          <Stack spacing={1.5}>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="-0.03em" color={titleColor}>
              {title}
            </Text>
            {description ? (
              <Text color={textColor} fontSize="sm" lineHeight="1.55">
                {description}
              </Text>
            ) : null}
          </Stack>
          {meta.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2} w="100%">
              {meta.map((item, index) => {
                const tone = metaTones[index % metaTones.length]
                return (
                <Box
                  key={item.label}
                  px={3}
                  py={2}
                  borderRadius="8px"
                  bg={tone.bg}
                  borderWidth="1px"
                  borderColor={tone.border}
                  borderLeftWidth="3px"
                  minW={0}
                >
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={textColor} mb={1}>
                    {item.label}
                  </Text>
                  <Text fontSize="lg" fontWeight="800" color={tone.value}>
                    {item.value}
                  </Text>
                </Box>
                )
              })}
            </SimpleGrid>
          ) : null}
        </Stack>
        {actions ? <Box w={{ base: '100%', xl: 'auto' }}>{actions}</Box> : null}
      </Flex>
    </Box>
  )
}
