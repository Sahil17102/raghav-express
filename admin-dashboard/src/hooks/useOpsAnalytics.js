import { useQuery } from '@tanstack/react-query'
import { getAdminOpsAnalytics } from 'services/opsAnalytics.service'

const localOpsSnapshot = {
  success: true,
  data: {
    summary: {
      totalOrders: 1248,
      deliveryRate: 94.2,
      rtoRate: 2.6,
      avgDeliveryDays: 2.4,
      avgDispatchDays: 0.7,
      bestCourier: { label: 'Raghav Surface' },
      bestZone: { label: 'North' },
    },
    zoneOverview: [
      { label: 'North', orders: 386, deliveryRate: 95.8, rtoRate: 2.1, avgDeliveryDays: 2.2, bestCourier: 'Raghav Surface' },
      { label: 'West', orders: 342, deliveryRate: 94.6, rtoRate: 2.4, avgDeliveryDays: 2.3, bestCourier: 'Express Air' },
      { label: 'South', orders: 294, deliveryRate: 92.9, rtoRate: 3.1, avgDeliveryDays: 2.8, bestCourier: 'Cargo Freight' },
    ],
    zoneCourierMatrix: { zones: [], couriers: [], rows: [] },
    zoneRtoAnalytics: [
      { zone: 'North', codRto: 3.2, prepaidRto: 1.1 },
      { zone: 'West', codRto: 3.7, prepaidRto: 1.4 },
      { zone: 'South', codRto: 4.3, prepaidRto: 1.8 },
    ],
    zoneSpeed: [
      { zone: 'North', bestCourier: 'Raghav Surface', avgDays: 2.2 },
      { zone: 'West', bestCourier: 'Express Air', avgDays: 2.3 },
      { zone: 'South', bestCourier: 'Cargo Freight', avgDays: 2.8 },
    ],
    ndrAnalytics: [], courierPerformance: [], highRiskPincodes: [],
    pincodeCourierComparison: [], codFriendlyPincodes: [], prepaidRecommendedPincodes: [],
    weightDistribution: [], colorWiseRto: [], priceWiseRto: [], courierRtoByWeight: [],
    productWiseRto: [], categoryWiseRto: [], skuWiseRto: [], sizeWiseRto: [], dispatchDelay: [],
    guidance: ['Prioritize Raghav Surface for North zone shipments.', 'Review COD verification for South zone orders.'],
  },
}

export const useOpsAnalytics = (filters = {}) => {
  return useQuery({
    queryKey: [
      'admin-ops-analytics',
      filters.fromDate || '',
      filters.toDate || '',
      filters.search || '',
      filters.courier || '',
      filters.zone || '',
      filters.accountId || '',
    ],
    queryFn: async () => {
      try {
        return await getAdminOpsAnalytics({
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
          search: filters.search || undefined,
          courier: filters.courier || undefined,
          zone: filters.zone || undefined,
          accountId: filters.accountId || undefined,
          userId: filters.accountId || undefined,
        })
      } catch (error) {
        const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
        if (isLocal) return localOpsSnapshot
        throw error
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
  })
}
