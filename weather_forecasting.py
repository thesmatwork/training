import requests
city=input("enter city name: ")
api_key="c74c1ad229b52a9831ae12898c1f4797"
url = "https://api.openweathermap.org/data/2.5/weather"
params = {
    "q": city,
    "appid": api_key,
    "units": "metric"
}
response = requests.get(url, params=params)
data = response.json()
temperature = data["main"]["temp"]
print("Temperature:", temperature, "°C")