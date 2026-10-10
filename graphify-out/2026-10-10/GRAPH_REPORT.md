# Graph Report - sadaa  (2026-09-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2503 nodes · 5069 edges · 209 communities (147 shown, 62 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 159 edges (avg confidence: 0.77)
- Token cost: 222,032 input · 2,795 output

## Graph Freshness
- Built from commit: `870f9a5b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- NPM Dependencies
- Color Design Tokens
- Slide Deck Skill
- Error Boundary & Layout Toggle
- Screen UI Components
- Push Notifications & FCM
- Package Manifest
- Custom Input Component
- Location & Permissions Hooks
- Navigation Structure
- Marketplace Domain Concepts
- Scroll & Bottom Bar Context
- Theme Provider & Tokens
- Slide Search CLI
- Design Skills Collection
- Corporate Identity Program
- Tailwind Config Tests
- Theme Hooks
- Design System Generator CLI
- Token Validator Tests
- Identity Account Screens
- Logo Design Search
- Component Design Tokens
- HTML Token Validator
- Network & Retry Utilities
- Custom Button & Theme Types
- Gallery & Blur Modals
- Auth State & API
- Profile & BottomSheet UI
- App Config & Env
- BM25 Search Algorithm
- Slide Generator Script
- Spacing Tokens
- Tailwind Config Generator
- Redux Middleware & Error Handler
- Auth Hooks
- shadcn Component List
- Core App Infrastructure
- Slide Background Fetcher
- Dev Dependencies
- App Root & Store
- Toast Service
- Base API & Config API
- Icon Generator
- Auth Navigation & OTP
- Semantic Color Tokens
- Design System Generator
- Bottom Bar Component
- UI Primitives & Header
- Banner Sizes Reference
- shadcn Accessibility Patterns
- i18n Localization Setup
- Canvas Design System
- Tailwind Utility Reference
- App Status & Storage
- Color Palette Definitions
- CIP HTML Rendering
- Tailwind Integration
- Font Size Tokens
- Color Sync Script
- MMKV Persistence & Redux Store
- Brand Color Extraction
- Logo Style Guide
- App Bootstrap
- Brand-to-Tokens Sync
- Asset Validator
- Logo Generation Script
- Primitive Radius & Shadow Tokens
- TypeScript Config
- Brand Guidelines Template
- Logo Color Psychology
- Token Validator Script
- Design Tokens Starter
- shadcn Installer Tests
- Choose Language Screen
- Typography Specifications
- Card Component Tokens
- shadcn Installer Methods
- shadcn Installer Class
- Config File Generation
- UI Styling Skill
- Home Screen UI Patterns
- Design System Rule
- Brand Context Injection
- Token Embedding Script
- Tailwind Responsive Design
- Icon & Layout Guidelines
- Forgot Password Flow
- Auth API Endpoints
- Brand Consistency Checklist
- Slide Design System
- Config Generator Base
- Logo Usage Rules
- Messaging Framework
- CIP Style Guide
- Logo AI Prompt Engineering
- Token Generation Script
- Button Component Tokens
- Animation Duration Tokens
- shadcn Theming
- Auth & Navigation
- Utils & System Bars
- App Entry & Notifications
- Design Token Primitives
- Component Install Tests
- Config Validity Tests
- Corporate Identity Deliverables
- UI Component Specs
- Input Token Config
- SVG Curved Bar Background
- Design Skills Suite
- HTML Slide Deck Infrastructure
- Brand Guidelines Template
- Brand Voice Development
- CIP Mockup Prompts
- Form Components
- NPM Scripts
- API Response Types
- Asset Approval Checklist
- Asset Organization Guide
- Manifest Config
- UI Primitives & Theme
- Color Palette Management
- Voice Dimensions
- Border Token
- Radius Token
- Large Size Token
- Small Size Token
- UI Styling Test Requirements
- Metro Config
- Spacing & List Styles
- Padding-Y Token
- XL Size Token
- None Token
- iOS Run README
- Design System Generation
- Env Loader
- Value Token 16
- Value Token 1
- Value Token 3
- Value Token 8
- Destructive Color Token
- Destructive Foreground Token
- Muted Color Token
- Primary Foreground Token
- Ring Color Token
- Secondary Foreground Token
- Installer Init
- Temp Project Fixture
- ESLint Config Rules
- React Native Config Types
- React Native Restart Types
- Apache License
- Domain Architecture Rule
- No-Config Component Test
- Already-Installed Component Test
- Default Project Root Test
- Custom Project Root Test
- Dry Run Init Test
- Installed Components Test
- Empty Components List Test
- Add Fonts Test
- Plugin Dedup Test
- Plugin Recommendations Test
- Next.js Plugin Test
- Default TypeScript Init Test
- JavaScript Config Test
- Config Colors Test
- Config Plugins Test
- Valid Config Test
- No Content Paths Test
- Write Config Content Test
- Invalid Path Write Test
- Full TypeScript Config Test
- Default Output Path Test
- Base Config Structure Test
- React Content Paths Test
- Vue Content Paths Test
- Toast Service
- Node Engines
- Ratings & Badges
- Search Domains
- Search Stacks
- Bootsplash Logo
- Bootsplash Logo 1.5x
- Bootsplash Logo Sada
- Bootsplash Logo 3x
- Bootsplash Logo 4x
- CLAUDE.md Project Guide
- Voice Testing
- Analogous Harmony
- Monochromatic Harmony
- Triadic Harmony
- Naming Convention
- Responsive Scaling Utils
- Slide Charts Data
- Slide Copy Data
- Slide Layouts Data
- Sada Logo
- SANADK Logo Asset
- Auth API Hooks
- Preferences API Hooks
- App Config

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 88 edges
2. `react` - 87 edges
3. `react-native` - 59 edges
4. `TailwindConfigGenerator` - 58 edges
5. `Box` - 44 edges
6. `moderateScale()` - 39 edges
7. `TestTailwindConfigGenerator` - 35 edges
8. `ShadcnInstaller` - 34 edges
9. `Text` - 32 edges
10. `SpacingToken` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Form` --references--> `react-hook-form`  [EXTRACTED]
  .claude/skills/ui-styling/references/shadcn-components.md → package.json
- `TestGeneratedConfigIsValidJs` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .claude/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .claude/skills/ui-styling/scripts/tailwind_config_gen.py
- `TestTailwindConfigGenerator` --uses--> `TailwindConfigGenerator`  [INFERRED]
  .claude/skills/ui-styling/scripts/tests/test_tailwind_config_gen.py → .claude/skills/ui-styling/scripts/tailwind_config_gen.py
- `TestShadcnInstaller` --uses--> `ShadcnInstaller`  [INFERRED]
  .claude/skills/ui-styling/scripts/tests/test_shadcn_add.py → .claude/skills/ui-styling/scripts/shadcn_add.py
- `GalleryModalComponent()` --calls--> `moderateScale()`  [EXTRACTED]
  src/shared/ui/GalleryModal/GalleryModal.tsx → src/core/theme/utils/responsive.ts

## Import Cycles
- 2-file cycle: `src/shared/ui/AnimatedIconHero/AnimatedIconHero.tsx -> src/shared/ui/index.ts -> src/shared/ui/AnimatedIconHero/AnimatedIconHero.tsx`

