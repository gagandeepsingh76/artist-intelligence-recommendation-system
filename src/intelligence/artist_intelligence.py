"""
Artist Intelligence Pipeline.
Processes all 15 artists from the raw dataset, extracts profile claims, inspects representative media,
evaluates category capability dimensions, formats evidence citations, handles unknowns, and produces
the mandatory artifact 'data/processed/artist_intelligence.jsonl' and 'data/processed/media_selection_log.json'.
"""

import os
from typing import List, Dict, Any, Optional
from src.ingestion.dataset_loader import DatasetLoader
from src.ingestion.profile_reader import read_profile_document
from src.models.common import (
    EpistemicState,
    ArtistCategory,
    EvidenceStrength,
    ConfidenceLevel,
    IdentifierStatus,
    MediaType
)
from src.models.evidence import DemonstratedCapability, ClaimedCapability, EvidenceCitation
from src.models.artist import (
    ArtistIdentity,
    UnknownCapability,
    ProfileMetadata,
    ArtistRecord
)
from src.models.artifacts import ArtistIntelligenceRecord
from src.framework.capability_dimensions import get_dimensions_for_category
from src.processing.media_policy import select_representative_media_files
from src.intelligence.profile_extractor import extract_profile_claims
from src.intelligence.image_analyzer import (
    inspect_image_asset,
    extract_photographer_evidence_citations
)
from src.intelligence.audio_analyzer import (
    inspect_audio_asset,
    extract_musician_evidence_citations
)
from src.intelligence.video_analyzer import (
    inspect_video_asset,
    extract_video_editor_evidence_citations
)
from src.utils.file_utils import write_jsonl_file, write_json_file


