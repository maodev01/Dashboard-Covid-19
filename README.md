# Dashboard - Covid19

Este proyecto es un dashboard de COVID-19 construido con FastAPI.

## Requisitos Previos

- Python 3.7+
- pip

## Instalación y Ejecución Local

1.  **Clonar el repositorio (si aplica) o navegar al directorio del proyecto:**

    ```bash
    cd "d:/Usuarios/David/Escritorio/Dashboard - Covid19"
    ```

2.  **Crear un entorno virtual (recomendado):**

    ```bash
    python -m venv venv
    ```

3.  **Activar el entorno virtual:**

    -   En Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    -   En macOS/Linux:
        ```bash
        source venv/bin/activate
        ```

4.  **Instalar las dependencias:**

    ```bash
    pip install -r requirements.txt
    ```

5.  **Ejecutar la aplicación:**

    Puedes ejecutar la aplicación usando `uvicorn` directamente o a través del script `main.py`.

    ```bash
    python main.py
    ```

    O usando uvicorn:

    ```bash
    uvicorn main:app --reload
    ```

6.  **Acceder al Dashboard:**

    Abre tu navegador y ve a: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Despliegue

Para desplegar en producción, se recomienda usar un servidor ASGI como Uvicorn gestionado por Gunicorn o Docker.
