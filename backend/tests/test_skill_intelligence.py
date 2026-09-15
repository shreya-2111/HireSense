import pytest
from app.services.skill_intelligence import (
    normalize_skill,
    match_skills_intelligently,
    analyze_evidence_context
)
from app.utils.scoring import calculate_comprehensive_match, calculate_skill_overlap

# ==============================================================================
# 1. CASE NORMALIZATION & CANONICAL MAPPING TESTS
# ==============================================================================

def test_canonical_normalization():
    """Test normalization handles capitalization, aliases, and version numbers."""
    # React variants
    assert normalize_skill("React.js") == "react.js"
    assert normalize_skill("react.js") == "react.js"
    assert normalize_skill("REACT.JS") == "react.js"
    assert normalize_skill("ReactJS") == "react.js"
    assert normalize_skill("React JS") == "react.js"
    assert normalize_skill("React 18") == "react.js"
    assert normalize_skill("react 17") == "react.js"
    
    # Python variants
    assert normalize_skill("Python") == "python"
    assert normalize_skill("PYTHON") == "python"
    assert normalize_skill("py") == "python"
    assert normalize_skill("Python 3") == "python"

    # Node.js variants
    assert normalize_skill("Node") == "node.js"
    assert normalize_skill("NodeJS") == "node.js"
    assert normalize_skill("Node JS") == "node.js"
    assert normalize_skill("node.js") == "node.js"

    # PostgreSQL variants
    assert normalize_skill("PostgreSQL") == "postgresql"
    assert normalize_skill("postgres") == "postgresql"
    assert normalize_skill("postgres db") == "postgresql"


# ==============================================================================
# 2. SIMILAR TECHNOLOGY NAMES MUST REMAIN DISTINCT
# ==============================================================================

def test_similar_technology_names_are_distinct():
    """C, C++, and C# must be strictly distinguishable and never conflated."""
    c_norm = normalize_skill("C")
    cpp_norm = normalize_skill("C++")
    csharp_norm = normalize_skill("C#")

    assert c_norm == "c"
    assert cpp_norm == "c++"
    assert csharp_norm == "c#"

    # Resume with only C# should NOT match required C or C++
    res = match_skills_intelligently(
        candidate_skills=["C#"],
        required_skills=["C", "C++"]
    )
    assert "C" in res["missing_skills"]
    assert "C++" in res["missing_skills"]
    assert len(res["direct_skills"]) == 0
    assert len(res["inferred_skills"]) == 0

    # Resume with only C should NOT match required C#
    res2 = match_skills_intelligently(
        candidate_skills=["C"],
        required_skills=["C#"]
    )
    assert "C#" in res2["missing_skills"]


# ==============================================================================
# 3. HIERARCHICAL & INFERRED MATCHING
# ==============================================================================

def test_hierarchical_inferred_matching():
    """Test parent technologies are correctly inferred from child frameworks/services."""
    
    # 1. React.js <- Next.js (BUILT_ON)
    res_react = match_skills_intelligently(
        candidate_skills=["Next.js", "Tailwind CSS"],
        required_skills=["React.js"]
    )
    assert "React.js" in res_react["inferred_skills"]
    assert len(res_react["inferred_matches"]) == 1
    match = res_react["inferred_matches"][0]
    assert match["required_skill"] == "React.js"
    assert match["evidence_skill"] == "Next.js"
    assert match["relationship"] == "BUILT_ON"
    assert match["confidence"] >= 90

    # 2. Python <- Django & FastAPI (FRAMEWORK_OF)
    res_python_django = match_skills_intelligently(
        candidate_skills=["Django", "PostgreSQL"],
        required_skills=["Python"]
    )
    assert "Python" in res_python_django["inferred_skills"]
    assert res_python_django["inferred_matches"][0]["relationship"] == "FRAMEWORK_OF"

    res_python_fastapi = match_skills_intelligently(
        candidate_skills=["FastAPI"],
        required_skills=["Python"]
    )
    assert "Python" in res_python_fastapi["inferred_skills"]

    # 3. Kubernetes <- Amazon EKS (MANAGED_SERVICE_FOR)
    res_k8s = match_skills_intelligently(
        candidate_skills=["Amazon EKS", "Terraform"],
        required_skills=["Kubernetes"]
    )
    assert "Kubernetes" in res_k8s["inferred_skills"]
    assert res_k8s["inferred_matches"][0]["relationship"] == "MANAGED_SERVICE_FOR"

    # 4. SQL <- PostgreSQL (IMPLEMENTS)
    res_sql = match_skills_intelligently(
        candidate_skills=["PostgreSQL"],
        required_skills=["SQL"]
    )
    assert "SQL" in res_sql["inferred_skills"]
    assert res_sql["inferred_matches"][0]["relationship"] == "IMPLEMENTS"


