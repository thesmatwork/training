import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
api_key = "c74c1ad229b52a9831ae12898c1f4797"
class WeatherRequest(BaseModel):
    city: str
@app.post("/weather")
def get_weather(request: WeatherRequest):

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "q": request.city,
        "appid": api_key,
        "units": "metric"
    }
    response = requests.get(url, params=params)
    data = response.json()
    print(data)
    temperature = data["main"]["temp"]
    return {
        "city": request.city,
        "temperature": temperature
    }