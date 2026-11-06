import React, { useMemo, useRef, useState } from "react";

const today = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const defaultServices = [
  { name: "Basic Wash", description: "Exterior wash, rinse and hand dry.", price: 5000, icon: "✦" },
  { name: "Premium Wash", description: "Exterior and interior cleaning with vacuum.", price: 10000, icon: "✧" },
  { name: "Full Detailing", description: "Deep cleaning, polish and complete detailing.", price: 25000, icon: "◇" },
];

const readStorage = (key, fallback) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

const money = (amount) => `RWF ${Number(amount).toLocaleString()}`;
const navItems = [
  ["dashboard", "▦", "Dashboard"],
  ["bookings", "▣", "Bookings"],
  ["customers", "♙", "Customers"],
  ["services", "✧", "Services"],
  ["payments", "＄", "Payments"],
];

function Status({ children }) {
  return <span className={`status ${children.replaceAll(" ", "-")}`}>{children}</span>;
}

function EmptyRow({ columns, children }) {
  return <tr><td colSpan={columns}>{children}</td></tr>;
}

function App() {
  const [bookings, setBookings] = useState(() => readStorage("shinewash_bookings", []));
  const [customers, setCustomers] = useState(() => readStorage("shinewash_customers", []));
  const [services, setServices] = useState(() => readStorage("shinewash_services", defaultServices));
  const [page, setPage] = useState("dashboard");
  const [bookingQuery, setBookingQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const bookingDialog = useRef(null);
  const currentDate = today();

  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const openBooking = () => bookingDialog.current?.showModal();
  const closeBooking = () => bookingDialog.current?.close();
  const totalPaid = bookings
    .filter((booking) => booking.payment === "Paid")
    .reduce((total, booking) => total + Number(booking.price), 0);

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const matchesQuery = Object.values(booking).some((value) =>
      String(value).toLowerCase().includes(bookingQuery.toLowerCase()),
    );
    return matchesQuery && (!statusFilter || booking.status === statusFilter);
  }), [bookings, bookingQuery, statusFilter]);

  const filteredCustomers = useMemo(() => customers.filter((customer) =>
    Object.values(customer).some((value) =>
      String(value).toLowerCase().includes(customerQuery.toLowerCase()),
    ),
  ), [customers, customerQuery]);

  function createBooking(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const service = services.find((item) => item.name === values.service);
    const booking = {
      ...values,
      price: service?.price ?? 0,
      status: "Pending",
      id: Date.now(),
    };
    const nextBookings = [booking, ...bookings];
    const nextCustomers = customers.some((customer) => customer.phone === values.phone)
      ? customers
      : [...customers, {
          name: values.customer,
          phone: values.phone,
          vehicle: values.vehicle,
          plate: values.plate,
        }];

    setBookings(nextBookings);
    setCustomers(nextCustomers);
    save("shinewash_bookings", nextBookings);
    save("shinewash_customers", nextCustomers);
    form.reset();
    closeBooking();
  }

  function updateStatus(id, status) {
    const nextBookings = bookings.map((booking) =>
      booking.id === id ? { ...booking, status } : booking,
    );
    setBookings(nextBookings);
    save("shinewash_bookings", nextBookings);
  }

  function addCustomer() {
    const name = window.prompt("Customer full name:");
    if (!name) return;
    const phone = window.prompt("Phone number:");
    if (!phone) return;
    const customer = {
      name,
      phone,
      vehicle: window.prompt("Vehicle model:") || "Not specified",
      plate: window.prompt("Plate number:") || "Not specified",
    };
    const nextCustomers = [...customers, customer];
    setCustomers(nextCustomers);
    save("shinewash_customers", nextCustomers);
  }

  function addService() {
    const name = window.prompt("Service name:");
    if (!name) return;
    const price = Number(window.prompt("Price in RWF:"));
    if (!Number.isFinite(price) || price < 0) {
      window.alert("Enter a valid price.");
      return;
    }
    const nextServices = [...services, {
      name,
      price,
      description: "Car wash service package.",
      icon: "✧",
    }];
    setServices(nextServices);
    save("shinewash_services", nextServices);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">✦</span><span>ShineWash</span></div>
        <div className="side-label">WORKSPACE</div>
        {navItems.map(([id, icon, label]) => (
          <button
            className={`nav-link ${page === id ? "active" : ""}`}
            data-page={id}
            key={id}
            onClick={() => setPage(id)}
          >
            {icon} <span>{label}</span>
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="avatar">JW</div>
          <div><b>Administrator</b><small>Manager account</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="eyebrow">CAR WASH MANAGEMENT</div><h1>{page[0].toUpperCase() + page.slice(1)}</h1></div>
          <div className="top-actions">
            <span className="today">{new Date().toLocaleDateString(undefined, {
              weekday: "short", day: "numeric", month: "short", year: "numeric",
            })}</span>
            <button className="primary" onClick={openBooking}>＋ New booking</button>
          </div>
        </header>

        {page === "dashboard" && (
          <section className="page">
            <div className="welcome">
              <div><h2>Welcome back 👋</h2><p>Here is what is happening at your car wash today.</p></div>
              <span className="live-pill">● System overview</span>
            </div>
            <div className="stats">
              <article className="stat-card"><div className="stat-top"><span>Total bookings</span><span className="stat-icon blue">▣</span></div><strong>{bookings.length}</strong><small className="muted">All recorded bookings</small></article>
              <article className="stat-card"><div className="stat-top"><span>Today's bookings</span><span className="stat-icon green">◷</span></div><strong>{bookings.filter((booking) => booking.date === currentDate).length}</strong><small className="muted">Scheduled for today</small></article>
              <article className="stat-card"><div className="stat-top"><span>Registered customers</span><span className="stat-icon purple">♙</span></div><strong>{customers.length}</strong><small className="muted">Customer records</small></article>
              <article className="stat-card"><div className="stat-top"><span>Revenue collected</span><span className="stat-icon orange">＄</span></div><strong>{money(totalPaid)}</strong><small className="muted">From paid bookings</small></article>
            </div>
            <div className="content-grid">
              <section className="panel">
                <div className="panel-heading"><div><h3>Recent bookings</h3><p>Latest customer appointments</p></div><button className="text-btn" onClick={() => setPage("bookings")}>View all →</button></div>
                <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Vehicle</th><th>Service</th><th>Date</th><th>Status</th></tr></thead><tbody>
                  {bookings.slice(0, 5).map((booking) => <tr key={booking.id}><td>{booking.customer}</td><td>{booking.vehicle}</td><td>{booking.service}</td><td>{booking.date}</td><td><Status>{booking.status}</Status></td></tr>)}
                  {bookings.length === 0 && <EmptyRow columns={5}>No bookings recorded yet.</EmptyRow>}
                </tbody></table></div>
              </section>
              <section className="panel quick-panel">
                <div className="panel-heading"><div><h3>Quick actions</h3><p>Manage your daily work</p></div></div>
                <button className="quick-action" onClick={openBooking}><span className="quick-icon">＋</span><span><b>Create booking</b><small>Schedule a car wash</small></span><span>→</span></button>
                <button className="quick-action" onClick={() => setPage("customers")}><span className="quick-icon">♙</span><span><b>View customers</b><small>Manage customer details</small></span><span>→</span></button>
                <button className="quick-action" onClick={() => setPage("services")}><span className="quick-icon">✧</span><span><b>Manage services</b><small>Review available packages</small></span><span>→</span></button>
              </section>
            </div>
          </section>
        )}

        {page === "bookings" && (
          <section className="page">
            <div className="page-toolbar"><div><h2>Bookings</h2><p>Schedule and track car wash appointments.</p></div><button className="primary" onClick={openBooking}>＋ Add booking</button></div>
            <div className="panel">
              <div className="filter-row">
                <input value={bookingQuery} onChange={(event) => setBookingQuery(event.target.value)} placeholder="Search customer, plate or service..." aria-label="Search bookings" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="">All statuses</option><option>Pending</option><option>In progress</option><option>Completed</option><option>Cancelled</option></select>
              </div>
              <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Vehicle / Plate</th><th>Service</th><th>Date &amp; time</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>
                {filteredBookings.map((booking) => <tr key={booking.id}>
                  <td><b>{booking.customer}</b></td><td>{booking.vehicle} / {booking.plate}</td><td>{booking.service}</td><td>{booking.date} {booking.time}</td><td>{money(booking.price)}</td><td><Status>{booking.status}</Status></td>
                  <td><select className="action-select" value={booking.status} onChange={(event) => updateStatus(booking.id, event.target.value)} aria-label={`Update ${booking.customer}'s booking status`}><option>Pending</option><option>In progress</option><option>Completed</option><option>Cancelled</option></select></td>
                </tr>)}
                {filteredBookings.length === 0 && <EmptyRow columns={7}>No bookings match your search.</EmptyRow>}
              </tbody></table></div>
            </div>
          </section>
        )}

        {page === "customers" && (
          <section className="page">
            <div className="page-toolbar"><div><h2>Customers</h2><p>Keep customer contact and vehicle information.</p></div><button className="primary" onClick={addCustomer}>＋ Add customer</button></div>
            <div className="panel"><div className="filter-row"><input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="Search customers..." aria-label="Search customers" /></div>
              <div className="table-wrap"><table><thead><tr><th>Customer name</th><th>Phone</th><th>Vehicle</th><th>Plate number</th></tr></thead><tbody>
                {filteredCustomers.map((customer, index) => <tr key={`${customer.phone}-${index}`}><td><b>{customer.name}</b></td><td>{customer.phone}</td><td>{customer.vehicle}</td><td>{customer.plate}</td></tr>)}
                {filteredCustomers.length === 0 && <EmptyRow columns={4}>No customers found.</EmptyRow>}
              </tbody></table></div>
            </div>
          </section>
        )}

        {page === "services" && (
          <section className="page">
            <div className="page-toolbar"><div><h2>Services</h2><p>Car wash packages and their prices.</p></div><button className="primary" onClick={addService}>＋ Add service</button></div>
            <div className="service-grid">{services.map((service, index) => <article className="service-card" key={`${service.name}-${index}`}><div className="service-symbol">{service.icon || "✦"}</div><h3>{service.name}</h3><p>{service.description}</p><strong>{money(service.price)}</strong><small> / vehicle</small></article>)}</div>
          </section>
        )}

        {page === "payments" && (
          <section className="page">
            <div className="page-toolbar"><div><h2>Payments</h2><p>Review payments recorded for bookings.</p></div></div>
            <div className="panel"><div className="table-wrap"><table><thead><tr><th>Customer</th><th>Booking service</th><th>Date</th><th>Amount</th><th>Payment status</th></tr></thead><tbody>
              {bookings.map((booking) => <tr key={booking.id}><td>{booking.customer}</td><td>{booking.service}</td><td>{booking.date}</td><td>{money(booking.price)}</td><td>{booking.payment === "Paid" ? <Status>Completed</Status> : <Status>Pending</Status>}</td></tr>)}
              {bookings.length === 0 && <EmptyRow columns={5}>No payments recorded yet.</EmptyRow>}
            </tbody></table></div></div>
          </section>
        )}
      </main>

      <dialog ref={bookingDialog} id="booking-dialog">
        <form onSubmit={createBooking}>
          <div className="dialog-head"><div><h2>New booking</h2><p>Enter the customer's appointment details.</p></div><button type="button" className="close" onClick={closeBooking} aria-label="Close">×</button></div>
          <label>Customer name<input name="customer" required placeholder="e.g. Jean Wilson" /></label>
          <div className="form-row"><label>Phone number<input name="phone" required placeholder="07XXXXXXXX" /></label><label>Vehicle<input name="vehicle" required placeholder="Toyota RAV4" /></label></div>
          <div className="form-row"><label>Plate number<input name="plate" required placeholder="RAA 123 A" /></label><label>Service<select name="service" required defaultValue={services[0]?.name}>{services.map((service, index) => <option value={service.name} key={`${service.name}-${index}`}>{service.name} — {money(service.price)}</option>)}</select></label></div>
          <div className="form-row"><label>Date<input type="date" name="date" min={currentDate} defaultValue={currentDate} required /></label><label>Time<input type="time" name="time" required /></label></div>
          <label>Payment status<select name="payment" defaultValue="Unpaid"><option>Unpaid</option><option>Paid</option></select></label>
          <div className="dialog-actions"><button type="button" className="secondary" onClick={closeBooking}>Cancel</button><button className="primary" type="submit">Save booking</button></div>
        </form>
      </dialog>
    </div>
  );
}

export default App;
