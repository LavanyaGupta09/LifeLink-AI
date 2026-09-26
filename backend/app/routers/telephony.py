import os
from fastapi import APIRouter, Request, Depends, Response
from twilio.twiml.voice_response import VoiceResponse, Gather
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.sos_service import create_sos_event

router = APIRouter(prefix="/api/telephony", tags=["Telephony (IVR)"])

@router.post("/ivr")
async def ivr_welcome(request: Request):
    """
    Webhook for incoming telephony calls.
    Returns TwiML instruction to say welcome message and gather 1 digit.
    """
    response = VoiceResponse()
    
    # Gather digit with action pointing to the input route
    # Note: If running locally, Twilio needs a public URL (like ngrok) to hit this.
    # We use a relative action path so Twilio appends it to the base URL they called.
    gather = Gather(num_digits=1, action="/api/telephony/ivr/input", method="POST")
    gather.say("Welcome to Life Link A I. For emergency S O S, press 1. To repeat, press 9.")
    response.append(gather)
    
    # If the user doesn't press anything, loop back
    response.redirect("/api/telephony/ivr")
    
    return Response(content=str(response), media_type="application/xml")


@router.post("/ivr/input")
async def ivr_input(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handle DTMF input from caller.
    """
    form_data = await request.form()
    digits = form_data.get("Digits", "")
    caller = form_data.get("From", "Unknown")

    response = VoiceResponse()
    
    if digits == "1":
        # Create SOS request
        try:
            # We use the phone number as the user_id, generic lat/lng
            event = await create_sos_event(
                db=db,
                user_id=caller,
                lat=0.0,
                lng=0.0,
                triage_level="critical",
                trigger_method="keypad_phone",
                address=f"Keypad phone call from {caller}"
            )
            # Twilio will say this and then end the call, or we can pause.
            response.say("Your emergency request has been received. Please stay on the line.")
            # Keeping the line open for 60 seconds as a prototype
            response.pause(length=60)
        except Exception as e:
            response.say("Sorry, there was an internal error processing your request.")
            print(f"IVR SOS Error: {e}")
            
    elif digits == "9":
        # Repeat menu
        response.redirect("/api/telephony/ivr")
    else:
        # Invalid option
        response.say("Invalid option. Please try again.")
        response.redirect("/api/telephony/ivr")
        
    return Response(content=str(response), media_type="application/xml")
