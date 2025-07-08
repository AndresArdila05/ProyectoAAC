# backend/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from core.dynamic_array import DynamicArray
from core.arithmetic import *
from core.division import *
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#Request Model
class OperationRequest(BaseModel):
    u: int
    v: int
    base: int

@app.post("/suma")
def suma(data: OperationRequest):
    result = sumaDigitosBaseB(data.u, data.v, data.base)
    return result

@app.post("/resta")
def resta(data: OperationRequest):
    result = restaDigitosBaseB(data.u, data.v, data.base)
    return result

@app.post("/multiplicacion")
def multiplicacion(data: OperationRequest):
    result = multiplicacion_digitos_base_b(data.u, data.v, data.base)
    return result

@app.post("/division")
def division(data: OperationRequest):
    result = division_digitos_base_b(data.u, data.v, data.base)
    return result