## Hyperedges (group relationships)
- **Brand Guidelines Sections** — claude_skills_brand_references_visual_identity_color_palette, claude_skills_brand_references_visual_identity_typography, claude_skills_brand_templates_brand_guidelines_starter_logo_usage, claude_skills_brand_templates_brand_guidelines_starter_voice_tone, claude_skills_brand_templates_brand_guidelines_starter_design_components [EXTRACTED 0.80]
- **Banner Design Principles** — _claude_skills_banner_design_references_banner_sizes_and_styles_visual_hierarchy, _claude_skills_banner_design_references_banner_sizes_and_styles_safe_zones, claude_skills_design_references_banner_sizes_and_styles_cta_rules, _claude_skills_banner_design_references_banner_sizes_and_styles_typography, _claude_skills_banner_design_references_banner_sizes_and_styles_text_image_ratio [EXTRACTED 0.80]
- **Before Using Logo Checklist** — claude_skills_brand_references_logo_usage_rules_variants, claude_skills_brand_references_logo_usage_rules_color_usage, claude_skills_brand_references_logo_usage_rules_minimum_size, claude_skills_brand_references_logo_usage_rules_clear_space, claude_skills_brand_references_logo_usage_rules_approval_process [EXTRACTED 0.80]
- **Slide Layout Pattern Catalog** — claude_skills_slides_references_layout_patterns_title_slide, claude_skills_slides_references_layout_patterns_two_column_split, claude_skills_slides_references_layout_patterns_feature_grid, claude_skills_slides_references_layout_patterns_metrics_dashboard [EXTRACTED 0.80]
- **Trust & Money Layer** — project_define_escrow, project_define_contracts, project_define_invoices, project_define_refund_pipeline, project_define_dispute [EXTRACTED 0.80]
- **Component Variant Patterns** — claude_skills_design_system_references_states_and_variants_color_variants, claude_skills_design_system_references_states_and_variants_size_variants, claude_skills_design_system_references_states_and_variants [EXTRACTED 0.80]
- **Banner Design & Generation Pipeline** — claude_skills_banner_design_skill, skill_frontend_design, claude_skills_ai_artist_scripts_search, claude_skills_ai_multimodal_scripts_gemini_batch_process, claude_skills_chrome_devtools_scripts_screenshot [EXTRACTED 0.85]
- **Brand Pitch Multi-Skill Workflow** — claude_skills_design_references_design_routing_logo_design, claude_skills_design_references_design_routing_cip_design, _claude_skills_slides_skill_slides [EXTRACTED 0.85]
- **Brand Update Sync Flow** — docs_brand_guidelines, assets_design_tokens_json, assets_design_tokens_css, claude_skills_brand_scripts_sync_brand_to_tokens [EXTRACTED 0.85]
- **Brand Sync Workflow** — docs_brand_guidelines, claude_skills_brand_scripts_sync_brand_to_tokens, assets_design_tokens_json, assets_design_tokens_css, claude_skills_brand_scripts_inject_brand_context [EXTRACTED 0.85]
- **Slide Decision CSV System** — data_slide_strategies, data_slide_layout_logic, data_slide_typography, data_slide_color_logic, data_slide_backgrounds [EXTRACTED 0.85]
- **Escrowed Deal Lifecycle** — project_define_pipeline, project_define_content_review, project_define_proof_of_publish, project_define_escrow, project_define_escrow_split, project_define_wallet [EXTRACTED 0.85]
- **Deck Strategies Sharing Emotion Arc Pattern** — claude_skills_slides_references_slide_strategies_yc_seed_deck, claude_skills_slides_references_slide_strategies_sales_pitch, claude_skills_slides_references_slide_strategies_product_demo, claude_skills_slides_references_slide_strategies_emotion_arc [EXTRACTED 0.85]
- **Orchestrated Design Skills** — skill_ui_ux_pro_max, claude_skills_brand_skill_brand, _claude_skills_design_system_skill, skill_chrome_devtools [EXTRACTED 0.85]
- **Emotion Arc Persuasion Pattern** — claude_skills_slides_references_slide_strategies_yc_seed_deck, claude_skills_slides_references_slide_strategies_sales_pitch, claude_skills_slides_references_slide_strategies_product_demo, claude_skills_slides_references_slide_strategies_emotion_arc [EXTRACTED 0.85]
- **shadcn Form Stack (RHF + Zod)** — claude_skills_ui_styling_references_shadcn_components_form, ref_react_hook_form, claude_skills_ui_styling_references_shadcn_components_zod, claude_skills_ui_styling_references_shadcn_components_input [EXTRACTED 0.85]
- **Global Error UI Flow** — claude_baseapi, claude_globalerrorslice, claude_globalerrormodal, claude_networksnackbar, claude_usenetworkmonitor, claude_retryregistry [EXTRACTED 0.85]
- **Home Screen Composition** — claude_homescreen_pattern, claude_homeheroheader, claude_homefeatureswitcher, claude_scrollcontext [EXTRACTED 0.85]
- **AI SVG Icon Generation Workflow** — claude_skills_design_scripts_icon_generate, concept_gemini_3_1_pro_preview, concept_icon_styles, concept_icon_categories [EXTRACTED 0.85]
- **Interactive State Priority Set** — claude_skills_design_system_references_states_and_variants_disabled_states, claude_skills_design_system_references_states_and_variants_loading_states, claude_skills_design_system_references_states_and_variants_focus_states, claude_skills_design_system_references_states_and_variants_interactive_states [EXTRACTED 0.85]
- **Keyboard-Navigable Component Patterns** — claude_skills_ui_styling_references_shadcn_accessibility_dialog, claude_skills_ui_styling_references_shadcn_accessibility_dropdown_menu, claude_skills_ui_styling_references_shadcn_accessibility_command_palette, claude_skills_ui_styling_references_shadcn_accessibility_focus_management [EXTRACTED 0.85]
- **Logo Design Workflow** — claude_skills_design_scripts_logo_search, claude_skills_design_scripts_logo_generate, claude_skills_design_references_logo_design_ui_ux_pro_max [EXTRACTED 0.85]
- **Screen Reader Support Techniques** — claude_skills_ui_styling_references_shadcn_accessibility_semantic_html, claude_skills_ui_styling_references_shadcn_accessibility_aria_labels, claude_skills_ui_styling_references_shadcn_accessibility_sr_only, claude_skills_ui_styling_references_shadcn_accessibility_live_regions [EXTRACTED 0.85]
- **HTML Slide Template Composition** — claude_skills_slides_references_html_template_base_structure, claude_skills_slides_references_html_template_navigation, claude_skills_slides_references_html_template_chartjs, claude_skills_slides_references_html_template_animations, claude_skills_slides_references_html_template_css_variables [EXTRACTED 0.85]
- **Tailwind CSS Customization Directives** — claude_skills_ui_styling_references_tailwind_customization_theme_directive, claude_skills_ui_styling_references_tailwind_customization_utility_directive, claude_skills_ui_styling_references_tailwind_customization_custom_variant, claude_skills_ui_styling_references_tailwind_customization_layer, claude_skills_ui_styling_references_tailwind_customization_apply [EXTRACTED 0.85]
- **Theme Hooks** — core_theme_usetheme, core_theme_usestyles, core_theme_useresponsivevalue [EXTRACTED 0.85]
- **Two-Phase Design Process** — claude_skills_ui_styling_references_canvas_design_system_design_philosophy_creation, claude_skills_ui_styling_references_canvas_design_system_visual_expression, claude_skills_ui_styling_references_canvas_design_system_refinement_process [EXTRACTED 0.85]
- **UI/UX Design Guideline Sections** — claude_skills_ui_ux_pro_max_skill_icons_visual_elements, claude_skills_ui_ux_pro_max_skill_interaction_app, claude_skills_ui_ux_pro_max_skill_light_dark_contrast, claude_skills_ui_ux_pro_max_skill_layout_spacing [EXTRACTED 0.85]
- **Aesthetic Styles** — claude_skills_design_references_logo_style_guide_minimalist, claude_skills_design_references_logo_style_guide_vintage_retro, claude_skills_design_references_cip_style_guide_luxury_premium, claude_skills_design_references_logo_style_guide_geometric, claude_skills_design_references_logo_style_guide_organic_natural, claude_skills_design_references_logo_style_guide_gradient_modern [EXTRACTED 0.90]
- **Asset Approval Review Areas** — claude_skills_brand_references_approval_checklist_visual_elements, claude_skills_brand_references_approval_checklist_accessibility, claude_skills_brand_references_approval_checklist_content_quality, claude_skills_brand_references_approval_checklist_technical_requirements, claude_skills_brand_references_approval_checklist_legal_compliance [EXTRACTED 0.90]
- **Banner Size Categories** — claude_skills_design_references_banner_sizes_and_styles_social_media_sizes, claude_skills_design_references_banner_sizes_and_styles_display_ad_sizes, claude_skills_design_references_banner_sizes_and_styles_website_sizes, claude_skills_design_references_banner_sizes_and_styles_print_sizes [EXTRACTED 0.90]
- **App Boot Sequence** — claude_useappbootstrap, claude_appstatus, claude_rootnavigator, claude_mmkv_storage [EXTRACTED 0.90]
- **Brand Guideline Document Sections** — claude_skills_brand_references_brand_guideline_template_color_palette, claude_skills_brand_references_brand_guideline_template_typography, claude_skills_brand_references_brand_guideline_template_logo_usage, claude_skills_brand_references_brand_guideline_template_voice_tone, claude_skills_brand_references_brand_guideline_template_imagery [EXTRACTED 0.90]
- **CIP Design Style Categories** — claude_skills_design_references_cip_style_guide_corporate_minimal, claude_skills_design_references_cip_style_guide_modern_tech, claude_skills_design_references_cip_style_guide_luxury_premium, claude_skills_design_references_cip_style_guide_classic_traditional, claude_skills_design_references_cip_style_guide_warm_organic, claude_skills_design_references_cip_style_guide_bold_dynamic, claude_skills_design_references_cip_style_guide_fresh_modern, claude_skills_design_references_cip_style_guide_soft_elegant [EXTRACTED 0.90]
- **CIP Generation Workflow** — scripts_cip_search, scripts_cip_generate, scripts_cip_render_html [EXTRACTED 0.90]
- **Color Harmony Types** — claude_skills_design_references_logo_color_psychology_monochromatic, claude_skills_design_references_logo_color_psychology_complementary, claude_skills_design_references_logo_color_psychology_analogous, claude_skills_design_references_logo_color_psychology_triadic [EXTRACTED 0.90]
- **Complete Brand Package Workflow** — claude_skills_design_scripts_logo_generate, scripts_cip_generate, _claude_skills_design_skill_slides [EXTRACTED 0.90]
- **Component tokens reference the semantic layer** — _claude_skills_design_system_references_component_tokens_button, _claude_skills_design_system_references_component_tokens_input, _claude_skills_design_system_references_component_tokens_card, _claude_skills_design_system_references_component_tokens_badge, _claude_skills_design_system_references_component_tokens_semantic_layer [EXTRACTED 0.90]
- **Persuasive Slide Copywriting Formulas** — claude_skills_design_references_slides_copywriting_formulas_pas, claude_skills_design_references_slides_copywriting_formulas_aida, claude_skills_design_references_slides_copywriting_formulas_fab, claude_skills_design_references_slides_copywriting_formulas_cost_of_inaction, claude_skills_design_references_slides_copywriting_formulas_bab [EXTRACTED 0.90]
- **Persuasive Slide Copy Formulas** — claude_skills_design_references_slides_copywriting_formulas_pas, claude_skills_design_references_slides_copywriting_formulas_aida, claude_skills_design_references_slides_copywriting_formulas_fab, claude_skills_design_references_slides_copywriting_formulas_cost_of_inaction, claude_skills_design_references_slides_copywriting_formulas_bab [EXTRACTED 0.90]
- **Core Logo Types** — claude_skills_design_references_logo_style_guide_wordmark, claude_skills_design_references_logo_style_guide_lettermark, claude_skills_design_references_logo_style_guide_pictorial_mark, claude_skills_design_references_logo_style_guide_abstract_mark, claude_skills_design_references_logo_style_guide_mascot, claude_skills_design_references_logo_style_guide_emblem, claude_skills_design_references_logo_style_guide_combination_mark [EXTRACTED 0.90]
- **Core Principles** — claude_skills_ui_styling_references_canvas_design_system_visual_communication_first, claude_skills_ui_styling_references_canvas_design_system_minimal_text_integration, claude_skills_ui_styling_references_canvas_design_system_expert_craftsmanship, claude_skills_ui_styling_references_canvas_design_system_systematic_patterns [EXTRACTED 0.90]
- **Core Visual Identity Elements** — claude_skills_brand_references_visual_identity_logo, claude_skills_brand_references_visual_identity_color_palette, claude_skills_brand_references_visual_identity_typography, claude_skills_brand_references_visual_identity_imagery_style [EXTRACTED 0.90]
- **Current bounded contexts** — claude_rules_01_domain_driven_architecture_domain_auth, claude_rules_01_domain_driven_architecture_domain_identity, claude_rules_01_domain_driven_architecture_domain_marketplace, claude_rules_01_domain_driven_architecture_domain_finance [EXTRACTED 0.90]
- **Date Picker Composition** — claude_skills_ui_styling_references_shadcn_components_datepicker, claude_skills_ui_styling_references_shadcn_components_calendar, claude_skills_ui_styling_references_shadcn_components_popover, claude_skills_ui_styling_references_shadcn_components_button [EXTRACTED 0.90]
- **Slide Deck Strategy Catalog** — claude_skills_slides_references_slide_strategies_yc_seed_deck, claude_skills_slides_references_slide_strategies_sales_pitch, claude_skills_slides_references_slide_strategies_product_demo, _claude_skills_design_references_slides_strategies_duarte_sparkline, _claude_skills_design_references_slides_strategies_series_a [EXTRACTED 0.90]
- **Design Movement Examples** — claude_skills_ui_styling_references_canvas_design_system_concrete_poetry, claude_skills_ui_styling_references_canvas_design_system_chromatic_language, claude_skills_ui_styling_references_canvas_design_system_analog_meditation, claude_skills_ui_styling_references_canvas_design_system_organic_systems, claude_skills_ui_styling_references_canvas_design_system_geometric_silence [EXTRACTED 0.90]
- **Banner Design Principles** — _claude_skills_banner_design_references_banner_sizes_and_styles_visual_hierarchy, _claude_skills_banner_design_references_banner_sizes_and_styles_safe_zones, claude_skills_design_references_banner_sizes_and_styles_cta_rules, claude_skills_design_references_banner_sizes_and_styles_typography, _claude_skills_banner_design_references_banner_sizes_and_styles_text_image_ratio, claude_skills_design_references_banner_sizes_and_styles_print_specs [EXTRACTED 0.90]
- **Brand to Implementation Dependency Chain** — claude_skills_brand_skill_brand, _claude_skills_design_system_skill, claude_skills_design_references_design_routing_ui_styling [EXTRACTED 0.90]
- **Design System Component Specifications** — claude_skills_design_system_references_component_specs_button, claude_skills_design_system_references_component_specs_input, claude_skills_design_system_references_component_specs_card, claude_skills_design_system_references_component_specs_badge, claude_skills_design_system_references_component_specs_alert, claude_skills_ui_styling_references_shadcn_components_dialog, claude_skills_design_system_references_component_specs_table [EXTRACTED 0.90]
- **Messaging Framework Cascade** — claude_skills_brand_references_messaging_framework_mission, claude_skills_brand_references_messaging_framework_vision, claude_skills_brand_references_messaging_framework_value_proposition, claude_skills_brand_references_messaging_framework_positioning_statement, claude_skills_brand_references_messaging_framework_key_messages, claude_skills_brand_references_messaging_framework_proof_points [EXTRACTED 0.90]
- **New Design System Workflow** — _claude_skills_design_skill_brand, _claude_skills_design_skill_designsystem, claude_skills_design_references_design_routing_ui_styling [EXTRACTED 0.90]
- **Primary Color Meanings** — claude_skills_design_references_logo_color_psychology_blue, claude_skills_design_references_logo_color_psychology_red, claude_skills_design_references_logo_color_psychology_green, claude_skills_design_references_logo_color_psychology_yellow_gold, claude_skills_design_references_logo_color_psychology_purple, claude_skills_design_references_logo_color_psychology_orange, claude_skills_design_references_logo_color_psychology_black, claude_skills_design_references_logo_color_psychology_white [EXTRACTED 0.90]
- **Primitive Token Categories** — claude_skills_design_system_references_primitive_tokens_color_scales, claude_skills_design_system_references_primitive_tokens_spacing_scale, claude_skills_design_system_references_primitive_tokens_typography_scale, claude_skills_design_system_references_primitive_tokens_border_radius, claude_skills_design_system_references_primitive_tokens_shadows, claude_skills_design_system_references_primitive_tokens_motion_duration, claude_skills_design_system_references_primitive_tokens_z_index_scale [EXTRACTED 0.90]
- **Screenshot Export Options** — claude_skills_design_references_social_photos_design_chrome_headless, claude_skills_design_references_social_photos_design_playwright, claude_skills_design_references_social_photos_design_puppeteer, skill_chrome_devtools [EXTRACTED 0.90]
- **Semantic Token Categories** — claude_skills_design_system_references_semantic_tokens_color, claude_skills_design_system_references_semantic_tokens_spacing, claude_skills_design_system_references_semantic_tokens_typography, claude_skills_design_system_references_states_and_variants_interactive_states [EXTRACTED 0.90]
- **Slide Navigation Flow** — claude_skills_design_references_slides_html_template_showslide, claude_skills_design_references_slides_html_template_nextslide, claude_skills_design_references_slides_html_template_prevslide [EXTRACTED 0.90]
- **Slide Creation Workflow** — claude_skills_design_references_slides_create, claude_skills_design_references_slides_layout_patterns, claude_skills_design_references_slides_copywriting_formulas, claude_skills_design_references_slides_html_template, claude_skills_design_references_slides_strategies [EXTRACTED 0.90]
- **Slides Skill Knowledge Base** — _claude_skills_slides_skill_slides, _claude_skills_slides_references_layout_patterns, _claude_skills_slides_references_html_template, _claude_skills_slides_references_copywriting_formulas, _claude_skills_slides_references_slide_strategies [EXTRACTED 0.90]
- **Social Photos Design Workflow Steps** — claude_skills_design_references_social_photos_design_html_design, claude_skills_design_references_social_photos_design_screenshot_export, claude_skills_design_references_social_photos_design_verify_fix [EXTRACTED 0.90]
- **Layout Utility Family** — claude_skills_ui_styling_references_tailwind_utilities_flexbox, claude_skills_ui_styling_references_tailwind_utilities_grid, claude_skills_ui_styling_references_tailwind_utilities_positioning [EXTRACTED 0.90]
- **Three-Layer Token Architecture** — claude_skills_design_system_references_token_architecture_primitive, _claude_skills_design_system_skill_semantic_layer, _claude_skills_design_system_skill_component_layer [EXTRACTED 0.90]
- **UI Kit Primitives** — shared_ui_box, shared_ui_text, shared_ui_pressable, shared_ui_card, shared_ui_image, shared_ui_layout [EXTRACTED 0.90]
- **UI Styling Core Three-Layer Stack** — _claude_skills_ui_styling_shadcn_ui, _claude_skills_ui_styling_tailwind_css, _claude_skills_ui_styling_canvas_design [EXTRACTED 0.90]
- **Priority-Ranked UX Rule Categories** — claude_skills_ui_ux_pro_max_skill_accessibility, _claude_skills_ui_ux_pro_max_skill_navigation_patterns, _claude_skills_ui_ux_pro_max_skill_charts_data [EXTRACTED 0.90]
- **Voice Development Process Steps** — claude_skills_brand_references_voice_framework_personality_traits, claude_skills_brand_references_voice_framework_voice_chart, claude_skills_brand_references_voice_framework_context_adaptation [EXTRACTED 0.90]
- **Four Voice Dimension Spectrums** — claude_skills_brand_references_voice_framework_tone_spectrum, claude_skills_brand_references_voice_framework_language_spectrum, claude_skills_brand_references_voice_framework_character_spectrum, claude_skills_brand_references_voice_framework_emotion_spectrum [EXTRACTED 0.90]
- **One-way dependency direction: app → domains → shared → core** — claude_rules_01_domain_driven_architecture_layer_app, claude_rules_01_domain_driven_architecture_layer_domains, claude_rules_01_domain_driven_architecture_layer_shared, claude_rules_01_domain_driven_architecture_layer_core [EXTRACTED 0.95]
- **Three-Layer Token System** — claude_skills_design_system_references_token_architecture_primitive, _claude_skills_design_system_skill_semantic_layer, _claude_skills_design_system_skill_component_layer [EXTRACTED 0.95]
- **Creator Pricing & Status Tools** — project_define_smart_rate_calculator, project_define_local_rate_index, project_define_rate_cards, project_define_gamification, project_define_mutual_rating [INFERRED 0.70]
- **Brand Consistency Dimensions** — _claude_skills_brand_references_consistency_checklist_visual, _claude_skills_brand_references_consistency_checklist_voice, _claude_skills_brand_references_consistency_checklist_channel_audit [INFERRED 0.75]
- **CIP Mockup Prompt Assembly** — claude_skills_design_references_cip_prompt_engineering_base_prompt, claude_skills_design_references_cip_prompt_engineering_deliverable_modifiers, claude_skills_design_references_cip_prompt_engineering_style_modifiers, claude_skills_design_references_cip_prompt_engineering_lighting_modifiers, claude_skills_design_references_cip_prompt_engineering_context_modifiers, claude_skills_design_references_cip_prompt_engineering_quality_modifiers [INFERRED 0.75]
- **Gemini AI-backed Generators** — claude_skills_design_scripts_logo_generate, scripts_cip_generate, claude_skills_design_scripts_icon_generate [INFERRED 0.75]
- **Visual Styling Utilities** — claude_skills_ui_styling_references_tailwind_utilities_colors, claude_skills_ui_styling_references_tailwind_utilities_borders, claude_skills_ui_styling_references_tailwind_utilities_shadows, claude_skills_ui_styling_references_tailwind_utilities_opacity [INFERRED 0.75]
- **Code Implementation Layer** — claude_skills_brand_references_typography_specifications_css_implementation, claude_skills_brand_references_typography_specifications_tailwind_config, claude_skills_brand_references_typography_specifications_type_scale [INFERRED 0.75]
- **Asset Metadata & Registry System** — claude_skills_brand_references_asset_organization_manifest, claude_skills_brand_references_asset_organization_version_entry, claude_skills_brand_references_asset_organization_tagging_system, claude_skills_brand_references_asset_organization_naming_convention [INFERRED 0.80]
- **CIP Brand Deliverable Categories** — claude_skills_design_references_cip_deliverable_guide_core_identity, claude_skills_design_references_cip_deliverable_guide_stationery_set, claude_skills_design_references_cip_deliverable_guide_office_environment, claude_skills_design_references_cip_deliverable_guide_apparel, claude_skills_design_references_cip_deliverable_guide_vehicle_branding, claude_skills_design_references_cip_deliverable_guide_digital_assets, claude_skills_design_references_cip_deliverable_guide_events_promotional [INFERRED 0.80]
- **Design token to Tailwind mapping flow** — claude_skills_design_system_references_tailwind_integration_css_variables, claude_skills_ui_styling_references_tailwind_customization_config_file, claude_skills_design_system_references_tailwind_integration_component_classes, claude_skills_design_system_references_tailwind_integration_shadcn_alignment [INFERRED 0.80]
- **Logo Prompt Composition Elements** — claude_skills_design_references_logo_prompt_engineering_core_structure, claude_skills_design_references_logo_prompt_engineering_style_keywords, claude_skills_design_references_logo_prompt_engineering_negative_prompts, claude_skills_design_references_logo_prompt_engineering_technical_requirements [INFERRED 0.80]
- **Pre-Delivery Verification Flow** — claude_skills_ui_ux_pro_max_skill_pre_delivery_checklist, claude_skills_ui_ux_pro_max_skill_icons_visual_elements, claude_skills_ui_ux_pro_max_skill_interaction_app, claude_skills_ui_ux_pro_max_skill_light_dark_contrast, claude_skills_ui_ux_pro_max_skill_accessibility [INFERRED 0.80]
- **shadcn/ui Theming System** — claude_skills_ui_styling_references_shadcn_theming_css_variables, claude_skills_ui_styling_references_shadcn_theming_tailwind_config, claude_skills_ui_styling_references_shadcn_theming_color_customization, claude_skills_ui_styling_references_shadcn_theming_dark_mode [INFERRED 0.80]
- **Breakpoint Query Variant Mechanisms** — claude_skills_ui_styling_references_tailwind_responsive_breakpoint_system, claude_skills_ui_styling_references_tailwind_responsive_max_width_queries, claude_skills_ui_styling_references_tailwind_responsive_range_queries, claude_skills_ui_styling_references_tailwind_responsive_container_queries, claude_skills_ui_styling_references_tailwind_responsive_custom_breakpoints [INFERRED 0.80]
- **Typography System Definition** — claude_skills_brand_references_typography_specifications_font_stack, claude_skills_brand_references_typography_specifications_type_scale, claude_skills_brand_references_typography_specifications_font_weights, claude_skills_brand_references_typography_specifications_line_height, claude_skills_brand_references_typography_specifications_letter_spacing [INFERRED 0.80]
- **iOS Run Environment Variants** — readme_run_ios_development, readme_run_ios_staging, readme_run_ios_production [INFERRED 0.85]
- **Pytest Testing Stack** — pkg_pytest, pkg_pytest_cov, pkg_pytest_mock [INFERRED 0.85]

