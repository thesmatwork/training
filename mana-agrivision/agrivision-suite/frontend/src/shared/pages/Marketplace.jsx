import React, { useMemo, useState } from "react";
import {
  ShoppingCart, Sprout, Users, ShieldCheck, Truck, Search,
  ChevronRight, Plus, Grid2X2, FlaskConical, SprayCan, Wrench,
  Droplets, Tractor, Leaf, Boxes, UserRound, MapPin, Star,
  ArrowRight, X, Check
} from "lucide-react";
import "./Marketplace.css";
import './MarketPrices.css';

const products = [
  {
    id: 1,
    name: "Paddy Seeds (Swarna)",
    sub: "High germination rate",
    category: "Seeds",
    price: 850,
    unit: "10 kg",
    seller: "Rythu Agro",
    location: "Warangal, TS",
    rating: "4.8",
    reviews: 24,
    tag: "Popular",
    img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 2,
    name: "DAP Fertilizer",
    sub: "For better crop growth",
    category: "Fertilizers",
    price: 1350,
    unit: "50 kg",
    seller: "Agri Mart",
    location: "Vijayawada, AP",
    rating: "4.6",
    reviews: 18,
    img: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 3,
    name: "Knapsack Sprayer",
    sub: "16L capacity",
    category: "Farm Tools",
    price: 1200,
    unit: "unit",
    seller: "GreenTech Tools",
    location: "Hyderabad, TG",
    rating: "4.5",
    reviews: 12,
    img: "https://images.unsplash.com/photo-1599685315640-5ec1d7b2a5e2?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 4,
    name: "Drip Irrigation Pipe",
    sub: "16mm (per meter)",
    category: "Irrigation",
    price: 12,
    unit: "meter",
    seller: "Irrigation Pro",
    location: "Coimbatore, TN",
    rating: "4.7",
    reviews: 30,
    img: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=700&q=85"
  }
];

const trending = [
  ["Tomato", "12", "/ kg", "Warangal, TS",
    "High Demand",
    "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=160&q=80"],
  ["Onion", "18", "/ kg", "Nashik, MH",
    "High Demand",
    "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=160&q=80"],
  ["Green Chilli", "25", "/ kg", "Guntur, AP",
    "Good Demand",
    "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=160&q=80"],
  ["Paddy", "2,200", "/ quintal", "Karimnagar, TS",
    "Good Demand",
    "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=160&q=80"],
  ["Cotton", "6,800", "/ quintal", "Adilabad, TS",
    "Stable",
    "https://images.unsplash.com/photo-1597848212624-e6e7e6e8f2b2?auto=format&fit=crop&w=160&q=80"]
];

const categories = [
  ["All", Grid2X2],
  ["Seeds", Sprout],
  ["Fertilizers", FlaskConical],
  ["Pesticides", SprayCan],
  ["Farm Tools", Wrench],
  ["Irrigation", Droplets],
  ["Machinery", Tractor],
  ["Organic Inputs", Leaf],
  ["Other Supplies", Boxes]
];

const money = value =>
  "₹ " + Number(value).toLocaleString("en-IN");

