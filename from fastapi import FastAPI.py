from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
def hello(name: str = "gowtham"):
    return {
        "message": "Hello " + name
    }