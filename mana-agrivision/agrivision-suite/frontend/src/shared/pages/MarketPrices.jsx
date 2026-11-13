import { useCallback, useEffect, useMemo, useState } from "react";



import {

  Search,

  RefreshCw,

  Download,

  Star,

  TrendingUp,

  TrendingDown,

  MapPin,

  CalendarDays,

  Sprout,

  BarChart3,

  ArrowUpRight,

  ArrowDownRight,

  Filter,

  IndianRupee,

  Clock3,

  AlertCircle,

  X,

  CheckCircle2,

} from "lucide-react";



import { api } from "../services/api.js";



import "./MarketPrices.css";



const INDIAN_STATES = [

  "Andhra Pradesh",



  "Arunachal Pradesh",



  "Assam",



  "Bihar",



  "Chhattisgarh",



  "Goa",



  "Gujarat",



  "Haryana",



  "Himachal Pradesh",



  "Jharkhand",



  "Karnataka",



  "Kerala",



  "Madhya Pradesh",



  "Maharashtra",



  "Manipur",



  "Meghalaya",



  "Mizoram",



  "Nagaland",



  "Odisha",



  "Punjab",



  "Rajasthan",



  "Sikkim",



  "Tamil Nadu",



  "Telangana",



  "Tripura",



  "Uttar Pradesh",



  "Uttarakhand",



  "West Bengal",



  "Andaman and Nicobar Islands",



  "Chandigarh",



  "Dadra and Nagar Haveli and Daman and Diu",



  "Delhi",



  "Jammu and Kashmir",



  "Ladakh",



  "Lakshadweep",



  "Puducherry",

];



const CATEGORIES = [

  "All crops",



  "Food Grains",



  "Vegetables",



  "Fruits",



  "Pulses",



  "Oilseeds",



  "Spices",



  "Commercial Crops",

];



const CATEGORY_CROPS = {

  "Food Grains": [

    "paddy",

    "rice",

    "wheat",

    "maize",

    "corn",

    "jowar",



    "sorghum",

    "bajra",

    "pearl millet",

    "ragi",

    "finger millet",



    "barley",

    "millet",

  ],



  Vegetables: [

    "tomato",

    "potato",

    "onion",

    "brinjal",

    "eggplant",



    "cabbage",

    "cauliflower",

    "carrot",

    "beans",

    "okra",



    "bhindi",

    "chilli",

    "cucumber",

    "bitter gourd",



    "bottle gourd",

    "pumpkin",

    "drumstick",

    "peas",



    "capsicum",

    "garlic",

  ],



  Fruits: [

    "mango",

    "banana",

    "apple",

    "grapes",

    "orange",



    "papaya",

    "guava",

    "pomegranate",

    "watermelon",



    "muskmelon",

    "pineapple",

    "lemon",

    "sweet lime",



    "sapota",

    "jackfruit",

  ],



  Pulses: [

    "red gram",

    "tur",

    "arhar",

    "pigeon pea",

    "gram",



    "chana",

    "chickpea",

    "bengal gram",

    "black gram",



    "urad",

    "green gram",

    "moong",

    "lentil",

    "masoor",



    "horse gram",

    "cowpea",

  ],



  Oilseeds: [

    "groundnut",

    "peanut",

    "soybean",

    "soyabean",



    "mustard",

    "sesame",

    "gingelly",

    "sunflower",



    "safflower",

    "castor",

    "linseed",

  ],



  Spices: [

    "turmeric",

    "red chilli",

    "dry chilli",

    "pepper",



    "cardamom",

    "cumin",

    "jeera",

    "coriander",



    "fenugreek",

    "ginger",

    "garlic",

    "cloves",

  ],



  "Commercial Crops": [

    "cotton",

    "sugarcane",

    "jute",

    "tobacco",



    "arecanut",

    "rubber",

    "tea",

    "coffee",



    "copra",

    "coconut",

  ],

};



const formatINR = (value) =>

  new Intl.NumberFormat("en-IN", {

    style: "currency",



    currency: "INR",



    maximumFractionDigits: 0,

  }).format(Number(value) || 0);



