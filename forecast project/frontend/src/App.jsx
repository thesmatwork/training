import { useState } from "react";
function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  async function getWeather() {
    const response = await fetch("http://127.0.0.1:8000/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: city,
      }),
    });

    const data = await response.json();

    setWeather(data);
  }

  return (
    <div>
      <h1>🌤️ Weather App</h1>

      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <button onClick={getWeather}>
        Get Weather
      </button>

      {weather && (
        <div>
          <h2>{weather.city}</h2>
          <p>Temperature: {weather.temperature} °C</p>
        </div>
      )}
    </div>
  );
}
export default App;