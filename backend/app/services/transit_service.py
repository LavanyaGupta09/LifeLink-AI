def generate_uber_deep_link(pickup_lat: float, pickup_lng: float, dropoff_lat: float, dropoff_lng: float) -> str:
    """
    Constructs a Universal Uber Deep-Link without calling paid dispatch endpoints.
    This opens the Uber app on the user's phone directly to the route confirmation screen.
    """
    base = "uber://?action=setPickup"
    pickup = f"&pickup[latitude]={pickup_lat}&pickup[longitude]={pickup_lng}"
    dropoff = f"&dropoff[latitude]={dropoff_lat}&dropoff[longitude]={dropoff_lng}"
    
    return f"{base}{pickup}{dropoff}"