## Communities (209 total, 62 thin omitted)

### Community 0 - "NPM Dependencies"
Cohesion: 0.03
Nodes (63): dependencies, @gorhom/bottom-sheet, @hookform/resolvers, i18next, libphonenumber-js, lottie-react-native, lucide-react-native, @notifee/react-native (+55 more)

### Community 1 - "Color Design Tokens"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 2 - "Slide Deck Skill"
Cohesion: 0.06
Nodes (48): Nancy Duarte Sparkline, Guy Kawasaki, Series A Deck, Copywriting Formulas Reference, create.md Reference, HTML Template Reference, Layout Patterns Reference, Slide Strategies Reference (+40 more)

### Community 3 - "Error Boundary & Layout Toggle"
Cohesion: 0.08
Nodes (28): lottie-react-native, react-native, @shopify/flash-list, ErrorBoundary, LAYOUTS, LayoutToggle(), LayoutToggleProps, ListFooterLoader() (+20 more)

### Community 4 - "Screen UI Components"
Cohesion: 0.10
Nodes (31): react-i18next, react-native-linear-gradient, src_core_store_index_hideservererror, src_core_store_index_selectservererror, AnimatedIconHero(), AnimatedIconHeroProps, DEFAULT_SIZES, ICON_MAP (+23 more)

