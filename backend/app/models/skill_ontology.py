import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.core.database import Base

class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alias = Column(String(100), unique=True, index=True, nullable=False)
    canonical_name = Column(String(100), index=True, nullable=False)
    category = Column(String(50), nullable=True) # frontend, backend, database, etc.

class SkillRelationship(Base):
    __tablename__ = "skill_relationships"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_skill = Column(String(100), index=True, nullable=False) # e.g. "next.js", "django"
    target_skill = Column(String(100), index=True, nullable=False) # e.g. "react.js", "python"
    relationship_type = Column(String(50), nullable=False) # BUILT_ON, FRAMEWORK_OF, LIBRARY_FOR, IMPLEMENTS, MANAGED_SERVICE_FOR, SUPERSET_OF, SPECIALIZATION_OF, RELATED_TO, TOOL_FOR
    strength = Column(Float, default=0.95, nullable=False) # 0.0 to 1.0 confidence weight
    source = Column(String(50), default="ontology", nullable=False) # ontology, ai, admin
    status = Column(String(50), default="validated", nullable=False) # validated, candidate
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
