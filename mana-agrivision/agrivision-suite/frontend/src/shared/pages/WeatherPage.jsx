import { useEffect, useState } from 'react';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, MapPin, Search, Sun, Thermometer, Umbrella, Wind } from 'lucide-react';
import './WeatherPage.css';

const DEFAULT_CITY = 'Hyderabad';

/*
  Live data comes from Open-Meteo (free, no API key).
  Weather codes follow the WMO table: https://open-meteo.com/en/docs
*/
function describe(code) {
  if (code === 0) return { label: 'Clear sky', Icon: Sun };
  if (code === 1) return { label: 'Mostly clear', Icon: CloudSun };
  if (code === 2) return { label: 'Partly cloudy', Icon: CloudSun };
  if (code === 3) return { label: 'Overcast', Icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Fog', Icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', Icon: CloudRain };
  if (code >= 61 && code <= 67) return { label: 'Rain', Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: 'Snow', Icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: 'Rain showers', Icon: CloudRain };
  if (code >= 95) return { label: 'Thunderstorm', Icon: CloudLightning };
  return { label: 'Cloudy', Icon: Cloud };
}

async function fetchWeather(query) {
  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  if (!geoRes.ok) throw new Error('Could not look up that place. Try again.');
  const geo = await geoRes.json();
  const place = geo.results?.[0];
  if (!place) throw new Error(`No place found for "${query}". Check the spelling or try a nearby town.`);

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max' +
    '&timezone=auto&forecast_days=7';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather service is not responding. Try again in a moment.');
  const data = await res.json();

  return {
    place: [place.name, place.admin1].filter(Boolean).join(', '),
    current: data.current,
    daily: data.daily.time.map((date, i) => ({
      date,
      code: data.daily.weather_code[i],
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
      rainChance: data.daily.precipitation_probability_max[i],
      rainMm: data.daily.precipitation_sum[i],
      wind: data.daily.wind_speed_10m_max[i]
    }))
  };
}

// Simple, transparent rules based on the forecast numbers.
function buildAdvice(daily, current) {
  const today = daily[0];
  const next2Rain = (daily[0]?.rainMm || 0) + (daily[1]?.rainMm || 0);
  const wind = Math.max(current?.wind_speed_10m || 0, today?.wind || 0);

  const spraying =
    (today.rainChance ?? 0) >= 40 || wind >= 20
      ? { tone: 'warn', title: 'Avoid spraying today', text: wind >= 20 ? 'Strong wind can carry spray away from the crop.' : 'Rain could wash the spray off the leaves.' }
      : { tone: 'good', title: 'Good time to spray', text: 'Wind is light and rain chance is low today.' };

  let irrigation;
  if (next2Rain >= 5) irrigation = { tone: 'warn', title: 'Hold off watering', text: `About ${Math.round(next2Rain)} mm of rain expected in the next 2 days.` };
  else if (today.max >= 36) irrigation = { tone: 'info', title: 'Water early or late', text: 'It will be hot. Irrigate in the early morning or evening.' };
  else irrigation = { tone: 'good', title: 'Irrigate as planned', text: 'No significant rain is expected soon.' };

  let field;
  if ((today.rainChance ?? 0) >= 60) field = { tone: 'warn', title: 'Rain likely today', text: 'Keep harvested produce and inputs covered.' };
  else if (today.max >= 38) field = { tone: 'warn', title: 'Heat caution', text: 'Do heavy field work in the morning and rest in the afternoon.' };
  else field = { tone: 'info', title: 'Good for field work', text: 'Conditions look fine. Start early to make the most of the day.' };

  return [
    { key: 'spray', label: 'Spraying', ...spraying },
    { key: 'irrigation', label: 'Irrigation', ...irrigation },
    { key: 'field', label: 'Field work', ...field }
  ];
}

const dayName = (iso, i) => (i === 0 ? 'Today' : new Date(iso).toLocaleDateString('en-IN', { weekday: 'short' }));
const round = (n) => (n == null ? '—' : Math.round(n));

