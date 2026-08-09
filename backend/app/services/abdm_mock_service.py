import asyncio
from typing import Dict, Any

class ABDMMockService:
    @staticmethod
    async def _simulate_network() -> None:
        await asyncio.sleep(2.0)

    @staticmethod
    async def _process_mock_id(identifier: str) -> Dict[str, Any]:
        """
        Mock logic:
        TEST_PASS_* -> 200 OK: verified
        TEST_FAIL_* -> 400 Bad Request: rejected
        other       -> 202 Accepted: pending_manual_verification
        """
        await ABDMMockService._simulate_network()
        
        if identifier.startswith("TEST_PASS_"):
            return {"status": "verified"}
        elif identifier.startswith("TEST_FAIL_"):
            return {"status": "rejected", "reason": "Invalid ID format"}
        else:
            return {"status": "pending_manual_verification"}

    @classmethod
    async def mock_verify_hpr(cls, medical_council_id: str) -> Dict[str, Any]:
        return await cls._process_mock_id(medical_council_id)

    @classmethod
    async def mock_verify_hfr(cls, facility_id: str) -> Dict[str, Any]:
        return await cls._process_mock_id(facility_id)

    @classmethod
    async def mock_verify_vahan(cls, dl_number: str, vehicle_rc: str) -> Dict[str, Any]:
        return await cls._process_mock_id(dl_number)

abdm_mock_service = ABDMMockService()