### Community 5 - "Push Notifications & FCM"
Cohesion: 0.10
Nodes (20): @notifee/react-native, @react-native-firebase/app, @react-native-firebase/messaging, registerFcmToken(), src_core_notification_index_notificationmanager, messagingInstance, NotificationManager, NotifeeForegroundEvent (+12 more)

### Community 6 - "Package Manifest"
Cohesion: 0.04
Nodes (44): name, private, version, @babel/core, babel-plugin-module-resolver, @babel/preset-env, @babel/runtime, eslint (+36 more)

### Community 7 - "Custom Input Component"
Cohesion: 0.10
Nodes (34): libphonenumber-js, lucide-react-native, CustomInput, CustomInputInner, CustomInputProps, IconProps, createInputTextStyle(), createMultilineContainerStyle() (+26 more)

### Community 8 - "Location & Permissions Hooks"
Cohesion: 0.13
Nodes (23): @react-native-community/geolocation, react-native-permissions, GeoLocation, useLocation(), UseLocationReturn, useNotification(), usePermission(), initialState() (+15 more)

### Community 9 - "Navigation Structure"
Cohesion: 0.07
Nodes (27): @react-navigation/bottom-tabs, @react-navigation/stack, RootNavigator(), RootStackParamList, Stack, Tab, src_core_navigation_index_homestackparamlist, src_core_navigation_index_roottabparamlist (+19 more)

