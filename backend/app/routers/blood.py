import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app.models.blood_donor import BloodDonor, BloodGroupEnum
from app.models.blood_request import BloodRequest

router = APIRouter(prefix="/api/v1/blood", tags=["Blood Donor Network"])

# Maps patient blood group -> compatible donor blood groups
COMPATIBILITY_MATRIX = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
}

def get_compatible_donor_groups(required_group: str) -> List[str]:
    return COMPATIBILITY_MATRIX.get(required_group, [])

def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    import math
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

class RegisterDonorRequest(BaseModel):
    user_id: str
    blood_group: BloodGroupEnum
    lat: float
    lng: float
    is_available: bool = True

@router.post("/register-donor")
async def register_donor(data: RegisterDonorRequest, db: AsyncSession = Depends(get_db)):
    """Toggles user status as an active donor and updates their geolocation."""
    result = await db.execute(select(BloodDonor).where(BloodDonor.user_id == data.user_id))
    donor = result.scalars().first()
    
    if donor:
        donor.blood_group = data.blood_group
        donor.lat = data.lat
        donor.lng = data.lng
        donor.is_available = data.is_available
    else:
        donor = BloodDonor(
            user_id=data.user_id,
            blood_group=data.blood_group,
            lat=data.lat,
            lng=data.lng,
            is_available=data.is_available
        )
        db.add(donor)
    
    await db.commit()
    return {"message": "Donor registered/updated successfully", "is_available": donor.is_available}

class EmergencyBloodRequest(BaseModel):
    patient_id: str
    hospital_id: str = None
    required_blood_group: BloodGroupEnum
    units_needed: int = 1
    urgency_level: str = "Critical"
    lat: float
    lng: float

@router.post("/emergency-request")
async def emergency_request(data: EmergencyBloodRequest, db: AsyncSession = Depends(get_db)):
    """Broadcasts an SOS to compatible donors."""
    # 1. Create Request
    req = BloodRequest(
        patient_id=data.patient_id,
        hospital_id=data.hospital_id,
        required_blood_group=data.required_blood_group,
        units_needed=data.units_needed,
        urgency_level=data.urgency_level,
        status="open"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    # 2. Find compatible donors
    compatible_groups = get_compatible_donor_groups(data.required_blood_group.value)
    result = await db.execute(
        select(BloodDonor).where(
            BloodDonor.is_available == True,
            BloodDonor.blood_group.in_([BloodGroupEnum(g) for g in compatible_groups])
        )
    )
    all_compatible_donors = result.scalars().all()
    
    # 3. Filter by distance (e.g. 15km)
    notified_donors = []
    for donor in all_compatible_donors:
        if donor.lat is not None and donor.lng is not None:
            dist = haversine(data.lat, data.lng, donor.lat, donor.lng)
            if dist <= 15.0:
                notified_donors.append(donor.user_id)
                # MOCK PUSH NOTIFICATION
                print(f"[MOCK FCM] 🚨 URGENT: A patient nearby needs {data.units_needed} units of {data.required_blood_group.value}. You are a match. Can you help?")

    return {
        "request_id": req.request_id,
        "notified_count": len(notified_donors),
        "message": "Emergency blood request broadcasted to compatible donors."
    }

@router.get("/nearby-donors")
async def get_nearby_donors(
    lat: float = Query(...), 
    lng: float = Query(...),
    blood_group: BloodGroupEnum = Query(None), 
    radius_km: float = Query(15.0),
    db: AsyncSession = Depends(get_db)
):
    """Returns count of nearby compatible donors."""
    if blood_group:
        compatible_groups = get_compatible_donor_groups(blood_group.value)
        query = select(BloodDonor).where(
            BloodDonor.is_available == True,
            BloodDonor.blood_group.in_([BloodGroupEnum(g) for g in compatible_groups])
        )
    else:
        query = select(BloodDonor).where(BloodDonor.is_available == True)
        
    result = await db.execute(query)
    donors = result.scalars().all()
    
    nearby_count = 0
    for donor in donors:
        if donor.lat is not None and donor.lng is not None:
            dist = haversine(lat, lng, donor.lat, donor.lng)
            if dist <= radius_km:
                nearby_count += 1
                
    return {"nearby_donors_count": nearby_count}