function formatDate(value) {

  if (!value) return "Date unavailable";



  // data.gov.in commonly returns DD/MM/YYYY.



  let parsed;



  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {

    const [day, month, year] = value.split("/");



    parsed = new Date(`${year}-${month}-${day}T00:00:00`);

  } else {

    parsed = new Date(value);

  }



  if (Number.isNaN(parsed.getTime())) return value;



  return parsed.toLocaleDateString("en-IN", {

    day: "2-digit",



    month: "short",



    year: "numeric",

  });

}



function normalizeRecord(row, index) {

  return {

    id: row.id ?? `${row.commodity}-${row.market}-${row.arrival_date}-${index}`,



    crop: row.crop ?? row.commodity ?? "Unknown crop",



    variety: row.variety ?? "—",



    grade: row.grade ?? "—",



    market: row.market ?? row.market_name ?? "—",



    district: row.district ?? "—",



    state: (row.state === "Keralam" ? "Kerala" : row.state) ?? "—",



    min: Number(row.min ?? row.min_price ?? 0),



    max: Number(row.max ?? row.max_price ?? 0),



    modal: Number(row.modal ?? row.modal_price ?? 0),



    previous: Number(row.previous ?? row.previous_price ?? 0),



    unit: row.unit ?? "Quintal",



    date: row.date ?? row.arrival_date ?? row.price_date ?? "",

  };

}



function getCropCategory(cropName) {

  const crop = String(cropName || "").toLowerCase();



  for (const [category, names] of Object.entries(CATEGORY_CROPS)) {

    if (names.some((name) => crop.includes(name))) {

      return category;

    }

  }



  return "Other";

}



function PriceChange({ current, previous }) {

  if (!previous) {

    return <span className="mp-change neutral">Not available</span>;

  }



  const difference = current - previous;



  const percent = (difference / previous) * 100;



  const isUp = difference >= 0;



  const Icon = isUp ? ArrowUpRight : ArrowDownRight;



  return (

    <span className={`mp-change ${isUp ? "positive" : "negative"}`}>

      <Icon size={15} />

      {Math.abs(percent).toFixed(1)}%

    </span>

  );

}



