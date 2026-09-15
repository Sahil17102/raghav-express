import { useQuery } from '@tanstack/react-query'
import { getAdminDashboardStats } from 'services/dashboard.service'

const localDashboardSnapshot = {
  success: true,
  data: {
    todayOperations: { orders: 38, pending: 7, inTransit: 19, delivered: 12, ndr: 3, stuck: 1 },
    financial: {
      todayShippingCharges: 42680,
      todayRevenue: 12840,
      totalShippingCharges: 684200,
      totalFreightCharges: 512400,
      totalCourierCosts: 366100,
      totalRevenue: 146300,
      codAmount: 218900,
      codRemittanceDue: 36400,
      codStats: { totalCollected: 218900, remitted: 182500, pendingRemittance: 36400 },
    },
    operational: {
      deliverySuccessRate: 94.2,
      ndrRate: 4.8,
      rtoRate: 2.6,
      avgDeliveryTime: 2.4,
      totalOrders: 1248,
      deliveredOrders: 1176,
      ndrOrders: 60,
      rtoOrders: 32,
    },
    alerts: { openTickets: 8, inProgressTickets: 5, overdueTickets: 2, pendingKyc: 6, weightDiscrepancies: 4 },
    couriers: {
      total: 6,
      performance: {
        'Raghav Surface': { count: 486, deliveryRate: 95.4, revenue: 58200 },
        'Express Air': { count: 372, deliveryRate: 93.8, revenue: 51400 },
        'Cargo Freight': { count: 241, deliveryRate: 91.6, revenue: 36700 },
      },
      byServiceProvider: { Delhivery: 3, Other: 3 },
    },
    geographic: {
      topOriginCities: [{ city: 'Jodhpur', count: 318 }, { city: 'Pali', count: 224 }, { city: 'Jaipur', count: 196 }],
      topDestinationCities: [{ city: 'Delhi', count: 286 }, { city: 'Mumbai', count: 238 }, { city: 'Ahmedabad', count: 174 }],
    },
    users: { total: 186, today: 4, lastWeek: 19, active: 142, veryActive: 87, pendingKyc: 6 },
    charts: {
      ordersByDate: [24, 31, 27, 36, 42, 33, 38].map((orders, index) => ({
        date: new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10),
        orders,
      })),
      revenueByDate: [7200, 9100, 8400, 11200, 13600, 10800, 12840].map((revenue, index) => ({
        date: new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10),
        revenue,
      })),
      shippingChargesByDate: [],
      ordersByIntegration: [],
    },
    orderStatusCounts: { delivered: 1176, in_transit: 19, pending: 7, ndr: 60, rto: 32 },
    recentOrders: [],
    recentTickets: [],
  },
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await getAdminDashboardStats()
        const payload = response?.data || {}
        const hasMeaningfulLocalData =
          Number(payload?.operational?.totalOrders || 0) > 0 ||
          (payload?.charts?.ordersByDate || []).some((item) => Number(item?.orders || 0) > 0)
        const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
        return isLocal && !hasMeaningfulLocalData ? localDashboardSnapshot : response
      } catch (error) {
        const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
        if (isLocal) return localDashboardSnapshot
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

