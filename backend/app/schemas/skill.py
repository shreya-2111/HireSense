from pydantic import BaseModel
from typing import Optional

class SkillBase(BaseModel):
    name: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    normalized_name: str

    class Config:
        from_attributes = True

class JobSkillAdd(BaseModel):
    name: str
    required: Optional[bool] = True
    importance: Optional[str] = "required"

class JobSkillResponse(BaseModel):
    id: int
    skill_id: int
    name: str
    required: bool
    importance: str

    class Config:
        from_attributes = True

class CandidateSkillAdd(BaseModel):
    name: str
    proficiency: Optional[str] = "intermediate"
    source: Optional[str] = "extracted"

class CandidateSkillResponse(BaseModel):
    id: int
    skill_id: int
    name: str
    proficiency: str
    source: str

    class Config:
        from_attributes = True
