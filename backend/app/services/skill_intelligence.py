import re
import difflib
import logging
from typing import Dict, Any, List, Optional, Tuple, Set
from sqlalchemy.orm import Session
from app.models.skill_ontology import SkillAlias, SkillRelationship

logger = logging.getLogger(__name__)

# ==============================================================================
# LAYER 1 & 2: TECHNOLOGY-AWARE CANONICAL NORMALIZATION
# ==============================================================================

# Reserved symbols and special programming language names that must never be collapsed
SPECIAL_LANGUAGE_MAP = {
    "c": "c",
    "c++": "c++",
    "cpp": "c++",
    "c#": "c#",
    "c-sharp": "c#",
    "c sharp": "c#",
    "f#": "f#",
    "f sharp": "f#",
    ".net": ".net",
    "dotnet": ".net",
    ".net core": ".net core",
    "asp.net": "asp.net",
    "asp.net core": "asp.net core",
    "go": "go",
    "golang": "go",
    "r": "r",
    "java": "java",
    "javascript": "javascript",
    "typescript": "typescript",
    "objective-c": "objective-c",
    "objective c": "objective-c",
}

# Canonical alias mapping (Layer 3)
CANONICAL_ALIASES: Dict[str, str] = {
    # React ecosystem
    "react": "react.js",
    "reactjs": "react.js",
    "react js": "react.js",
    "react.js": "react.js",
    "react 18": "react.js",
    "react 17": "react.js",
    "react 19": "react.js",
    "rectjs": "react.js",
    "resct.js": "react.js",
    "resctjs": "react.js",
    "reatjs": "react.js",
    
    # Next.js
    "next": "next.js",
    "nextjs": "next.js",
    "next.js": "next.js",
    "next js": "next.js",
    "next 14": "next.js",
    "next 13": "next.js",

    # Vue ecosystem
    "vue": "vue.js",
    "vuejs": "vue.js",
    "vue.js": "vue.js",
    "vue js": "vue.js",
    "vue 3": "vue.js",
    "nuxt": "nuxt.js",
    "nuxtjs": "nuxt.js",
    "nuxt.js": "nuxt.js",

    # Angular
    "angular": "angular",
    "angularjs": "angular",
    "angular.js": "angular",
    "angular 2+": "angular",

    # Node.js
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "node js": "node.js",

    # Express.js
    "express": "express.js",
    "expressjs": "express.js",
    "express.js": "express.js",
    "express js": "express.js",

    # Python & Frameworks
    "python": "python",
    "python 3": "python",
    "py": "python",
    "pyhton": "python",
    "fastapi": "fastapi",
    "fast api": "fastapi",
    "fast-api": "fastapi",
    "django": "django",
    "flask": "flask",
    "sqlalchemy": "sqlalchemy",

    # Java & Frameworks
    "java": "java",
    "java 17": "java",
    "java 21": "java",
    "java 11": "java",
    "java 8": "java",
    "spring": "spring",
    "spring boot": "spring boot",
    "springboot": "spring boot",
    "hibernate": "hibernate",

    # Databases & SQL
    "sql": "sql",
    "structured query language": "sql",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "postgres db": "postgresql",
    "postgre sql": "postgresql",
    "mysql": "mysql",
    "sqlite": "sqlite",
    "sqlite3": "sqlite",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "redis": "redis",

    # Cloud & DevOps
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "kubernets": "kubernetes",
    "docker": "docker",
    "docker compose": "docker compose",
    "docker-compose": "docker compose",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud platform": "gcp",
    "google cloud": "gcp",
    "azure": "azure",
    "microsoft azure": "azure",
    "eks": "amazon eks",
    "amazon eks": "amazon eks",
    "aws eks": "amazon eks",
    "gke": "google gke",
    "google gke": "google gke",
    "aks": "azure aks",
    "azure aks": "azure aks",

    # CI/CD & Version Control
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "git": "git",
    "github": "git",
    "gitlab": "git",

    # Testing
    "selenium": "selenium",
    "cypress": "cypress",
    "playwright": "playwright",
    "jest": "jest",
    "pytest": "pytest",
    "testing": "testing",
    "software testing": "testing",
    "qa automation": "testing",
    "automation testing": "testing",

    # APIs & Web
    "rest": "rest api",
    "rest api": "rest api",
    "rest apis": "rest api",
    "restful": "rest api",
    "restful api": "rest api",
    "restful apis": "rest api",
    "graphql": "graphql",

    # Mobile
    "flutter": "flutter",
    "react native": "react native",
    "react-native": "react native",
    "android": "android",
    "ios": "ios",
    "swift": "swift",
    "kotlin": "kotlin",
    "dart": "dart",

    # Styling & Frontend UI
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "tailwind css": "tailwind css",
    "html": "html",
    "html5": "html",
    "css": "css",
    "css3": "css",
    "sass": "sass",
    "scss": "scss",

    # Big Data / AI
    "spark": "apache spark",
    "apache spark": "apache spark",
    "pyspark": "pyspark",
    "machine learning": "machine learning",
    "ml": "machine learning",
    "deep learning": "deep learning",
    "dl": "deep learning",
    "nlp": "nlp",
    "llm": "llm",
    "large language models": "llm",
}


