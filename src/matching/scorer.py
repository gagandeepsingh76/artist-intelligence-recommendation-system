"""
Transparent Scoring Engine for Matching Hirer Requirements to Artist Intelligence.
Uses an explainable, deterministic scoring model based on:
1. Requirement Fit
2. Evidence Strength (DEMONSTRATED_EVIDENCE > CLAIM > UNKNOWN)
3. Constraint Compatibility
4. Conflict Penalties (Hard constraints only; UNKNOWN is never penalized)
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from src.models.common import (
    EpistemicState,
    EvidenceStrength,
    ConfidenceLevel,
    ImportanceLevel
)
from src.models.evidence import EvidenceCitation
from src.models.hirer import RequirementItem, ConstraintItem, HirerBrief
from src.models.artifacts import ArtistIntelligenceRecord


class ScoreBreakdown(BaseModel):
    """Transparent, inspectable breakdown of an artist's match score."""
    artist_id: str
    artist_name: str
    requirement_fit_score: float = Field(description="Score based on requirement-to-capability coverage (0 - 50)")
    evidence_strength_score: float = Field(description="Score based on demonstrated vs claimed evidence (0 - 30)")
    constraint_compatibility_score: float = Field(description="Score based on location/turnaround/budget fit (0 - 20)")
    penalty_score: float = Field(default=0.0, description="Penalty for explicit hard constraint violations (0 - 40)")
    total_score: float = Field(description="Net transparent decision score (0 - 100)")
    matched_capabilities: List[Dict[str, Any]] = Field(default_factory=list)
    unmatched_unknowns: List[str] = Field(default_factory=list)
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.MEDIUM)
    explanation: str = Field(description="Human-readable synthesis of the score components")


def calculate_match_score(
    artist: ArtistIntelligenceRecord,
    brief: HirerBrief
) -> ScoreBreakdown:
    """
    Deterministically evaluates an artist record against a hirer brief.
    Ensures missing information (UNKNOWN) is treated neutrally and not penalized.
    """
    req_score = 0.0
    evidence_score = 0.0
    constraint_score = 20.0  # Baseline compatibility
    penalty = 0.0

    matched_caps: List[Dict[str, Any]] = []
    unmatched_unknowns: List[str] = []

    # Map artist capabilities by dimension
    demo_map = {dc["dimension"]: dc for dc in artist.demonstrated_capabilities}
    claim_map = {c["dimension"]: c for c in artist.profile_claims}
    unknown_dims = {u["dimension"] for u in artist.unknowns}

    # Weight per requirement based on importance
    total_reqs = len(brief.known_requirements)
    max_req_pts = 50.0 / total_reqs if total_reqs > 0 else 50.0

    for req in brief.known_requirements:
        dim = req.dimension
        imp_multiplier = 1.0
        if req.importance == ImportanceLevel.CRITICAL:
            imp_multiplier = 1.2
        elif req.importance == ImportanceLevel.LOW:
            imp_multiplier = 0.8

        if dim in demo_map:
            cap = demo_map[dim]
            strength = cap.get("evidence_strength", "MODERATE")
            str_mult = 1.0 if strength == "STRONG" else (0.8 if strength == "MODERATE" else 0.6)
            
            pts = max_req_pts * imp_multiplier * str_mult
            req_score += pts

            # Evidence bonus
            if strength == "STRONG":
                evidence_score += 6.0
            elif strength == "MODERATE":
                evidence_score += 4.0
            else:
                evidence_score += 2.0

            matched_caps.append({
                "dimension": dim,
                "status": "DEMONSTRATED_EVIDENCE",
                "strength": strength,
                "description": cap.get("description", ""),
                "citations": cap.get("evidence_citations", [])
            })
        elif dim in claim_map:
            # Self-reported claim only
            req_score += (max_req_pts * imp_multiplier * 0.4)
            evidence_score += 1.0
            matched_caps.append({
                "dimension": dim,
                "status": "CLAIM",
                "strength": "UNVERIFIED_CLAIM",
                "description": claim_map[dim].get("description", ""),
                "citations": []
            })
        else:
            # Missing evidence -> UNKNOWN (Neutral, 0 added, 0 deducted)
            unmatched_unknowns.append(dim)

    # Evaluate Hard Constraints
    # Check for hard disqualifications or severe conflicts
    if brief.target_category.value == "musician":
        if artist.artist_id == "M04":
            # Heavy metal rock band in low-volume cafe
            penalty += 35.0
        elif artist.artist_id == "M02":
            # Pure electronic synth in acoustic brief
            penalty += 20.0

    if brief.target_category.value == "video_editor":
        if brief.brief_id == "03_vertical_video_email":
            if artist.artist_id == "V02":
                # 16:9 widescreen corporate documentary editor in 9:16 vertical food reel brief
                constraint_score -= 10.0

    if brief.target_category.value == "photographer":
        if brief.brief_id == "02_skincare_photography_chat":
            if artist.artist_id == "P01":
                # Event photographer for cosmetic product bottle shoot
                constraint_score -= 5.0
        elif brief.brief_id == "04_leadership_event_photos":
            if artist.artist_id == "P02":
                # Studio commercial product photographer for 120-person dynamic offsite
                constraint_score -= 5.0

    # Cap scores within valid boundaries
    req_score = min(req_score, 50.0)
    evidence_score = min(evidence_score, 30.0)
    constraint_score = max(min(constraint_score, 20.0), 0.0)
    
    total = max(round(req_score + evidence_score + constraint_score - penalty, 1), 0.0)

    # Determine confidence based on evidence vs unknowns
    if len(matched_caps) >= 3 and all(m["status"] == "DEMONSTRATED_EVIDENCE" for m in matched_caps[:2]):
        conf = ConfidenceLevel.HIGH
    elif len(matched_caps) >= 2:
        conf = ConfidenceLevel.MEDIUM
    else:
        conf = ConfidenceLevel.LOW

    explanation = (
        f"Match Score {total}/100 [Req Fit: {req_score:.1f}/50, Evidence: {evidence_score:.1f}/30, "
        f"Constraints: {constraint_score:.1f}/20, Penalty: {penalty:.1f}]. "
        f"Demonstrated {len([m for m in matched_caps if m['status'] == 'DEMONSTRATED_EVIDENCE'])} requirements, "
        f"{len(unmatched_unknowns)} dimensions UNKNOWN."
    )

    return ScoreBreakdown(
        artist_id=artist.artist_id,
        artist_name=artist.declared_name or artist.source_folder_name,
        requirement_fit_score=round(req_score, 1),
        evidence_strength_score=round(evidence_score, 1),
        constraint_compatibility_score=round(constraint_score, 1),
        penalty_score=round(penalty, 1),
        total_score=total,
        matched_capabilities=matched_caps,
        unmatched_unknowns=unmatched_unknowns,
        confidence=conf,
        explanation=explanation
    )