### Community 10 - "Marketplace Domain Concepts"
Cohesion: 0.06
Nodes (38): Ad Types, Affiliate Links & Discount Codes, AI-Generated Creator Bio/Portfolio, Analytics & ROI Dashboard, Anonymous Brand Reviews, Barter Marketplace, Barter Digital Catalog, Brand/Merchant Actor (+30 more)

### Community 11 - "Scroll & Bottom Bar Context"
Cohesion: 0.09
Nodes (31): react-native-reanimated, useBottomBar(), SCROLL_DIRECTION_THRESHOLD, ScrollContext, ScrollContextValue, ScrollProvider(), useJSScrollHandler(), useScrollContext() (+23 more)

### Community 12 - "Theme Provider & Tokens"
Cohesion: 0.11
Nodes (31): buildTheme(), getStoredLanguage(), getStoredThemeMode(), ThemeContext, ThemeProvider(), ThemeProviderProps, BASE_BORDER_WIDTHS, createBorderWidths() (+23 more)

### Community 13 - "Slide Search CLI"
Cohesion: 0.12
Nodes (30): format_context(), format_result(), main(), Format a single search result for display, Slide Search CLI - Search slide design databases for strategies, layouts, copy,…, Format contextual recommendations for display., BM25, calculate_pattern_break() (+22 more)

### Community 14 - "Design Skills Collection"
Cohesion: 0.10
Nodes (32): Design System Skill, Charts & Data Rules, Navigation Patterns Rules, ai-artist search.py, ai-multimodal Skill, gemini_batch_process.py, Banner Sizes and Styles Reference, Banner Design Skill (+24 more)

### Community 15 - "Corporate Identity Program"
Cohesion: 0.12
Nodes (28): detect_domain(), get_cip_brief(), _load_csv(), Generate a comprehensive CIP brief for a brand, CIP Design Core - BM25 search engine for Corporate Identity Program design…, search(), search_all(), _search_csv() (+20 more)

### Community 16 - "Tailwind Config Tests"
Cohesion: 0.06
Nodes (16): Test adding colors multiple times., Test adding full color palette., Test adding custom spacing., Test adding custom breakpoints., Test TailwindConfigGenerator class., Test generating TypeScript configuration., Test validating config with empty theme extensions., Test writing configuration to file. (+8 more)

### Community 17 - "Theme Hooks"
Cohesion: 0.15
Nodes (25): ResponsiveMap, useResponsiveValue(), NamedStyles, StyleFactory, useStyles(), FullThemeColors, SemanticColors, ShadowStyle (+17 more)

### Community 18 - "Design System Generator CLI"
Cohesion: 0.10
Nodes (27): argparse, search(), ansi_ljust(), _detect_page_type(), format_ascii_box(), format_markdown(), format_master_md(), format_page_override_md() (+19 more)

### Community 19 - "Token Validator Tests"
Cohesion: 0.11
Nodes (23): Regression test for sync-brand-to-tokens.cjs. The color parser required a…, main(), Slide Token Validator (Legacy Wrapper) Now delegates to html-token-validator.py…, Delegate to unified html-token-validator.py with --type slides., Path, Regression tests for validate-tokens.cjs. The validator used to skip any line…, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives. (+15 more)

### Community 20 - "Identity Account Screens"
Cohesion: 0.11
Nodes (22): MaintenanceScreenComponent(), Props, src_core_navigation_index_goback, src_core_navigation_index_settingsstackscreenprops, moderateScale(), src_domains_identity_api_accountapi_usegetpreferencesquery, src_domains_identity_api_accountapi_useupdatepreferencesmutation, ChangePasswordScreenComponent() (+14 more)

### Community 21 - "Logo Design Search"
Cohesion: 0.10
Nodes (26): Logo Design (Built-in), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results, detect_domain(), _load_csv() (+18 more)

### Community 22 - "Component Design Tokens"
Cohesion: 0.11
Nodes (29): Alert Tokens, Badge Tokens, Button Tokens, Card Tokens, Dialog/Modal Tokens, Input Tokens, Semantic Token Layer, Table Tokens (+21 more)

### Community 23 - "HTML Token Validator"
Cohesion: 0.12
Nodes (25): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+17 more)

### Community 24 - "Network & Retry Utilities"
Cohesion: 0.12
Nodes (22): @react-native-community/netinfo, react-native-image-picker, registry, RetryFn, retryRegistry, useNetworkMonitor(), goBack(), selectNetworkError() (+14 more)

### Community 25 - "Custom Button & Theme Types"
Cohesion: 0.19
Nodes (22): BorderWidthToken, RadiiToken, ShadowToken, SpacingToken, src_core_theme_types_borderwidthtoken, src_core_theme_types_radiitoken, src_core_theme_types_shadowtoken, src_core_theme_types_spacingtoken (+14 more)

### Community 26 - "Gallery & Blur Modals"
Cohesion: 0.10
Nodes (20): @react-native-community/blur, GalleryModal, GalleryModalComponent(), GalleryModalProps, styles, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }, BlurViewBoth, BlurViewProps (+12 more)

### Community 27 - "Auth State & API"
Cohesion: 0.18
Nodes (22): RegisterFcmTokenPayload, authReducer, authSlice, src_domains_auth_store_authslice_clearcredentials, initialState, src_domains_auth_store_authslice_setcredentials, src_domains_auth_store_authslice_setuser, AuthResponse (+14 more)

### Community 28 - "Profile & BottomSheet UI"
Cohesion: 0.11
Nodes (18): react-native-fast-image, react-native-safe-area-context, AVATAR_SIZE, ProfileScreen, ProfileScreenComponent(), Props, styles, BottomSheet() (+10 more)

### Community 29 - "App Config & Env"
Cohesion: 0.15
Nodes (17): APP_NAME, DEFAULT_CURRENCY, MAX_SEARCH_HISTORY_ITEMS, apiUrl, AppEnv, EnvConfig, isDev, isProd (+9 more)

### Community 30 - "BM25 Search Algorithm"
Cohesion: 0.15
Nodes (7): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, BM25, BM25

### Community 31 - "Slide Generator Script"
Cohesion: 0.13
Nodes (21): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+13 more)

### Community 32 - "Spacing Tokens"
Cohesion: 0.09
Nodes (22): $type, $value, $type, $value, $type, $value, $type, $value (+14 more)

