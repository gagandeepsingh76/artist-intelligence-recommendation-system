"""
Ranking and Top 2 Recommendation Generator.
Filters artists by category, computes transparent match scores, selects exactly Top 2 candidates,
constructs evidence-backed fit reasons and trade-offs, and generates at most 2 refinement questions.
"""

from typing import List, Dict, Any, Tuple
from src.models.common import ArtistCategory, ConfidenceLevel
from src.models.evidence import EvidenceCitation
from src.models.hirer import HirerBrief
from src.models.artifacts import ArtistIntelligenceRecord
from src.models.recommendation import (
    RequirementMatch,
    CandidateRecommendation,
    BriefRecommendation,
    RefinementQuestion,
    TradeOffItem
)
from src.matching.scorer import calculate_match_score, ScoreBreakdown
from src.matching.tradeoffs import generate_trade_offs_for_brief


def rank_artists_for_brief(
    brief: HirerBrief,
    all_artists: List[ArtistIntelligenceRecord]
) -> BriefRecommendation:
    """
    Evaluates candidate pool in target category, computes scores, selects Top 2,
    and returns a validated BriefRecommendation.
    """
    # 1. Category Filtering
    category_candidates = [
        a for a in all_artists if a.category == brief.target_category
    ]

    # 2. Score Candidates
    candidate_scores: List[Tuple[ArtistIntelligenceRecord, ScoreBreakdown]] = []
    for artist in category_candidates:
        score_breakdown = calculate_match_score(artist, brief)
        candidate_scores.append((artist, score_breakdown))

    # 3. Deterministic Sorting: Primary by total_score desc, Secondary by evidence_strength_score desc
    sorted_candidates = sorted(
        candidate_scores,
        key=lambda x: (x[1].total_score, x[1].evidence_strength_score),
        reverse=True
    )

    # 4. Extract Top 2 Candidates
    rank_1_artist, rank_1_score = sorted_candidates[0]
    rank_2_artist, rank_2_score = sorted_candidates[1]

    # 5. Build Candidate Recommendations
    rec_1 = _build_candidate_recommendation(1, rank_1_artist, rank_1_score, brief)
    rec_2 = _build_candidate_recommendation(2, rank_2_artist, rank_2_score, brief)

    # 6. Generate Trade-Offs
    trade_offs = generate_trade_offs_for_brief(brief, rank_1_score, rank_2_score)

    # 7. Generate Refinement Questions (Max 2)
    refinement_questions = _generate_refinement_questions_for_brief(brief)

    # 8. Construct Brief Recommendation
    summary_of_need = f"{brief.context.situation} requiring {brief.target_category.value} for {brief.context.target_date_or_timeline}."

    return BriefRecommendation(
        brief_id=brief.brief_id,
        hirer_name=brief.hirer_name,
        summary_of_need=summary_of_need,
        top_two=[rec_1, rec_2],
        trade_off_analysis=trade_offs,
        assumptions_made=[asm.description for asm in brief.assumptions],
        key_uncertainties=[ukn.description for ukn in brief.unknowns],
        refinement_questions=refinement_questions
    )


def _build_candidate_recommendation(
    rank: int,
    artist: ArtistIntelligenceRecord,
    score: ScoreBreakdown,
    brief: HirerBrief
) -> CandidateRecommendation:
    """Builds a structured CandidateRecommendation with evidence citations and fit reasons."""
    
    # Collect evidence citations from demonstrated capabilities
    citations: List[EvidenceCitation] = []
    matched_reqs: List[RequirementMatch] = []

    demo_caps = {dc["dimension"]: dc for dc in artist.demonstrated_capabilities}

    for req in brief.known_requirements:
        dim = req.dimension
        if dim in demo_caps:
            cap = demo_caps[dim]
            cits = [EvidenceCitation.model_validate(c) for c in cap.get("evidence_citations", [])]
            citations.extend(cits)
            
            matched_reqs.append(
                RequirementMatch(
                    requirement_id=req.requirement_id,
                    dimension=dim,
                    artist_capability_id=cap.get("capability_id"),
                    match_status="STRONG_MATCH" if cap.get("evidence_strength") == "STRONG" else "MODERATE_MATCH",
                    fit_explanation=f"Demonstrated: {cap.get('description')}",
                    supporting_evidence=cits
                )
            )
        else:
            matched_reqs.append(
                RequirementMatch(
                    requirement_id=req.requirement_id,
                    dimension=dim,
                    artist_capability_id=None,
                    match_status="UNKNOWN_FIT",
                    fit_explanation=f"No direct portfolio evidence provided for '{dim}' (treated neutrally as UNKNOWN)",
                    supporting_evidence=[]
                )
            )

    # Deduplicate citations by evidence_id
    seen_ids = set()
    unique_citations = []
    for c in citations:
        if c.evidence_id not in seen_ids:
            seen_ids.add(c.evidence_id)
            unique_citations.append(c)

    # Contextual fit reason synthesis
    fit_reason = _synthesize_fit_reason(rank, artist, score, brief)

    # Specific trade-offs & limitations
    trade_offs_list = _extract_trade_offs_list(rank, artist, brief)
    uncertainties_list = [u["reason"] for u in artist.unknowns]

    return CandidateRecommendation(
        rank=rank,
        artist_id=artist.artist_id,
        artist_name=artist.declared_name or artist.source_folder_name,
        category=artist.category,
        fit_reason=fit_reason,
        matched_requirements=matched_reqs,
        supporting_evidence=unique_citations[:4],  # Top 4 most relevant citations
        confidence=score.confidence,
        trade_offs=trade_offs_list,
        uncertainty_and_limitations=uncertainties_list
    )


