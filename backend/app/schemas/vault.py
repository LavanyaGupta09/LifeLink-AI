"""
LifeLink AI — Vault Schemas
Pydantic models for the Medical Report Analysis API response.
"""
from pydantic import BaseModel
from typing import Literal


class CriticalFinding(BaseModel):
    parameter_name: str
    extracted_value: str
    normal_range: str
    status: Literal["Normal", "High", "Low", "Critical"]
    plain_english_explanation: str
    needs_immediate_attention: bool


class ReportAnalysisResponse(BaseModel):
    report_id: str
    general_summary: str
    total_red_flags: int
    critical_findings: list[CriticalFinding]