### Community 33 - "Tailwind Config Generator"
Cohesion: 0.10
Nodes (13): main(), Add custom font families. Args: fonts: Dict of font_type: [font_names] e.g.,…, Add custom spacing values. Args: spacing: Dict of name: value e.g., {'18':…, Add custom breakpoints. Args: breakpoints: Dict of name: width e.g., {'3xl':…, Add plugin requirements. Args: plugins: List of plugin names e.g.,…, Get plugin recommendations based on configuration. Returns: List of recommended…, Tailwind CSS Configuration Generator Generate tailwind.config.js/ts with custom…, Generate Tailwind CSS configuration files. (+5 more)

### Community 34 - "Redux Middleware & Error Handler"
Cohesion: 0.18
Nodes (18): @reduxjs/toolkit, apiListenerMiddleware, AppApiError, getApiErrorMessage(), getMessageFromData(), getMessageFromErrorsArray(), getStatusCode(), isFetchBaseQueryError() (+10 more)

### Community 35 - "Auth Hooks"
Cohesion: 0.16
Nodes (17): src_domains_auth_api_index_usegetprofilequery, src_domains_auth_api_index_useloginmutation, src_domains_auth_api_index_uselogoutmutation, src_domains_auth_api_index_useregistermutation, src_domains_auth_api_index_useresendotpmutation, src_domains_auth_api_index_useupdateprofilemutation, src_domains_auth_api_index_useverifyotpmutation, useAuth() (+9 more)

### Community 36 - "shadcn Component List"
Cohesion: 0.11
Nodes (21): shadcn Components Reference, Accordion, Alert, Alert Dialog, Avatar, Badge, Button, Calendar (+13 more)

### Community 37 - "Core App Infrastructure"
Cohesion: 0.12
Nodes (21): AppStatus Enum, baseApi, GlobalErrorModal, globalErrorSlice, MMKV Storage, navigationService, NetworkSnackbar, retryRegistry (+13 more)

### Community 38 - "Slide Background Fetcher"
Cohesion: 0.14
Nodes (20): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+12 more)

### Community 39 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): devDependencies, @babel/core, babel-plugin-module-resolver, @babel/preset-env, @babel/runtime, eslint, jest, prettier (+13 more)

### Community 40 - "App Root & Store"
Cohesion: 0.14
Nodes (14): react-native-bootsplash, react-native-gesture-handler, react-native-keyboard-controller, react-redux, styles, MaintenanceScreen, AppDispatch, persistor (+6 more)

### Community 41 - "Toast Service"
Cohesion: 0.16
Nodes (7): react-native-toast-message, ShowErrorToastOptions, ToastOptions, toastService, ToastServiceClass, ToastType, useToast()

### Community 42 - "Base API & Config API"
Cohesion: 0.13
Nodes (17): baseApi, baseQueryWithGlobalErrorHandler(), ExtraOptions, isApiEnvelope(), rawBaseQuery, AppConfig, configApi, { useGetConfigQuery } (+9 more)

### Community 43 - "Icon Generator"
Cohesion: 0.16
Nodes (19): Icon Design Reference, apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), main() (+11 more)

### Community 44 - "Auth Navigation & OTP"
Cohesion: 0.16
Nodes (14): react-hook-form, src_core_navigation_index_authstackparamlist, AuthStackParamList, useVerifyOtp(), UseVerifyOtpOptions, VerifyOtpFormValues, AuthNavigator(), Stack (+6 more)

### Community 45 - "Semantic Color Tokens"
Cohesion: 0.11
Nodes (19): $type, $value, background, foreground, muted-foreground, primary, primary-hover, secondary (+11 more)

### Community 46 - "Design System Generator"
Cohesion: 0.14
Nodes (11): DesignSystemGenerator, Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation. variance/motion/density are…, Bucket a 1-10 dial value into its tier config. Returns None if value is None., Generates design system recommendations from aggregated searches. (+3 more)

### Community 47 - "Bottom Bar Component"
Cohesion: 0.20
Nodes (12): react, BottomBar(), INTERPOLATE_RANGE, TAB_ANIMATION_CONFIG, WIDTH_CONFIG, styles, BottomBarProps, TabConfig (+4 more)

### Community 48 - "UI Primitives & Header"
Cohesion: 0.18
Nodes (14): useTheme(), src_core_theme_types_typographyvariant, percentageOfWidth(), TabItem(), BoxComponent(), CardInner(), PressableComponent(), replaceChild() (+6 more)

### Community 49 - "Banner Sizes Reference"
Cohesion: 0.14
Nodes (18): Banner Sizes & Art Direction Styles Reference, Web / Display Ads Sizes, Safe Zones, Text-to-Image Ratio, Typography Rules, Visual Hierarchy (3-Zone Rule), Banner Sizes & Art Direction Styles Reference, 22 Art Direction Styles (+10 more)

### Community 50 - "shadcn Accessibility Patterns"
Cohesion: 0.16
Nodes (18): shadcn/ui Accessibility Patterns, ARIA Labels, Color Contrast (WCAG), Command Palette Navigation, Dialog/Modal Focus Trap, Dropdown/Menu Navigation, Form Error Handling, Focus Indicators (+10 more)

### Community 51 - "i18n Localization Setup"
Cohesion: 0.23
Nodes (13): i18next, bootstrapLanguage(), src_assets_locales_ar_common, src_assets_locales_en_common, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, isRTL(), resources (+5 more)

### Community 52 - "Canvas Design System"
Cohesion: 0.12
Nodes (17): Canvas Design System, Analog Meditation, Chromatic Language, Color Approach, Composition Rules, Concrete Poetry, Phase 1: Design Philosophy Creation, Expert Craftsmanship (+9 more)

### Community 53 - "Tailwind Utility Reference"
Cohesion: 0.13
Nodes (17): Tailwind CSS Utility Reference, Arbitrary Values, Aspect Ratio Utilities, Borders Utilities, Colors Utilities, Cursor Utilities, Flexbox Utilities, Grid Utilities (+9 more)

### Community 54 - "App Status & Storage"
Cohesion: 0.27
Nodes (11): react-native-device-info, buildFcmTokenPayload(), getPersistentDeviceId(), authStorage, appStorage, mmkv, ValueOf, MMKV_IDS (+3 more)

### Community 55 - "Color Palette Definitions"
Cohesion: 0.12
Nodes (16): ButtonVariantColors, createColors(), darkColors, EmptyStateColors, ExtendedColors, FeatureColors, FormColors, GradientColors (+8 more)

### Community 56 - "CIP HTML Rendering"
Cohesion: 0.16
Nodes (15): CIP Design Reference, CIP Design (Built-in), base64, Gemini Nano Banana (Flash/Pro), generate_html(), get_deliverable_info(), get_image_base64(), main() (+7 more)

### Community 57 - "Tailwind Integration"
Cohesion: 0.16
Nodes (16): Tailwind Integration, Animation Tokens, Component Classes (button), CSS Variables Setup (base layer), Dark Mode Toggle, shadcn/ui Alignment, Tailwind CSS Customization, @apply Directive (+8 more)

### Community 58 - "Font Size Tokens"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 59 - "Color Sync Script"
Cohesion: 0.23
Nodes (15): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+7 more)

### Community 60 - "MMKV Persistence & Redux Store"
Cohesion: 0.17
Nodes (11): react-native-mmkv, redux-persist, mmkvReduxStorage, persistMMKV, authPersistConfig, rootReducer, RootState, globalErrorReducer (+3 more)

### Community 61 - "Brand Color Extraction"
Cohesion: 0.20
Nodes (12): calculateCompliance(), colorDistance(), displayPalette(), extractHexColors(), findNearestBrandColor(), fs, generateImageMagickCommand(), hexToRgb() (+4 more)

### Community 62 - "Logo Style Guide"
Cohesion: 0.17
Nodes (15): Logo Style Guide, Abstract Mark, Combination Mark, Emblem, Geometric Style, Gradient/Modern Style, Lettermark (Monogram), Mascot (+7 more)

### Community 63 - "App Bootstrap"
Cohesion: 0.25
Nodes (11): AppContent(), AppStatus, AUTHENTICATED, CHOOSE_LANGUAGE, LOADING, UNAUTHENTICATED, BootstrapState, useAppBootstrap() (+3 more)

### Community 64 - "Brand-to-Tokens Sync"
Cohesion: 0.23
Nodes (13): Design Tokens CSS, Design Tokens JSON, Brand Update Command, adjustBrightness(), { execFileSync }, extractColorsFromMarkdown(), fs, generateColorScale() (+5 more)

### Community 65 - "Asset Validator"
Cohesion: 0.25
Nodes (13): checkManifest(), formatBytes(), formatOutput(), fs, main(), parseFilename(), path, RULES (+5 more)