def normalize_skill(name: str) -> str:
    """
    Technology-safe normalization.
    Preserves critical distinctions like C, C++, C#, .NET, Go, Java, TypeScript.
    """
    if not name:
        return ""
    raw = name.strip()
    lowered = raw.lower()

    # 1. Exact match in special language map
    if lowered in SPECIAL_LANGUAGE_MAP:
        return SPECIAL_LANGUAGE_MAP[lowered]

    # 2. Match in canonical alias map
    if lowered in CANONICAL_ALIASES:
        return CANONICAL_ALIASES[lowered]

    # 3. Clean spacing and punctuation while preserving '+', '#', '.', '-' in tech names
    # Strip leading/trailing punctuation
    cleaned = re.sub(r'^[^\w\+\#\.\-]+|[^\w\+\#\.\-]+$', '', lowered)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    if cleaned in CANONICAL_ALIASES:
        return CANONICAL_ALIASES[cleaned]

    # Version stripping for patterns like "React 18" -> "React" -> "react.js"
    version_stripped = re.sub(r'\s+v?\d+(?:\.\d+)*$', '', cleaned).strip()
    if version_stripped in CANONICAL_ALIASES:
        return CANONICAL_ALIASES[version_stripped]

    return cleaned


# ==============================================================================
# LAYER 4: UNIVERSAL SKILL ONTOLOGY GRAPH
# ==============================================================================

