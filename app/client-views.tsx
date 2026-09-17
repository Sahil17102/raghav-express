'use client';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Download,
  Eye,
  FileText,
  IndianRupee,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Truck,
  WalletCards,
  Warehouse,
  X,
  Zap,
} from 'lucide-react';
const orders = [
  [
    'RGX-240812',
    'Aarav Textiles',
    'Jodhpur → Delhi',
    'Raghav Surface',
    '₹1,240',
    'In transit',
  ],
  [
    'RGX-240811',
    'Meera Handicrafts',
    'Pali → Mumbai',
    'Express Air',
    '₹860',
    'Delivered',
  ],
  [
    'RGX-240810',
    'Raj Foods',
    'Jaipur → Ahmedabad',
    'Raghav Cargo',
    '₹2,180',
    'Pickup due',
  ],
  [
    'RGX-240809',
    'Blue Pottery Co.',
    'Jodhpur → Bengaluru',
    'Express Air',
    '₹1,560',
    'NDR',
  ],
];
export function ClientHome({ go }: { go: (n: string) => void }) {
  const kpis = [
    ['Orders Today', '0', Boxes, 'blue'],
    ['In Transit', '0', Truck, 'teal'],
    ['NDR Pending', '0', AlertTriangle, 'red'],
    ['RTO Active', '0', RefreshCw, 'violet'],
    ['Wallet', '₹4,948', WalletCards, 'orange'],
  ] as const;
  return (
    <>
      <section className="home-welcome">
        <div>
          <span>DAILY SHIPPING OVERVIEW</span>
          <h1>Good evening, Raghav!</h1>
          <p>Here’s your daily overview and the actions that need attention.</p>
        </div>
        <button onClick={() => go('Create Order')}>
          <Plus />
          Create Order
        </button>
      </section>
      <section className="home-kpis">
        {kpis.map(([n, v, I, t]) => (
          <button
            key={n}
            className={t}
            onClick={() =>
              go(
                n === 'Wallet'
                  ? 'Passbook'
                  : n.includes('NDR')
                    ? 'NDR'
                    : n.includes('RTO')
                      ? 'RTO'
                      : 'All Orders',
              )
            }
          >
            <I />
            <span>
              <small>{n}</small>
              <b>{v}</b>
              <em>View details →</em>
            </span>
          </button>
        ))}
      </section>
      <section className="home-layout">
        <article className="clone-card profile-card">
          <header>
            <span>
              <ClipboardList />
            </span>
            <div>
              <h2>Complete Your Profile</h2>
              <p>75% complete</p>
            </div>
            <b>75%</b>
          </header>
          <div className="profile-progress">
            <i />
          </div>
          {[
            ['Company Profile', 'Add business details', Building2],
            ['Bank Account', 'Required for COD payouts', WalletCards],
            ['Pickup Address', 'Set up warehouse location', Warehouse],
            ['Label Config', 'Customize shipping labels', FileText],
          ].map(([n, d, I]) => (
            <button
              key={n as string}
              onClick={() =>
                go(n === 'Pickup Address' ? 'Warehouse' : 'Settings')
              }
            >
              <span>
                <I />
              </span>
              <p>
                <b>{n as string}</b>
                <small>{d as string}</small>
              </p>
              <ChevronDown />
            </button>
          ))}
        </article>
        <article className="clone-card home-quick">
          <header>
            <span>
              <Zap />
            </span>
            <div>
              <h2>Quick Actions</h2>
              <p>Shortcuts</p>
            </div>
          </header>
          {[
            ['Create Order', 'Ship a new package', Plus],
            ['All Orders', 'View all shipments', Boxes],
            ['NDR', 'Handle failed deliveries', AlertTriangle],
            ['COD Remittance', 'Track COD payouts', IndianRupee],
            ['Rate Calculator', 'Compare courier rates', Calculator],
            ['Reports', 'Shipping insights', BarChart3],
          ].map(([n, d, I]) => (
            <button key={n as string} onClick={() => go(n as string)}>
              <I />
              <span>
                <b>{n as string}</b>
                <small>{d as string}</small>
              </span>
            </button>
          ))}
        </article>
      </section>
    </>
  );
}
export function OrdersManager({
  go,
  mode = 'All Orders',
}: {
  go: (n: string) => void;
  mode?: 'All Orders' | 'B2C Orders' | 'B2B Orders';
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [filters, setFilters] = useState(false);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [orderType, setOrderType] = useState(
    mode === 'B2C Orders' ? 'B2C' : mode === 'B2B Orders' ? 'B2B' : 'All',
  );
  const [payment, setPayment] = useState('All payments');
  const [courier, setCourier] = useState('All couriers');
  const typedOrders = useMemo(
    () =>
      orders.map((r, index) => ({
        row: r,
        type: index % 2 === 0 ? 'B2C' : 'B2B',
        payment: index % 2 === 0 ? 'Prepaid' : 'COD',
      })),
    [],
  );
  const filtered = useMemo(
    () =>
      typedOrders.filter(
        ({ row, type, payment: pay }) =>
          row.join(' ').toLowerCase().includes(query.toLowerCase()) &&
          (orderType === 'All' || type === orderType) &&
          (status === 'All' || row[5].toLowerCase() === status.toLowerCase()) &&
          (payment === 'All payments' || pay === payment) &&
          (courier === 'All couriers' || row[3] === courier),
      ),
    [typedOrders, query, orderType, status, payment, courier],
  );
  const exportCsv = () => {
    const csv = [
      'LRN,Type,Customer,Route,Courier,Amount,Status',
      ...filtered.map(({ row, type }) =>
        [row[0], type, ...row.slice(1)].join(','),
      ),
    ].join('\n');
    const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = href;
    a.download = `raghav-${orderType.toLowerCase()}-orders.csv`;
    a.click();
    URL.revokeObjectURL(href);
  };
  return (
    <>
      <section className="orders-head">
        <div>
          <span>ORDER MANAGEMENT</span>
          <h1>{orderType === 'All' ? 'All Orders' : `${orderType} Orders`}</h1>
          <p>
            Search, filter and manage every{' '}
            {orderType === 'All' ? 'shipment' : orderType + ' shipment'}.
          </p>
        </div>
        <div>
          <button onClick={() => setFilters(!filters)}>
            <SlidersHorizontal />
            Filters
          </button>
          <button onClick={exportCsv}>
            <Download />
            Export CSV
          </button>
          <button className="primary" onClick={() => go('Create Order')}>
            <Plus />
            Create Order
          </button>
        </div>
      </section>
      <section className="order-type-tabs" aria-label="Order type">
        {['All', 'B2C', 'B2B'].map((type) => (
          <button
            key={type}
            className={orderType === type ? 'active' : ''}
            onClick={() => setOrderType(type)}
          >
            {type === 'All' ? 'All Orders' : `${type} Orders`}
            <span>
              {
                typedOrders.filter((x) => type === 'All' || x.type === type)
                  .length
              }
            </span>
          </button>
        ))}
      </section>
      {filters && (
        <section className="order-filters">
          <label>
            <CalendarDays />
            From
            <input type="date" />
          </label>
          <label>
            <CalendarDays />
            To
            <input type="date" />
          </label>
          <label>
            <Search />
            Search
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="LRN, customer, courier"
            />
          </label>
          <label>
            Payment mode
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option>All payments</option>
              <option>Prepaid</option>
              <option>COD</option>
            </select>
          </label>
          <label>
            Courier
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
            >
              <option>All couriers</option>
              <option>Raghav Surface</option>
              <option>Express Air</option>
              <option>Raghav Cargo</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStatus('All');
              setPayment('All payments');
              setCourier('All couriers');
            }}
          >
            Clear filters
          </button>
        </section>
      )}
      <section className="status-tabs">
        {[
          'All',
          'Pickups & Manifests',
          'In transit',
          'Out for delivery',
          'Delivered',
          'RTO Intransit',
          'RTO Delivered',
          'Undelivered',
          'Cancelled',
          'NDR',
        ].map((s) => (
          <button
            className={status === s ? 'active' : ''}
            onClick={() => setStatus(s)}
            key={s}
          >
            {s}
            <span>
              {s === 'All'
                ? typedOrders.filter(
                    (x) => orderType === 'All' || x.type === orderType,
                  ).length
                : typedOrders.filter(
                    ({ row, type }) =>
                      (orderType === 'All' || type === orderType) &&
                      row[5].toLowerCase() === s.toLowerCase(),
                  ).length}
            </span>
          </button>
        ))}
      </section>
      <article className="clone-card order-management">
        <header>
          <div>
            <h2>
              {orderType === 'All' ? 'All Orders' : `${orderType} Orders`}
            </h2>
            <p>{filtered.length} total orders</p>
          </div>
          <label className="table-search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders"
            />
          </label>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>LRN / AWB</th>
                <th>TYPE</th>
                <th>CUSTOMER</th>
                <th>ROUTE</th>
                <th>COURIER</th>
                <th>WEIGHT</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ row: r, type, payment: pay }) => (
                <tr key={r[0]}>
                  <td>
                    <b>{r[0]}</b>
                    <small>AWB-{r[0].slice(-6)}</small>
                  </td>
                  <td>
                    <b>{type}</b>
                    <small>{pay}</small>
                  </td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td>1.25 kg</td>
                  <td>{r[4]}</td>
                  <td>
                    <span className="order-status">{r[5]}</span>
                  </td>
                  <td>
                    <button
                      className="info-button"
                      onClick={() => setSelected(r)}
                    >
                      <Eye />
                      Info
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer>
          <span>
            Rows per page: <b>10</b>
          </span>
          <span>
            1–{filtered.length} of {filtered.length}
          </span>
        </footer>
      </article>
      {selected && (
        <div className="clone-modal" onClick={() => setSelected(null)}>
          <section
            className="order-detail"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelected(null)}>
              <X />
            </button>
            <span className="detail-label">COMPLETE ORDER INFORMATION</span>
            <h2>{selected[0]}</h2>
            <div className="detail-grid">
              {[
                ['Customer', selected[1]],
                [
                  'Order Type',
                  typedOrders.find((x) => x.row[0] === selected[0])?.type ||
                    'B2C',
                ],
                ['Route', selected[2]],
                ['Courier', selected[3]],
                ['Charged Weight', '1.25 kg'],
                ['Invoice Value', selected[4]],
                ['Sender', 'Raghav Express, Jodhpur'],
                ['Receiver', selected[1]],
              ].map(([a, b]) => (
                <div key={a}>
                  <small>{a}</small>
                  <b>{b}</b>
                </div>
              ))}
            </div>
            <div className="detail-route">
              <MapPin />
              <span>Booked</span>
              <i />
              <Truck />
              <span>In transit</span>
              <i />
              <PackageCheck />
              <span>Delivery</span>
            </div>
            <button className="save-button" onClick={() => setSelected(null)}>
              Close details
            </button>
          </section>
        </div>
      )}
    </>
  );
}

