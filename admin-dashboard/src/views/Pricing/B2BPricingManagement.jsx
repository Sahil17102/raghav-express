import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Suspense, useEffect, useMemo, useState } from 'react'
import B2BAdditionalCharges from '../../components/B2B/B2BAdditionalCharges'
import B2BQuoteCalculator from '../../components/B2B/B2BQuoteCalculator'
import B2BRateMatrix from '../../components/B2B/B2BRateMatrix'
import { useCouriers } from '../../hooks/useCouriers'
import { b2bAdminService } from '../../services/b2bAdmin.service'
import { PlansService } from '../../services/plan.service'
import ZonesManagement from '../Zones/ZonesManagement'

const B2BPincodesPanel = () => {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ pincode: '', zone_id: '', courier_id: '', flag: '' })
  const { data: couriers = [] } = useCouriers({ businessType: 'b2b' })
  const { data: zones = [] } = useQuery({
    queryKey: ['b2b-pricing-zones-for-pincodes'],
    queryFn: () => b2bAdminService.getZones({ include_global: true }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['b2b-pricing-pincodes', page, filters],
    queryFn: () =>
      b2bAdminService.getPincodes({
        page,
        limit: 20,
        pincode: filters.pincode || undefined,
        zone_id: filters.zone_id || undefined,
      }),
    keepPreviousData: true,
  })

  const rows = data?.data || []
  const total = data?.pagination?.total || 0
  const totalPages = data?.pagination?.totalPages || Math.max(1, Math.ceil(total / 20))

  const flagLabels = useMemo(
    () => ['ODA', 'Remote', 'Mall', 'SEZ / Port', 'Airport', 'High Security', 'SDL Zone', 'To-Pay Charge', 'Green Tax'],
    [],
  )

  return (
    <Stack spacing={4}>
      <Flex gap={3} wrap="wrap" align="end">
        <Box minW="220px">
          <Text mb={1} fontSize="sm" fontWeight="semibold">
            Search pincode
          </Text>
          <Input
            placeholder="Search pincode"
            value={filters.pincode}
            onChange={(event) => {
              setPage(1)
              setFilters((prev) => ({ ...prev, pincode: event.target.value }))
            }}
          />
        </Box>
        <Box minW="230px">
          <Text mb={1} fontSize="sm" fontWeight="semibold">
            All zones
          </Text>
          <Select
            placeholder="All zones"
            value={filters.zone_id}
            onChange={(event) => {
              setPage(1)
              setFilters((prev) => ({ ...prev, zone_id: event.target.value }))
            }}
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.code} — {zone.name}
              </option>
            ))}
          </Select>
        </Box>
        <Box minW="230px">
          <Text mb={1} fontSize="sm" fontWeight="semibold">
            All couriers
          </Text>
          <Select
            placeholder="All couriers"
            value={filters.courier_id}
            onChange={(event) => setFilters((prev) => ({ ...prev, courier_id: event.target.value }))}
          >
            {couriers.map((courier) => (
              <option key={courier.id} value={courier.id}>
                {courier.name}
              </option>
            ))}
          </Select>
        </Box>
        <Box minW="220px">
          <Text mb={1} fontSize="sm" fontWeight="semibold">
            All flags
          </Text>
          <Select
            placeholder="All flags"
            value={filters.flag}
            onChange={(event) => setFilters((prev) => ({ ...prev, flag: event.target.value }))}
          >
            {flagLabels.map((flag) => (
              <option key={flag} value={flag}>
                {flag}
              </option>
            ))}
          </Select>
        </Box>
        <Flex ml="auto" gap={2}>
          <Button variant="outline">Approved Template</Button>
          <Button variant="outline">Import CSV</Button>
          <Button colorScheme="brand">Add Pincode</Button>
        </Flex>
      </Flex>

      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          {total.toLocaleString('en-IN')} pincodes
        </Text>
        {isLoading && <Spinner size="sm" />}
      </HStack>

      <TableContainer borderWidth="1px" borderRadius="lg">
        <Table size="sm">
          <Thead bg="purple.50">
            <Tr>
              <Th>Pincode</Th>
              <Th>City</Th>
              <Th>State</Th>
              <Th>Zone</Th>
              <Th>Courier</Th>
              <Th>Attributes</Th>
              <Th>SDL Rate/Kg</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td fontWeight="semibold">{row.pincode}</Td>
                <Td>{row.city}</Td>
                <Td>{row.state}</Td>
                <Td>
                  <Badge colorScheme="blue">
                    {row.zone_code} — {row.zone_name}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme="gray">{row.courier_name || 'Global'}</Badge>
                </Td>
                <Td>
                  <Badge colorScheme="green">{row.attributes || 'Standard'}</Badge>
                </Td>
                <Td>{row.sdl_rate_per_kg || '-'}</Td>
                <Td>
                  <Button size="xs" variant="outline">
                    Edit
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Flex justify="flex-end" align="center" gap={3}>
        <Button size="sm" variant="outline" isDisabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          Previous
        </Button>
        <Text fontSize="sm">
          Page {page} of {totalPages}
        </Text>
        <Button
          size="sm"
          variant="outline"
          isDisabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Flex>
    </Stack>
  )
}

const B2BPricingManagement = () => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => PlansService.getPlans(),
  })

  useEffect(() => {
    if (plans?.length > 0 && !selectedPlanId) setSelectedPlanId(plans[0].id)
  }, [plans, selectedPlanId])

  const showPlan = tabIndex >= 2

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={{ base: 4, md: 6 }}>
      <VStack spacing={6} align="stretch">
        <Box bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} shadow="md" p={6}>
          <Heading size="lg" mb={2}>
            B2B Pricing Management
          </Heading>
          <Text color="gray.600" fontSize="sm" mb={6}>
            Configure zones, pincode coverage, rates and shipment charges.
          </Text>

          {showPlan && plans?.length > 0 && (
            <HStack spacing={3} align="center" mb={4}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" minW="80px">
                Plan
              </Text>
              <Select value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)} maxW="240px">
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </HStack>
          )}

          <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="purple" variant="line">
            <TabList gap={2} borderBottomWidth="1px" borderColor={borderColor}>
              {['Zones', 'Pincodes', 'Rate Matrix', 'Additional Charges', 'Quote Calculator'].map((label) => (
                <Tab key={label} fontWeight="medium" fontSize="lg" px={0} mr={6}>
                  {label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              <TabPanel px={0} py={6}>
                <ZonesManagement defaultBusinessType="B2B" />
              </TabPanel>
              <TabPanel px={0} py={6}>
                <B2BPincodesPanel />
              </TabPanel>
              <TabPanel px={0} py={6}>
                <Suspense fallback={<Box p={6}>Loading rate matrix...</Box>}>
                  <B2BRateMatrix planId={selectedPlanId} />
                </Suspense>
              </TabPanel>
              <TabPanel px={0} py={6}>
                <Suspense fallback={<Box p={6}>Loading charges...</Box>}>
                  <B2BAdditionalCharges planId={selectedPlanId} />
                </Suspense>
              </TabPanel>
              <TabPanel px={0} py={6}>
                <Suspense fallback={<Box p={6}>Loading calculator...</Box>}>
                  <B2BQuoteCalculator planId={selectedPlanId} />
                </Suspense>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Box>
  )
}

export default B2BPricingManagement