# Structure: (source_skill, target_skill) -> { relationship_type, strength, match_type, reason }
# If source_skill is mentioned in candidate resume, it can satisfy or relate to target_skill (required in JD).
BUILTIN_ONTOLOGY: Dict[Tuple[str, str], Dict[str, Any]] = {
    # ------------------ Frontend Frameworks & Libraries ------------------
    ("next.js", "react.js"): {
        "relationship_type": "BUILT_ON",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Next.js is a React-based production framework that directly utilizes React.js components, hooks, and lifecycle."
    },
    ("remix", "react.js"): {
        "relationship_type": "BUILT_ON",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Remix is a full-stack React framework built entirely on React principles."
    },
    ("gatsby", "react.js"): {
        "relationship_type": "BUILT_ON",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "Gatsby is a static-site generator and framework built on React."
    },
    ("redux", "react.js"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.88,
        "match_type": "inferred",
        "reason": "Redux is a primary state-management library predominantly applied with React applications."
    },
    ("zustand", "react.js"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.85,
        "match_type": "inferred",
        "reason": "Zustand is a state management library built specifically for React."
    },
    ("nuxt.js", "vue.js"): {
        "relationship_type": "BUILT_ON",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Nuxt.js is the intuitive Vue framework built directly on Vue.js."
    },
    ("sveltekit", "svelte"): {
        "relationship_type": "BUILT_ON",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "SvelteKit is the application framework built on Svelte."
    },
    ("react native", "react.js"): {
        "relationship_type": "ECOSYSTEM_OF",
        "strength": 0.65,
        "match_type": "related",
        "reason": "React Native shares React architecture and JSX syntax, but targets mobile platforms rather than web DOM."
    },
    ("react.js", "javascript"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "React.js is a JavaScript UI library requiring core JavaScript proficiency."
    },
    ("vue.js", "javascript"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Vue.js is a progressive JavaScript framework requiring JavaScript expertise."
    },
    ("angular", "typescript"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Angular is built primarily with TypeScript."
    },
    ("typescript", "javascript"): {
        "relationship_type": "SUPERSET_OF",
        "strength": 0.98,
        "match_type": "inferred",
        "reason": "TypeScript is a typed superset of JavaScript that compiles down to JavaScript."
    },

    # ------------------ Backend Frameworks & Languages ------------------
    ("django", "python"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Django is a high-level Python web framework providing strong evidence of Python proficiency."
    },
    ("fastapi", "python"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "FastAPI is a modern asynchronous Python web framework requiring Python 3 type hints."
    },
    ("flask", "python"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Flask is a standard Python micro-framework."
    },
    ("sqlalchemy", "python"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.90,
        "match_type": "inferred",
        "reason": "SQLAlchemy is the comprehensive Python SQL toolkit and Object Relational Mapper."
    },
    ("pandas", "python"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "Pandas is a fast, powerful data analysis library for Python."
    },
    ("numpy", "python"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.90,
        "match_type": "inferred",
        "reason": "NumPy is the fundamental package for scientific computing in Python."
    },
    ("spring boot", "java"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Spring Boot is an enterprise Java framework requiring core Java expertise."
    },
    ("spring", "java"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Spring is an application framework for the Java platform."
    },
    ("hibernate", "java"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "Hibernate is an object-relational mapping tool for Java."
    },
    ("express.js", "node.js"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Express.js is a minimal and flexible Node.js web application framework."
    },
    ("nestjs", "node.js"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "NestJS is a progressive Node.js framework for building efficient server-side applications."
    },
    ("rails", "ruby"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Ruby on Rails is a server-side web application framework written in Ruby."
    },
    ("laravel", "php"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Laravel is a web application framework with expressive, elegant syntax written in PHP."
    },
    ("asp.net", "c#"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "ASP.NET is an open-source server-side web application framework designed for .NET and C#."
    },
    (".net core", "c#"): {
        "relationship_type": "ECOSYSTEM_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": ".NET Core is the cross-platform framework primarily programmed with C#."
    },
    (".net", "c#"): {
        "relationship_type": "ECOSYSTEM_OF",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": ".NET is the software framework primarily associated with C# development."
    },

    # ------------------ Databases & SQL ------------------
    ("postgresql", "sql"): {
        "relationship_type": "IMPLEMENTS",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "PostgreSQL is a powerful, open-source object-relational database system implementing ANSI-SQL."
    },
    ("mysql", "sql"): {
        "relationship_type": "IMPLEMENTS",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "MySQL is an open-source relational database management system implementing SQL standards."
    },
    ("sqlite", "sql"): {
        "relationship_type": "IMPLEMENTS",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "SQLite implements a self-contained, serverless, zero-configuration SQL database engine."
    },
    ("amazon rds", "sql"): {
        "relationship_type": "MANAGED_SERVICE_FOR",
        "strength": 0.90,
        "match_type": "inferred",
        "reason": "Amazon RDS provides managed relational SQL databases (PostgreSQL, MySQL, MariaDB, etc.)."
    },

    # ------------------ Cloud, Containers & Orchestration ------------------
    ("amazon eks", "kubernetes"): {
        "relationship_type": "MANAGED_SERVICE_FOR",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Amazon EKS is a managed service that runs Kubernetes on AWS."
    },
    ("google gke", "kubernetes"): {
        "relationship_type": "MANAGED_SERVICE_FOR",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Google GKE is a managed environment for running Kubernetes applications."
    },
    ("azure aks", "kubernetes"): {
        "relationship_type": "MANAGED_SERVICE_FOR",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Azure AKS is Azure's managed container orchestration service based on Kubernetes."
    },
    ("docker compose", "docker"): {
        "relationship_type": "EXTENSION_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Docker Compose is a tool for defining and running multi-container Docker applications."
    },
    ("helm", "kubernetes"): {
        "relationship_type": "PACKAGE_MANAGER_FOR",
        "strength": 0.90,
        "match_type": "inferred",
        "reason": "Helm is the dedicated package manager for Kubernetes."
    },

    # ------------------ Mobile & Languages ------------------
    ("flutter", "dart"): {
        "relationship_type": "FRAMEWORK_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "Flutter apps are written in Dart and leverage Dart's core features."
    },
    ("android", "kotlin"): {
        "relationship_type": "LANGUAGE_FOR",
        "strength": 0.70,
        "match_type": "related",
        "reason": "Kotlin is the preferred language for modern Android development, though Android also uses Java."
    },
    ("ios", "swift"): {
        "relationship_type": "LANGUAGE_FOR",
        "strength": 0.75,
        "match_type": "related",
        "reason": "Swift is Apple's modern programming language for iOS development."
    },

    # ------------------ Testing & QA ------------------
    ("selenium", "testing"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Selenium is an industry standard test automation framework for web applications."
    },
    ("cypress", "testing"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Cypress is a front-end testing tool built for the modern web."
    },
    ("playwright", "testing"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Playwright is a framework for end-to-end testing across modern web browsers."
    },
    ("pytest", "testing"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "pytest is a mature testing framework for Python."
    },
    ("jest", "testing"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "Jest is a JavaScript testing framework with a focus on simplicity."
    },

    # ------------------ Big Data & AI ------------------
    ("pyspark", "apache spark"): {
        "relationship_type": "SPECIALIZATION_OF",
        "strength": 0.96,
        "match_type": "inferred",
        "reason": "PySpark is the Python API for Apache Spark big data processing."
    },
    ("deep learning", "machine learning"): {
        "relationship_type": "SPECIALIZATION_OF",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "Deep Learning is a specialized subfield of Machine Learning based on artificial neural networks."
    },
    ("pytorch", "machine learning"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "PyTorch is an open-source machine learning framework for deep neural networks."
    },
    ("tensorflow", "machine learning"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "TensorFlow is a machine learning platform for developing and training ML models."
    },
    ("scikit-learn", "machine learning"): {
        "relationship_type": "LIBRARY_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "Scikit-learn is a premier Python library for predictive data analysis and machine learning."
    },

    # ------------------ REST APIs & Tools ------------------
    ("fastapi", "rest api"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "FastAPI is specifically engineered for designing and building RESTful web APIs."
    },
    ("express.js", "rest api"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.92,
        "match_type": "inferred",
        "reason": "Express.js is commonly used to architect RESTful web services."
    },
    ("postman", "rest api"): {
        "relationship_type": "TOOL_FOR",
        "strength": 0.85,
        "match_type": "inferred",
        "reason": "Postman is an API platform for building and testing REST APIs."
    },

    # ------------------ Version Control ------------------
    ("github", "git"): {
        "relationship_type": "MANAGED_SERVICE_FOR",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "GitHub is a cloud platform for software development and Git version control."
    },
    ("gitlab", "git"): {
        "relationship_type": "MANAGED_SERVICE_FOR",
        "strength": 0.95,
        "match_type": "inferred",
        "reason": "GitLab is an open-core Git-repository manager providing full CI/CD pipelines."
    }
}


