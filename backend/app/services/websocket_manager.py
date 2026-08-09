from typing import List, Dict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # We can store active connections
        self.active_connections: List[WebSocket] = []
        # We can optionally group them by role (e.g. 'driver', 'hospital', 'patient')
        self.role_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, role: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if role:
            if role not in self.role_connections:
                self.role_connections[role] = []
            self.role_connections[role].append(websocket)

    def disconnect(self, websocket: WebSocket, role: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if role and role in self.role_connections and websocket in self.role_connections[role]:
            self.role_connections[role].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        msg_str = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(msg_str)
            except Exception as e:
                print(f"Error broadcasting to connection: {e}")

    async def broadcast_to_role(self, message: dict, role: str):
        if role in self.role_connections:
            msg_str = json.dumps(message)
            for connection in self.role_connections[role]:
                try:
                    await connection.send_text(msg_str)
                except Exception as e:
                    print(f"Error broadcasting to {role}: {e}")

manager = ConnectionManager()
