'use client';
import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  PackageCheck,
  Route,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import { SiteFooter, SiteNav } from './site-chrome';
const services = [
  {
    icon: PackageCheck,
    title: 'Express Parcel',
    text: 'Doorstep pickup for documents and priority parcels.',
  },
  {
    icon: Truck,
    title: 'Surface Cargo',
    text: 'LTL, FTL and bulk movement nationwide.',
  },
  {
    icon: Route,
    title: 'Pan India Network',
    text: 'Reliable reach across India.',
  },
];
const reviews = [
  [
    '“Our business dispatches are more organised now. The team stays available and keeps every handoff clear.”',
    'Amit Sharma',
    'Business Owner',
  ],
  [
    '“Quick pickup and good communication. Our important parcel reached safely and on time.”',
    'Neha Jain',
    'Jodhpur',
  ],
  [
    '“Raghav Express understood our regular cargo requirement and made the process very easy.”',
    'Vikram Mehta',
    'Operations Lead',
  ],
];
export default function Home() {
  const [trackingId, setTrackingId] = useState('');
  const [message, setMessage] = useState('');
  function track(e: React.FormEvent) {
    e.preventDefault();
    setMessage(
      trackingId
        ? `Shipment ${trackingId.toUpperCase()} is being checked by our team.`
        : 'Please enter your consignment number.',
    );
  }
  return (
    <>
      <SiteNav />
      <section className="hero">
        <img
          className="hero-image"
          src="/raghav-hero.png"
          alt="Cargo truck ready for dispatch"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">
            <span /> YOUR CARGO, OUR COMMITMENT
          </p>
          <h1>
            Moving India
            <br />
            <i>with confidence.</i>
          </h1>
          <p className="hero-copy">
            Swift, secure and seamless courier & cargo solutions, built around
            the promise of every delivery.
          </p>
          <div className="hero-actions">
            <a className="primary-btn" href="/contact">
              Get a Quick Quote <ArrowRight size={18} />
            </a>
            <a className="watch-link" href="/services">
              <span>01</span> Explore our services
            </a>
          </div>
        </div>
        <div className="hero-stat">
          <b>15+</b>
          <span>
            Years of dependable
            <br />
            service
          </span>
        </div>
        <div className="scroll-note">
          SCROLL TO EXPLORE <ChevronDown size={16} />
        </div>
      </section>
      <section className="track-section">
        <div>
          <p className="eyebrow dark-eyebrow">
            <span /> TRACK WITH EASE
          </p>
          <h2>
            Always know where
            <br />
            your shipment is.
          </h2>
        </div>
        <form className="track-form" onSubmit={track}>
          <label htmlFor="tracking">CONSIGNMENT NUMBER</label>
          <div>
            <input
              id="tracking"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. RX123456789"
            />
            <button>
              Track Now <ArrowRight size={17} />
            </button>
          </div>
          <output>{message}</output>
        </form>
      </section>
      <section className="services section-wrap">
        <div className="section-intro">
          <p className="eyebrow dark-eyebrow">
            <span /> WHAT WE DELIVER
          </p>
          <h2>
            Logistics that keeps
            <br />
            <i>business moving.</i>
          </h2>
        </div>
        <div className="service-grid">
          {services.map(({ icon: Icon, title, text }, i) => (
            <article className="service-card" key={title}>
              <span className="service-number">0{i + 1}</span>
              <Icon size={34} />
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="/services">
                Learn more <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>
        <section className="operations-panel">
          <div className="operations-intro">
            <p className="eyebrow"><span /> YOUR SHIPPING CONTROL ROOM</p>
            <h2>Every dispatch,<br /><i>in one view.</i></h2>
            <p>See what is booked, what is moving and what needs attention across your delivery network.</p>
            <a className="primary-btn" href="/tracking">Open tracking <ArrowRight size={17} /></a>
          </div>
          <div className="operations-board">
            <div className="board-head"><span>LIVE DISPATCH</span><b>Today · 09:42 AM</b></div>
            <div className="board-stats"><div><small>BOOKED TODAY</small><strong>128</strong><em>+12.5%</em></div><div><small>IN TRANSIT</small><strong>64</strong><em>On route</em></div><div><small>DELIVERED</small><strong>52</strong><em>+8.7%</em></div></div>
            <div className="board-route"><div><span className="route-dot red-dot" /><p><b>Jodhpur pickup hub</b><small>18 consignments ready</small></p></div><div className="route-line" /><div><span className="route-dot teal-dot" /><p><b>Destination network</b><small>Pan India movement active</small></p></div></div>
          </div>
        </section>
        <section className="journey">
        <div>
          <p className="eyebrow">
            <span /> A CONNECTED JOURNEY
          </p>
          <h2>
            From doorstep
            <br />
            to <i>destination.</i>
          </h2>
          <p>
            Every shipment moves through a simple, coordinated journey. We keep
            the work behind your delivery visible and understandable.
          </p>
          <a className="outline-btn" href="/tracking">
            Track a shipment <ArrowRight size={17} />
          </a>
        </div>
        <div className="journey-flow">
          {['Book', 'Pickup', 'Move', 'Deliver'].map((x, i) => (
            <div key={x}>
              <b>0{i + 1}</b>
              <span>{x}</span>
              <small>
                {
                  [
                    'Details confirmed',
                    'Parcel collected',
                    'Route in progress',
                    'Final handover',
                  ][i]
                }
              </small>
            </div>
          ))}
        </div>
      </section>
      <section className="business section-wrap">
        <p className="eyebrow dark-eyebrow">
          <span /> FOR GROWING BUSINESSES
        </p>
        <h2>
          One logistics desk
          <br />
          for every dispatch.
        </h2>
        <div className="business-grid">
          <div>
            <b>01</b>
            <h3>Recurring pickups</h3>
            <p>
              Plan a simple dispatch rhythm for regular orders, offices and
              local sellers.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Flexible movement</h3>
            <p>
              Choose courier, cargo or transport support based on every
              shipment.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Direct assistance</h3>
            <p>Talk to a person when a delivery needs attention.</p>
          </div>
          <a href="/contact">
            Discuss your business needs <ArrowRight />
          </a>
        </div>
      </section>
      <section className="reviews">
        <div className="review-title">
          <p className="eyebrow">
            <span /> TRUSTED BY CUSTOMERS
          </p>
          <h2>
            What people say
            <br />
            about <i>our service.</i>
          </h2>
        </div>
        <div className="review-grid">
          {reviews.map(([quote, name, role]) => (
            <article key={name}>
              <span className="stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} fill="currentColor" />
                ))}
              </span>
              <p>{quote}</p>
              <b>{name}</b>
              <small>{role}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="faq section-wrap">
        <div>
          <p className="eyebrow dark-eyebrow">
            <span /> COMMON QUESTIONS
          </p>
          <h2>
            A few things worth
            <br />
            knowing.
          </h2>
        </div>
        <div className="faq-list">
          <details open>
            <summary>How do I get a shipping quote?</summary>
            <p>
              Share pickup and delivery locations, parcel type and approximate
              weight. Our team will guide you to the suitable service.
            </p>
          </details>
          <details>
            <summary>
              Can Raghav Express handle regular business shipments?
            </summary>
            <p>
              Yes. We support recurring pickups and cargo requirements for
              growing businesses.
            </p>
          </details>
          <details>
            <summary>What is needed to track a shipment?</summary>
            <p>
              Your Raghav Express consignment number. Our tracking page gives a
              clear demo journey and our desk can share the latest status.
            </p>
          </details>
          <details>
            <summary>Do you provide Pan India delivery?</summary>
            <p>
              Yes, our courier and cargo services are designed for reliable
              movement across India.
            </p>
          </details>
        </div>
      </section>
      <section className="cta-band">
        <div>
          <p className="eyebrow">
            <span /> RAGHAV EXPRESS
          </p>
          <h2>
            Ready when
            <br />
            you are.
          </h2>
        </div>
        <a href="/contact" className="primary-btn">
          Talk to our team <ArrowRight />
        </a>
      </section>
      <SiteFooter />
    </>
  );
}
