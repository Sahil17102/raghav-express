"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Calculator,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Headphones,
  Home,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  PackageCheck,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Settings,
  SlidersHorizontal,
  Store,
  Sun,
  Truck,
  WalletCards,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { ClientHome, ClientModule, OrdersManager } from "./client-views";
type Role = "client" | "admin";
type ClientProfile = Record<string, string>;
type Icon = typeof Home;
type Child = { label: string; icon: Icon };
type Item = { label: string; icon: Icon; children?: Child[] };
type Section = { title: string; items: Item[] };
const clientSections: Section[] = [
  {
    title: "MAIN",
    items: [
      { label: "Home", icon: Home },
      { label: "Dashboard", icon: LayoutDashboard },
      {
        label: "Orders",
        icon: Boxes,
        children: [
          { label: "All Orders", icon: ClipboardList },
          { label: "Create Order", icon: Plus },
          { label: "B2C Orders", icon: PackageCheck },
          { label: "B2B Orders", icon: Building2 },
        ],
      },
    ],
  },
  { title: "ANALYTICS", items: [{ label: "Reports", icon: BarChart3 }] },
  {
    title: "FINANCE",
    items: [
      {
        label: "Billing",
        icon: FileText,
        children: [
          { label: "Passbook", icon: WalletCards },
          { label: "COD Remittance", icon: IndianRupee },
          { label: "Shipping Charges", icon: Truck },
          { label: "All Recharges", icon: Plus },
          { label: "Invoices", icon: FileText },
          { label: "Credit Notes", icon: FileText },
          { label: "Debit Notes", icon: FileText },
          { label: "Ledgers", icon: ClipboardList },
        ],
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        label: "Operations",
        icon: AlertTriangle,
        children: [
          { label: "NDR", icon: AlertTriangle },
          { label: "RTO", icon: RefreshCw },
        ],
      },
      { label: "Warehouse", icon: Warehouse },
      { label: "Reconciliation", icon: Scale },
    ],
  },
  {
    title: "INTEGRATIONS",
    items: [
      {
        label: "Integrations",
        icon: Zap,
        children: [
          { label: "Couriers", icon: Truck },
          { label: "Channels", icon: SlidersHorizontal },
        ],
      },
    ],
  },
  {
    title: "TOOLS",
    items: [
      {
        label: "Tools",
        icon: Calculator,
        children: [
          { label: "Rate Calculator", icon: Calculator },
          { label: "Order Tracking", icon: Search },
        ],
      },
    ],
  },
  { title: "SUPPORT", items: [{ label: "Support", icon: Headphones }] },
];
const adminSections: Section[] = [
  {
    title: "ADMIN",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "All Orders", icon: Boxes },
      { label: "Sellers", icon: Store },
      { label: "NDR & RTO", icon: AlertTriangle },
      { label: "Couriers", icon: Truck },
      { label: "Finance", icon: WalletCards },
      { label: "Reports", icon: BarChart3 },
      { label: "Settings", icon: Settings },
    ],
  },
];
const orders = [
  [
    "RGX-240812",
    "Aarav Textiles",
    "Jodhpur → Delhi",
    "Raghav Surface",
    "₹1,240",
    "In transit",
  ],
  [
    "RGX-240811",
    "Meera Handicrafts",
    "Pali → Mumbai",
    "Express Air",
    "₹860",
    "Delivered",
  ],
  [
    "RGX-240810",
    "Raj Foods",
    "Jaipur → Ahmedabad",
    "Raghav Cargo",
    "₹2,180",
    "Pickup due",
  ],
  [
    "RGX-240809",
    "Blue Pottery Co.",
    "Jodhpur → Bengaluru",
    "Express Air",
    "₹1,560",
    "NDR",
  ],
];