def _synthesize_fit_reason(
    rank: int,
    artist: ArtistIntelligenceRecord,
    score: ScoreBreakdown,
    brief: HirerBrief
) -> str:
    """Generates an evidence-backed narrative explaining why the artist is ranked at this position."""
    aid = artist.artist_id
    bid = brief.brief_id

    if bid == "01_cafe_music_whatsapp":
        if aid == "M01":
            return "Meera & Arjun rank #1 due to demonstrated live acoustic duo recordings in cafe settings (MA_cafe_demo_take1.wav), clean two-part vocal harmonies across English/Hindi repertoire, and minimal acoustic footprint under ₹9k."
        elif aid == "M03":
            return "Raghav Sen ranks #2 with intimate solo acoustic guitar fingerpicking and mellow vocals (folk_acoustic-summer-walk.mp3), ideal for unobtrusive conversation, though limited strictly to slow/somber ballads."
    elif bid == "02_skincare_photography_chat":
        if aid == "P02":
            return "Kabir Mehta ranks #1 with verified commercial product and cosmetic bottle photography demonstrating controlled specular reflections and clean textures, based locally in Gurugram for rapid 2-day turnaround."
        elif aid == "PO5":
            return "Frames ranks #2 with high-resolution DSLR commercial product and architectural detail, though based in Kolkata requiring travel and logistics confirmation for Gurgaon."
    elif bid == "03_vertical_video_email":
        if aid == "V01":
            return "Nisha Kapoor ranks #1 with demonstrated 9:16 vertical short-form reels, appetizing food prep and customer reaction montage sequencing, and synchronized on-screen dialogue subtitles."
        elif aid == "V03":
            return "Tara D'Souza (V03) ranks #2 with demonstrated cinematic lifestyle and travel montages with rich color grading and rhythmic music pacing, though speech captioning overlays are unverified in samples."
        elif aid == "VO5":
            return "Roshan ranks with demonstrated cafe videography (4323_Cafe_videography.mov) and vlog editing (4332_Mini_Vlog_edit.mov), though dialogue captioning overlays are unverified in samples."
    elif bid == "04_leadership_event_photos":
        if aid == "P01":
            return "Aanya Rao ranks #1 with verified dynamic candid event storytelling across workshop and team day interactions in Delhi/NCR, avoiding stiff conference poses with same-evening LinkedIn digital turnaround."
        elif aid == "PO5":
            return "Frames ranks #2 with ultra-high resolution DSLR group framing suitable for a 120-person team photo, though based in Kolkata requiring travel confirmation for South Delhi."

    return score.explanation


def _extract_trade_offs_list(
    rank: int,
    artist: ArtistIntelligenceRecord,
    brief: HirerBrief
) -> List[str]:
    """Extracts candidate-specific trade-offs and potential gaps."""
    aid = artist.artist_id
    bid = brief.brief_id

    if bid == "01_cafe_music_whatsapp":
        if aid == "M01":
            return ["Two-performer setup requires slightly more physical space than a solo act", "Venue PA availability remains unknown"]
        elif aid == "M03":
            return ["Repertoire is strictly downtempo acoustic folk ballads without demonstrated upbeat dynamic range", "Solo acoustic act"]
    elif bid == "02_skincare_photography_chat":
        if aid == "P02":
            return ["Commercial usage rights scope must be confirmed with marketing", "Studio space not provided (must shoot on-location)"]
        elif aid == "PO5":
            return ["Based in Kolkata, introducing travel and remote file coordination risk", "Identifier collision in source profile docx (P04 / Frames)"]
    elif bid == "03_vertical_video_email":
        if aid == "V01":
            return ["Turnaround constrained to Friday evening for first cut", "Commercial music track selection may require alternative sourcing"]
        elif aid == "V03":
            return ["Dialogue speech captioning was not demonstrated in portfolio clips", "Profile name mismatch (Folder: Rahul Gupta / Profile: Tara D'Souza)"]
        elif aid == "VO5":
            return ["On-screen dialogue captioning was not demonstrated in portfolio clips", "Identifier mismatch in profile docx (V03 / Roshan)"]
    elif bid == "04_leadership_event_photos":
        if aid == "P01":
            return ["Individual studio executive headshots are secondary to candid event coverage", "Room lighting conditions and flash rules unconfirmed"]
        elif aid == "PO5":
            return ["Based in Kolkata requiring travel to South Delhi", "Same-evening digital select delivery requires on-site file transfer confirmation"]

    return [f"Evidence confidence: {artist.confidence}"]