# ==============================================================================
# LAYER 5: DYNAMIC AI RELATIONSHIP DISCOVERY WITH GOOGLE GEMINI
# ==============================================================================

class DynamicSkillIntelligence:
    def __init__(self):
        # In-memory relationship cache: (evidence_skill, required_skill) -> evaluation dict
        self._cache: Dict[Tuple[str, str], Optional[Dict[str, Any]]] = {}

    def _get_relationship_from_db(self, db: Session, evidence_norm: str, required_norm: str) -> Optional[Dict[str, Any]]:
        """Query DB for stored/candidate relationships."""
        try:
            rel = db.query(SkillRelationship).filter(
                SkillRelationship.source_skill == evidence_norm,
                SkillRelationship.target_skill == required_norm,
                SkillRelationship.status.in_(["validated", "candidate"])
            ).first()
            if rel:
                match_type = "inferred" if rel.strength >= 0.80 else "related"
                return {
                    "relationship_type": rel.relationship_type,
                    "strength": rel.strength,
                    "match_type": match_type,
                    "reason": rel.reason or f"{evidence_norm} relates to {required_norm} via {rel.relationship_type}",
                    "source": rel.source
                }
        except Exception as e:
            logger.debug(f"DB skill relationship query skipped/failed: {e}")
        return None

    def _save_candidate_to_db(self, db: Session, evidence_norm: str, required_norm: str, evaluation: Dict[str, Any]):
        """Save high-confidence AI discovered relationship as candidate for admin review."""
        try:
            existing = db.query(SkillRelationship).filter(
                SkillRelationship.source_skill == evidence_norm,
                SkillRelationship.target_skill == required_norm
            ).first()
            if not existing:
                new_rel = SkillRelationship(
                    source_skill=evidence_norm,
                    target_skill=required_norm,
                    relationship_type=evaluation.get("relationship_type", "RELATED_TO"),
                    strength=evaluation.get("strength", 0.85),
                    source="ai",
                    status="candidate",
                    reason=evaluation.get("reason")
                )
                db.add(new_rel)
                db.commit()
        except Exception as e:
            logger.debug(f"Could not persist candidate skill relationship: {e}")
            db.rollback()

    def evaluate_relationship_with_ai(
        self,
        required_skill: str,
        evidence_skill: str
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluate unknown relationship via Google Gemini GenAI with strict anti-hallucination guardrails.
        High precision > Aggressive matching!
        """
        from app.services.gemini_service import gemini_service
        if not gemini_service.is_available():
            return None

        client = gemini_service._get_client()
        if not client:
            return None

        prompt = f"""You are a strict Senior Technical Recruiter and Software Architecture Expert.
Evaluate whether a candidate possessing skill "{evidence_skill}" provides legitimate evidence for a job requirement asking for "{required_skill}".

CRITICAL ANTI-HALLUCINATION RULES:
1. Domain co-occurrence is NOT an inferred match. (e.g. HTML does NOT infer React.js; CSS does NOT infer Node.js; Java does NOT infer Python; Python does NOT infer React).
2. Different programming languages (e.g. Java vs Python, C++ vs C#) are NOT equivalent and do NOT infer each other.
3. Only evaluate as "inferred" if "{evidence_skill}" is built upon, is a framework of, implements, or fundamentally requires deep knowledge of "{required_skill}".
4. If "{evidence_skill}" belongs to the same ecosystem but does NOT prove competence in "{required_skill}" (e.g. React Native vs React.js web), classify as "related".
5. If there is NO strong technological relationship, return "relationship_found": false.

Respond ONLY with valid JSON in this exact structure:
{{
  "relationship_found": true/false,
  "relationship_type": "BUILT_ON" | "FRAMEWORK_OF" | "LIBRARY_FOR" | "IMPLEMENTS" | "MANAGED_SERVICE_FOR" | "SUPERSET_OF" | "SPECIALIZATION_OF" | "RELATED_TO" | "NONE",
  "confidence": 0.0 to 1.0,
  "match_type": "inferred" | "related" | "none",
  "reason": "One concise explanatory sentence."
}}"""

        try:
            response = client.models.generate_content(
                model=gemini_service.model_name,
                contents=prompt
            )
            if response and response.text:
                import json
                cleaned_text = response.text.strip()
                if "```json" in cleaned_text:
                    cleaned_text = cleaned_text.split("```json")[1].split("```")[0].strip()
                elif "```" in cleaned_text:
                    cleaned_text = cleaned_text.split("```")[1].split("```")[0].strip()
                
                data = json.loads(cleaned_text)
                if data.get("relationship_found") and data.get("confidence", 0) >= 0.60:
                    conf = float(data.get("confidence", 0.70))
                    match_type = "inferred" if conf >= 0.80 and data.get("match_type") == "inferred" else "related"
                    return {
                        "relationship_type": data.get("relationship_type", "RELATED_TO"),
                        "strength": conf,
                        "match_type": match_type,
                        "reason": data.get("reason", f"{evidence_skill} relates to {required_skill}."),
                        "source": "ai"
                    }
        except Exception as e:
            logger.debug(f"Gemini dynamic skill relationship evaluation failed: {e}")

        return None


# ==============================================================================
# LAYER 6: CONTEXT-AWARE RESUME ANALYSIS
# ==============================================================================

def analyze_evidence_context(skill_name: str, resume_text: str) -> Tuple[float, str]:
    """
    Evaluates where and how a skill appears in resume text to adjust confidence.
    Returns: (context_modifier: 0.7 to 1.05, context_snippet: str)
    """
    if not skill_name or not resume_text:
        return 1.0, "Skill mentioned in candidate profile"

    lowered = resume_text.lower()
    skill_clean = skill_name.lower().strip()
    pattern = r'(?<![a-zA-Z0-9_\-\#\+])' + re.escape(skill_clean) + r'(?![a-zA-Z0-9_\-\#\+])'
    match = re.search(pattern, lowered)
    if not match:
        return 1.0, "Identified in profile skills"

    start = max(0, match.start() - 100)
    end = min(len(resume_text), match.end() + 100)
    window = resume_text[start:end].replace('\n', ' ')

    window_lower = window.lower()
    # Check weak / learning context
    weak_signals = ["learning", "familiar with", "beginner", "course", "workshop", "studying", "basic understanding"]
    for ws in weak_signals:
        if ws in window_lower:
            return 0.75, f"Weak context: mention indicates '{ws}'"

    # Check strong production experience context
    strong_signals = ["production", "architected", "developed", "built", "engineered", "deployed", "scaled", "maintained", "implemented"]
    for ss in strong_signals:
        if ss in window_lower:
            return 1.02, f"Verified active usage in practical context"

    return 1.0, f"Mentioned in resume context"


# ==============================================================================
# CORE UNIVERSAL SKILL MATCHING ENGINE
# ==============================================================================

skill_intelligence_engine = DynamicSkillIntelligence()


def match_skills_intelligently(
    candidate_skills: List[str],
    required_skills: List[str],
    candidate_text: str = "",
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Universal Multi-Layer Skill Matching:
    Classifies every required skill into:
      - DIRECT
      - INFERRED
      - RELATED / PARTIAL
      - MISSING
    Calculates weighted coverage and comprehensive explanation objects.
    """
    if not required_skills:
        return {
            "matched_skills": candidate_skills,
            "inferred_skills": [],
            "related_skills": [],
            "missing_skills": [],
            "skill_match_summary": {
                "direct": len(candidate_skills),
                "inferred": 0,
                "related": 0,
                "missing": 0
            },
            "skill_match_details": [],
            "skill_score": 100.0,
            "skill_ratio": 1.0
        }

    # Map candidate skills to normalized forms preserving original text
    cand_map: Dict[str, str] = {}
    for s in candidate_skills:
        if not s or s.strip().lower() == "string":
            continue
        norm = normalize_skill(s)
        if norm and norm not in cand_map:
            cand_map[norm] = s

    direct_matches: List[str] = []
    inferred_matches: List[Dict[str, Any]] = []
    related_matches: List[Dict[str, Any]] = []
    missing_skills: List[str] = []
    all_details: List[Dict[str, Any]] = []

    weighted_points = 0.0

    for original_req in required_skills:
        req_norm = normalize_skill(original_req)
        
        # -------------------------------------------------------------
        # 1. LAYER 1 & 2: EXACT & CANONICAL MATCH (DIRECT)
        # -------------------------------------------------------------
        if req_norm in cand_map:
            orig_evidence = cand_map[req_norm]
            context_mod, context_msg = analyze_evidence_context(orig_evidence, candidate_text)
            direct_matches.append(original_req)
            weighted_points += 1.0
            all_details.append({
                "required_skill": original_req,
                "evidence_skill": orig_evidence,
                "match_type": "direct",
                "confidence": round(min(1.0, 1.0 * context_mod) * 100),
                "relationship": "DIRECT_MATCH",
                "reason": f"Candidate explicitly verified skill in profile: {orig_evidence}.",
                "context": context_msg
            })
            continue

        # Check raw text direct match for safety
        if candidate_text:
            pattern = r'(?<![a-zA-Z0-9_\-\#\+])' + re.escape(req_norm) + r'(?![a-zA-Z0-9_\-\#\+])'
            if re.search(pattern, candidate_text.lower()):
                context_mod, context_msg = analyze_evidence_context(original_req, candidate_text)
                direct_matches.append(original_req)
                weighted_points += 1.0
                all_details.append({
                    "required_skill": original_req,
                    "evidence_skill": original_req,
                    "match_type": "direct",
                    "confidence": round(min(1.0, 1.0 * context_mod) * 100),
                    "relationship": "DIRECT_MATCH",
                    "reason": f"Candidate explicitly verified skill in resume context: {original_req}.",
                    "context": context_msg
                })
                continue

        # -------------------------------------------------------------
        # 2. LAYER 4 & 5: ONTOLOGY & DYNAMIC AI EVALUATION
        # -------------------------------------------------------------
        best_candidate_eval: Optional[Dict[str, Any]] = None
        best_evidence_name: Optional[str] = None
        highest_strength = 0.0

        for cand_norm, orig_cand in cand_map.items():
            # Never match if identical or conflating C / C++ / C#
            if cand_norm in ["c", "c++", "c#"] and req_norm in ["c", "c++", "c#"] and cand_norm != req_norm:
                continue

            evaluation = None
            pair = (cand_norm, req_norm)

            # Check in-memory built-in ontology
            if pair in BUILTIN_ONTOLOGY:
                evaluation = BUILTIN_ONTOLOGY[pair]
            # Check DB if available
            elif db and (eval_db := skill_intelligence_engine._get_relationship_from_db(db, cand_norm, req_norm)):
                evaluation = eval_db
            # Check runtime memory cache
            elif pair in skill_intelligence_engine._cache:
                evaluation = skill_intelligence_engine._cache[pair]
            else:
                # Dynamic AI Evaluation via Gemini for unknown pair
                eval_ai = skill_intelligence_engine.evaluate_relationship_with_ai(original_req, orig_cand)
                skill_intelligence_engine._cache[pair] = eval_ai
                if eval_ai and db:
                    skill_intelligence_engine._save_candidate_to_db(db, cand_norm, req_norm, eval_ai)
                evaluation = eval_ai

            if evaluation and evaluation.get("strength", 0) > highest_strength:
                highest_strength = evaluation["strength"]
                best_candidate_eval = evaluation
                best_evidence_name = orig_cand

        # -------------------------------------------------------------
        # 3. CLASSIFY MATCH TYPE
        # -------------------------------------------------------------
        if best_candidate_eval and best_candidate_eval.get("match_type") == "inferred" and highest_strength >= 0.80:
            context_mod, context_msg = analyze_evidence_context(best_evidence_name, candidate_text)
            final_conf = round(min(99.0, highest_strength * context_mod * 100))
            inferred_matches.append({
                "required_skill": original_req,
                "evidence_skill": best_evidence_name,
                "relationship": best_candidate_eval.get("relationship_type", "BUILT_ON"),
                "confidence": final_conf,
                "reason": best_candidate_eval.get("reason", f"Proficiency in {best_evidence_name} provides strong evidence for {original_req}.")
            })
            # Inferred match provides 90% credit
            weighted_points += 0.90 * (final_conf / 100.0)
            all_details.append({
                "required_skill": original_req,
                "evidence_skill": best_evidence_name,
                "match_type": "inferred",
                "confidence": final_conf,
                "relationship": best_candidate_eval.get("relationship_type", "BUILT_ON"),
                "reason": best_candidate_eval.get("reason", f"{best_evidence_name} provides strong technical evidence for {original_req}."),
                "context": context_msg
            })
        elif best_candidate_eval and (best_candidate_eval.get("match_type") == "related" or highest_strength >= 0.55):
            context_mod, context_msg = analyze_evidence_context(best_evidence_name, candidate_text)
            final_conf = round(min(90.0, highest_strength * context_mod * 100))
            related_matches.append({
                "required_skill": original_req,
                "evidence_skill": best_evidence_name,
                "relationship": best_candidate_eval.get("relationship_type", "RELATED_TO"),
                "confidence": final_conf,
                "reason": best_candidate_eval.get("reason", f"{best_evidence_name} relates to {original_req} ecosystem.")
            })
            # Related match provides 40% credit
            weighted_points += 0.40 * (final_conf / 100.0)
            all_details.append({
                "required_skill": original_req,
                "evidence_skill": best_evidence_name,
                "match_type": "related",
                "confidence": final_conf,
                "relationship": best_candidate_eval.get("relationship_type", "RELATED_TO"),
                "reason": best_candidate_eval.get("reason", f"{best_evidence_name} relates to {original_req} ecosystem."),
                "context": context_msg
            })
        else:
            # -------------------------------------------------------------
            # 4. MISSING
            # -------------------------------------------------------------
            missing_skills.append(original_req)
            all_details.append({
                "required_skill": original_req,
                "evidence_skill": None,
                "match_type": "missing",
                "confidence": 0,
                "relationship": "NONE",
                "reason": f"No sufficient explicit or inferred evidence identified in profile for {original_req}.",
                "context": "Unverified"
            })

    total_req = len(required_skills)
    skill_ratio = min(1.0, max(0.0, weighted_points / total_req)) if total_req > 0 else 1.0
    skill_score = round(skill_ratio * 100.0, 1)

    # For backward compatibility: matched_skills includes direct matches + high-confidence inferred skills
    inferred_skill_names = [item["required_skill"] for item in inferred_matches]
    related_skill_names = [item["required_skill"] for item in related_matches]
    combined_matched_skills = list(dict.fromkeys(direct_matches + inferred_skill_names))

    return {
        "matched_skills": combined_matched_skills, # Backward compatible
        "direct_skills": direct_matches,
        "inferred_skills": inferred_skill_names,
        "inferred_matches": inferred_matches,
        "related_skills": related_skill_names,
        "related_matches": related_matches,
        "missing_skills": missing_skills,
        "skill_match_summary": {
            "direct": len(direct_matches),
            "inferred": len(inferred_matches),
            "related": len(related_matches),
            "missing": len(missing_skills)
        },
        "skill_match_details": all_details,
        "skill_score": skill_score,
        "skill_ratio": skill_ratio
    }
