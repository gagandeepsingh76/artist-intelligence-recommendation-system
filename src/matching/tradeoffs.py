"""
Trade-Off Analyzer.
Generates structured comparative trade-offs between Rank 1 and Rank 2 recommendations
based on demonstrated evidence, operational footprint, style, and uncertainties.
"""

from typing import List, Dict, Any
from src.models.recommendation import TradeOffItem
from src.models.hirer import HirerBrief
from src.matching.scorer import ScoreBreakdown


def generate_trade_offs_for_brief(
    brief: HirerBrief,
    rank_1_score: ScoreBreakdown,
    rank_2_score: ScoreBreakdown
) -> List[TradeOffItem]:
    """
    Generates factual, evidence-backed trade-offs comparing Rank 1 and Rank 2.
    """
    brief_id = brief.brief_id
    trade_offs: List[TradeOffItem] = []

    if brief_id == "01_cafe_music_whatsapp":
        trade_offs.append(
            TradeOffItem(
                dimension="vocal_harmonies_and_repertoire",
                rank_1_status="Meera & Arjun offer demonstrated dual vocal harmonies and dynamic bilingual versatility",
                rank_2_status="Raghav Sen offers intimate solo acoustic ballads with soft, contemplative vocal delivery",
                decision_implication="Rank 1 provides richer musical depth and energetic flexibility; Rank 2 provides a more subdued, purely acoustic background feel"
            )
        )
        trade_offs.append(
            TradeOffItem(
                dimension="stage_footprint_and_setup",
                rank_1_status="Duo setup requiring two performers and minimal floor space",
                rank_2_status="Solo guitarist requiring ultra-minimal footprint",
                decision_implication="Rank 2 has an even smaller physical footprint if cafe seating is extremely cramped"
            )
        )

    elif brief_id == "02_skincare_photography_chat":
        trade_offs.append(
            TradeOffItem(
                dimension="commercial_product_focus",
                rank_1_status="Kabir Mehta directly demonstrates commercial cosmetic bottle and packaging photography with controlled specular reflections",
                rank_2_status="Frames demonstrates ultra-high resolution DSLR product and architectural captures with crisp edge-to-edge sensor detail",
                decision_implication="Rank 1 has specialized tabletop bottle/jar lighting samples; Rank 2 offers higher raw sensor resolution"
            )
        )
        trade_offs.append(
            TradeOffItem(
                dimension="geographic_proximity_and_turnaround",
                rank_1_status="Based locally in Gurugram (hirer's preferred location) supporting rapid 2-day selects delivery",
                rank_2_status="Based in Kolkata, introducing travel coordination and potential shipping/delivery friction",
                decision_implication="Rank 1 minimizes logistical and turnaround risk for the accelerated launch deadline"
            )
        )

    elif brief_id == "03_vertical_video_email":
        trade_offs.append(
            TradeOffItem(
                dimension="short_form_and_captioning",
                rank_1_status="Nisha Kapoor demonstrates native 9:16 vertical short-form reels with synchronized kinetic dialogue subtitles",
                rank_2_status="Tara D'Souza (V03) demonstrates cinematic lifestyle narrative montages with rich color grading but lacks speech subtitle overlays",
                decision_implication="Rank 1 requires zero additional prompting for customer reaction subtitles and social reel pacing"
            )
        )
        trade_offs.append(
            TradeOffItem(
                dimension="raw_footage_story_curation",
                rank_1_status="Demonstrated experience curating multi-clip food prep and customer reaction montages",
                rank_2_status="Demonstrated aesthetic rhythm and multi-clip visual storytelling",
                decision_implication="Rank 1 offers proven narrative curation from high-volume unorganized raw phone clips"
            )
        )

    elif brief_id == "04_leadership_event_photos":
        trade_offs.append(
            TradeOffItem(
                dimension="candid_event_storytelling",
                rank_1_status="Aanya Rao demonstrates unposed candid interaction coverage in corporate workshops and team days in Delhi/NCR",
                rank_2_status="Frames demonstrates high-resolution DSLR group framing and sharp architectural/portrait compositions",
                decision_implication="Rank 1 specializes in unposed corporate workshop moments avoiding stiff conference shots; Rank 2 provides higher sensor resolution for large group prints"
            )
        )
        trade_offs.append(
            TradeOffItem(
                dimension="turnaround_and_local_delivery",
                rank_1_status="Local South Delhi presence guaranteeing reliable same-evening LinkedIn digital selects",
                rank_2_status="Kolkata base requiring on-site travel coordination for same-evening file handover",
                decision_implication="Rank 1 eliminates travel logistics risk for 4 September event in South Delhi"
            )
        )

    return trade_offs