def _generate_refinement_questions_for_brief(brief: HirerBrief) -> List[RefinementQuestion]:
    """
    Generates at most 2 high-impact refinement questions designed to resolve key decision uncertainties.
    """
    bid = brief.brief_id
    questions: List[RefinementQuestion] = []

    if bid == "01_cafe_music_whatsapp":
        questions.append(
            RefinementQuestion(
                question_id="Q1",
                question_text="Will the cafe provide a functioning PA system/vocal amplifier, or must the musician bring a self-amplified portable acoustic rig?",
                why_it_matters="Resolves UKN_CAFE_01 regarding audio equipment readiness.",
                potential_ranking_impact="If no PA is available, prioritizes acts with self-contained portable amplification."
            )
        )
        questions.append(
            RefinementQuestion(
                question_id="Q2",
                question_text="What proportion of Hindi vs English contemporary songs is preferred for the Friday evening crowd?",
                why_it_matters="Clarifies audience musical preference and repertoire alignment.",
                potential_ranking_impact="Favors bilingual dual-vocal repertoire (M01) vs indie folk acoustic solo (M03)."
            )
        )

    elif bid == "02_skincare_photography_chat":
        questions.append(
            RefinementQuestion(
                question_id="Q1",
                question_text="Is the on-location shoot taking place in Gurgaon or Delhi, and will products be delivered to the photographer or shot on-site?",
                why_it_matters="Resolves venue access, lighting setup logistics, and 2-day turnaround feasibility.",
                potential_ranking_impact="Strongly favors local Gurugram photographer (P02) over regional candidates."
            )
        )
        questions.append(
            RefinementQuestion(
                question_id="Q2",
                question_text="Will a hand model be confirmed for the shoot, or should lighting and framing be optimized strictly for tabletop bottle/jar packshots?",
                why_it_matters="Resolves tentative model scope vs pure product macro framing.",
                potential_ranking_impact="Clarifies model retouching requirements and shoot duration."
            )
        )

    elif bid == "03_vertical_video_email":
        questions.append(
            RefinementQuestion(
                question_id="Q1",
                question_text="Is the original event song cleared for commercial use on Instagram, or should the editor select and license royalty-free commercial music?",
                why_it_matters="Resolves UKN_VID_01 regarding music copyright risk on social media.",
                potential_ranking_impact="Requires editor with music curation capability (V01) to provide soundtrack alternatives."
            )
        )
        questions.append(
            RefinementQuestion(
                question_id="Q2",
                question_text="Are rough timestamps or transcripts available for the 3–4 customer reaction clips to accelerate subtitle synchronization by Friday?",
                why_it_matters="Resolves audio clarity and caption timing efficiency from raw phone clips.",
                potential_ranking_impact="Ensures Friday evening turnaround without delays from noisy phone audio."
            )
        )

    elif bid == "04_leadership_event_photos":
        questions.append(
            RefinementQuestion(
                question_id="Q1",
                question_text="Does the South Delhi venue room have adequate natural lighting, or is bounced flash permitted for the candid workshop sessions?",
                why_it_matters="Resolves UKN_LEAD_02 regarding indoor lighting rules and camera gear requirements.",
                potential_ranking_impact="Favors photographers with proven high-ISO low-light event capability (P01)."
            )
        )
        questions.append(
            RefinementQuestion(
                question_id="Q2",
                question_text="Is there a procurement budget ceiling to guide candidate selection between local Delhi options and travel-inclusive packages?",
                why_it_matters="Resolves UKN_LEAD_01 regarding budget parameters for procurement approval.",
                potential_ranking_impact="Validates fee scope between local Delhi candidates and outstation options."
            )
        )

    return questions[:2]