export default function WeatherPage() {
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(city) {
    setLoading(true);
    setError('');
    try {
      setWeather(await fetchWeather(city));
    } catch (err) {
      setError(err.message || 'Could not load the weather.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(DEFAULT_CITY); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) load(query.trim());
  }

  const current = weather?.current;
  const today = weather?.daily?.[0];
  const now = current ? describe(current.weather_code) : null;
  const advice = weather ? buildAdvice(weather.daily, current) : [];

  return (
    <div className="wx">
      <div className="wx-head">
        <div>
          <span className="wx-eyebrow">LOCAL CONDITIONS</span>
          <h1>Weather insights</h1>
          <p>Check conditions before planning farm work.</p>
        </div>
        <form className="wx-search" onSubmit={handleSubmit} role="search">
          <label className="wx-sr" htmlFor="wx-city">Search your village or city</label>
          <div className="wx-input">
            <Search size={16} aria-hidden="true" />
            <input id="wx-city" type="text" placeholder="Search your village or city" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button type="submit" className="wx-btn" disabled={loading}>{loading ? 'Loading…' : 'Search'}</button>
        </form>
      </div>

      {error && <div className="wx-banner" role="alert">{error}</div>}

      {loading && !weather && <div className="wx-card wx-loading">Loading the forecast…</div>}

      {weather && (
        <>
          <div className="wx-top">
            <section className="wx-hero" aria-label="Current weather">
              <div className="wx-place"><MapPin size={15} aria-hidden="true" /> {weather.place}</div>
              <div className="wx-now">
                <now.Icon size={56} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <div className="wx-temp">{round(current.temperature_2m)}°C</div>
                  <div className="wx-desc">{now.label} · feels like {round(current.apparent_temperature)}°C</div>
                </div>
              </div>
              <div className="wx-range">
                <Thermometer size={15} aria-hidden="true" /> High {round(today.max)}° · Low {round(today.min)}°
              </div>
            </section>

            <div className="wx-stats">
              <div className="wx-stat"><small><Droplets size={14} aria-hidden="true" /> Humidity</small><b>{round(current.relative_humidity_2m)}%</b></div>
              <div className="wx-stat"><small><Wind size={14} aria-hidden="true" /> Wind</small><b>{round(current.wind_speed_10m)} km/h</b></div>
              <div className="wx-stat"><small><Umbrella size={14} aria-hidden="true" /> Rain chance</small><b>{round(today.rainChance)}%</b></div>
              <div className="wx-stat"><small><CloudRain size={14} aria-hidden="true" /> Rain today</small><b>{round(today.rainMm)} mm</b></div>
            </div>
          </div>

          <section className="wx-card wx-forecast" aria-labelledby="wx-forecast-title">
            <h2 id="wx-forecast-title">7-day forecast</h2>
            <div className="wx-days">
              {weather.daily.map((d, i) => {
                const { Icon, label } = describe(d.code);
                return (
                  <div key={d.date} className={`wx-day ${i === 0 ? 'wx-day-today' : ''}`} title={label}>
                    <span className="wx-day-name">{dayName(d.date, i)}</span>
                    <Icon size={24} strokeWidth={1.75} aria-label={label} />
                    <b>{round(d.max)}°</b>
                    <span className="wx-day-min">{round(d.min)}°</span>
                    <span className="wx-day-rain"><Droplets size={11} aria-hidden="true" /> {round(d.rainChance)}%</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="wx-advice-title">
            <h2 id="wx-advice-title" className="wx-section-title">Farm advice for today</h2>
            <div className="wx-advice">
              {advice.map((a) => (
                <article key={a.key} className={`wx-tip wx-tip-${a.tone}`}>
                  <small>{a.label}</small>
                  <b>{a.title}</b>
                  <p>{a.text}</p>
                </article>
              ))}
            </div>
            <p className="wx-note">Advice is based on forecast numbers only. For high-value decisions, also check local advice from an agricultural expert.</p>
          </section>
        </>
      )}
    </div>
  );
}