const moduleConfig: Record<
  string,
  {
    title: string;
    sub: string;
    actions: string[];
    cards: [string, string, typeof Boxes][];
  }
> = {
  Warehouse: {
    title: 'Pickup Warehouses',
    sub: 'Manage pickup and return locations',
    actions: ['Add Warehouse', 'Upload CSV'],
    cards: [
      ['Primary Warehouse', 'Industrial Area, Jodhpur', Warehouse],
      ['Returns Hub', 'MIA, Pali', MapPin],
      ['Pickup Coverage', '3 active pincodes', Truck],
    ],
  },
  Reconciliation: {
    title: 'Weight Reconciliation',
    sub: 'Review shipment weight discrepancies',
    actions: ['Export Report', 'Settings'],
    cards: [
      ['Open Disputes', '3 shipments', AlertTriangle],
      ['Amount on Hold', '₹1,840', IndianRupee],
      ['Resolved', '18 this month', PackageCheck],
    ],
  },
  Couriers: {
    title: 'Courier Partners',
    sub: 'Manage available delivery services',
    actions: ['Set Priority', 'Compare Rates'],
    cards: [
      ['Raghav Surface', 'Pan India · 3–6 days', Truck],
      ['Express Air', 'Metro cities · 1–3 days', PackageCheck],
      ['Cargo Freight', 'PTL · LTL · FTL', Boxes],
    ],
  },
  Channels: {
    title: 'Sales Channels',
    sub: 'Connect stores and automate order sync',
    actions: ['Add Channel', 'Sync Orders'],
    cards: [
      ['Shopify', 'Ready to connect', Building2],
      ['WooCommerce', 'Ready to connect', Building2],
      ['Custom API', 'API keys and webhooks', ClipboardList],
    ],
  },
  Passbook: {
    title: 'Wallet Passbook',
    sub: 'Track wallet credits and shipping debits',
    actions: ['Recharge Wallet', 'Download Statement'],
    cards: [
      ['Available Balance', '₹4,948', WalletCards],
      ['Total Recharged', '₹15,000', IndianRupee],
      ['Shipping Spend', '₹10,052', Truck],
    ],
  },
  'COD Remittance': {
    title: 'COD Remittance',
    sub: 'Track collected COD and payout status',
    actions: ['Export CSV', 'Bank Details'],
    cards: [
      ['COD Collected', '₹24,520', IndianRupee],
      ['Next Remittance', '15 Sep 2026', CalendarDays],
      ['Pending Orders', '12 shipments', Boxes],
    ],
  },
  'Shipping Charges': {
    title: 'Shipping Charges',
    sub: 'Review freight, COD and handling deductions',
    actions: ['Export Charges', 'Raise Dispute'],
    cards: [
      ['Freight Charges', '₹8,940', Truck],
      ['COD Fees', '₹620', IndianRupee],
      ['Tax & Handling', '₹492', FileText],
    ],
  },
  'All Recharges': {
    title: 'Wallet Recharges',
    sub: 'Review every wallet recharge and payment status',
    actions: ['Recharge Wallet', 'Export CSV'],
    cards: [
      ['Successful', '₹15,000', WalletCards],
      ['Pending', '₹0', RefreshCw],
      ['Failed', '₹0', AlertTriangle],
    ],
  },
  Invoices: {
    title: 'Tax Invoices',
    sub: 'Download monthly shipping and service invoices',
    actions: ['Download All', 'Date Range'],
    cards: [
      ['September 2026', '₹10,052', FileText],
      ['August 2026', '₹8,760', FileText],
      ['GST Documents', 'Up to date', PackageCheck],
    ],
  },
  'Credit Notes': {
    title: 'Credit Notes',
    sub: 'Track approved billing adjustments and refunds',
    actions: ['Export CSV', 'Date Range'],
    cards: [
      ['Total Credits', '₹860', IndianRupee],
      ['Open Notes', '1 document', FileText],
      ['Applied', '4 notes', PackageCheck],
    ],
  },
  'Debit Notes': {
    title: 'Debit Notes',
    sub: 'Review additional shipping and adjustment charges',
    actions: ['Export CSV', 'Raise Query'],
    cards: [
      ['Total Debits', '₹420', IndianRupee],
      ['Open Notes', '2 documents', FileText],
      ['Resolved', '7 notes', PackageCheck],
    ],
  },
  Ledgers: {
    title: 'Account Ledger',
    sub: 'Complete credit, debit and running balance statement',
    actions: ['Download Ledger', 'Date Range'],
    cards: [
      ['Opening Balance', '₹0', WalletCards],
      ['Credits', '₹15,860', IndianRupee],
      ['Debits', '₹10,912', FileText],
    ],
  },
  Reports: {
    title: 'Shipping Reports',
    sub: 'Operational and financial performance reports',
    actions: ['Date Range', 'Export Report'],
    cards: [
      ['Order Report', 'Shipment-wise movement', BarChart3],
      ['Revenue Report', 'Prepaid and COD earnings', IndianRupee],
      ['Courier Report', 'Partner performance', Truck],
    ],
  },
  NDR: {
    title: 'NDR Management',
    sub: 'Resolve failed delivery attempts',
    actions: ['Bulk Action', 'Export NDR'],
    cards: [
      ['Action Required', '4 shipments', AlertTriangle],
      ['Buyer Reattempt', '2 requested', RefreshCw],
      ['Address Update', '1 pending', MapPin],
    ],
  },
  RTO: {
    title: 'RTO Management',
    sub: 'Track return-to-origin shipments',
    actions: ['Export RTO', 'Review Charges'],
    cards: [
      ['RTO In Transit', '3 shipments', Truck],
      ['RTO Delivered', '18 shipments', PackageCheck],
      ['RTO Charges', '₹2,460', IndianRupee],
    ],
  },
  Support: {
    title: 'Support Centre',
    sub: 'Create and monitor support tickets',
    actions: ['Create Ticket', 'Contact Support'],
    cards: [
      ['Open Tickets', '2 active', AlertTriangle],
      ['Resolved Tickets', '14 total', PackageCheck],
      ['Average Response', '2 hours', RefreshCw],
    ],
  },
  Settings: {
    title: 'Account Settings',
    sub: 'Manage company, billing and shipping preferences',
    actions: ['Save Changes', 'API Settings'],
    cards: [
      ['Company Profile', 'Business and contact details', Building2],
      ['Label Configuration', 'Invoice and label preferences', FileText],
      ['Courier Priority', 'Automated courier selection', SlidersHorizontal],
    ],
  },
  'Transporter ID': {
    title: 'Transporter IDs',
    sub: 'Manage GST e-way bill transporter identifiers',
    actions: ['Add Transporter ID', 'Export CSV'],
    cards: [
      ['Raghav Express', '09AABCRGX2026', Truck],
      ['Status', 'Active', PackageCheck],
      ['Default Mode', 'Surface', Boxes],
    ],
  },
};