### Community 66 - "Logo Generation Script"
Cohesion: 0.19
Nodes (13): Gemini Nano Banana, enhance_prompt(), generate_batch(), generate_logo(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation Args: aspect_ratio:…, Generate multiple logo variants with different styles (+5 more)

### Community 67 - "Primitive Radius & Shadow Tokens"
Cohesion: 0.19
Nodes (14): $type, $value, $type, $value, $type, $value, primitive, radius (+6 more)

### Community 68 - "TypeScript Config"
Cohesion: 0.14
Nodes (13): @react-native/typescript-config, compilerOptions, baseUrl, noFallthroughCasesInSwitch, noImplicitAny, noImplicitReturns, noUncheckedIndexedAccess, paths (+5 more)

### Community 69 - "Brand Guidelines Template"
Cohesion: 0.23
Nodes (13): Visual Identity Basics, Accessibility (WCAG AA), Color Palette, Imagery Style, Logo, Typography, Brand Guidelines Starter Template, Accessibility (WCAG 2.1 AA) (+5 more)

### Community 70 - "Logo Color Psychology"
Cohesion: 0.19
Nodes (13): Logo Color Psychology, Accessibility Considerations, Black Color Meaning, Blue Color Meaning, Complementary Harmony, Green Color Meaning, Color Combinations by Industry, Orange Color Meaning (+5 more)

### Community 71 - "Token Validator Script"
Cohesion: 0.22
Nodes (12): extensions, formatReport(), fs, getFiles(), main(), parseArgs(), path, patterns (+4 more)

### Community 72 - "Design Tokens Starter"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 73 - "shadcn Installer Tests"
Cohesion: 0.17
Nodes (7): Test adding components in dry run mode., Test ShadcnInstaller class., Test adding all components without config., Test listing installed components without config., Test checking for non-existent shadcn config., Test getting installed components without config., TestShadcnInstaller

### Community 74 - "Choose Language Screen"
Cohesion: 0.28
Nodes (8): LanguageOptionRow, LanguageOptionRowProps, LANGUAGE_OPTIONS, LanguageCardAlign, LanguageOption, useChooseLanguageScreen(), ChooseLanguageScreen(), SupportedLanguage

### Community 75 - "Typography Specifications"
Cohesion: 0.23
Nodes (12): Typography Specifications, Typography Accessibility, CSS Implementation, Common Font Pairings, Font Stack Structure, Font Weights, Letter Spacing, Line Height Guidelines (+4 more)

### Community 76 - "Card Component Tokens"
Cohesion: 0.20
Nodes (12): $type, $value, bg, bg, padding, shadow, card, bg (+4 more)

### Community 77 - "shadcn Installer Methods"
Cohesion: 0.21
Nodes (6): Add all available shadcn/ui components. Args: overwrite: If True, overwrite…, List installed components. Returns: Tuple of (success, message with component…, Check if shadcn is initialized in project. Returns: True if components.json…, Get list of already installed components. Returns: List of installed component…, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components. Args: components: List of component names to add…

### Community 78 - "shadcn Installer Class"
Cohesion: 0.17
Nodes (7): Handle shadcn/ui component installation., ShadcnInstaller, Test adding components with overwrite flag., Test listing installed components when none exist., Test listing installed components when they exist., Test checking for existing shadcn config., Test getting installed components when none exist.

### Community 79 - "Config File Generation"
Cohesion: 0.20
Nodes (6): Generate configuration file content. Returns: Configuration file as string, Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config. Validates each plugin name against a strict…, Add indentation to JSON string., Write configuration to file. Returns: Tuple of (success, message)

### Community 80 - "UI Styling Skill"
Cohesion: 0.20
Nodes (11): Canvas Visual Design Layer, Radix UI Primitives, Canvas Design System Reference, shadcn Accessibility Reference, shadcn Theming Reference, Tailwind Customization Reference, Tailwind Responsive Reference, Tailwind Utilities Reference (+3 more)

### Community 81 - "Home Screen UI Patterns"
Cohesion: 0.20
Nodes (11): BottomBarContext, FloatingBottomBar, HomeFeatureSwitcher, HomeHeroHeader, Home Screen Pattern, Layout Component, Paginated List Pattern, ScreenHeader (+3 more)

### Community 82 - "Design System Rule"
Cohesion: 0.22
Nodes (11): 02 — Strict Design System, Theme Tokens, useStyles(factory, deps?), useTheme(), UI Kit (@/shared/ui), Box, Card, Image (+3 more)

### Community 83 - "Brand Context Injection"
Cohesion: 0.31
Nodes (10): extractColorsFromTable(), extractCoreAttributes(), extractHexColors(), extractImageStyle(), extractTypography(), extractVoice(), fs, generatePromptAddition() (+2 more)

### Community 84 - "Token Embedding Script"
Cohesion: 0.18
Nodes (8): args, fs, minimal, MINIMAL_TOKENS, path, projectRoot, tokensPath, wrapStyle

### Community 85 - "Tailwind Responsive Design"
Cohesion: 0.29
Nodes (11): Tailwind CSS Responsive Design, Responsive Best Practices, Breakpoint System, Common Responsive Layouts, Container Queries, Custom Breakpoints, Max-Width Queries, Mobile-First Approach (+3 more)

### Community 86 - "Icon & Layout Guidelines"
Cohesion: 0.24
Nodes (11): icons.csv Recommended Icons, Accessibility Checklist, Heroicons (@heroicons/react), Icons & Visual Elements Guidelines, Interaction (App) Guidelines, Layout & Spacing Guidelines, Light/Dark Mode Contrast Guidelines, Phosphor Icons (@phosphor-icons/react) (+3 more)

### Community 87 - "Forgot Password Flow"
Cohesion: 0.27
Nodes (9): useApi(), src_core_navigation_index_replace, replace(), navigateAfterAuth(), src_domains_auth_api_index_useforgotpasswordmutation, useForgotPassword(), UseForgotPasswordOptions, ForgotPasswordFormValues (+1 more)

### Community 88 - "Auth API Endpoints"
Cohesion: 0.18
Nodes (10): authApi, src_domains_auth_api_authapi_useforgotpasswordmutation, src_domains_auth_api_authapi_usegetprofilequery, src_domains_auth_api_authapi_useloginmutation, src_domains_auth_api_authapi_uselogoutmutation, src_domains_auth_api_authapi_useregisterfcmtokenmutation, src_domains_auth_api_authapi_useregistermutation, src_domains_auth_api_authapi_useresendotpmutation (+2 more)

### Community 89 - "Brand Consistency Checklist"
Cohesion: 0.22
Nodes (10): Brand Consistency Checklist, Audit Frequency, Channel Audit, Color Consistency, Logo Consistency, Messaging Consistency, Tone Consistency, Typography Consistency (+2 more)

### Community 90 - "Slide Design System"
Cohesion: 0.20
Nodes (10): Chart.js Integration, Contextual Decision Flow, design-tokens.css, Pattern Breaking (Duarte Sparkline), Slide System, slide-backgrounds.csv, slide-color-logic.csv, slide-layout-logic.csv (+2 more)

### Community 91 - "Config Generator Base"
Cohesion: 0.22
Nodes (6): Any, Path, Initialize generator. Args: typescript: If True, generate .ts config, else .js…, Determine default output path., Create base configuration structure., Get default content paths for framework.

### Community 92 - "Logo Usage Rules"
Cohesion: 0.27
Nodes (10): Logo Usage Rules, Logo Approval Process, Clear Space, Co-branding, Color Usage, File Formats, Incorrect Usage, Minimum Size (+2 more)

### Community 93 - "Messaging Framework"
Cohesion: 0.33
Nodes (10): Messaging Framework, Elevator Pitches, Key Messages, Message Architecture, Message Testing, Mission Statement, Positioning Statement, Proof Points (+2 more)

### Community 94 - "CIP Style Guide"
Cohesion: 0.24
Nodes (10): CIP Design Style Guide, Bold Dynamic Style, Classic Traditional Style, Color Psychology, Corporate Minimal Style, Fresh Modern Style, Luxury Premium Style, Modern Tech Style (+2 more)

### Community 95 - "Logo AI Prompt Engineering"
Cohesion: 0.27
Nodes (10): Logo Design Reference, ui-ux-pro-max, Logo AI Prompt Engineering, Core Prompt Structure, Industry-Specific Prompts, Negative Prompts, Common Pitfalls, Style Keywords Library (+2 more)

### Community 96 - "Token Generation Script"
Cohesion: 0.36
Nodes (9): flattenTokens(), fs, generateCSS(), generateTailwind(), main(), parseArgs(), path, resolveReference() (+1 more)

### Community 97 - "Button Component Tokens"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 98 - "Animation Duration Tokens"
Cohesion: 0.20
Nodes (10): fast, normal, slow, $type, $value, $type, $value, duration (+2 more)

### Community 99 - "shadcn Theming"
Cohesion: 0.29
Nodes (10): shadcn/ui Theming & Customization, Theming Best Practices, buttonVariants (cva), Color Customization, Component Customization, CSS Variable System, Dark Mode Setup, Tailwind Configuration (+2 more)

### Community 100 - "Auth & Navigation"
Cohesion: 0.27
Nodes (7): ref_assets_images_logo_svg, @react-navigation/native, navigationRef, useLogin(), emailRules(), LoginScreen(), passwordRules()

### Community 101 - "Utils & System Bars"
Cohesion: 0.29
Nodes (7): react-native-edge-to-edge, layoutStatusBarToSystemBarStyle(), applyReplacements(), escapeRegex(), Replacement, _replacements, setTestConfig()

### Community 102 - "App Entry & Notifications"
Cohesion: 0.25
Nodes (6): displayName, name, react-native-screens, react-test-renderer, App(), registerNotificationBackgroundHandlers()

### Community 103 - "Design Token Primitives"
Cohesion: 0.25
Nodes (9): Primitive Tokens, Border Radius, Color Scales, Motion / Duration, Shadows, Spacing Scale, Status Colors, Typography Scale (+1 more)

### Community 104 - "Component Install Tests"
Cohesion: 0.22
Nodes (5): Test successful component addition., Test component addition with subprocess error., Test component addition when npx is not found., Test successful addition of all components., patch

### Community 105 - "Config Validity Tests"
Cohesion: 0.25
Nodes (7): Reduce a generated TS/JS config to a bare assignable object so it can be handed…, Regression guard for the missing-comma bug between the ``theme`` block and…, The property preceding ``plugins`` must end with a comma (pure-Python check, so…, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs, parametrize

### Community 106 - "Corporate Identity Deliverables"
Cohesion: 0.29
Nodes (8): CIP Deliverable Guide, Apparel, Core Identity, Digital Assets, Events & Promotional, Office Environment, Stationery Set, Vehicle Branding

### Community 107 - "UI Component Specs"
Cohesion: 0.32
Nodes (8): Component Specifications, Alert, Badge, Button, Card, Input, Table, Dialog

### Community 108 - "Input Token Config"
Cohesion: 0.29
Nodes (8): padding-x, input, $type, $value, focus-ring, padding-x, $type, $value

### Community 109 - "SVG Curved Bar Background"
Cohesion: 0.29
Nodes (6): react-native-svg, *.svg, buildPath(), CurvedBarBackground(), CurvedBarBackgroundProps, styles

### Community 110 - "Design Skills Suite"
Cohesion: 0.29
Nodes (7): Design Skill, Banner Design (Built-in), Brand Sub-skill, Design-System Sub-skill, Icon Design (Built-in), Slides (Built-in), Social Photos (Built-in)

### Community 111 - "HTML Slide Deck Infrastructure"
Cohesion: 0.48
Nodes (7): Chart.js Library, HTML Slide Template, Animation Classes, Base Slide Deck Structure, Chart.js Integration, CSS Variables / Design Tokens, Slide Navigation Script

### Community 112 - "Brand Guidelines Template"
Cohesion: 0.43
Nodes (7): Brand Guidelines Template, Color Palette Section, Extractable Fields, Imagery Guidelines Section, Logo Usage Section, Typography Section, Voice & Tone Section

### Community 113 - "Brand Voice Development"
Cohesion: 0.29
Nodes (7): Context Adaptation, Voice Development Process, Define Personality Traits, Tone, Voice, Voice Chart, Voice Guide Template

### Community 114 - "CIP Mockup Prompts"
Cohesion: 0.29
Nodes (7): CIP Mockup Prompt Engineering, Base Prompt Structure, Context Modifiers, Deliverable-Specific Modifiers, Lighting Modifiers, Quality Modifiers, Style Modifiers

### Community 115 - "Form Components"
Cohesion: 0.29
Nodes (7): Checkbox, Form, Input, Label, Radio Group, Switch, Zod

### Community 116 - "NPM Scripts"
Cohesion: 0.29
Nodes (7): scripts, android, ios, lint, prestart, start, test

### Community 117 - "API Response Types"
Cohesion: 0.29
Nodes (6): ApiResponse, LoadPhase, Paginated, PaginatedData, PaginatedMeta, PaginationMeta

### Community 118 - "Asset Approval Checklist"
Cohesion: 0.33
Nodes (6): Asset Approval Checklist, Accessibility Review, Content Quality Review, Legal & Compliance Review, Technical Requirements Review, Visual Elements Review

### Community 119 - "Asset Organization Guide"
Cohesion: 0.53
Nodes (6): Asset Organization Guide, Cleanup Workflow, manifest.json Asset Registry, Asset Naming Convention, Tagging System, Version Entry Schema

### Community 120 - "Manifest Config"
Cohesion: 0.40
Nodes (4): background, logo, height, width

### Community 121 - "UI Primitives & Theme"
Cohesion: 0.40
Nodes (5): Primitive Components (Box/Text/Pressable/Card), Theme System, ToastCard, useStyles Hook, useTheme Hook

### Community 122 - "Color Palette Management"
Cohesion: 0.40
Nodes (5): Color Palette Management, Accessibility Contrast Requirements (WCAG 2.1), Brand Compliance Validation, Color Extraction, Color System Structure

### Community 123 - "Voice Dimensions"
Cohesion: 0.40
Nodes (5): Character Spectrum (Serious-Playful), Emotion Spectrum (Reserved-Expressive), Language Spectrum (Simple-Complex), Tone Spectrum (Formal-Casual), Voice Dimensions

### Community 124 - "Border Token"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 125 - "Radius Token"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 126 - "Large Size Token"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 127 - "Small Size Token"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 128 - "UI Styling Test Requirements"
Cohesion: 0.70
Nodes (5): UI Styling Scripts Requirements, UI Styling Tests Requirements, pytest, pytest-cov, pytest-mock

### Community 129 - "Metro Config"
Cohesion: 0.40
Nodes (4): config, defaultConfig, { getDefaultConfig, mergeConfig }, react-native-config

### Community 130 - "Spacing & List Styles"
Cohesion: 0.50
Nodes (3): BASE_SPACING, createSpacing(), listStyles

### Community 131 - "Padding-Y Token"
Cohesion: 0.67
Nodes (4): padding-y, padding-y, $type, $value

### Community 132 - "XL Size Token"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 133 - "None Token"
Cohesion: 0.67
Nodes (4): $type, $value, none, none

### Community 134 - "iOS Run README"
Cohesion: 0.83
Nodes (4): README, Run iOS (Development), Run iOS (Production), Run iOS (Staging)

### Community 135 - "Design System Generation"
Cohesion: 0.67
Nodes (3): Design Dials (variance/motion/density), Design System Generation, Master + Overrides Persistence Pattern

### Community 136 - "Env Loader"
Cohesion: 0.67
Nodes (3): load_env(), Load .env files in priority order, load_env()

### Community 137 - "Value Token 16"
Cohesion: 0.67
Nodes (3): $type, $value, 16

### Community 138 - "Value Token 1"
Cohesion: 0.67
Nodes (3): $type, $value, 1

### Community 139 - "Value Token 3"
Cohesion: 0.67
Nodes (3): $type, $value, 3

### Community 140 - "Value Token 8"
Cohesion: 0.67
Nodes (3): $type, $value, 8

### Community 141 - "Destructive Color Token"
Cohesion: 0.67
Nodes (3): destructive, $type, $value

### Community 142 - "Destructive Foreground Token"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 143 - "Muted Color Token"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 144 - "Primary Foreground Token"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 145 - "Ring Color Token"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 146 - "Secondary Foreground Token"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

## Knowledge Gaps
- **678 isolated node(s):** `Replacement`, `CurvedBarBackgroundProps`, `ScrollContextValue`, `HeroHeaderProps`, `LayoutCtaButtonProps` (+673 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 968 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `shadcn Components Reference` connect `shadcn Component List` to `UI Component Specs`, `UI Styling Skill`, `Form Components`?**
  _High betweenness centrality (0.320) - this node is a cross-community bridge._
- **Why does `ui-styling skill` connect `UI Styling Skill` to `shadcn Component List`, `Design Skills Suite`, `Design Skills Collection`?**
  _High betweenness centrality (0.314) - this node is a cross-community bridge._
- **Why does `react-hook-form` connect `Auth Navigation & OTP` to `Auth Hooks`, `Auth & Navigation`, `Screen UI Components`, `Package Manifest`, `Form Components`, `Identity Account Screens`, `Forgot Password Flow`, `Network & Retry Utilities`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TailwindConfigGenerator` (e.g. with `TestGeneratedConfigIsValidJs` and `TestTailwindConfigGenerator`) actually correct?**
  _`TailwindConfigGenerator` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Replacement`, `CurvedBarBackgroundProps`, `ScrollContextValue` to the rest of the system?**
  _678 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NPM Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.031746031746031744 - nodes in this community are weakly interconnected._
- **Should `Color Design Tokens` be split into smaller, more focused modules?**
  _Cohesion score 0.05370101596516691 - nodes in this community are weakly interconnected._