function DashboardView({ go }: { go: (name: string) => void }) {
  const [date, setDate] = useState("2026-09-12");
  const [refreshing, setRefreshing] = useState(false);
  const [customize, setCustomize] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(
        [
          "Metric,Value\nActive shipments,0\nIn transit,0\nWallet balance,4948\nCOD remittance,0",
        ],
        { type: "text/csv" },
      ),
    );
    a.download = "raghav-express-dashboard.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <section className="clone-heading">
        <div className="clone-title">
          <span>
            <LayoutDashboard />
          </span>
          <div>
            <h1>Dashboard</h1>
            <p>
              A clean view of orders, cash flow, courier health, and action
              queues.
            </p>
          </div>
        </div>
        <div className="heading-actions">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button onClick={download}>
            <Download />
            Export CSV
          </button>
          <button className="outline-warm" onClick={() => setCustomize(true)}>
            <SlidersHorizontal />
            Customize
          </button>
          <button className="refresh-button" onClick={refresh}>
            <RefreshCw className={refreshing ? "spin" : ""} />
            {refreshing ? "Updating" : "Refresh"}
          </button>
        </div>
      </section>
      <section className="clone-stats">
        {(
          [
            ["ACTIVE SHIPMENTS", "0", "No active shipments", Boxes, "blue"],
            ["IN TRANSIT", "0", "Pickup queue is clear", Truck, "teal"],
            [
              "WALLET BALANCE",
              "₹4,948",
              "Balance ready for use",
              WalletCards,
              "orange",
            ],
            ["COD REMITTANCE", "₹0", "No remittance due", Building2, "purple"],
          ] as [string, string, string, Icon, string][]
        ).map(([label, value, note, I, tone]) => (
          <article key={label}>
            <span className={`stat-icon ${tone}`}>
              <I />
            </span>
            <small>{label}</small>
            <strong>{value}</strong>
            <div>
              <em>✓ {note}</em>
              <button
                onClick={() =>
                  go(
                    label === "WALLET BALANCE"
                      ? "Passbook"
                      : label === "COD REMITTANCE"
                        ? "COD Remittance"
                        : "All Orders",
                  )
                }
              >
                {label === "WALLET BALANCE"
                  ? "Manage wallet"
                  : label === "COD REMITTANCE"
                    ? "View remittances"
                    : "View shipments"}{" "}
                ↗
              </button>
            </div>
          </article>
        ))}
      </section>
      <section className="clone-grid">
        <article className="clone-card quick-card">
          <header>
            <span>
              <Zap />
            </span>
            <div>
              <h2>Quick Actions</h2>
              <p>Frequent shipping tasks</p>
            </div>
          </header>
          <div className="quick-grid">
            {(
              [
                ["Create Order", Plus],
                ["All Orders", Boxes],
                ["Rate Calculator", Calculator],
                ["Track AWB", Search],
                ["Support", CircleHelp],
                ["Shipments", Truck],
              ] as [string, Icon][]
            ).map(([label, I]) => (
              <button
                key={label}
                onClick={() =>
                  go(label === "Track AWB" ? "Order Tracking" : label)
                }
              >
                <span>
                  <I />
                </span>
                {label}
              </button>
            ))}
          </div>
        </article>
        <article className="clone-card insight-card">
          <header>
            <span>
              <BarChart3 />
            </span>
            <div>
              <h2>Performance Insights</h2>
              <p>Signals that need attention</p>
            </div>
          </header>
          <div className="alert danger">
            <AlertTriangle />
            Delivery success dropped to 0%. Prioritize interventions.
          </div>
          <div className="alert success">
            <BarChart3 />
            Orders are growing by 100% vs previous week.
          </div>
        </article>
      </section>
      <section className="clone-grid lower-grid">
        <article className="clone-card">
          <header>
            <span>
              <Truck />
            </span>
            <div>
              <h2>Delivery Health</h2>
              <p>Success and exception control</p>
            </div>
          </header>
          <div className="empty-chart">
            <b>0%</b>
            <span>Delivery success</span>
          </div>
        </article>
        <article className="clone-card">
          <header>
            <span>
              <IndianRupee />
            </span>
            <div>
              <h2>Payment Mix</h2>
              <p>Prepaid versus COD orders</p>
            </div>
          </header>
          <div className="empty-chart ring">
            <b>₹0</b>
            <span>Total revenue</span>
          </div>
        </article>
      </section>
      <section className="analytics-grid">
        <article className="clone-card trend-card">
          <header>
            <span>
              <BarChart3 />
            </span>
            <div>
              <h2>Orders Trend</h2>
              <p>Shipment volume over the last 7 days</p>
            </div>
            <select aria-label="Trend period">
              <option>7 days</option>
              <option>30 days</option>
            </select>
          </header>
          <div className="trend-summary">
            <div>
              <small>TOTAL ORDERS</small>
              <b>248</b>
              <em>↑ 12.5%</em>
            </div>
            <div>
              <small>AVG. PER DAY</small>
              <b>35</b>
              <em>Healthy</em>
            </div>
          </div>
          <div className="analytics-chart">
            <span style={{ height: "38%" }} />
            <span style={{ height: "56%" }} />
            <span style={{ height: "44%" }} />
            <span style={{ height: "73%" }} />
            <span style={{ height: "61%" }} />
            <span style={{ height: "87%" }} />
            <span style={{ height: "96%" }} />
          </div>
          <div className="chart-labels">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </article>
        <article className="clone-card metrics-card">
          <header>
            <span>
              <SlidersHorizontal />
            </span>
            <div>
              <h2>Key Metrics</h2>
              <p>Order mix and value</p>
            </div>
          </header>
          <div className="metric-list">
            <div>
              <span className="metric-dot blue">
                <BarChart3 />
              </span>
              <p>
                Average order value<small>Across all shipments</small>
              </p>
              <b>₹1,206</b>
            </div>
            <div>
              <span className="metric-dot teal">
                <WalletCards />
              </span>
              <p>
                Prepaid orders<small>62% of total volume</small>
              </p>
              <b>154</b>
            </div>
            <div>
              <span className="metric-dot orange">
                <IndianRupee />
              </span>
              <p>
                COD orders<small>38% of total volume</small>
              </p>
              <b>94</b>
            </div>
          </div>
        </article>
      </section>
      <section className="analytics-grid triple">
        <article className="clone-card mini-analytics">
          <header>
            <span>
              <Truck />
            </span>
            <div>
              <h2>Courier Performance</h2>
              <p>Service partner health</p>
            </div>
          </header>
          {[
            ["Raghav Surface", "94%"],
            ["Express Air", "89%"],
            ["Cargo Freight", "86%"],
          ].map(([n, v]) => (
            <div className="progress-row" key={n}>
              <div>
                <span>{n}</span>
                <b>{v}</b>
              </div>
              <i>
                <em style={{ width: v }} />
              </i>
            </div>
          ))}
        </article>
        <article className="clone-card mini-analytics">
          <header>
            <span>
              <Store />
            </span>
            <div>
              <h2>Top Destinations</h2>
              <p>Most active delivery cities</p>
            </div>
          </header>
          {[
            ["Delhi", "78 orders"],
            ["Mumbai", "61 orders"],
            ["Ahmedabad", "43 orders"],
          ].map(([n, v], i) => (
            <div className="destination" key={n}>
              <span>0{i + 1}</span>
              <b>{n}</b>
              <small>{v}</small>
            </div>
          ))}
        </article>
        <article className="clone-card mini-analytics">
          <header>
            <span>
              <Bell />
            </span>
            <div>
              <h2>Recent Activity</h2>
              <p>Latest account movement</p>
            </div>
          </header>
          {[
            ["Shipment delivered", "RGX-240811 · 12 min ago"],
            ["Wallet recharge", "₹5,000 · 1 hour ago"],
            ["Pickup scheduled", "Jodhpur hub · 2 hours ago"],
          ].map(([n, v]) => (
            <div className="activity" key={n}>
              <i />
              <p>
                <b>{n}</b>
                <small>{v}</small>
              </p>
            </div>
          ))}
        </article>
      </section>
      {customize && (
        <div className="clone-modal" onClick={() => setCustomize(false)}>
          <section onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCustomize(false)}>
              <X />
            </button>
            <h2>Customize dashboard</h2>
            <p>Choose the information you want to keep visible.</p>
            {[
              "Quick stats",
              "Quick actions",
              "Performance insights",
              "Delivery health",
              "Payment mix",
            ].map((x) => (
              <label key={x}>
                <input type="checkbox" defaultChecked />
                {x}
              </label>
            ))}
            <button className="save-button" onClick={() => setCustomize(false)}>
              Save layout
            </button>
          </section>
        </div>
      )}
    </>
  );
}