export default function MarketPrices() {

  const [prices, setPrices] = useState([]);



  const [loading, setLoading] = useState(true);



  const [error, setError] = useState("");



  const [notice, setNotice] = useState("");



  const [search, setSearch] = useState("");



  const [categoryFilter, setCategoryFilter] = useState("All crops");



  const [cropFilter, setCropFilter] = useState("All crops");



  const [stateFilter, setStateFilter] = useState("All states");



  const [districtFilter, setDistrictFilter] = useState("All districts");



  const [marketFilter, setMarketFilter] = useState("All markets");



  const [sortBy, setSortBy] = useState("modal");



  const [sortDirection, setSortDirection] = useState("desc");



  const [watchlist, setWatchlist] = useState([]);



  const [watchlistOnly, setWatchlistOnly] = useState(false);



  const loadPrices = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      // Load every page so crop, district and market dropdowns are built
      // from the complete dataset rather than only the first 10 records.
      const pageSize = 500;
      let offset = 0;
      let total = Infinity;
      let allRows = [];
      let source = "market API";

      while (offset < total) {
        const params = new URLSearchParams();
        params.set("limit", String(pageSize));
        params.set("offset", String(offset));

        // The backend supports state filtering. District/crop/market filters
        // are applied client-side after all records for the selected state load.
        if (stateFilter !== "All states") {
          params.set("state", stateFilter === "Kerala" ? "Keralam" : stateFilter);
        }

        const result = await api(`/api/v1/market/prices?${params.toString()}`);
        const rows = Array.isArray(result)
          ? result
          : (result?.items ?? result?.prices ?? result?.data ?? []);

        if (!Array.isArray(rows)) {
          throw new Error("The market API returned an unexpected response.");
        }

        allRows = allRows.concat(rows);
        source = result?.source || source;

        if (Array.isArray(result)) {
          if (rows.length < pageSize) break;
        } else {
          const reportedTotal = Number(result?.total);
          if (Number.isFinite(reportedTotal)) {
            total = reportedTotal;
          } else if (result?.has_more === true) {
            total = offset + rows.length + 1;
          } else {
            total = offset + rows.length;
          }

          if (rows.length === 0 || result?.has_more === false) break;
        }

        offset += rows.length;
        if (rows.length < pageSize && offset >= total) break;
        if (rows.length === 0) break;
      }

      // Deduplicate records in case the upstream dataset changes between pages.
      const seen = new Set();
      const uniqueRows = allRows.filter((row, index) => {
        const key = [
          row.id ?? "",
          row.commodity ?? row.crop ?? "",
          row.market ?? row.market_name ?? "",
          row.district ?? "",
          row.state ?? "",
          row.arrival_date ?? row.date ?? "",
          row.modal_price ?? row.modal ?? "",
        ].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setPrices(uniqueRows.map(normalizeRecord));
      setNotice(
        `Loaded ${uniqueRows.length.toLocaleString("en-IN")} market records from ${source}.`,
      );
    } catch (err) {
      setPrices([]);
      setError(
        err.message || "Unable to load market prices. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }, [stateFilter]);


  const loadWatchlist = useCallback(async () => {

    try {

      const result = await api("/api/v1/market/watchlist");



      setWatchlist(Array.isArray(result) ? result : []);

    } catch (err) {

      console.error("Watchlist could not be loaded:", err.message);

    }

  }, []);



  useEffect(() => {

    loadPrices();

  }, [loadPrices]);



  useEffect(() => {

    loadWatchlist();

  }, [loadWatchlist]);



  const uniqueValues = (items, field) =>

    [

      ...new Set(

        items



          .map((item) => item[field])



          .filter((value) => value && value !== "—"),

      ),

    ].sort((a, b) => a.localeCompare(b));



  const districts = useMemo(() => {

    const rows =

      stateFilter === "All states"

        ? prices

        : prices.filter((item) => item.state === stateFilter);



    return uniqueValues(rows, "district");

  }, [prices, stateFilter]);



  const markets = useMemo(() => {

    const rows = prices.filter((item) => {

      const stateMatches =

        stateFilter === "All states" || item.state === stateFilter;



      const districtMatches =

        districtFilter === "All districts" || item.district === districtFilter;



      return stateMatches && districtMatches;

    });



    return uniqueValues(rows, "market");

  }, [prices, stateFilter, districtFilter]);



  const crops = useMemo(

    () => uniqueValues(prices, "crop"),



    [prices],

  );



  const filteredPrices = useMemo(() => {

    const query = search.trim().toLowerCase();



    return prices



      .filter((item) => {

        const searchable = [

          item.crop,



          item.variety,



          item.market,



          item.district,



          item.state,

        ]

          .join(" ")

          .toLowerCase();



        const searchMatches = searchable.includes(query);



        const categoryMatches =

          categoryFilter === "All crops" ||

          getCropCategory(item.crop) === categoryFilter;



        const cropMatches =

          cropFilter === "All crops" || item.crop === cropFilter;



        const stateMatches =

          stateFilter === "All states" || item.state === stateFilter;



        const districtMatches =

          districtFilter === "All districts" ||

          item.district === districtFilter;



        const marketMatches =

          marketFilter === "All markets" || item.market === marketFilter;



        const watchMatches =

          !watchlistOnly ||

          watchlist.some((saved) => saved.crop_name === item.crop);



        return (

          searchMatches &&

          categoryMatches &&

          cropMatches &&

          stateMatches &&

          districtMatches &&

          marketMatches &&

          watchMatches

        );

      })



      .sort((a, b) => {

        const first = a[sortBy];



        const second = b[sortBy];



        const comparison =

          typeof first === "number" && typeof second === "number"

            ? first - second

            : String(first ?? "").localeCompare(String(second ?? ""));



        return sortDirection === "asc" ? comparison : -comparison;

      });

  }, [

    prices,



    search,



    categoryFilter,



    cropFilter,



    stateFilter,



    districtFilter,



    marketFilter,



    watchlistOnly,



    watchlist,



    sortBy,



    sortDirection,

  ]);



  const averagePrice = filteredPrices.length

    ? filteredPrices.reduce((sum, item) => sum + item.modal, 0) /

      filteredPrices.length

    : 0;



  const risingCount = filteredPrices.filter(

    (item) => item.previous && item.modal > item.previous,

  ).length;



  async function toggleWatchlist(item) {

    const saved = watchlist.find(

      (entry) =>

        entry.crop_name === item.crop &&

        entry.state === item.state &&

        entry.district === item.district &&

        entry.market_name === item.market,

    );



    try {

      if (saved) {

        await api(`/api/v1/market/watchlist/${saved.id}`, {

          method: "DELETE",

        });



        setWatchlist((current) =>

          current.filter((entry) => entry.id !== saved.id),

        );



        setNotice(`${item.crop} removed from your watchlist.`);

      } else {

        const created = await api("/api/v1/market/watchlist", {

          method: "POST",



          body: JSON.stringify({

            crop_name: item.crop,



            state: item.state,



            district: item.district,



            market_name: item.market,

          }),

        });



        setWatchlist((current) => [...current, created]);



        setNotice(`${item.crop} added to your watchlist.`);

      }

    } catch (err) {

      setError(err.message || "Unable to update watchlist.");

    }

  }



  function isWatched(item) {

    return watchlist.some(

      (entry) =>

        entry.crop_name === item.crop &&

        entry.state === item.state &&

        entry.district === item.district &&

        entry.market_name === item.market,

    );

  }



  function handleSort(field) {

    if (sortBy === field) {

      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));

    } else {

      setSortBy(field);



      setSortDirection(

        ["crop", "market", "state"].includes(field) ? "asc" : "desc",

      );

    }

  }



  function clearFilters() {

    setSearch("");



    setCategoryFilter("All crops");



    setCropFilter("All crops");



    setStateFilter("All states");



    setDistrictFilter("All districts");



    setMarketFilter("All markets");



    setWatchlistOnly(false);

  }



  function exportCSV() {

    if (!filteredPrices.length) {

      setNotice("No market records are available to export.");



      return;

    }



    const columns = [

      ["Crop", "crop"],



      ["Category", "category"],



      ["Variety", "variety"],



      ["Market", "market"],



      ["District", "district"],



      ["State", "state"],



      ["Minimum price", "min"],



      ["Maximum price", "max"],



      ["Modal price", "modal"],



      ["Unit", "unit"],



      ["Arrival date", "date"],

    ];



    const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;



    const csv = [

      columns.map(([label]) => escapeCSV(label)).join(","),



      ...filteredPrices.map((row) =>

        columns

          .map(([, key]) => {

            const value =

              key === "category" ? getCropCategory(row.crop) : row[key];



            return escapeCSV(value);

          })

          .join(","),

      ),

    ].join("\r\n");



    const blob = new Blob(["\uFEFF", csv], {

      type: "text/csv;charset=utf-8;",

    });



    const url = URL.createObjectURL(blob);



    const anchor = document.createElement("a");



    anchor.href = url;



    anchor.download = "mana-polam-market-prices.csv";



    document.body.appendChild(anchor);



    anchor.click();



    anchor.remove();



    URL.revokeObjectURL(url);



    setNotice("Market prices CSV downloaded.");

  }



  return (

    <main className="mp-market">

      <header className="mp-page-header">

        <div>

          <div className="mp-eyebrow">

            <Sprout size={15} /> MANA POLAM TOOLS

          </div>



          <h1>Market prices</h1>



          <p>

            Explore crop prices across Indian states, districts and agricultural

            markets.

          </p>

        </div>



        <div className="mp-header-actions">

          <button

            type="button"

            className="mp-btn mp-btn-secondary"

            onClick={exportCSV}

          >

            <Download size={16} /> Export CSV

          </button>



          <button

            type="button"

            className="mp-btn mp-btn-primary"

            onClick={loadPrices}

            disabled={loading}

          >

            <RefreshCw size={16} className={loading ? "mp-spinning" : ""} />



            {loading ? "Refreshing..." : "Refresh prices"}

          </button>

        </div>

      </header>



      <div className="mp-source-note">

        <AlertCircle size={17} />



        <span>

          Prices are retrieved from data.gov.in. Availability depends on the

          government data service and its latest records.

        </span>

      </div>



      {notice && (

        <div className="mp-notice" role="status">

          <CheckCircle2 size={17} />



          <span>{notice}</span>



          <button

            type="button"

            aria-label="Dismiss notice"

            onClick={() => setNotice("")}

          >

            <X size={15} />

          </button>

        </div>

      )}



      {error && (

        <div className="mp-error" role="alert">

          <AlertCircle size={18} />



          <div>

            <strong>Could not load market data</strong>



            <p>{error}</p>



            <button

              type="button"

              className="mp-text-button"

              onClick={loadPrices}

            >

              Try again

            </button>

          </div>

        </div>

      )}



      <section className="mp-stats-grid" aria-label="Market summary">

        <article className="mp-stat-card">

          <div className="mp-stat-top">

            <span className="mp-stat-icon green">

              <IndianRupee size={19} />

            </span>



            <span className="mp-stat-label">Average modal price</span>

          </div>



          <h2>{formatINR(averagePrice)}</h2>



          <p>Per quintal · Current filters</p>

        </article>



        <article className="mp-stat-card">

          <div className="mp-stat-top">

            <span className="mp-stat-icon blue">

              <BarChart3 size={19} />

            </span>



            <span className="mp-stat-label">Market records</span>

          </div>



          <h2>{filteredPrices.length}</h2>



          <p>Matching government records</p>

        </article>



        <article className="mp-stat-card">

          <div className="mp-stat-top">

            <span className="mp-stat-icon amber">

              <TrendingUp size={19} />

            </span>



            <span className="mp-stat-label">Prices rising</span>

          </div>



          <h2>{risingCount}</h2>



          <p>Only where previous price exists</p>

        </article>



        <article className="mp-stat-card">

          <div className="mp-stat-top">

            <span className="mp-stat-icon purple">

              <Star size={19} />

            </span>



            <span className="mp-stat-label">Watchlist items</span>

          </div>



          <h2>{watchlist.length}</h2>



          <p>Saved crop and market combinations</p>

        </article>

      </section>



      <section className="mp-panel mp-filters-panel">

        <div className="mp-section-title">

          <div>

            <h2>

              <Filter size={18} /> Find market prices

            </h2>



            <p>Select a state, district, market and crop category.</p>

          </div>



          <button

            type="button"

            className="mp-text-button"

            onClick={clearFilters}

          >

            Clear all

          </button>

        </div>



        <div className="mp-filter-grid">

          <label className="mp-search-field">

            <span>Search crop or market</span>



            <div className="mp-input-with-icon">

              <Search size={17} />



              <input

                type="search"

                placeholder="Search crop, district or mandi..."

                value={search}

                onChange={(event) => setSearch(event.target.value)}

              />

            </div>

          </label>



          <label>

            <span>Crop category</span>



            <select

              value={categoryFilter}

              onChange={(event) => setCategoryFilter(event.target.value)}

            >

              {CATEGORIES.map((category) => (

                <option key={category} value={category}>

                  {category}

                </option>

              ))}

            </select>

          </label>



          <label>

            <span>Crop</span>



            <select

              value={cropFilter}

              onChange={(event) => setCropFilter(event.target.value)}

            >

              <option value="All crops">All crops</option>



              {crops.map((crop) => (

                <option key={crop} value={crop}>

                  {crop}

                </option>

              ))}

            </select>

          </label>



          <label>

            <span>State / UT</span>



            <select

              value={stateFilter}

              onChange={(event) => {

                setStateFilter(event.target.value);



                setDistrictFilter("All districts");



                setMarketFilter("All markets");

              }}

            >

              <option value="All states">All states and UTs</option>



              {INDIAN_STATES.map((state) => (

                <option key={state} value={state}>

                  {state}

                </option>

              ))}

            </select>

          </label>



          <label>

            <span>District</span>



            <select

              value={districtFilter}

              onChange={(event) => {

                setDistrictFilter(event.target.value);



                setMarketFilter("All markets");

              }}

              disabled={stateFilter === "All states" || districts.length === 0}

            >

              <option value="All districts">All districts</option>



              {districts.map((district) => (

                <option key={district} value={district}>

                  {district}

                </option>

              ))}

            </select>

          </label>



          <label>

            <span>Available mandi</span>



            <select

              value={marketFilter}

              onChange={(event) => setMarketFilter(event.target.value)}

              disabled={markets.length === 0}

            >

              <option value="All markets">All available markets</option>



              {markets.map((market) => (

                <option key={market} value={market}>

                  {market}

                </option>

              ))}

            </select>

          </label>

        </div>



        <div className="mp-filter-footer">

          <span>

            <MapPin size={15} />

            Showing {filteredPrices.length} of {prices.length} loaded records

          </span>



          <label className="mp-watch-toggle">

            <input

              type="checkbox"

              checked={watchlistOnly}

              onChange={(event) => setWatchlistOnly(event.target.checked)}

            />

            <Star size={15} /> Watchlist only

          </label>

        </div>

      </section>



      <section className="mp-panel mp-table-panel">

        <div className="mp-section-title">

          <div>

            <h2>Crop price comparison</h2>



            <p>Compare minimum, maximum and modal mandi prices.</p>

          </div>



          <span className="mp-record-pill">

            {filteredPrices.length} records

          </span>

        </div>



        <div className="mp-table-scroll">

          <table className="mp-price-table">

            <thead>

              <tr>

                <th scope="col">Watch</th>



                <th scope="col">

                  <button type="button" onClick={() => handleSort("crop")}>

                    Crop

                  </button>

                </th>



                <th scope="col">

                  <button type="button" onClick={() => handleSort("state")}>

                    State / District

                  </button>

                </th>



                <th scope="col">

                  <button type="button" onClick={() => handleSort("market")}>

                    Market

                  </button>

                </th>



                <th scope="col">

                  <button type="button" onClick={() => handleSort("min")}>

                    Min. price

                  </button>

                </th>



                <th scope="col">

                  <button type="button" onClick={() => handleSort("max")}>

                    Max. price

                  </button>

                </th>



                <th scope="col">

                  <button type="button" onClick={() => handleSort("modal")}>

                    Modal price

                  </button>

                </th>



                <th scope="col">Change</th>



                <th scope="col">Arrival date</th>

              </tr>

            </thead>



            <tbody>

              {filteredPrices.map((item) => (

                <tr key={item.id}>

                  <td>

                    <button

                      type="button"

                      className={`mp-star-button ${

                        isWatched(item) ? "active" : ""

                      }`}

                      aria-label={

                        isWatched(item)

                          ? `Remove ${item.crop} from watchlist`

                          : `Add ${item.crop} to watchlist`

                      }

                      onClick={() => toggleWatchlist(item)}

                    >

                      <Star

                        size={17}

                        fill={isWatched(item) ? "currentColor" : "none"}

                      />

                    </button>

                  </td>



                  <td>

                    <div className="mp-crop-name">{item.crop}</div>



                    <span className="mp-table-sub">

                      {item.variety} · {getCropCategory(item.crop)}

                    </span>

                  </td>



                  <td>

                    <div className="mp-market-name">{item.state}</div>



                    <span className="mp-table-sub">{item.district}</span>

                  </td>



                  <td>

                    <div className="mp-market-name">{item.market}</div>



                    <span className="mp-table-sub">{item.grade}</span>

                  </td>



                  <td>{formatINR(item.min)}</td>



                  <td>{formatINR(item.max)}</td>



                  <td>

                    <strong className="mp-modal-price">

                      {formatINR(item.modal)}

                    </strong>



                    <span className="mp-table-sub">

                      / {item.unit.toLowerCase()}

                    </span>

                  </td>



                  <td>

                    <PriceChange

                      current={item.modal}

                      previous={item.previous}

                    />

                  </td>



                  <td>{formatDate(item.date)}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>



        {loading && (

          <div className="mp-empty-state">

            <RefreshCw size={28} className="mp-spinning" />



            <h3>Loading mandi prices</h3>



            <p>Fetching records from the government market data service.</p>

          </div>

        )}



        {!loading && !filteredPrices.length && (

          <div className="mp-empty-state">

            <Search size={30} />



            <h3>No matching market records</h3>



            <p>

              Try another crop or location. The selected market may not have a

              record in the available data.

            </p>



            <button

              type="button"

              className="mp-btn mp-btn-secondary"

              onClick={clearFilters}

            >

              Clear filters

            </button>

          </div>

        )}



        <div className="mp-table-footer">

          <span>

            <Clock3 size={14} /> Arrival dates are shown when supplied by the

            data provider.

          </span>



          <span>Prices in Indian rupees (₹)</span>

        </div>

      </section>



      <footer className="mp-disclaimer">

        <AlertCircle size={16} />



        <p>

          <strong>Before selling:</strong> Verify the latest prices with your

          local regulated market. Prices can vary by crop variety, grade,

          quality, transport costs and commissions. Category labels are based on

          crop-name matching and may need adjustment for local crop names.

        </p>

      </footer>

    </main>

  );

}
