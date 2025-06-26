from fastapi import FastAPI, Query
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI()

class Location(BaseModel):
    address: str
    postal_code: str

class Doctor(BaseModel):
    id: str
    full_name: str
    specialty: str
    location: Location
    languages: List[str]
    phone: str
    rating: float
    accepting_new_patients: bool

# Sample data
doctors = [
    Doctor(
        id="drc001",
        full_name="Dr. Leila Nouri",
        specialty="Psychiatrist",
        location={"address": "123 Queen St W", "postal_code": "M5H 2M9"},
        languages=["English", "Farsi"],
        phone="+1-416-555-1234",
        rating=4.7,
        accepting_new_patients=True
    ),
    Doctor(
        id="drc002",
        full_name="Dr. Steven Wong",
        specialty="Psychiatrist",
        location={"address": "456 Bloor St W", "postal_code": "M5S 1X8"},
        languages=["English", "Mandarin"],
        phone="+1-416-555-5678",
        rating=4.5,
        accepting_new_patients=False
    )
]

@app.get("/doctors", response_model=List[Doctor])
def get_doctors(city: Optional[str] = Query(None), specialty: Optional[str] = Query(None)):
    results = [d for d in doctors if (not specialty or d.specialty == specialty)]
    return results
