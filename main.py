from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
from services import get_dashboard_data
import os

app = FastAPI(title="COVID-19 Dashboard Colombia")

# Setup templates
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# API Endpoint
@app.get("/api/data")
async def api_data(city: str = None, gender: str = None, department: str = None):
    data = get_dashboard_data(city=city, gender=gender, department=department)
    return data

# Frontend Route
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