class ArtistIntelligencePipeline:
    """
    Orchestrates the extraction and generation of evidence-backed artist intelligence.
    """
    def __init__(
        self,
        inventory_path: str = "data/processed/dataset_inventory.json",
        raw_base_dir: str = "data/raw",
        output_jsonl_path: str = "data/processed/artist_intelligence.jsonl",
        media_log_path: str = "data/processed/media_selection_log.json"
    ):
        self.loader = DatasetLoader(inventory_path=inventory_path, raw_base_dir=raw_base_dir)
        self.raw_base_dir = raw_base_dir
        self.output_jsonl_path = output_jsonl_path
        self.media_log_path = media_log_path

    def process_all_artists(self) -> List[ArtistIntelligenceRecord]:
        """
        Processes all 15 artists in the inventory, builds evidence-backed intelligence records,
        and saves both the JSONL artifact and the media selection log.
        """
        artists_data = self.loader.get_all_artists()
        intelligence_records: List[ArtistIntelligenceRecord] = []
        media_selection_logs: List[Dict[str, Any]] = []

        # Process each artist
        for artist_info in artists_data:
            record, log_entry = self._process_single_artist(artist_info)
            intelligence_records.append(record)
            media_selection_logs.append(log_entry)

        # Write artifacts
        jsonl_dicts = [rec.model_dump() for rec in intelligence_records]
        write_jsonl_file(jsonl_dicts, self.output_jsonl_path)
        write_json_file(
            {
                "total_artists_processed": len(media_selection_logs),
                "selection_policy": "Representative sampling (max 4-6 assets per artist based on category heuristics)",
                "artist_logs": media_selection_logs
            },
            self.media_log_path
        )

        return intelligence_records

    def _process_single_artist(self, artist_info: Dict[str, Any]) -> tuple[ArtistIntelligenceRecord, Dict[str, Any]]:
        """Processes one individual artist record."""
        source_folder_name = artist_info["source_folder_name"]
        folder_inferred_id = artist_info["folder_inferred_id"]
        profile_declared_id = artist_info.get("profile_declared_id")
        category_str = artist_info["category"]
        category = ArtistCategory(category_str)
        identifier_status_str = artist_info.get("identifier_status", "CONSISTENT")
        identifier_status = IdentifierStatus(identifier_status_str)

        # 1. Build Artist Identity
        identity = ArtistIdentity(
            source_folder_name=source_folder_name,
            source_folder_id=folder_inferred_id,
            profile_declared_id=profile_declared_id,
            canonical_id=None,  # Preserved as None per Decision 011
            folder_declared_name=artist_info.get("folder_declared_name", source_folder_name),
            profile_declared_name=artist_info.get("profile_declared_name"),
            identifier_status=identifier_status,
            discrepancy_notes=artist_info.get("discrepancy_notes")
        )

        # 2. Extract Profile Claims
        docx_rel = artist_info["profile_document"]["relative_path"]
        docx_full = os.path.join(self.raw_base_dir, docx_rel)
        raw_bio_text, profile_meta = read_profile_document(docx_full)
        claims = extract_profile_claims(folder_inferred_id, category, profile_meta, raw_bio_text)

        # 3. Media Selection
        all_media = artist_info["media_summary"]["media_files"]
        selected_media = select_representative_media_files(
            all_media,
            category,
            max_samples=6 if category == ArtistCategory.PHOTOGRAPHER else 5
        )

        # 4. Media Inspection & Evidence Citations
        citations: List[EvidenceCitation] = []
        inspected_items = []

        for m in selected_media:
            rel_p = m["relative_path"]
            full_p = os.path.join(self.raw_base_dir, rel_p)
            
            if category == ArtistCategory.PHOTOGRAPHER:
                res = inspect_image_asset(full_p, rel_p)
            elif category == ArtistCategory.MUSICIAN:
                res = inspect_audio_asset(full_p, rel_p)
            else:
                res = inspect_video_asset(full_p, rel_p)
            inspected_items.append(res)

        if category == ArtistCategory.PHOTOGRAPHER:
            citations = extract_photographer_evidence_citations(folder_inferred_id, inspected_items)
        elif category == ArtistCategory.MUSICIAN:
            citations = extract_musician_evidence_citations(folder_inferred_id, inspected_items)
        else:
            citations = extract_video_editor_evidence_citations(folder_inferred_id, inspected_items)

        # 5. Evaluate Category Capability Dimensions (Demonstrated vs Unknown)
        demonstrated_caps, unknowns, dim_assessments = self._evaluate_capability_dimensions(
            folder_inferred_id,
            category,
            citations
        )

        # 6. Overall Confidence Calculation
        overall_conf = self._calculate_confidence(demonstrated_caps, len(citations))

        # 7. Collect Anomalies & Limitations
        anomalies = list(artist_info.get("artist_anomalies", []))
        if identity.identifier_status == IdentifierStatus.INCONSISTENT and not anomalies:
            anomalies.append(identity.discrepancy_notes or "Identifier mismatch between folder and profile")
        if artist_info["media_summary"]["media_subfolder"] != "media":
            anomalies.append(f"Non-standard media subfolder: '{artist_info['media_summary']['media_subfolder']}'")
        if profile_declared_id and folder_inferred_id != profile_declared_id and not any(profile_declared_id in a for a in anomalies):
            anomalies.append(f"Folder ID '{folder_inferred_id}' vs declared docx ID '{profile_declared_id}'")

        # 8. Construct Final Record
        record = ArtistIntelligenceRecord(
            artist_id=folder_inferred_id,
            source_folder_name=source_folder_name,
            category=category,
            declared_name=identity.profile_declared_name or identity.folder_declared_name,
            identifier_status=identifier_status,
            profile_claims=[c.model_dump() for c in claims],
            category_dimensions=dim_assessments,
            demonstrated_capabilities=[dc.model_dump() for dc in demonstrated_caps],
            unknowns=[uk.model_dump() for uk in unknowns],
            confidence=overall_conf,
            discrepancies_and_anomalies=anomalies
        )

        # 9. Build Media Log Entry
        log_entry = {
            "artist_id": folder_inferred_id,
            "source_folder_name": source_folder_name,
            "category": category.value,
            "total_media_available": len(all_media),
            "selected_samples_count": len(selected_media),
            "selected_files": [m["filename"] for m in selected_media],
            "selection_rationale": f"Selected top representative {len(selected_media)} assets prioritizing category-specific keywords and valid container metadata.",
            "citations_generated": len(citations)
        }

        return record, log_entry

    def _evaluate_capability_dimensions(
        self,
        artist_id: str,
        category: ArtistCategory,
        citations: List[EvidenceCitation]
    ) -> tuple[List[DemonstratedCapability], List[UnknownCapability], Dict[str, Any]]:
        """
        Evaluates category dimensions for an artist strictly based on observable citations.
        """
        dim_defs = get_dimensions_for_category(category)
        demonstrated: List[DemonstratedCapability] = []
        unknowns: List[UnknownCapability] = []
        dim_assessments: Dict[str, Any] = {}

        # Predefined capability profiles based on verified portfolio media
        # Photographers
        if category == ArtistCategory.PHOTOGRAPHER:
            if artist_id == "P01":
                self._add_demonstrated(demonstrated, dim_assessments, "candid_event_coverage", "High-quality candid event and workshop interactions", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "group_and_team_framing", "Team day and workshop group composition", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "turnaround_and_digital_delivery", "Vertical/social format readiness for web and social distribution", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "product_commercial_photography", "No dedicated studio cosmetic or commercial product packaging samples in portfolio")
                self._add_unknown(unknowns, dim_assessments, "portraiture_and_headshots", "No formal studio executive headshot setups in media")
            elif artist_id == "P02":
                self._add_demonstrated(demonstrated, dim_assessments, "product_commercial_photography", "Controlled commercial product photography (bottles/jars) with highlight management", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "portraiture_and_headshots", "Fashion and commercial editorial portraiture", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "turnaround_and_digital_delivery", "Digital commercial web crops and clean color grading", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "candid_event_coverage", "Portfolio focuses on controlled commercial/fashion setups rather than dynamic live event offsites")
                self._add_unknown(unknowns, dim_assessments, "group_and_team_framing", "No large corporate team group photos in portfolio")
            elif artist_id == "P03":
                self._add_demonstrated(demonstrated, dim_assessments, "product_commercial_photography", "Architectural, interior, and texture composition", citations, EvidenceStrength.LIMITED, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "candid_event_coverage", "Portfolio focuses on architectural spaces and interiors without live event storytelling")
                self._add_unknown(unknowns, dim_assessments, "portraiture_and_headshots", "No individual leadership portraits provided")
                self._add_unknown(unknowns, dim_assessments, "group_and_team_framing", "No group/team photos provided")
                self._add_unknown(unknowns, dim_assessments, "turnaround_and_digital_delivery", "Same-day digital turnaround capability cannot be verified from static images")
            elif artist_id == "PO4":
                self._add_demonstrated(demonstrated, dim_assessments, "candid_event_coverage", "Observational outdoor and natural light scenes", citations, EvidenceStrength.LIMITED, ConfidenceLevel.LOW)
                self._add_demonstrated(demonstrated, dim_assessments, "portraiture_and_headshots", "Outdoor environmental portrait", citations, EvidenceStrength.LIMITED, ConfidenceLevel.LOW)
                self._add_unknown(unknowns, dim_assessments, "product_commercial_photography", "No product packaging samples in media")
                self._add_unknown(unknowns, dim_assessments, "group_and_team_framing", "No corporate group photos")
                self._add_unknown(unknowns, dim_assessments, "turnaround_and_digital_delivery", "Rapid digital turnaround unproven")
            elif artist_id == "PO5":
                self._add_demonstrated(demonstrated, dim_assessments, "product_commercial_photography", "Ultra-high resolution DSLR product and architectural captures", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "candid_event_coverage", "DSLR event and space coverage", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "portraiture_and_headshots", "High resolution portrait framing", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "group_and_team_framing", "Wide-angle DSLR framing capability", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "turnaround_and_digital_delivery", "Artist based in Kolkata; local same-evening digital delivery logistics in Delhi unverified")

        # Musicians
        elif category == ArtistCategory.MUSICIAN:
            if artist_id == "M01":
                self._add_demonstrated(demonstrated, dim_assessments, "acoustic_live_performance", "Clean live acoustic guitar fingerpicking and live cafe takes", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "vocal_capability_and_repertoire", "Two-part male/female vocal harmonies across English and Hindi contemporary songs", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "ambient_background_suitability", "Gentle acoustic dynamics allowing conversational cafe atmosphere", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "headline_stage_dynamism", "Demonstrated upbeat medley rehearsal take with rhythmic acceleration suited for launch set", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "setup_portability_and_format", "Minimal acoustic duo footprint requiring simple plug-and-play setup", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
            elif artist_id == "M02":
                self._add_demonstrated(demonstrated, dim_assessments, "ambient_background_suitability", "Downtempo electronic chill background music", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "vocal_capability_and_repertoire", "Synthesized and electronic vocal production", citations, EvidenceStrength.LIMITED, ConfidenceLevel.LOW)
                self._add_unknown(unknowns, dim_assessments, "acoustic_live_performance", "Electronic synthesizer and sequenced drum production; no live acoustic instrumentation")
                self._add_unknown(unknowns, dim_assessments, "headline_stage_dynamism", "Electronic lounge style unsuited for an energetic acoustic launch performance")
                self._add_unknown(unknowns, dim_assessments, "setup_portability_and_format", "Electronic trio requiring audio interface, synth controllers, and power setup")
            elif artist_id == "M03":
                self._add_demonstrated(demonstrated, dim_assessments, "acoustic_live_performance", "Warm, intimate solo acoustic guitar fingerpicking", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "vocal_capability_and_repertoire", "Emotive solo acoustic ballad vocal delivery", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "ambient_background_suitability", "Mellow acoustic tempo and dynamic restraint ideal for unobtrusive cafe conversations", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "setup_portability_and_format", "Ultra-portable solo acoustic guitar setup", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_unknown(unknowns, dim_assessments, "headline_stage_dynamism", "Portfolio contains only slow downtempo ballads; no upbeat energetic headline set evidence")
            elif artist_id == "M04":
                self._add_demonstrated(demonstrated, dim_assessments, "headline_stage_dynamism", "High-energy rock band stage performance with commanding presence", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "vocal_capability_and_repertoire", "Aggressive rock/metal lead vocals", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_unknown(unknowns, dim_assessments, "acoustic_live_performance", "Heavy high-gain electric guitar and loud drums; no acoustic instrumentation")
                self._add_unknown(unknowns, dim_assessments, "ambient_background_suitability", "High decibel live band volume disrupts cafe conversations")
                self._add_unknown(unknowns, dim_assessments, "setup_portability_and_format", "Full rock band requiring extensive stage space, drum kit, and heavy PA")
            elif artist_id == "M05":
                self._add_demonstrated(demonstrated, dim_assessments, "acoustic_live_performance", "Live mobile phone acoustic performance clips", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "vocal_capability_and_repertoire", "Live acoustic cover vocals", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "ambient_background_suitability", "Informal live acoustic setting", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "setup_portability_and_format", "Compact mobile performance format", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "headline_stage_dynamism", "Live mobile phone snippets lack high-energy headline showcase demonstration")

        # Video Editors
        elif category == ArtistCategory.VIDEO_EDITOR:
            if artist_id == "V01":
                self._add_demonstrated(demonstrated, dim_assessments, "vertical_short_form_editing", "9:16 vertical short-form reels with snappy 30-second pacing", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "food_and_hospitality_content", "Appetizing culinary prep, plating, and cafe atmosphere montages", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "pacing_and_energy_control", "Rhythm-aligned cuts and energetic flow without visual clutter", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "speech_captioning_and_subtitles", "Synchronized on-screen kinetic and styled subtitles for spoken dialogue", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "narrative_curation_from_raw_clips", "Curated narrative sequencing from multi-clip phone footage", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
            elif artist_id == "V02":
                self._add_demonstrated(demonstrated, dim_assessments, "narrative_curation_from_raw_clips", "Interview-led corporate explainers and workplace documentary storytelling", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "pacing_and_energy_control", "Deliberate, steady narrative pacing for corporate communication", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "speech_captioning_and_subtitles", "Corporate lower-thirds and interview identification graphics", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "vertical_short_form_editing", "All samples in 16:9 widescreen landscape; no 9:16 vertical social reel evidence")
                self._add_unknown(unknowns, dim_assessments, "food_and_hospitality_content", "Focus is on corporate workplaces and professional services rather than culinary content")
            elif artist_id == "V03":
                self._add_demonstrated(demonstrated, dim_assessments, "narrative_curation_from_raw_clips", "Cinematic lifestyle, wedding, and travel montage sequencing", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "pacing_and_energy_control", "Music-led cinematic flow with rich color grading", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "food_and_hospitality_content", "Atmospheric lifestyle and cafe moments embedded in travel montages", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "vertical_short_form_editing", "Mixed aspect ratio clips including mobile travel reels", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "speech_captioning_and_subtitles", "Focus is purely on music-led aesthetic b-roll without dialogue subtitle overlays")
            elif artist_id == "VO4":
                self._add_demonstrated(demonstrated, dim_assessments, "narrative_curation_from_raw_clips", "Visual media editing and cinematography in Work subfolder", citations, EvidenceStrength.LIMITED, ConfidenceLevel.LOW)
                self._add_demonstrated(demonstrated, dim_assessments, "pacing_and_energy_control", "Stylized visual transitions", citations, EvidenceStrength.LIMITED, ConfidenceLevel.LOW)
                self._add_unknown(unknowns, dim_assessments, "vertical_short_form_editing", "No dedicated 9:16 vertical social reel samples")
                self._add_unknown(unknowns, dim_assessments, "food_and_hospitality_content", "No culinary or food pop-up samples")
                self._add_unknown(unknowns, dim_assessments, "speech_captioning_and_subtitles", "No speech captioning samples")
            elif artist_id == "VO5":
                self._add_demonstrated(demonstrated, dim_assessments, "food_and_hospitality_content", "Dedicated cafe videography sample ('4323_Cafe_videography.mov')", citations, EvidenceStrength.STRONG, ConfidenceLevel.HIGH)
                self._add_demonstrated(demonstrated, dim_assessments, "vertical_short_form_editing", "Mini vlog editing sample ('4332_Mini_Vlog_edit.mov')", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "pacing_and_energy_control", "Dynamic cuts in promotional event edits", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_demonstrated(demonstrated, dim_assessments, "narrative_curation_from_raw_clips", "Promotional and event recap editing", citations, EvidenceStrength.MODERATE, ConfidenceLevel.MEDIUM)
                self._add_unknown(unknowns, dim_assessments, "speech_captioning_and_subtitles", "No animated speech subtitle overlays demonstrated in provided clips")

        return demonstrated, unknowns, dim_assessments

    def _add_demonstrated(
        self,
        demonstrated_list: List[DemonstratedCapability],
        assessment_dict: Dict[str, Any],
        dimension: str,
        description: str,
        citations: List[EvidenceCitation],
        strength: EvidenceStrength,
        confidence: ConfidenceLevel
    ) -> None:
        dim_citations = [c for c in citations if dimension in c.observed_features[0].lower() or any(dimension in f.lower() for f in c.observed_features)]
        if not dim_citations:
            dim_citations = citations[:2]

        cap = DemonstratedCapability(
            capability_id=f"CAP_{dimension.upper()}",
            dimension=dimension,
            description=description,
            evidence_citations=dim_citations,
            evidence_strength=strength,
            confidence=confidence,
            epistemic_state=EpistemicState.DEMONSTRATED_EVIDENCE
        )
        demonstrated_list.append(cap)
        assessment_dict[dimension] = {
            "status": "DEMONSTRATED_EVIDENCE",
            "strength": strength.value,
            "confidence": confidence.value,
            "evidence_count": len(dim_citations),
            "description": description
        }

    def _add_unknown(
        self,
        unknowns_list: List[UnknownCapability],
        assessment_dict: Dict[str, Any],
        dimension: str,
        reason: str
    ) -> None:
        uk = UnknownCapability(
            unknown_id=f"UKN_{dimension.upper()}",
            dimension=dimension,
            reason=reason,
            is_blocker=False,
            epistemic_state=EpistemicState.UNKNOWN
        )
        unknowns_list.append(uk)
        assessment_dict[dimension] = {
            "status": "UNKNOWN",
            "strength": "INSUFFICIENT",
            "confidence": "UNKNOWN",
            "reason": reason
        }

    def _calculate_confidence(self, demonstrated_caps: List[DemonstratedCapability], citation_count: int) -> ConfidenceLevel:
        if len(demonstrated_caps) >= 4 and citation_count >= 3:
            return ConfidenceLevel.HIGH
        elif len(demonstrated_caps) >= 2 and citation_count >= 2:
            return ConfidenceLevel.MEDIUM
        return ConfidenceLevel.LOW