export default function Marketplace() {
  const [mode, setMode] = useState("buy");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [listings, setListings] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "per kg",
    location: "",
    seller: ""
  });

  const shown = useMemo(() => {
    const all = mode === "buy"
      ? products
      : [
          ...trending.map((p, i) => ({
            id: 100 + i,
            name: p[0],
            category: "Produce",
            price: Number(p[1].replace(",", "")),
            unit: p[2].trim(),
            seller: "Local farmer",
            location: p[3],
            rating: "4.7",
            reviews: 10,
            sub: "Fresh farm produce",
            img: p[5]
          })),
          ...listings
        ];

    return all.filter(item =>
      (mode === "sell" ||
        category === "All" ||
        item.category.toLowerCase() === category.toLowerCase()) &&
      (!search ||
        `${item.name} ${item.category} ${item.location}`
          .toLowerCase()
          .includes(search.toLowerCase()))
    );
  }, [mode, category, search, listings]);

  function submitListing(e) {
    e.preventDefault();

    const newItem = {
      id: Date.now(),
      name: form.name,
      category: "Produce",
      price: Number(form.price),
      unit: form.unit,
      seller: form.seller || "Local farmer",
      location: form.location || "Location not added",
      rating: "New",
      reviews: 0,
      sub: "New listing",
      img: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=85"
    };

    setListings(previous => [newItem, ...previous]);
    setModal(null);
    setForm({
      name: "",
      price: "",
      unit: "per kg",
      location: "",
      seller: ""
    });

    setNotice(
      "Listing added for this session only. Backend connection is required to publish it for all users."
    );
  }

  return (
    <div className="mp-page">

      {/* No sidebar or global header here.
          Existing App layout provides them. */}

      <div className="mp-breadcrumb">
        Home <ChevronRight size={14} /> <b>Marketplace</b>
      </div>

      <div className="mp-title-row">
        <div className="mp-title-icon">
          <ShoppingCart size={28} />
        </div>

        <div className="mp-title-copy">
          <h1>Marketplace</h1>
          <p>
            Buy farming supplies or sell your farm produce directly.
          </p>
        </div>

        <button
          className="mp-how"
          onClick={() => setModal("how")}
        >
          ▶ How it works?
        </button>
      </div>

      <section className="mp-hero">
        <div className="mp-hero-copy">
          <h2>Buy what you need. Sell what you grow.</h2>
          <p>Quality inputs. Better prices. Direct connections.</p>

          <div className="mp-hero-benefits">
            <div>
              <span><Sprout /></span>
              <b>Trusted products</b>
              <small>Seeds, fertilizers & more</small>
            </div>

            <div>
              <span><Users /></span>
              <b>Direct buyers</b>
              <small>Better market prices</small>
            </div>

            <div>
              <span><ShieldCheck /></span>
              <b>Safe & simple</b>
              <small>Verified listings</small>
            </div>

            <div>
              <span><Truck /></span>
              <b>Support local</b>
              <small>Stronger farmer community</small>
            </div>
          </div>
        </div>

        <div className="mp-hero-photo" />
      </section>

      <div className="mp-layout">

        <section className="mp-market-main">

          <div className="mp-mode-tabs">
            <button
              className={mode === "buy" ? "selected" : ""}
              onClick={() => {
                setMode("buy");
                setCategory("All");
              }}
            >
              <ShoppingCart size={17} />
              Buy Farming Products
            </button>

            <button
              className={mode === "sell" ? "selected" : ""}
              onClick={() => {
                setMode("sell");
                setCategory("All");
              }}
            >
              <Sprout size={17} />
              Sell Your Produce
            </button>
          </div>

          {notice && (
            <div className="mp-notice">
              {notice}
              <button onClick={() => setNotice("")}>
                <X size={15} />
              </button>
            </div>
          )}

          <div className="mp-searchline">
            <label>
              <Search size={18} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={
                  mode === "buy"
                    ? "Search seeds, fertilizers, tools, equipment..."
                    : "Search crops, vegetables, grains, location..."
                }
              />
            </label>

            <button type="button">Search</button>
          </div>

          {mode === "buy" && (
            <div className="mp-cat-row">
              {categories.map(([name, Icon]) => (
                <button
                  key={name}
                  className={category === name ? "selected" : ""}
                  onClick={() => setCategory(name)}
                >
                  <Icon size={20} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mp-section-head">
            <h2>
              {mode === "buy"
                ? "Featured Products"
                : "Produce Listings"}
            </h2>

            <button
              onClick={() => {
                setCategory("All");
                setSearch("");
              }}
            >
              View all
            </button>
          </div>

          {shown.length > 0 ? (
            <div className="mp-product-grid">
              {shown.map(item => (
                <article className="mp-product" key={item.id}>

                  <div className="mp-product-img">
                    <img src={item.img} alt={item.name} />
                    {item.tag && <span>{item.tag}</span>}
                  </div>

                  <div className="mp-product-info">
                    <h3>{item.name}</h3>
                    <p className="mp-product-sub">{item.sub}</p>

                    <div className="mp-price">
                      {money(item.price)}
                      <small> / {item.unit}</small>
                    </div>

                    <div className="mp-meta">
                      <span>
                        <UserRound size={13} />
                        {item.seller}
                      </span>

                      <span>
                        <MapPin size={13} />
                        {item.location}
                      </span>
                    </div>

                    <div className="mp-rating">
                      <Star size={14} fill="currentColor" />
                      {item.rating}
                      {item.reviews ? ` (${item.reviews})` : ""}
                    </div>

                    <div className="mp-card-actions">
                      <button onClick={() => setModal(item)}>
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          setNotice(
                            "Cart and checkout need backend integration."
                          )
                        }
                      >
                        <ShoppingCart size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mp-empty">
              <Search size={25} />
              <b>No listings found</b>
              <span>Try another search or category.</span>
              <button onClick={() => {
                setCategory("All");
                setSearch("");
              }}>
                Clear filters
              </button>
            </div>
          )}

          <div className="mp-section-head mp-popular-head">
            <h2>Popular Categories</h2>
          </div>

          <div className="mp-popular-grid">
            {[
              ["Seeds", "Vegetable, paddy, cotton and more"],
              ["Fertilizers", "Organic & chemical fertilizers"],
              ["Farm Tools", "Sprayers, cutters, equipment"],
              ["Irrigation", "Drip, sprinkler, pipes & fittings"],
              ["Machinery", "Tractors, tillers, machines"],
              ["Organic Inputs", "Fertilizers, neem products"]
            ].map(([name, desc]) => (
              <button
                key={name}
                onClick={() => {
                  setMode("buy");
                  setCategory(name);
                }}
              >
                <span>
                  <b>{name}</b>
                  <small>{desc}</small>
                </span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </section>

        <aside className="mp-right">

          <section className="mp-list-card">
            <div className="mp-list-card-title">
              <span><Sprout size={25} /></span>
              <div>
                <h2>List Your Produce</h2>
                <p>Sell your farm produce directly to buyers.</p>
              </div>
            </div>

            <button
              className="mp-create"
              onClick={() => {
                setMode("sell");
                setModal("create");
              }}
            >
              <Plus size={19} />
              Create a Listing
            </button>

            <ul>
              <li><Check /> Get better market prices</li>
              <li><Check /> Connect with verified buyers</li>
              <li><Check /> Simple and free to list</li>
            </ul>
          </section>

          <section className="mp-trending-card">
            <div className="mp-trending-title">
              <h2>Trending Produce</h2>
              <button onClick={() => setMode("sell")}>
                View all
              </button>
            </div>

            {trending.map(([name, price, unit, place, demand, img]) => (
              <div className="mp-trend" key={name}>
                <img src={img} alt={name} />

                <div>
                  <b>{name}</b>
                  <strong>
                    ₹ {price} <small>{unit}</small>
                  </strong>
                  <span>{place}</span>
                </div>

                <em>{demand}</em>
              </div>
            ))}

            <p className="mp-price-note">
              Illustrative prices only — not live mandi rates.
            </p>
          </section>

          <section className="mp-side-tip">
            <Truck size={20} />
            <div>
              <b>Plan before you buy</b>
              <p>
                Confirm availability, quality, delivery and final price
                directly with the seller.
              </p>
            </div>
          </section>

        </aside>
      </div>

      {modal && (
        <div
          className="mp-modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section className="mp-modal">
            <button
              className="mp-modal-close"
              onClick={() => setModal(null)}
            >
              <X size={19} />
            </button>

            {modal === "how" ? (
              <>
                <h2>How Marketplace works</h2>
                <p>
                  Browse farming supplies, compare listed prices,
                  and review seller locations. Farmers can create
                  produce listings with their asking price and location.
                </p>
                <p className="mp-demo-note">
                  Seller verification, contact, checkout and live
                  market rates are not connected yet.
                </p>
                <button
                  className="mp-submit"
                  onClick={() => setModal(null)}
                >
                  Got it
                </button>
              </>
            ) : modal === "create" ? (
              <>
                <h2>Create a produce listing</h2>
                <p>Share what your farm has harvested.</p>

                <form onSubmit={submitListing}>
                  <label>
                    Produce name
                    <input
                      required
                      value={form.name}
                      onChange={e =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Fresh tomatoes"
                    />
                  </label>

                  <div className="mp-form-two">
                    <label>
                      Price (₹)
                      <input
                        required
                        type="number"
                        min="1"
                        value={form.price}
                        onChange={e =>
                          setForm({ ...form, price: e.target.value })
                        }
                        placeholder="Price"
                      />
                    </label>

                    <label>
                      Unit
                      <select
                        value={form.unit}
                        onChange={e =>
                          setForm({ ...form, unit: e.target.value })
                        }
                      >
                        <option>per kg</option>
                        <option>per quintal</option>
                        <option>per bag</option>
                        <option>per unit</option>
                      </select>
                    </label>
                  </div>

                  <label>
                    Farm / seller name
                    <input
                      value={form.seller}
                      onChange={e =>
                        setForm({ ...form, seller: e.target.value })
                      }
                      placeholder="Your name or farm"
                    />
                  </label>

                  <label>
                    Location
                    <input
                      value={form.location}
                      onChange={e =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="Village, district"
                    />
                  </label>

                  <p className="mp-demo-note">
                    Demo listings are kept in browser state only.
                    Server integration is required for permanent storage.
                  </p>

                  <button className="mp-submit" type="submit">
                    <Plus size={17} /> Publish listing
                  </button>
                </form>
              </>
            ) : (
              <>
                <img
                  className="mp-modal-product-img"
                  src={modal.img}
                  alt={modal.name}
                />

                <h2>{modal.name}</h2>

                <div className="mp-modal-price">
                  {money(modal.price)}
                  <small> / {modal.unit}</small>
                </div>

                <p>{modal.sub}</p>
                <p>
                  <MapPin size={15} /> {modal.location}
                  {" · "}Listed by {modal.seller}
                </p>

                <button
                  className="mp-submit"
                  onClick={() => {
                    setNotice(
                      "Seller contact and checkout need backend integration."
                    );
                    setModal(null);
                  }}
                >
                  Contact seller <ArrowRight size={16} />
                </button>
              </>
            )}
          </section>
        </div>
      )}

    </div>
  );
}