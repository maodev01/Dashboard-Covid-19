import pandas as pd
import requests
from io import StringIO

DATA_URL = "https://www.datos.gov.co/resource/gt2j-8ykr.json?$limit=20000"

def fetch_covid_data():
    """
    Fetches COVID-19 data from the Colombian Open Data Portal.
    Returns a pandas DataFrame.
    """
    try:
        response = requests.get(DATA_URL)
        response.raise_for_status()
        data = response.json()
        df = pd.DataFrame(data)
        return df
    except Exception as e:
        print(f"Error fetching data: {e}")
        return pd.DataFrame()

def get_dashboard_data(city: str = None, gender: str = None, department: str = None):
    """
    Processes the data to return summary statistics and chart data.
    Supports filtering by city, gender, and department.
    """
    df = fetch_covid_data()
    
    # Base response structure
    response = {
        "total_cases": 0,
        "total_deaths": 0,
        "cases_by_status": {},
        "top_cities": {},
        "age_distribution": {},
        "gender_distribution": {},
        "deaths_over_time": {},
        "available_cities": [],
        "available_departments": []
    }

    if df.empty:
        return response

    # Normalize columns to lowercase
    df.columns = [c.lower() for c in df.columns]
    
    # Get available departments (always from full data)
    if 'departamento_nom' in df.columns:
        depts = df['departamento_nom'].dropna().unique()
        response['available_departments'] = sorted(list(depts))

    # --- Apply Department Filter First ---
    if department and 'departamento_nom' in df.columns:
        df = df[df['departamento_nom'] == department]

    # Get available cities (based on current df - filtered by dept if selected)
    if 'ciudad_municipio_nom' in df.columns:
        cities = df['ciudad_municipio_nom'].dropna().unique()
        response['available_cities'] = sorted(list(cities))

    # --- Apply City and Gender Filters ---
    if city and 'ciudad_municipio_nom' in df.columns:
        df = df[df['ciudad_municipio_nom'] == city]
    
    if gender and 'sexo' in df.columns:
        df = df[df['sexo'].str.upper() == gender.upper()]

    if df.empty:
        return response

    # 1. Total Cases
    response["total_cases"] = len(df)
    
    # 2. Fatal Cases (Deaths)
    if 'estado' in df.columns:
        df['estado'] = df['estado'].str.lower()
        response["total_deaths"] = df[df['estado'] == 'fallecido'].shape[0]
        response["cases_by_status"] = df['estado'].value_counts().to_dict()

    # 3. Top 10 Cities (or just the selected one if filtered)
    if 'ciudad_municipio_nom' in df.columns:
        response["top_cities"] = df['ciudad_municipio_nom'].value_counts().head(10).to_dict()

    # 4. Age Distribution
    if 'edad' in df.columns:
        try:
            df['edad'] = pd.to_numeric(df['edad'], errors='coerce')
            bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120]
            labels = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100', '100+']
            df['age_group'] = pd.cut(df['edad'], bins=bins, labels=labels, right=False)
            age_dist = df['age_group'].value_counts().sort_index().to_dict()
            response["age_distribution"] = {str(k): v for k, v in age_dist.items()}
        except Exception as e:
            print(f"Error processing age: {e}")

    # 5. Gender Distribution
    if 'sexo' in df.columns:
        df['sexo'] = df['sexo'].str.upper()
        response["gender_distribution"] = df['sexo'].value_counts().to_dict()

    # 6. Deaths over time
    if 'fecha_muerte' in df.columns:
        try:
            # Filter only deaths
            deaths_df = df[df['estado'] == 'fallecido'].copy()
            if not deaths_df.empty:
                deaths_df['fecha_muerte'] = pd.to_datetime(deaths_df['fecha_muerte'], errors='coerce')
                # Group by date
                deaths_by_date = deaths_df['fecha_muerte'].dt.date.value_counts().sort_index()
                response["deaths_over_time"] = {str(k): v for k, v in deaths_by_date.items()}
        except Exception as e:
            print(f"Error processing death dates: {e}")

    return response
