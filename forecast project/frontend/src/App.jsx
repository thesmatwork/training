import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeather(e) {
    e.preventDefault();

    const enteredCity = city.trim();

    // Check if input is empty
    if (!enteredCity) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    // Allow only letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(enteredCity)) {
      setError("");

      // Create invalid weather result
      // so it appears in the bottom card
      setWeather({
        city: enteredCity,
        temperature: "city not found",
      });

      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/weather",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            city: enteredCity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to get weather information."
        );
      }

      const data = await response.json();

      // Save response from FastAPI
      setWeather(data);

    } catch (err) {
      setError(
        "Could not fetch weather. Please check your city and try again."
      );

      setWeather(null);

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="weather-app">

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <section className="weather-container">

        {/* ================= HEADER ================= */}

        <header className="header">

          <div className="logo">

            <span className="logo-icon">
              ☁️
            </span>

            <span>
              Weatherly
            </span>

          </div>

          <p className="subtitle">
            Simple weather, beautifully presented.
          </p>

        </header>


        {/* ================= HERO SECTION ================= */}

        <section className="hero-section">

          <div className="hero-content">

            <span className="eyebrow">
              WEATHER FORECAST
            </span>

            <h1>
              Know your weather.
              <br />
              <span>
                Plan your day.
              </span>
            </h1>

            <p className="hero-description">
              Enter a city below to get the latest weather information.
            </p>


            {/* Search Form */}

            <form
              className="search-box"
              onSubmit={getWeather}
            >

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Searching..."
                  : "Search"}
              </button>

            </form>


            {/* Error message for empty input or network error */}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

          </div>


          {/* Weather Illustration */}

          <div className="weather-illustration">

            <div className="sun"></div>

            <div className="cloud cloud-one">
              ☁
            </div>

            <div className="cloud cloud-two">
              ☁
            </div>

            <div className="rain">
              ••••••
            </div>

          </div>

        </section>


        {/* ================= LOADING ================= */}

        {loading && (

          <div className="loading-card">

            <div className="spinner"></div>

            <span>
              Getting weather data...
            </span>

          </div>

        )}


        {/* ================= WEATHER CARD ================= */}

        {weather && !loading && (

          <section className="weather-card">

            {/* Check if temperature is a number */}

            {typeof weather.temperature === "number" ? (

              <>
                {/* ================= VALID CITY ================= */}

                <div className="weather-card-top">

                  <div>

                    <span className="location-label">
                      CURRENT WEATHER
                    </span>

                    <h2>
                      {weather.city}
                    </h2>

                  </div>

                  <div className="weather-icon">
                    🌤️
                  </div>

                </div>


                {/* Temperature */}

                <div className="temperature">

                  {weather.temperature}

                  <span>
                    °C
                  </span>

                </div>


                <p className="weather-status">
                  Current temperature
                </p>


                {/* Weather Details */}

                <div className="weather-details">


                  {/* Temperature */}

                  <div className="detail">

                    <span className="detail-icon">
                      🌡️
                    </span>

                    <div>

                      <small>
                        Temperature
                      </small>

                      <strong>
                        {weather.temperature} °C
                      </strong>

                    </div>

                  </div>


                  {/* Location */}

                  <div className="detail">

                    <span className="detail-icon">
                      📍
                    </span>

                    <div>

                      <small>
                        Location
                      </small>

                      <strong>
                        {weather.city}
                      </strong>

                    </div>

                  </div>


                  {/* Status */}

                  <div className="detail">

                    <span className="detail-icon">
                      ☀️
                    </span>

                    <div>

                      <small>
                        Status
                      </small>

                      <strong>
                        Available
                      </strong>

                    </div>

                  </div>

                </div>

              </>

            ) : (

              <>
                {/* ================= INVALID CITY ================= */}

                <div className="temperature">
                  City not found
                </div>

                <p className="weather-status">
                  Please enter a valid city name.
                </p>

              </>

            )}

          </section>

        )}


        {/* ================= EMPTY STATE ================= */}

        {!weather && !loading && !error && (

          <section className="empty-state">

            <div className="empty-icon">
              🌍
            </div>

            <h3>
              Search for a city
            </h3>

            <p>
              Discover the current weather conditions for any city.
            </p>

          </section>

        )}

      </section>

    </main>
  );
}

export default App;