function GenericView({ name }: { name: string }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      orders.filter((r) =>
        r.join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <>
      <section className="clone-heading">
        <div className="clone-title">
          <span>
            <ClipboardList />
          </span>
          <div>
            <h1>{name}</h1>
            <p>
              Manage your {name.toLowerCase()} from the Raghav Express
              workspace.
            </p>
          </div>
        </div>
        <button className="refresh-button">
          <Plus />
          Add new
        </button>
      </section>
      <article className="clone-card data-card">
        <header>
          <div>
            <h2>{name}</h2>
            <p>Latest shipment activity and status</p>
          </div>
          <label className="table-search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records"
            />
          </label>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>ROUTE</th>
                <th>COURIER</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={cell}>{i === 0 ? <b>{cell}</b> : cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}

export default function DashboardShell({ role }: { role: Role }) {
  const sections = role === "admin" ? adminSections : clientSections;
  const [active, setActive] = useState("Home");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [topMenu, setTopMenu] = useState<
    "quick" | "wallet" | "alerts" | "profile" | null
  >(null);
  const [searchValue, setSearchValue] = useState("");
  const [walletBalance, setWalletBalance] = useState(4948);
  const [recharge, setRecharge] = useState("");
  const [toast, setToast] = useState("");
  const [signedInEmail, setSignedInEmail] = useState(
    "raghavexpresspali@gmail.com",
  );
  const [clientProfile, setClientProfile] = useState<ClientProfile>({});
  useEffect(() => {
    if (window.location.hostname === "raghav-express-web.onrender.com") {
      window.location.replace(
        "https://raghav-express.onrender.com/?source=legacy-web",
      );
      return;
    }
    const currentEmail = localStorage.getItem("raghav-current-user-email");
    if (currentEmail) {
      setSignedInEmail(currentEmail);
      try {
        const profiles = JSON.parse(
          localStorage.getItem("raghav-user-profiles") || "{}",
        ) as Record<string, ClientProfile>;
        setClientProfile(profiles[currentEmail] || {});
      } catch {}
      return;
    }
    try {
      const onboarded = JSON.parse(
        localStorage.getItem("raghav-onboarded-users") || "[]",
      ) as string[];
      const latestEmail = onboarded.at(-1);
      if (latestEmail) {
        localStorage.setItem("raghav-current-user-email", latestEmail);
        setSignedInEmail(latestEmail);
        try {
          const profiles = JSON.parse(
            localStorage.getItem("raghav-user-profiles") || "{}",
          ) as Record<string, ClientProfile>;
          setClientProfile(profiles[latestEmail] || {});
        } catch {}
      }
    } catch {
      localStorage.removeItem("raghav-onboarded-users");
    }
  }, []);
  const userInitials = signedInEmail
    .split("@")[0]
    .replace(/[^a-z0-9]+/gi, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RE";
  const select = (n: string) => {
    setActive(n);
    setMobile(false);
    setTopMenu(null);
  };
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };
  const downloadStatement = () => {
    const href = URL.createObjectURL(
      new Blob(
        [
          "Date,Description,Credit,Debit,Balance\n2026-09-08,Wallet recharge,5000,0,4948",
        ],
        { type: "text/csv" },
      ),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = "raghav-wallet-statement.csv";
    a.click();
    URL.revokeObjectURL(href);
  };
  return (
    <div
      className={`clone-app ${dark ? "dark" : ""} ${collapsed ? "collapsed" : ""}`}
    >
      <aside className={mobile ? "clone-sidebar open" : "clone-sidebar"}>
        <div className="clone-brand">
          <img src="/raghav-express-logo.png" alt="Raghav Express" />
          <div>
            <b>Raghav Express</b>
            <span>{role === "admin" ? "ADMIN PANEL" : "CLIENT PANEL"}</span>
          </div>
          <button className="mobile-close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <div className="clone-nav-scroll">
          {sections.map((s) => (
            <section key={s.title}>
              <h3>{s.title}</h3>
              {s.items.map(({ label, icon: I, children }) => (
                <div key={label}>
                  <button
                    className={
                      active === label ||
                      children?.some((x) => x.label === active)
                        ? "active"
                        : ""
                    }
                    title={label}
                    onClick={() =>
                      children
                        ? setExpanded(expanded === label ? null : label)
                        : select(label)
                    }
                  >
                    <span className="nav-icon">
                      <I />
                    </span>
                    <span className="nav-label">{label}</span>
                    {children && (
                      <ChevronDown
                        className={`chevron ${expanded === label ? "up" : ""}`}
                      />
                    )}
                  </button>
                  {children && expanded === label && (
                    <div className="subnav">
                      {children.map(({ label: c, icon: C }) => (
                        <button
                          key={c}
                          className={active === c ? "active" : ""}
                          onClick={() => select(c)}
                        >
                          <C />
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button
            className={active === "Settings" ? "active" : ""}
            onClick={() => select("Settings")}
          >
            <span className="nav-icon">
              <Settings />
            </span>
            <span className="nav-label">Settings</span>
          </button>
          <div className="merchant">
            <span>{userInitials}</span>
            <div>
              <b>Raghav Express</b>
              <small>{signedInEmail}</small>
            </div>
            <ChevronDown />
          </div>
        </div>
      </aside>
      <main className="clone-main">
        <header className="clone-topbar">
          <button className="mobile-menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft />
          </button>
          <b>{active}</b>
          <div className="global-search">
            <select aria-label="Search type">
              <option>LRN</option>
              <option>AWB</option>
            </select>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search up to 25 LRNs"
            />
            <button
              onClick={() =>
                searchValue.trim()
                  ? select("Order Tracking")
                  : notify("Enter an LRN or AWB to search")
              }
            >
              Search
            </button>
          </div>
          <div className="top-tools">
            <button
              aria-label="Open quick actions"
              onClick={() => setTopMenu(topMenu === "quick" ? null : "quick")}
            >
              <Zap />
              Quick Actions
            </button>
            <button
              className="wallet"
              aria-label="Open wallet"
              onClick={() => setTopMenu(topMenu === "wallet" ? null : "wallet")}
            >
              <WalletCards />₹{walletBalance.toLocaleString("en-IN")}
            </button>
            <button onClick={() => select("Support")}>
              <Headphones />
              Support
            </button>
            <button className="theme-toggle" onClick={() => setDark(!dark)}>
              {dark ? (
                <Sun />
              ) : (
                <>
                  <Sun />
                  <Moon />
                </>
              )}
            </button>
            <button
              className="bell"
              aria-label="Notifications"
              onClick={() => setTopMenu(topMenu === "alerts" ? null : "alerts")}
            >
              <Bell />
              <i />
            </button>
            <button
              className="avatar"
              aria-label="Open profile"
              onClick={() =>
                setTopMenu(topMenu === "profile" ? null : "profile")
              }
            >
              {userInitials}
            </button>
            {topMenu === "quick" && (
              <div className="top-popover quick-popover">
                <h3>Quick Actions</h3>
                {[
                  ["Rate Calculator", Calculator],
                  ["Add Warehouse", Warehouse],
                  ["Recharge Wallet", WalletCards],
                  ["Early COD", IndianRupee],
                  ["Book Order", Plus],
                  ["Transporter ID", Truck],
                ].map(([n, I]) => {
                  const C = I as Icon;
                  return (
                    <button
                      key={n as string}
                      onClick={() =>
                        select(
                          n === "Add Warehouse"
                            ? "Warehouse"
                            : n === "Recharge Wallet"
                              ? "Passbook"
                              : n === "Early COD"
                                ? "COD Remittance"
                                : n === "Book Order"
                                  ? "Create Order"
                                  : (n as string),
                        )
                      }
                    >
                      <C />
                      <span>{n as string}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {topMenu === "wallet" && (
              <div className="top-popover wallet-popover">
                <small>AVAILABLE BALANCE</small>
                <strong>₹{walletBalance.toLocaleString("en-IN")}</strong>
                <label>
                  Recharge amount
                  <input
                    type="number"
                    min="100"
                    value={recharge}
                    onChange={(e) => setRecharge(e.target.value)}
                    placeholder="₹ Enter amount"
                  />
                </label>
                <button
                  className="popover-primary"
                  onClick={() => {
                    const value = Number(recharge);
                    if (value > 0) {
                      setWalletBalance((v) => v + value);
                      setRecharge("");
                      notify(
                        `₹${value.toLocaleString("en-IN")} added to wallet`,
                      );
                    }
                  }}
                >
                  Recharge wallet
                </button>
                <button onClick={downloadStatement}>Download statement</button>
                <button onClick={() => select("Passbook")}>
                  View passbook
                </button>
              </div>
            )}
            {topMenu === "alerts" && (
              <div className="top-popover alerts-popover">
                <h3>Notifications</h3>
                <article>
                  <b>Pickup scheduled</b>
                  <small>Jodhpur warehouse · Today, 4:30 PM</small>
                </article>
                <article>
                  <b>Wallet recharge successful</b>
                  <small>₹5,000 added · 4 days ago</small>
                </article>
                <button
                  onClick={() => {
                    setTopMenu(null);
                    notify("All notifications marked as read");
                  }}
                >
                  Mark all as read
                </button>
              </div>
            )}
            {topMenu === "profile" && (
              <div className="top-popover profile-popover">
                <div>
                  <span>{userInitials}</span>
                  <p>
                    <b>Raghav Express</b>
                    <small>{signedInEmail}</small>
                  </p>
                </div>
                <button onClick={() => select("Settings")}>
                  <Settings />
                  Profile
                </button>
                <button onClick={() => select("Settings")}>
                  <Settings />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setTopMenu(null);
                    notify(
                      "Keyboard shortcuts: Ctrl+K search · C create order · T track shipment",
                    );
                  }}
                >
                  <Calculator />
                  Keyboard Shortcuts
                </button>
                <button
                  onClick={() => {
                    setTopMenu(null);
                    notify("Legal & Policies opened");
                  }}
                >
                  <FileText />
                  Legal & Policies
                </button>
                <a
                  href="/login"
                  onClick={() =>
                    localStorage.removeItem("raghav-current-user-email")
                  }
                >
                  <LogOut />
                  Logout
                </a>
              </div>
            )}
          </div>
        </header>
        <div className="clone-content">
          {active === "Home" ? (
            <ClientHome go={select} />
          ) : active === "Dashboard" ? (
            <DashboardView go={select} />
          ) : ["All Orders", "B2C Orders", "B2B Orders"].includes(active) ? (
            <OrdersManager
              go={select}
              mode={active as "All Orders" | "B2C Orders" | "B2B Orders"}
            />
          ) : (
            <ClientModule
              name={active}
              go={select}
              signedInEmail={signedInEmail}
              profile={clientProfile}
            />
          )}
        </div>
      </main>
      <a className="clone-signout" href="/login">
        <LogOut />
        Sign out
      </a>
      {toast && (
        <div className="client-toast">
          <PackageCheck />
          {toast}
        </div>
      )}
    </div>
  );
}
