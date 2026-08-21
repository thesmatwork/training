import requests
from fastapi import FastAPI
app = FastAPI()
api_key = "c74c1ad229b52a9831ae12898c1f4797"
@app.get("/weather")
def get_weather(city: str):
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }
    response = requests.get(url, params=params)
    data = response.json()
    temperature = data["main"]["temp"]
    return {
        "city": city,
        "temperature": temperature
    }