function CreateOrderClone() {
  const [kind, setKind] = useState<'B2C' | 'B2B'>('B2C');
  const [orderId, setOrderId] = useState('ORD-98689952');
  const [unit, setUnit] = useState<'CM' | 'INCH'>('CM');
  const [weight, setWeight] = useState(0);
  const [length, setLength] = useState(0);
  const [breadth, setBreadth] = useState(0);
  const [height, setHeight] = useState(0);
  const [invoiceValue, setInvoiceValue] = useState(0);
  const [invoices, setInvoices] = useState([0]);
  const [boxes, setBoxes] = useState([0]);
  const [booking, setBooking] = useState(false);
  const divisor = unit === 'CM' ? 4500 : 139;
  const volumetric = (length * breadth * height) / divisor;
  const chargeable = Math.max(weight, volumetric, kind === 'B2C' ? 0.5 : 0);
  const dimension = unit === 'CM' ? 'cm' : 'inch';
  const regenerate = () =>
    setOrderId(`ORD-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const bookShipment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const paymentMode = String(form.get('paymentMode') || 'Prepaid');
    const totalAmount = Number(form.get('invoiceValue') || 0);
    if (kind === 'B2B') {
      const toCentimeters = (value: number) =>
        unit === 'CM' ? value : value * 2.54;
      const invoiceNumbers = form.getAll('invoiceNumber');
      const invoiceValues = form.getAll('invoiceValue');
      const ewaybills = form.getAll('ewaybill');
      const invoiceFiles = form
        .getAll('invoiceFile')
        .filter(
          (value): value is File => value instanceof File && value.size > 0,
        );
      const payload = new FormData();
      payload.set(
        'pickup_location_name',
        String(form.get('pickupLocationName') || ''),
      );
      payload.set('payment_mode', paymentMode.toLowerCase());
      if (paymentMode === 'COD') payload.set('cod_amount', String(totalAmount));
      payload.set('weight', String(Math.round(weight * boxes.length * 1000)));
      payload.set(
        'dropoff_location',
        JSON.stringify({
          consignee_name: String(
            form.get('companyName') || form.get('recipientName') || '',
          ),
          address: String(form.get('recipientAddress') || ''),
          city: String(form.get('recipientCity') || ''),
          state: String(form.get('recipientState') || ''),
          zip: String(form.get('recipientPin') || ''),
          phone: String(form.get('recipientPhone') || ''),
          email: String(form.get('recipientEmail') || ''),
          consignee_gst: String(form.get('recipientGst') || ''),
        }),
      );
      payload.set(
        'invoices',
        JSON.stringify(
          invoiceNumbers.map((number, index) => ({
            inv_num: String(number),
            inv_amt: Number(invoiceValues[index] || 0),
            ewaybill: String(ewaybills[index] || ''),
          })),
        ),
      );
      payload.set(
        'shipment_details',
        JSON.stringify([
          {
            order_id: orderId,
            box_count: boxes.length,
            description: String(form.get('productName') || 'Goods'),
            weight: Math.round(weight * boxes.length * 1000),
            waybills: [],
            master: false,
          },
        ]),
      );
      payload.set(
        'dimensions',
        JSON.stringify([
          {
            length_cm: toCentimeters(length),
            width_cm: toCentimeters(breadth),
            height_cm: toCentimeters(height),
            box_count: boxes.length,
          },
        ]),
      );
      payload.set('rov_insurance', 'false');
      payload.set('freight_mode', 'fop');
      payload.set('fm_pickup', 'true');
      invoiceFiles.forEach((file) => payload.append('doc_file', file));
      if (invoiceFiles.length)
        payload.set(
          'doc_data',
          JSON.stringify(
            invoiceNumbers.map((number) => ({
              doc_type: 'INVOICE_COPY',
              doc_meta: { invoice_num: [String(number)] },
            })),
          ),
        );
      setBooking(true);
      try {
        const response = await fetch('/api/delhivery/b2b/shipments', {
          method: 'POST',
          body: payload,
        });
        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          data?: Record<string, unknown>;
        };
        if (!response.ok || !result.success)
          throw new Error(result.message || 'B2B shipment creation failed');
        const jobId = String(
          result.data?.job_id ||
            result.data?.request_id ||
            result.data?.jobId ||
            '',
        );
        window.alert(
          jobId
            ? `B2B shipment submitted. Job ID: ${jobId}`
            : 'B2B shipment submitted successfully.',
        );
        regenerate();
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : 'B2B shipment creation failed',
        );
      } finally {
        setBooking(false);
      }
      return;
    }
    const responsePayload = {
      shipments: [
        {
          order: orderId,
          name: String(form.get('recipientName') || ''),
          phone: String(form.get('recipientPhone') || ''),
          add: String(form.get('recipientAddress') || ''),
          pin: String(form.get('recipientPin') || ''),
          payment_mode: paymentMode,
          cod_amount: paymentMode === 'COD' ? totalAmount : undefined,
          total_amount: totalAmount,
          products_desc: String(form.get('productName') || ''),
          seller_inv: String(form.get('invoiceNumber') || ''),
          hsn_code: String(form.get('hsnCode') || ''),
          ewbn: String(form.get('ewaybill') || ''),
          weight: Math.round(weight * 1000),
          shipment_length: unit === 'CM' ? length : length * 2.54,
          shipment_width: unit === 'CM' ? breadth : breadth * 2.54,
          shipment_height: unit === 'CM' ? height : height * 2.54,
          shipping_mode: 'Surface',
          country: 'India',
        },
      ],
    };
    setBooking(true);
    try {
      const response = await fetch('/api/delhivery/b2c/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responsePayload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: Record<string, unknown>;
      };
      if (!response.ok || !result.success)
        throw new Error(result.message || 'Shipment creation failed');
      const packages = Array.isArray(result.data?.packages)
        ? (result.data.packages as Record<string, unknown>[])
        : [];
      const waybill = String(
        packages[0]?.waybill || packages[0]?.wbn || result.data?.waybill || '',
      );
      window.alert(
        waybill
          ? `Shipment created successfully. AWB: ${waybill}`
          : 'Shipment created successfully.',
      );
      regenerate();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Shipment creation failed',
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <section className="fastship-create">
      <header className="fastship-create-head">
        <div>
          <small>PANEL</small>
          <h1>Create New Order</h1>
        </div>
        <div
          className="fastship-order-tabs"
          role="tablist"
          aria-label="Order type tabs"
        >
          {(['B2C', 'B2B'] as const).map((type) => (
            <button
              type="button"
              role="tab"
              aria-selected={kind === type}
              className={kind === type ? 'active' : ''}
              onClick={() => setKind(type)}
              key={type}
            >
              {type} Order
            </button>
          ))}
        </div>
      </header>
      <div className="fastship-step-intro">
        <div>
          <b>{kind} Order Creation</b>
          <span>Step 1 of 3</span>
          <p>
            Build shipments faster with a guided flow. Only the active step is
            editable.
          </p>
        </div>
        <ol>
          <li className="active">
            <i>1</i>
            <span>
              Order &amp; Delivery
              <small>Customer, products and package details</small>
            </span>
          </li>
          <li>
            <i>2</i>
            <span>
              Pickup &amp; Review
              <small>Pickup warehouse and booking summary</small>
            </span>
          </li>
          <li>
            <i>3</i>
            <span>
              Courier Selection<small>Choose courier rate only</small>
            </span>
          </li>
        </ol>
      </div>
      <form onSubmit={bookShipment}>
        <section className="fastship-form-card">
          <h2>
            <ClipboardList />
            Order Details <ChevronDown />
          </h2>
          <div className="fastship-card-body three-col">
            <label>
              ORDER ID *
              <div className="input-action">
                <input value={orderId} readOnly />
                <button type="button" onClick={regenerate}>
                  <RefreshCw />
                </button>
              </div>
              <small className="valid">Order ID is available.</small>
            </label>
            <label>
              ORDER DATE
              <input type="date" defaultValue="2026-09-16" />
            </label>
            <label>
              ORDER TYPE *
              <select name="paymentMode" defaultValue="Prepaid">
                <option>Prepaid</option>
                <option>COD</option>
              </select>
              <small>Select type</small>
            </label>
            {kind === 'B2B' && (
              <label>
                PICKUP WAREHOUSE NAME *
                <input
                  name="pickupLocationName"
                  required
                  placeholder="Exact Delhivery registered name"
                />
                <small>Case and space sensitive</small>
              </label>
            )}
          </div>
        </section>

        <section className="fastship-form-card">
          <h2>
            <Building2 />
            Recipient Details <ChevronDown />
          </h2>
          <div className="fastship-card-body">
            <div className="saved-address">
              <select defaultValue="">
                <option value="" disabled>
                  Saved Delivery Address
                </option>
              </select>
              <button type="button">Save Address</button>
            </div>
            <div className="fastship-grid">
              {kind === 'B2B' && (
                <label>
                  COMPANY NAME *<input name="companyName" required />
                </label>
              )}
              <label>
                NAME *<input name="recipientName" required />
              </label>
              <label>
                PHONE *<input name="recipientPhone" required type="tel" />
              </label>
              <label className="full">
                ADDRESS *<textarea name="recipientAddress" required />
              </label>
              <label>
                PINCODE *
                <input
                  name="recipientPin"
                  required
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </label>
              <label>
                CITY *<input name="recipientCity" required={kind === 'B2B'} />
              </label>
              <label>
                STATE *<input name="recipientState" required={kind === 'B2B'} />
              </label>
              {kind === 'B2B' && (
                <label>
                  NAME (OPTIONAL)
                  <input />
                </label>
              )}
              <label>
                EMAIL
                <input name="recipientEmail" type="email" />
              </label>
              {kind === 'B2B' && (
                <label>
                  GSTIN (OPTIONAL)
                  <input name="recipientGst" maxLength={15} />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="fastship-form-card">
          <h2>
            <FileText />
            Invoices <ChevronDown />
          </h2>
          <div className="fastship-card-body">
            {invoices.map((invoice, index) => (
              <div className="fastship-invoice" key={invoice}>
                <h3>Invoice {index + 1}</h3>
                <div className="fastship-grid three-col">
                  <label>
                    INVOICE NUMBER *<input name="invoiceNumber" required />
                    <small>Enter customer invoice number</small>
                  </label>
                  <label>
                    INVOICE DATE *
                    <input required type="date" defaultValue="2026-09-16" />
                  </label>
                  <label>
                    INVOICE VALUE (₹) *
                    <input
                      name="invoiceValue"
                      required
                      type="number"
                      min="0"
                      value={index === 0 ? invoiceValue : undefined}
                      onChange={
                        index === 0
                          ? (e) => setInvoiceValue(Number(e.target.value))
                          : undefined
                      }
                      defaultValue={index === 0 ? undefined : 0}
                    />
                  </label>
                  <label>
                    PRODUCT NAME *
                    <input
                      name="productName"
                      required
                      placeholder="e.g. Cotton T-shirt"
                    />
                  </label>
                  <label>
                    SKU (OPTIONAL)
                    <input />
                  </label>
                  <label>
                    HSN CODE (OPTIONAL)
                    <input name="hsnCode" />
                  </label>
                  <label>
                    EBN NUMBER (OPTIONAL)
                    <input name="ewaybill" />
                    <small>Required only when invoice value &gt; ₹50,000</small>
                  </label>
                  <label>
                    EBN EXPIRY (OPTIONAL)
                    <input type="date" />
                    <small>Required when EBN Number is provided</small>
                  </label>
                  {kind === 'B2B' && (
                    <label>
                      INVOICE FILE (OPTIONAL)
                      <input
                        name="invoiceFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.bmp"
                      />
                    </label>
                  )}
                </div>
                {kind === 'B2B' && invoices.length > 1 && (
                  <button
                    className="remove-clone-row"
                    type="button"
                    onClick={() =>
                      setInvoices((rows) => rows.filter((x) => x !== invoice))
                    }
                  >
                    <X /> Remove invoice
                  </button>
                )}
              </div>
            ))}
            <div className="invoice-total">
              <b>Invoice Grand Total</b>
              <strong>₹{invoiceValue.toFixed(2)}</strong>
            </div>
            {kind === 'B2B' && (
              <button
                className="clone-outline-button"
                type="button"
                onClick={() => setInvoices((rows) => [...rows, Date.now()])}
              >
                + Add Invoice
              </button>
            )}
          </div>
        </section>

        {kind === 'B2C' ? (
          <section className="fastship-form-card">
            <h2>
              <Boxes />
              Package Details <ChevronDown />
            </h2>
            <div className="fastship-card-body">
              <div className="minimum-note">
                ⓘ &nbsp; Note: The minimum chargeable weight is 0.50 Kg
              </div>
              <div className="dimension-toggle">
                <span>UNIT</span>
                <button
                  type="button"
                  className={unit === 'CM' ? 'active' : ''}
                  onClick={() => setUnit('CM')}
                >
                  CM
                </button>
                <button
                  type="button"
                  className={unit === 'INCH' ? 'active' : ''}
                  onClick={() => setUnit('INCH')}
                >
                  INCH
                </button>
              </div>
              <div className="fastship-grid four-col">
                <label>
                  WEIGHT (KG) *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </label>
                <label>
                  LENGTH ({dimension.toUpperCase()}) *
                  <input
                    required
                    type="number"
                    min="0"
                    onChange={(e) => setLength(Number(e.target.value))}
                  />
                </label>
                <label>
                  BREADTH ({dimension.toUpperCase()}) *
                  <input
                    required
                    type="number"
                    min="0"
                    onChange={(e) => setBreadth(Number(e.target.value))}
                  />
                </label>
                <label>
                  HEIGHT ({dimension.toUpperCase()}) *
                  <input
                    required
                    type="number"
                    min="0"
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="weight-panel">
                <h3>👜 Package Weight Summary</h3>
                <p>
                  Chargeable weight is calculated as max of actual, volumetric,
                  or minimum weight (0.5 kg)
                </p>
                <div>
                  <article>
                    <small>ACTUAL WEIGHT</small>
                    <b>
                      {weight.toFixed(2)} <em>kg</em>
                    </b>
                    <span>{Math.round(weight * 1000)} grams</span>
                  </article>
                  <article>
                    <small>VOLUMETRIC WEIGHT</small>
                    <b>
                      {volumetric.toFixed(2)} <em>kg</em>
                    </b>
                    <span>L × B × H / {divisor}</span>
                  </article>
                  <article className="active">
                    <small>CHARGEABLE WEIGHT</small>
                    <b>
                      {chargeable.toFixed(2)} <em>kg</em>
                    </b>
                    <span>
                      {chargeable === 0.5
                        ? 'Minimum weight applied'
                        : 'Maximum weight applied'}
                    </span>
                  </article>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="fastship-form-card">
            <h2>
              <Boxes />
              Package Boxes <ChevronDown />
            </h2>
            <div className="fastship-card-body">
              <div className="package-title">
                <div>
                  <h3>Package Boxes</h3>
                  <p>
                    Enter the dimensions and actual weight of each physical box.
                  </p>
                </div>
                <div className="dimension-toggle">
                  <span>UNIT</span>
                  <button
                    type="button"
                    className={unit === 'CM' ? 'active' : ''}
                    onClick={() => setUnit('CM')}
                  >
                    CM
                  </button>
                  <button
                    type="button"
                    className={unit === 'INCH' ? 'active' : ''}
                    onClick={() => setUnit('INCH')}
                  >
                    INCH
                  </button>
                </div>
              </div>
              {boxes.map((box, index) => (
                <div className="box-entry" key={box}>
                  <label>
                    NO. OF BOXES *
                    <input type="number" min="1" defaultValue="1" />
                  </label>
                  <div className="box-stat">
                    <small>Total Actual Weight</small>
                    <b>{weight.toFixed(2)} kg</b>
                  </div>
                  <div className="box-stat">
                    <small>Volumetric Weight</small>
                    <b>{volumetric.toFixed(2)} kg</b>
                  </div>
                  <div className="box-stat">
                    <small>Chargeable Weight</small>
                    <b>{chargeable.toFixed(2)} kg</b>
                  </div>
                  <label>
                    PER BOX WEIGHT (KG) *
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      onChange={(e) => setWeight(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    LENGTH ({dimension.toUpperCase()}) *
                    <input
                      required
                      type="number"
                      min="0.01"
                      onChange={(e) => setLength(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    BREADTH ({dimension.toUpperCase()}) *
                    <input
                      required
                      type="number"
                      min="0.01"
                      onChange={(e) => setBreadth(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    HEIGHT ({dimension.toUpperCase()}) *
                    <input
                      required
                      type="number"
                      min="0.01"
                      onChange={(e) => setHeight(Number(e.target.value))}
                    />
                  </label>
                  {boxes.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBoxes((rows) => rows.filter((x) => x !== box))
                      }
                    >
                      <X />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="clone-outline-button"
                type="button"
                onClick={() => setBoxes((rows) => [...rows, Date.now()])}
              >
                + Add Box
              </button>
              <div className="weight-formula">
                <b>Actual vs Volumetric</b>
                <span>
                  max(Actual, Volumetric) · Volumetric = (L×B×H) / {divisor}
                </span>
                <strong>{chargeable.toFixed(2)} kg</strong>
              </div>
            </div>
          </section>
        )}

        {kind === 'B2C' && (
          <section className="fastship-form-card">
            <h2>
              <IndianRupee />
              Optional Charges &amp; Summary <ChevronDown />
            </h2>
            <div className="fastship-card-body fastship-grid four-col">
              <label>
                SHIPPING CHARGE (CUSTOMER ₹)
                <input type="number" min="0" />
                <small>What the customer pays for shipping</small>
              </label>
              <label>
                TRANSACTION FEE (OPTIONAL ₹)
                <input type="number" min="0" />
              </label>
              <label>
                DISCOUNT (OPTIONAL ₹)
                <input type="number" min="0" />
              </label>
              <label>
                PREPAID AMOUNT (OPTIONAL ₹)
                <input type="number" min="0" />
              </label>
            </div>
          </section>
        )}
        <div className="fastship-next">
          <span>Order &amp; Delivery</span>
          <button type="submit" disabled={booking}>
            {booking
              ? 'Booking...'
              : kind === 'B2B'
                ? 'Create B2B Shipment'
                : 'Create Shipment'}
          </button>
        </div>
      </form>
    </section>
  );
}

export function ClientModule({
  name,
  go,
  signedInEmail = 'raghavexpresspali@gmail.com',
  profile = {},
}: {
  name: string;
  go: (n: string) => void;
  signedInEmail?: string;
  profile?: Record<string, string>;
}) {
  const [action, setAction] = useState('');
  const [connected, setConnected] = useState<string[]>([]);
  const [rateMode, setRateMode] = useState<'B2C' | 'B2B'>('B2C');
  const [rateResult, setRateResult] = useState<{
    actual: number;
    volumetric: number;
    chargeable: number;
    cod: number;
    boxes: number;
  } | null>(null);
  const [orderKind, setOrderKind] = useState<'B2C' | 'B2B'>('B2C');
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [b2cParcels, setB2cParcels] = useState([0]);
  const [b2bProducts, setB2bProducts] = useState([0]);
  const [b2bBoxes, setB2bBoxes] = useState([0]);
  const [b2bInvoices, setB2bInvoices] = useState([0]);
  const [settingSaved, setSettingSaved] = useState('');
  const [warehouses, setWarehouses] = useState([
    {
      name: 'Raghav Express — Pali',
      address: 'Industrial Area, Pali, Rajasthan 306401',
      contact: '+91 96604 23241',
    },
    {
      name: 'Jodhpur Dispatch Hub',
      address: 'Basni, Jodhpur, Rajasthan 342005',
      contact: '+91 96604 23241',
    },
  ]);
  const cfg = moduleConfig[name] || {
    title: name,
    sub: `Manage ${name.toLowerCase()} from one focused workspace`,
    actions: ['Add New', 'Export CSV'],
    cards: [
      [`${name} Overview`, 'Workspace ready', ClipboardList],
      ['Pending Actions', '3 items', AlertTriangle],
      ['Last Updated', 'Today, 09:42 AM', RefreshCw],
    ] as [string, string, typeof Boxes][],
  };
  if (name === 'Rate Calculator')
    return (
      <section className="tool-workspace">
        <ModuleHead cfg={cfg} onAction={setAction} />
        <div className="rate-mode-tabs">
          <button
            className={rateMode === 'B2C' ? 'active' : ''}
            onClick={() => {
              setRateMode('B2C');
              setRateResult(null);
            }}
          >
            <PackageCheck />
            B2C Parcel
          </button>
          <button
            className={rateMode === 'B2B' ? 'active' : ''}
            onClick={() => {
              setRateMode('B2B');
              setRateResult(null);
            }}
          >
            <Building2 />
            B2B Cargo
          </button>
        </div>
        <div className="tool-split rate-calculator-grid">
          <form
            className="module-form rate-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const actual = Number(data.get('weight'));
              const length = Number(data.get('length') || 0);
              const breadth = Number(data.get('breadth') || 0);
              const height = Number(data.get('height') || 0);
              const boxes = Number(data.get('boxes') || 1);
              const volumetric =
                rateMode === 'B2C'
                  ? (length * breadth * height) / 5000
                  : (length * breadth * height * boxes) / 4500;
              const chargeable = Math.max(
                actual,
                volumetric,
                rateMode === 'B2C' ? 0.5 : 10,
              );
              const amount = Number(data.get('amount') || 0);
              const cod =
                data.get('payment') === 'COD' ? Math.max(45, amount * 0.02) : 0;
              setRateResult({ actual, volumetric, chargeable, cod, boxes });
            }}
          >
            <div className="rate-form-title">
              <div>
                <span>{rateMode} RATE ESTIMATOR</span>
                <h2>Calculate Shipping Rate</h2>
              </div>
              <small>
                {rateMode === 'B2C'
                  ? 'Minimum chargeable weight: 0.5 kg'
                  : 'Minimum cargo weight: 10 kg'}
              </small>
            </div>
            <div className="form-pair">
              <label>
                Pickup PIN
                <input
                  name="pickup"
                  required
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  placeholder="342001"
                />
              </label>
              <label>
                Delivery PIN
                <input
                  name="delivery"
                  required
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  placeholder="302013"
                />
              </label>
              <label>
                {rateMode === 'B2C'
                  ? 'Actual Weight (kg)'
                  : 'Total Weight (kg)'}
                <input
                  name="weight"
                  required
                  type="number"
                  min={rateMode === 'B2C' ? 0.1 : 1}
                  step="0.01"
                  placeholder={rateMode === 'B2C' ? '0.50' : '25'}
                />
              </label>
              {rateMode === 'B2B' && (
                <>
                  <label>
                    Number of Boxes
                    <input
                      name="boxes"
                      required
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                    />
                  </label>
                  <label>
                    Average Weight per Box (kg)
                    <input
                      name="boxWeight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="e.g. 5"
                    />
                  </label>
                </>
              )}
              <label>
                {rateMode === 'B2B' ? 'Largest Box Length (cm)' : 'Length (cm)'}
                <input
                  name="length"
                  required
                  type="number"
                  min="1"
                  placeholder="20"
                />
              </label>
              <label>
                {rateMode === 'B2B'
                  ? 'Largest Box Breadth (cm)'
                  : 'Breadth (cm)'}
                <input
                  name="breadth"
                  required
                  type="number"
                  min="1"
                  placeholder="15"
                />
              </label>
              <label>
                {rateMode === 'B2B' ? 'Largest Box Height (cm)' : 'Height (cm)'}
                <input
                  name="height"
                  required
                  type="number"
                  min="1"
                  placeholder="10"
                />
              </label>
              <label>
                Payment Mode
                <select name="payment">
                  <option>Prepaid</option>
                  <option>COD</option>
                </select>
              </label>
              <label>
                Order Value (₹)
                <input
                  name="amount"
                  required
                  type="number"
                  min="1"
                  placeholder="1000"
                />
              </label>
              <label>
                Movement Type
                <select name="movement">
                  <option>Forward</option>
                  <option>Return</option>
                </select>
              </label>
              {rateMode === 'B2B' && (
                <>
                  <label>
                    Cargo Service
                    <select name="cargoService">
                      <option>PTL / LTL</option>
                      <option>FTL</option>
                      <option>Air Cargo</option>
                    </select>
                  </label>
                  <label>
                    Goods Type
                    <select name="goodsType">
                      <option>General Cargo</option>
                      <option>Fragile Goods</option>
                      <option>Commercial Documents</option>
                      <option>Electronics</option>
                    </select>
                  </label>
                  <label>
                    GST Registered
                    <select name="gst">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </label>
                  <label>
                    E-Way Bill Number
                    <input name="eway" placeholder="If applicable" />
                  </label>
                  <label>
                    Insurance
                    <select name="insurance">
                      <option>Not required</option>
                      <option>Insure cargo</option>
                    </select>
                  </label>
                </>
              )}
            </div>
            <button type="submit">Calculate & Compare Rates</button>
          </form>
          <aside className="rate-result">
            <Calculator />
            {!rateResult ? (
              <>
                <h2>Your estimate</h2>
                <p>
                  Enter shipment details to compare available courier rates.
                </p>
              </>
            ) : (
              <>
                <h2>{rateMode} Rate Results</h2>
                {rateMode === 'B2B' && (
                  <div className="b2b-box-summary">
                    <Boxes />
                    <span>
                      <b>{rateResult.boxes} cargo boxes</b>
                      <small>
                        Total actual and combined volumetric weight are
                        compared.
                      </small>
                    </span>
                  </div>
                )}
                <div className="weight-summary">
                  <span>
                    <small>Actual</small>
                    <b>{rateResult.actual.toFixed(2)} kg</b>
                  </span>
                  <span>
                    <small>Volumetric</small>
                    <b>{rateResult.volumetric.toFixed(2)} kg</b>
                  </span>
                  <span>
                    <small>Chargeable</small>
                    <b>{rateResult.chargeable.toFixed(2)} kg</b>
                  </span>
                </div>
                <div className="courier-rates">
                  {(rateMode === 'B2C'
                    ? [
                        ['Raghav Surface', 52, 4],
                        ['Express Air', 78, 2],
                        ['Economy Parcel', 44, 6],
                      ]
                    : [
                        ['Raghav Cargo PTL', 24, 5],
                        ['Express Cargo', 38, 3],
                        ['Business Surface', 29, 4],
                      ]
                  ).map(([courier, base, days], index) => {
                    const freight =
                      rateMode === 'B2C'
                        ? Number(base) +
                          Math.max(
                            0,
                            Math.ceil((rateResult.chargeable - 0.5) / 0.5),
                          ) *
                            18
                        : Number(base) * rateResult.chargeable;
                    const total = Math.round(freight + rateResult.cod);
                    return (
                      <article key={courier as string}>
                        <div>
                          <b>{courier as string}</b>
                          <small>
                            {days as number}–{Number(days) + 1} working days ·{' '}
                            {index === 1 ? 'Air' : 'Surface'}
                          </small>
                        </div>
                        <span>
                          <small>
                            Freight ₹{Math.round(freight)}
                            {rateResult.cod
                              ? ` + COD ₹${Math.round(rateResult.cod)}`
                              : ''}
                          </small>
                          <strong>₹{total}</strong>
                        </span>
                        <button onClick={() => go('Create Order')}>Book</button>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </aside>
        </div>
      </section>
    );
  if (name === 'Order Tracking')
    return (
      <section className="tool-workspace">
        <ModuleHead
          cfg={{
            ...cfg,
            title: 'Track Shipment',
            sub: 'Follow a shipment using LRN or AWB',
          }}
          onAction={setAction}
        />
        <div className="tracking-module">
          <Search />
          <h2>Track your shipment</h2>
          <p>Enter a Raghav Express LRN or AWB number.</p>
          <div>
            <input placeholder="e.g. RGX-240812" />
            <button onClick={() => setAction('Shipment found: In transit')}>
              Track AWB
            </button>
          </div>
          {action && (
            <span>
              <Truck />
              {action}
            </span>
          )}
        </div>
      </section>
    );
  if (name === 'Create Order') return <CreateOrderClone />;
  /*return (
      <section className="tool-workspace">
        <ModuleHead
          cfg={{
            ...cfg,
            title: "Create Order",
            sub: "Book a new B2C or B2B shipment",
          }}
          onAction={setAction}
        />
        <form
          className="create-order-form advanced-order-form"
          onSubmit={(e) => {
            e.preventDefault();
            const orderId = `RGX-${Date.now().toString().slice(-8)}-${Math.floor(10 + Math.random() * 90)}`;
            setGeneratedOrderId(orderId);
            setAction(`${orderKind} order ${orderId} created successfully`);
          }}
        >
          <div className="order-kind-switch" aria-label="Shipment type">
            <button
              type="button"
              className={orderKind === "B2C" ? "active" : ""}
              onClick={() => {
                setOrderKind("B2C");
                setGeneratedOrderId("");
                setAction("");
              }}
            >
              <PackageCheck />
              <span>
                <b>B2C Parcel</b>
                <small>Customer and e-commerce delivery</small>
              </span>
            </button>
            <button
              type="button"
              className={orderKind === "B2B" ? "active" : ""}
              onClick={() => {
                setOrderKind("B2B");
                setGeneratedOrderId("");
                setAction("");
              }}
            >
              <Building2 />
              <span>
                <b>B2B Cargo</b>
                <small>Business, cartons and bulk freight</small>
              </span>
            </button>
          </div>
          <fieldset>
            <legend>
              <span>01</span> Order information
            </legend>
            <div className="form-pair">
              <label>
                Order ID (Auto-generated)
                <input
                  value={generatedOrderId}
                  readOnly
                  placeholder="Generated automatically on order creation"
                />
              </label>
              <label>
                Order Date
                <input required type="date" defaultValue="2026-09-12" />
              </label>
              <label>
                Payment Mode
                <select>
                  <option>Prepaid</option>
                  <option>COD</option>
                </select>
              </label>
              <label>
                Pickup Date
                <input required type="date" defaultValue="2026-09-12" />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <span>02</span> Pickup & return address
            </legend>
            <div className="form-pair">
              <label>
                Pickup Warehouse
                <select required defaultValue="">
                  <option value="" disabled>
                    Select warehouse
                  </option>
                  <option>Raghav Express — Pali</option>
                  <option>Jodhpur Dispatch Hub</option>
                </select>
              </label>
              <label>
                Pickup Time
                <select>
                  <option>10:00 AM – 01:00 PM</option>
                  <option>02:00 PM – 06:00 PM</option>
                </select>
              </label>
              <label>
                Pickup Contact Name
                <input required defaultValue="Raghav Express" />
              </label>
              <label>
                Pickup Contact Number
                <input required type="tel" defaultValue="+91 96604 23241" />
              </label>
              <label className="order-wide">
                Pickup Address
                <input required placeholder="Complete pickup address" />
              </label>
              <label>
                Pickup PIN
                <input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="306401"
                />
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Return address same as
                pickup
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <span>03</span>{" "}
              {orderKind === "B2C"
                ? "Customer delivery details"
                : "Consignee business details"}
            </legend>
            <div className="form-pair">
              {orderKind === "B2B" && (
                <label>
                  Company / Consignee Name
                  <input required placeholder="Registered business name" />
                </label>
              )}
              <label>
                {orderKind === "B2C" ? "Customer Name" : "Contact Person"}
                <input required placeholder="Receiver name" />
              </label>
              <label>
                Mobile Number
                <input
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                />
              </label>
              <label>
                Email Address
                <input type="email" placeholder="receiver@company.com" />
              </label>
              {orderKind === "B2B" && (
                <label>
                  Consignee GSTIN
                  <input
                    required
                    pattern="[0-9A-Z]{15}"
                    maxLength={15}
                    placeholder="15-digit GSTIN"
                  />
                </label>
              )}
              <label className="order-wide">
                Delivery Address
                <input
                  required
                  placeholder="House/building, street and locality"
                />
              </label>
              <label>
                PIN Code
                <input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Delivery PIN"
                />
              </label>
              <label>
                City
                <input required placeholder="City" />
              </label>
              <label>
                State
                <input required placeholder="State" />
              </label>
            </div>
          </fieldset>
          {orderKind === "B2C" ? (
            <fieldset>
              <legend>
                <span>04</span> Product & parcel details
              </legend>
              <div className="repeat-head">
                <p>Add each product or parcel separately with its own dimensions.</p>
                <button
                  type="button"
                  onClick={() =>
                    setB2cParcels((rows) => [...rows, Date.now()])
                  }
                >
                  <Plus />
                  Add Product / Parcel
                </button>
              </div>
              <div className="repeat-list">
                {b2cParcels.map((id, index) => (
                  <section className="repeat-row b2c-parcel-row" key={id}>
                    <b>Product / Parcel {index + 1}</b>
                    <label>
                      Product Name
                      <input required placeholder="Product description" />
                    </label>
                    <label>
                      SKU / HSN Code
                      <input placeholder="SKU or HSN" />
                    </label>
                    <label>
                      Quantity
                      <input required type="number" min="1" defaultValue="1" />
                    </label>
                    <label>
                      Unit Price (₹)
                      <input required type="number" min="1" placeholder="Invoice unit value" />
                    </label>
                    <label>
                      Actual Weight (kg)
                      <input required type="number" min="0.1" step="0.01" placeholder="0.50" />
                    </label>
                    <label>
                      Length (cm)
                      <input required type="number" min="1" step="0.1" placeholder="Length" />
                    </label>
                    <label>
                      Breadth (cm)
                      <input required type="number" min="1" step="0.1" placeholder="Breadth" />
                    </label>
                    <label>
                      Height (cm)
                      <input required type="number" min="1" step="0.1" placeholder="Height" />
                    </label>
                    <label>
                      Package Type
                      <select>
                        <option>Box</option>
                        <option>Flyer</option>
                        <option>Document</option>
                        <option>Tube</option>
                      </select>
                    </label>
                    <label>
                      Shipping Mode
                      <select>
                        <option>Surface</option>
                        <option>Express Air</option>
                      </select>
                    </label>
                    {b2cParcels.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove product or parcel ${index + 1}`}
                        onClick={() =>
                          setB2cParcels((rows) => rows.filter((x) => x !== id))
                        }
                      >
                        <X />
                      </button>
                    )}
                  </section>
                ))}
              </div>
            </fieldset>
          ) : (
            <>
              <fieldset>
                <legend>
                  <span>04</span> Products in shipment
                </legend>
                <div className="repeat-head">
                  <p>Add every product included in this B2B consignment.</p>
                  <button
                    type="button"
                    onClick={() =>
                      setB2bProducts((rows) => [...rows, Date.now()])
                    }
                  >
                    <Plus />
                    Add Product
                  </button>
                </div>
                <div className="repeat-list">
                  {b2bProducts.map((id, index) => (
                    <section className="repeat-row product-row" key={id}>
                      <b>Product {index + 1}</b>
                      <label>
                        Product Name
                        <input required placeholder="Product / material name" />
                      </label>
                      <label>
                        HSN Code
                        <input required placeholder="HSN code" />
                      </label>
                      <label>
                        Quantity
                        <input
                          required
                          type="number"
                          min="1"
                          defaultValue="1"
                        />
                      </label>
                      <label>
                        Unit Price (₹)
                        <input
                          required
                          type="number"
                          min="1"
                          placeholder="0.00"
                        />
                      </label>
                      {b2bProducts.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove product ${index + 1}`}
                          onClick={() =>
                            setB2bProducts((rows) =>
                              rows.filter((x) => x !== id),
                            )
                          }
                        >
                          <X />
                        </button>
                      )}
                    </section>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  <span>05</span> Cargo boxes & dimensions
                </legend>
                <div className="repeat-head">
                  <p>
                    Enter each box type separately for accurate chargeable
                    weight.
                  </p>
                  <button
                    type="button"
                    onClick={() => setB2bBoxes((rows) => [...rows, Date.now()])}
                  >
                    <Plus />
                    Add Box Type
                  </button>
                </div>
                <div className="repeat-list">
                  {b2bBoxes.map((id, index) => (
                    <section className="repeat-row box-row" key={id}>
                      <b>Box {index + 1}</b>
                      <label>
                        No. of Boxes
                        <input
                          required
                          type="number"
                          min="1"
                          defaultValue="1"
                        />
                      </label>
                      <label>
                        Weight per Box (kg)
                        <input required type="number" min="0.1" step="0.1" />
                      </label>
                      <label>
                        Length (cm)
                        <input required type="number" min="1" />
                      </label>
                      <label>
                        Breadth (cm)
                        <input required type="number" min="1" />
                      </label>
                      <label>
                        Height (cm)
                        <input required type="number" min="1" />
                      </label>
                      {b2bBoxes.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove box ${index + 1}`}
                          onClick={() =>
                            setB2bBoxes((rows) => rows.filter((x) => x !== id))
                          }
                        >
                          <X />
                        </button>
                      )}
                    </section>
                  ))}
                </div>
                <div className="cargo-footer">
                  <label>
                    Total Actual Weight (kg)
                    <input required type="number" min="1" step="0.1" />
                  </label>
                  <label>
                    Shipping Mode
                    <select>
                      <option>PTL / LTL</option>
                      <option>FTL</option>
                      <option>Air Cargo</option>
                    </select>
                  </label>
                  <span>
                    <Boxes />
                    <b>
                      {b2bBoxes.length} box type{b2bBoxes.length > 1 ? "s" : ""}
                    </b>
                  </span>
                </div>
              </fieldset>
              <fieldset>
                <legend>
                  <span>06</span> Invoices & compliance
                </legend>
                <div className="repeat-head">
                  <p>Multiple invoices and e-way bills can be attached.</p>
                  <button
                    type="button"
                    onClick={() =>
                      setB2bInvoices((rows) => [...rows, Date.now()])
                    }
                  >
                    <Plus />
                    Add Invoice
                  </button>
                </div>
                <div className="repeat-list">
                  {b2bInvoices.map((id, index) => (
                    <section className="repeat-row invoice-row" key={id}>
                      <b>Invoice {index + 1}</b>
                      <label>
                        Invoice Number
                        <input required />
                      </label>
                      <label>
                        Invoice Date
                        <input required type="date" defaultValue="2026-09-12" />
                      </label>
                      <label>
                        Invoice Value (₹)
                        <input required type="number" min="1" />
                      </label>
                      <label>
                        E-Way Bill Number
                        <input placeholder="If applicable" />
                      </label>
                      <label>
                        E-Way Bill Expiry
                        <input type="date" />
                      </label>
                      <label>
                        Invoice File
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                      {b2bInvoices.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove invoice ${index + 1}`}
                          onClick={() =>
                            setB2bInvoices((rows) =>
                              rows.filter((x) => x !== id),
                            )
                          }
                        >
                          <X />
                        </button>
                      )}
                    </section>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <fieldset>
            <legend>
              <span>{orderKind === "B2C" ? "05" : "07"}</span> Courier & charges
            </legend>
            <div className="form-pair">
              <label>
                Courier Preference
                <select>
                  <option>Auto-select best courier</option>
                  <option>Raghav Surface</option>
                  <option>Express Air</option>
                  <option>Cargo Freight</option>
                </select>
              </label>
              <label>
                Declared Order Value (₹)
                <input required type="number" min="1" />
              </label>
              <label>
                Insurance
                <select>
                  <option>No insurance</option>
                  <option>Insure shipment</option>
                </select>
              </label>
              <label>
                Delivery Instructions
                <input placeholder="Optional handling instructions" />
              </label>
            </div>
          </fieldset>
          <div className="order-submit-bar">
            <div>
              <b>{orderKind} shipment</b>
              <small>Required fields will be validated before booking.</small>
            </div>
            <button type="submit">Save & Select Courier</button>
          </div>
          {action && (
            <span className="form-success">
              <PackageCheck />
              {action}
            </span>
          )}
        </form>
      </section>
    );*/
  if (name === 'Warehouse')
    return (
      <section className="module-workspace">
        <ModuleHead
          cfg={cfg}
          onAction={(value) =>
            setAction(
              value.startsWith('Add Warehouse') ? 'add-warehouse' : value,
            )
          }
        />
        <div className="warehouse-list">
          {warehouses.map((warehouse, index) => (
            <article
              className="clone-card warehouse-record"
              key={warehouse.name}
            >
              <span>
                <Warehouse />
              </span>
              <div>
                <small>
                  {index === 0 ? 'PRIMARY PICKUP' : 'PICKUP LOCATION'}
                </small>
                <h3>{warehouse.name}</h3>
                <p>{warehouse.address}</p>
                <em>{warehouse.contact}</em>
              </div>
              <b>Active</b>
              <button onClick={() => setAction(`Editing ${warehouse.name}`)}>
                Edit
              </button>
            </article>
          ))}
        </div>
        {action === 'add-warehouse' && (
          <div className="clone-modal" onClick={() => setAction('')}>
            <form
              className="order-detail warehouse-form"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                setWarehouses((items) => [
                  ...items,
                  {
                    name: String(data.get('name')),
                    address: `${data.get('address')}, ${data.get('city')}, ${data.get('state')} ${data.get('pin')}`,
                    contact: String(data.get('phone')),
                  },
                ]);
                setAction('Warehouse added successfully');
              }}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setAction('')}
              >
                <X />
              </button>
              <span className="detail-label">NEW PICKUP LOCATION</span>
              <h2>Add Warehouse</h2>
              <p>
                Enter the address used for courier pickup and shipment returns.
              </p>
              <div className="form-pair">
                <label>
                  Warehouse Name
                  <input
                    name="name"
                    required
                    placeholder="e.g. Jaipur Fulfilment Hub"
                  />
                </label>
                <label>
                  Contact Person
                  <input
                    name="person"
                    required
                    placeholder="Pickup contact name"
                  />
                </label>
                <label>
                  Mobile Number
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                  />
                </label>
                <label>
                  Email Address
                  <input
                    name="email"
                    type="email"
                    placeholder="warehouse@company.com"
                  />
                </label>
                <label className="order-wide">
                  Complete Address
                  <input
                    name="address"
                    required
                    placeholder="Building, street and locality"
                  />
                </label>
                <label>
                  PIN Code
                  <input
                    name="pin"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="6-digit PIN"
                  />
                </label>
                <label>
                  City
                  <input name="city" required placeholder="City" />
                </label>
                <label>
                  State
                  <input name="state" required placeholder="State" />
                </label>
                <label>
                  Pickup Time
                  <select name="time">
                    <option>10:00 AM – 01:00 PM</option>
                    <option>02:00 PM – 06:00 PM</option>
                  </select>
                </label>
                <label>
                  Location Type
                  <select name="type">
                    <option>Warehouse</option>
                    <option>Office</option>
                    <option>Shop</option>
                  </select>
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Use as return address
                </label>
              </div>
              <div className="warehouse-form-actions">
                <button type="button" onClick={() => setAction('')}>
                  Cancel
                </button>
                <button type="submit">Save Warehouse</button>
              </div>
            </form>
          </div>
        )}
        {action && action !== 'add-warehouse' && (
          <div className="module-notice">
            <PackageCheck />
            {action}
            <button onClick={() => setAction('')}>
              <X />
            </button>
          </div>
        )}
      </section>
    );
  if (name === 'Settings') {
    const groups = [
      [
        'Account Control',
        'Identity',
        [
          ['Company Details', 'Business profile and brand identity', Building2],
          ['Change Password', 'Update login credentials securely', RefreshCw],
          ['KYC Details', 'Verification status and documents', ClipboardList],
          ['Bank Accounts', 'Payout and settlement accounts', WalletCards],
          ['Manage Users', 'Team access and permissions', Building2],
        ],
      ],
      [
        'Shipping Operations',
        'Execution',
        [
          ['Pickup Addresses', 'Add and manage pickup locations', Warehouse],
          ['Invoice Preferences', 'Invoice branding and output', FileText],
          ['Billing Preferences', 'Billing cycles and automation', IndianRupee],
          ['Label Settings', 'Shipping label fields and format', PackageCheck],
        ],
      ],
      [
        'Integrations And Routing',
        'Connectivity',
        [
          ['Connected Channels', 'Linked sales channels', Zap],
          ['Courier Priority', 'Preference rules by speed or cost', Truck],
          ['API Integration', 'API keys and webhooks', SlidersHorizontal],
        ],
      ],
    ] as const;
    return (
      <section className="settings-workspace">
        <header className="settings-hero">
          <span>CONTROL CENTER</span>
          <h1>Settings</h1>
          <p>
            Manage account controls, shipping configuration, payout logic and
            integrations.
          </p>
          <div>
            <b>
              3<small>SETTING DOMAINS</small>
            </b>
            <b>
              12<small>CONFIG MODULES</small>
            </b>
            <b>
              Account + Shipping + Integrations<small>OPS FOCUS</small>
            </b>
          </div>
        </header>
        {groups.map(([title, badge, items]) => (
          <section className="settings-domain" key={title}>
            <header>
              <div>
                <h2>{title}</h2>
                <span>{badge}</span>
                <p>
                  {title === 'Account Control'
                    ? 'Business profile, credentials, KYC, payout accounts and team permissions.'
                    : title === 'Shipping Operations'
                      ? 'Pickup network, billing logic, invoice output and shipping label configuration.'
                      : 'Sales channels, courier rules, API keys and webhook connectivity.'}
                </p>
              </div>
              <b>{items.length} modules</b>
            </header>
            <div>
              {items.map(([item, desc, I]) => (
                <button
                  key={item}
                  onClick={() =>
                    item === 'Pickup Addresses'
                      ? go('Warehouse')
                      : item === 'Connected Channels'
                        ? go('Channels')
                        : setAction(item)
                  }
                >
                  <span>
                    <I />
                  </span>
                  <p>
                    <b>{item}</b>
                    <small>{desc}</small>
                  </p>
                  <em>→</em>
                </button>
              ))}
            </div>
          </section>
        ))}
        {settingSaved && (
          <div className="module-notice">
            <PackageCheck />
            {settingSaved}
            <button onClick={() => setSettingSaved('')}>
              <X />
            </button>
          </div>
        )}
        {action && (
          <div className="clone-modal" onClick={() => setAction('')}>
            <form
              className="order-detail settings-dialog"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                if (action === 'Company Details') {
                  const updates = Object.fromEntries(
                    new FormData(e.currentTarget).entries(),
                  ) as Record<string, string>;
                  try {
                    const profiles = JSON.parse(
                      localStorage.getItem('raghav-user-profiles') || '{}',
                    ) as Record<string, Record<string, string>>;
                    localStorage.setItem(
                      'raghav-user-profiles',
                      JSON.stringify({
                        ...profiles,
                        [signedInEmail]: { ...profile, ...updates },
                      }),
                    );
                  } catch {}
                }
                setSettingSaved(`${action} updated successfully`);
                setAction('');
              }}
            >
              <button
                type="button"
                className="modal-close"
                onClick={() => setAction('')}
              >
                <X />
              </button>
              <span className="detail-label">ACCOUNT CONFIGURATION</span>
              <h2>{action}</h2>
              {action === 'Bank Accounts' && (
                <div className="saved-account-card">
                  <header>
                    <span>
                      <WalletCards />
                    </span>
                    <div>
                      <b>Primary Settlement Account</b>
                      <small>Verified for COD remittance</small>
                    </div>
                    <em>VERIFIED</em>
                  </header>
                  <div>
                    <p>
                      <small>ACCOUNT HOLDER</small>
                      <b>{profile.companyName || 'Raghav Express'}</b>
                    </p>
                    <p>
                      <small>BANK</small>
                      <b>HDFC Bank</b>
                    </p>
                    <p>
                      <small>ACCOUNT NUMBER</small>
                      <b>•••• •••• 4821</b>
                    </p>
                    <p>
                      <small>IFSC CODE</small>
                      <b>HDFC0001842</b>
                    </p>
                  </div>
                </div>
              )}
              {action === 'KYC Details' && (
                <div className="saved-account-card kyc-summary">
                  <header>
                    <span>
                      <PackageCheck />
                    </span>
                    <div>
                      <b>Business KYC</b>
                      <small>Identity and tax documents submitted</small>
                    </div>
                    <em>VERIFIED</em>
                  </header>
                  <div>
                    <p>
                      <small>PAN</small>
                      <b>AABCR••••F</b>
                    </p>
                    <p>
                      <small>GSTIN</small>
                      <b>08AABCR••••F1Z5</b>
                    </p>
                    <p>
                      <small>PAN DOCUMENT</small>
                      <b>Verified ✓</b>
                    </p>
                    <p>
                      <small>GST CERTIFICATE</small>
                      <b>Verified ✓</b>
                    </p>
                  </div>
                </div>
              )}
              {action === 'Company Details' && (
                <div className="saved-account-card company-summary">
                  <header>
                    <span>
                      <Building2 />
                    </span>
                    <div>
                      <b>Raghav Express</b>
                      <small>Business profile is 90% complete</small>
                    </div>
                    <em>ACTIVE</em>
                  </header>
                </div>
              )}
              {action === 'Manage Users' && (
                <div className="saved-account-card">
                  <header>
                    <span>
                      <Building2 />
                    </span>
                    <div>
                      <b>{profile.contactName || 'Account Owner'}</b>
                      <small>{signedInEmail} · Account owner</small>
                    </div>
                    <em>OWNER</em>
                  </header>
                </div>
              )}
              <div className="form-pair">
                {action === 'Company Details' ? (
                  <>
                    <label>
                      Legal Business Name
                      <input
                        name="companyName"
                        required
                        defaultValue={profile.companyName || 'Raghav Express'}
                      />
                    </label>
                    <label>
                      Brand Name
                      <input
                        name="brandName"
                        required
                        defaultValue={
                          profile.brandName ||
                          profile.companyName ||
                          'Raghav Express'
                        }
                      />
                    </label>
                    <label>
                      Business Email
                      <input
                        type="email"
                        required
                        defaultValue={signedInEmail}
                      />
                    </label>
                    <label>
                      Business Phone
                      <input
                        name="phone"
                        required
                        defaultValue={profile.phone || ''}
                        placeholder="Business phone"
                      />
                    </label>
                    <label>
                      GSTIN
                      <input
                        name="gst"
                        maxLength={15}
                        defaultValue={profile.gst || ''}
                        placeholder="15-digit GSTIN"
                      />
                    </label>
                    <label>
                      PAN Number
                      <input
                        name="pan"
                        maxLength={10}
                        defaultValue={profile.pan || ''}
                        placeholder="Business PAN"
                      />
                    </label>
                    <label className="order-wide">
                      Registered Address
                      <input
                        name="address"
                        required
                        defaultValue={profile.address || ''}
                        placeholder="Complete registered address"
                      />
                    </label>
                    <label>
                      Company Logo
                      <input type="file" accept="image/*" />
                    </label>
                  </>
                ) : action === 'Change Password' ? (
                  <>
                    <label>
                      Current Password
                      <input type="password" required />
                    </label>
                    <label>
                      New Password
                      <input type="password" required minLength={8} />
                    </label>
                    <label>
                      Confirm New Password
                      <input type="password" required minLength={8} />
                    </label>
                  </>
                ) : action === 'KYC Details' ? (
                  <>
                    <label>
                      KYC Type
                      <select>
                        <option>Business GST</option>
                        <option>Individual PAN</option>
                      </select>
                    </label>
                    <label>
                      PAN Number
                      <input
                        required
                        maxLength={10}
                        defaultValue="AABCR4821F"
                      />
                    </label>
                    <label>
                      GSTIN
                      <input maxLength={15} defaultValue="08AABCR4821F1Z5" />
                    </label>
                    <label>
                      Aadhaar Last 4 Digits
                      <input
                        inputMode="numeric"
                        maxLength={4}
                        defaultValue="2841"
                      />
                    </label>
                    <label>
                      Replace PAN Document
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                    <label>
                      Replace GST Certificate
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </>
                ) : action === 'Bank Accounts' ? (
                  <>
                    <label>
                      Account Holder
                      <input required defaultValue="Raghav Express" />
                    </label>
                    <label>
                      Account Number
                      <input required defaultValue="482100184271" />
                    </label>
                    <label>
                      IFSC Code
                      <input required defaultValue="HDFC0001842" />
                    </label>
                    <label>
                      Bank Name
                      <input required defaultValue="HDFC Bank" />
                    </label>
                    <label>
                      Account Type
                      <select>
                        <option>Current</option>
                        <option>Savings</option>
                      </select>
                    </label>
                    <label>
                      Cancelled Cheque
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </>
                ) : action === 'Manage Users' ? (
                  <>
                    <label>
                      User Name
                      <input required defaultValue="Raghav Sharma" />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        required
                        defaultValue={signedInEmail}
                      />
                    </label>
                    <label>
                      Role
                      <select>
                        <option>Manager</option>
                        <option>Operator</option>
                        <option>Viewer</option>
                      </select>
                    </label>
                    <label>
                      Permissions
                      <select>
                        <option>Orders + Tracking</option>
                        <option>Finance only</option>
                        <option>Full access</option>
                      </select>
                    </label>
                  </>
                ) : action === 'Invoice Preferences' ? (
                  <>
                    <label>
                      Invoice Prefix
                      <input defaultValue="RGX" />
                    </label>
                    <label>
                      Invoice Suffix
                      <input placeholder="Optional suffix" />
                    </label>
                    <label>
                      Template Type
                      <select>
                        <option>Professional</option>
                        <option>Compact</option>
                      </select>
                    </label>
                    <label>
                      Seller Name
                      <input defaultValue="Raghav Express" />
                    </label>
                    <label>
                      Brand Name
                      <input defaultValue="Raghav Express" />
                    </label>
                    <label>
                      GST Number
                      <input maxLength={15} />
                    </label>
                    <label>
                      PAN Number
                      <input maxLength={10} />
                    </label>
                    <label>
                      State Code
                      <input placeholder="RJ" />
                    </label>
                    <label className="order-wide">
                      Seller Address
                      <input />
                    </label>
                    <label>
                      Support Email
                      <input type="email" defaultValue={signedInEmail} />
                    </label>
                    <label>
                      Support Phone
                      <input defaultValue="+91 96604 23241" />
                    </label>
                    <label>
                      Upload Company Logo
                      <input type="file" accept="image/*" />
                    </label>
                    <label>
                      Upload Signature
                      <input type="file" accept="image/*" />
                    </label>
                  </>
                ) : action === 'Billing Preferences' ? (
                  <>
                    <label>
                      Invoice Frequency
                      <select>
                        <option>Weekly</option>
                        <option>Fortnightly</option>
                        <option>Monthly</option>
                      </select>
                    </label>
                    <label>
                      Billing Email
                      <input type="email" defaultValue={signedInEmail} />
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked /> Auto-generate
                      invoices
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked /> Email invoice
                      automatically
                    </label>
                  </>
                ) : action === 'Label Settings' ? (
                  <>
                    <label>
                      Printer Type
                      <select>
                        <option>Thermal Printer — 4×6 inch</option>
                        <option>InkJet Printer — A4</option>
                      </select>
                    </label>
                    <label>
                      Label Copies
                      <input type="number" min="1" defaultValue="1" />
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked /> Show order value
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked /> Show product name
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked /> Show customer
                      phone
                    </label>
                    <label>
                      <input type="checkbox" /> Hide seller address
                    </label>
                    <label>
                      Limit Item Name Characters
                      <input type="number" defaultValue="40" />
                    </label>
                    <label>
                      Limit Line Items
                      <input type="number" defaultValue="5" />
                    </label>
                  </>
                ) : action === 'Courier Priority' ? (
                  <>
                    <label>
                      Allocation Strategy
                      <select>
                        <option>Best rated courier</option>
                        <option>Lowest shipping cost</option>
                        <option>Fastest delivery</option>
                        <option>Custom priority</option>
                      </select>
                    </label>
                    <label>
                      Primary Courier
                      <select>
                        <option>Raghav Surface</option>
                        <option>Express Air</option>
                        <option>Cargo Freight</option>
                      </select>
                    </label>
                    <label>
                      Fallback Courier
                      <select>
                        <option>Express Air</option>
                        <option>Raghav Surface</option>
                        <option>Cargo Freight</option>
                      </select>
                    </label>
                    <label>
                      Apply To
                      <select>
                        <option>All orders</option>
                        <option>B2C only</option>
                        <option>B2B only</option>
                      </select>
                    </label>
                  </>
                ) : action === 'API Integration' ? (
                  <>
                    <label>
                      API Key
                      <input readOnly value="rgx_live_••••••••••••" />
                    </label>
                    <label>
                      Webhook URL
                      <input
                        type="url"
                        placeholder="https://example.com/webhook"
                      />
                    </label>
                    <label>
                      Webhook Secret
                      <input readOnly value="whsec_••••••••" />
                    </label>
                    <label>
                      Events
                      <select multiple defaultValue={['order.created']}>
                        <option value="order.created">Order created</option>
                        <option value="shipment.updated">
                          Shipment updated
                        </option>
                        <option value="ndr.created">NDR created</option>
                      </select>
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked /> API access
                      enabled
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Business / Display Name
                      <input defaultValue="Raghav Express" required />
                    </label>
                    <label>
                      Preference
                      <select>
                        <option>Enabled</option>
                        <option>Disabled</option>
                      </select>
                    </label>
                    <label className="order-wide">
                      Configuration Notes
                      <input placeholder="Optional notes" />
                    </label>
                  </>
                )}
              </div>
              <button className="save-button">Save {action}</button>
            </form>
          </div>
        )}
      </section>
    );
  }
  if (name === 'Support')
    return (
      <section className="tool-workspace">
        <ModuleHead cfg={cfg} onAction={setAction} />
        <form
          className="create-order-form"
          onSubmit={(e) => {
            e.preventDefault();
            setAction(
              name === 'Support'
                ? 'Support ticket RGX-TKT-104 created'
                : 'Account settings saved successfully',
            );
          }}
        >
          <h2>
            {name === 'Support'
              ? 'Create support ticket'
              : 'Company & shipping preferences'}
          </h2>
          <div className="form-pair">
            {name === 'Support' ? (
              <>
                <label>
                  Category
                  <select>
                    <option>Shipment issue</option>
                    <option>Billing</option>
                    <option>Integration</option>
                  </select>
                </label>
                <label>
                  LRN / AWB
                  <input placeholder="Optional shipment number" />
                </label>
                <label>
                  Subject
                  <input required placeholder="How can we help?" />
                </label>
                <label>
                  Message
                  <input required placeholder="Describe the issue" />
                </label>
              </>
            ) : (
              <>
                <label>
                  Company name
                  <input defaultValue="Raghav Express" />
                </label>
                <label>
                  Support email
                  <input type="email" defaultValue={signedInEmail} />
                </label>
                <label>
                  Contact number
                  <input defaultValue="+91 96604 23241" />
                </label>
                <label>
                  GSTIN
                  <input placeholder="Enter GSTIN" />
                </label>
                <label>
                  Default label size
                  <select>
                    <option>4 × 6 inch</option>
                    <option>A4</option>
                  </select>
                </label>
                <label>
                  Courier allocation
                  <select>
                    <option>Best rated</option>
                    <option>Lowest cost</option>
                    <option>Fastest</option>
                  </select>
                </label>
              </>
            )}
          </div>
          <button>
            {name === 'Support' ? 'Create ticket' : 'Save settings'}
          </button>
          {action && (
            <span className="form-success">
              <PackageCheck />
              {action}
            </span>
          )}
        </form>
      </section>
    );
  return (
    <section className="module-workspace">
      <ModuleHead cfg={cfg} onAction={setAction} />
      <div className="module-cards">
        {cfg.cards.map(([t, d, I]) => (
          <article key={t}>
            <span>
              <I />
            </span>
            <div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
            {name === 'Channels' ? (
              <button
                onClick={() =>
                  setConnected((x) =>
                    x.includes(t) ? x.filter((v) => v !== t) : [...x, t],
                  )
                }
              >
                {connected.includes(t) ? 'Connected' : 'Connect'}
              </button>
            ) : (
              <button onClick={() => setAction(`${t} opened`)}>
                View details
              </button>
            )}
          </article>
        ))}
      </div>
      {action && (
        <div className="module-notice">
          <PackageCheck />
          {action}
          <button onClick={() => setAction('')}>
            <X />
          </button>
        </div>
      )}
      <article className="clone-card module-table">
        <header>
          <div>
            <h2>Recent {cfg.title}</h2>
            <p>Latest records and activity</p>
          </div>
          <label className="table-search">
            <Search />
            <input placeholder="Search records" />
          </label>
        </header>
        <div className="module-empty">
          <ClipboardList />
          <h3>Workspace is ready</h3>
          <p>Connected API records will appear here.</p>
        </div>
      </article>
    </section>
  );
}

function ModuleHead({
  cfg,
  onAction,
}: {
  cfg: { title: string; sub: string; actions: string[] };
  onAction: (s: string) => void;
}) {
  return (
    <header className="module-head">
      <div>
        <span>RAGHAV EXPRESS WORKSPACE</span>
        <h1>{cfg.title}</h1>
        <p>{cfg.sub}</p>
      </div>
      <div>
        {cfg.actions.map((a, i) => (
          <button
            className={i === 0 ? 'primary' : ''}
            key={a}
            onClick={() => onAction(`${a} selected`)}
          >
            {i === 0 ? <Plus /> : <Download />}
            {a}
          </button>
        ))}
      </div>
    </header>
  );
}