# ==============================================================================
# 4. RELATED BUT NOT DIRECT/INFERRED EQUIVALENT
# ==============================================================================

def test_related_not_direct():
    """React Native relates to React ecosystem, but is RELATED/PARTIAL, NOT Direct or full Inferred."""
    res = match_skills_intelligently(
        candidate_skills=["React Native"],
        required_skills=["React.js"]
    )
    # Must NOT be direct
    assert "React.js" not in res["direct_skills"]
    # Must be classified as related
    assert "React.js" in res["related_skills"]
    assert len(res["related_matches"]) == 1
    rel = res["related_matches"][0]
    assert rel["relationship"] == "ECOSYSTEM_OF"
    assert 55 <= rel["confidence"] <= 75


# ==============================================================================
# 5. COMPLETELY UNRELATED & ANTI-HALLUCINATION
# ==============================================================================

def test_unrelated_technologies_missing():
    """Unrelated technologies or domain co-occurrence must be classified as MISSING."""
    # React vs Python
    res1 = match_skills_intelligently(
        candidate_skills=["Python", "Django"],
        required_skills=["React.js"]
    )
    assert "React.js" in res1["missing_skills"]
    assert len(res1["inferred_skills"]) == 0

    # React vs HTML: HTML is frontend, but does NOT infer React.js competence
    res2 = match_skills_intelligently(
        candidate_skills=["HTML", "CSS"],
        required_skills=["React.js"]
    )
    assert "React.js" in res2["missing_skills"]
    assert len(res2["inferred_skills"]) == 0

    # Java vs Python: Both backend languages, but completely distinct
    res3 = match_skills_intelligently(
        candidate_skills=["Java", "Spring Boot"],
        required_skills=["Python"]
    )
    assert "Python" in res3["missing_skills"]
    assert len(res3["inferred_skills"]) == 0


# ==============================================================================
# 6. CONTEXT SENSITIVITY
# ==============================================================================

def test_context_sensitivity():
    """Production usage provides higher confidence than learning mentions."""
    prod_text = "Architected and developed scalable production microservices using Next.js for high traffic web apps."
    learn_text = "Currently learning Next.js fundamentals through online tutorials and basic exercises."

    mod_prod, msg_prod = analyze_evidence_context("Next.js", prod_text)
    mod_learn, msg_learn = analyze_evidence_context("Next.js", learn_text)

    assert mod_prod > mod_learn
    assert mod_learn <= 0.80


# ==============================================================================
# 7. JOB-FIT SCORING INTEGRATION
# ==============================================================================

def test_scoring_integration():
    """Verify calculate_comprehensive_match returns full 4-way classification and weighted score."""
    match = calculate_comprehensive_match(
        candidate_skills=["Next.js", "Django", "PostgreSQL"],
        required_skills=["React.js", "Python", "SQL", "Docker"],
        candidate_exp_years=5,
        job_min_exp=3,
        job_max_exp=7,
        candidate_text="Experienced developer building production apps with Next.js, Django, and PostgreSQL databases."
    )

    # Inferred: React.js (via Next.js), Python (via Django), SQL (via PostgreSQL)
    # Missing: Docker
    assert "React.js" in match["inferred_skills"]
    assert "Python" in match["inferred_skills"]
    assert "SQL" in match["inferred_skills"]
    assert "Docker" in match["missing_skills"]

    summary = match["skill_match_summary"]
    assert summary["inferred"] == 3
    assert summary["missing"] == 1

    # Inferred skills provide substantial credit (~90% of skill weight)
    assert match["match_score"] >= 65.0
    assert len(match["skill_match_details"]) == 4
    assert match["recommendation"] in ["Shortlist", "Interview"]
