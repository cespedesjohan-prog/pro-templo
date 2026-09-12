from fastapi import FastAPI

app = FastAPI(title="PRO-TEMPLO API")


@app.get("/")
def inicio():
    return {
        "mensaje": "PRO-TEMPLO Python API funcionando",
        "estado": "ok"
    }


@app.get("/salud")
def salud():
    return {
        "sistema": "PRO-TEMPLO",
        "python": True,
        "estado": "activo"
    }