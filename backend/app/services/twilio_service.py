"""
LifeLink AI — Twilio Service
Used for emergency calls and notifications.
"""
from twilio.rest import Client
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def make_emergency_call(to_number: str = "+918700813135", url: str = "https://webhooks.twilio.com/v1/Voice/Template/voice_speech_recognition"):
    """
    Make an emergency voice call using Twilio API.
    """
    try:
        account_sid = settings.TWILIO_ACCOUNT_SID
        auth_token = settings.TWILIO_AUTH_TOKEN
        from_number = settings.TWILIO_FROM_NUMBER
        
        if not account_sid or not auth_token:
            logger.error("Twilio credentials not configured in settings.")
            return None
            
        client = Client(account_sid, auth_token)
        
        call = client.calls.create(
            url=url,
            to=to_number,
            from_=from_number or "+17372212163",
        )
        
        logger.info(f"Twilio emergency call initiated successfully. Call SID: {call.sid}")
        return call.sid
    except Exception as e:
        logger.error(f"Failed to make Twilio emergency call: {str(e)}")
        return None

def send_emergency_sms(to_number: str = "+918700813135", message: str = "🚨 URGENT: LifeLink SOS Triggered! An emergency alert has been activated. Please check the app for location and details."):
    """
    Send an emergency SMS using Twilio API.
    """
    try:
        account_sid = settings.TWILIO_ACCOUNT_SID
        auth_token = settings.TWILIO_AUTH_TOKEN
        from_number = settings.TWILIO_FROM_NUMBER
        
        if not account_sid or not auth_token:
            logger.error("Twilio credentials not configured in settings.")
            return None
            
        client = Client(account_sid, auth_token)
        
        msg = client.messages.create(
            body=message,
            to=to_number,
            from_=from_number or "+17372212163",
        )
        
        logger.info(f"Twilio emergency SMS sent successfully. Message SID: {msg.sid}")
        return msg.sid
    except Exception as e:
        logger.error(f"Failed to send Twilio emergency SMS: {str(e)}")
        return None
