# Homepage Taxonomy Ledger Design QA

- Source issue capture: `C:/Users/lyjkl/AppData/Local/Temp/codex-clipboard-1d2df77a-26a8-4592-8892-8048d5e89388.png`
- Desktop implementation: `outputs/audit/taxonomy-redesign-1440.png`
- Wide-desktop implementation: `outputs/audit/taxonomy-redesign-1866.png`
- Mobile regression capture: `outputs/audit/taxonomy-redesign-mobile-390.png`
- Viewports: 1440 x 900, 1866 x 900 and 390 x 844
- State: homepage scrolled to the 18-track taxonomy section

**Comparison Evidence**

- The source capture showed the taxonomy intro occupying the first grid row while the shared `.category-grid { grid-column: 1 / -1; }` rule forced all 18 tracks onto a second row. This left most of the right side visibly empty.
- The implementation gives the homepage taxonomy grid its own right-hand column and presents the tracks as a dense editorial ledger rather than generic buttons.
- The right side now starts with a clear board heading and continues directly into all 18 tracks; no large inactive paper area remains.

**Visual Findings**

- No actionable P0, P1 or P2 findings remain.
- Hierarchy: the left side remains the primary title and CTA. The right side has a smaller board title and operational metadata, so it supports rather than competes with the introduction.
- Information density: each track includes its number, short name, startup gate, market size and growth rate. Three desktop columns balance the original module height without card stacking.
- Material and color: warm paper, oxblood, mushroom text and antique-gold numerals reuse the existing homepage tokens. Fine ledger rules create depth without adding decorative containers.
- Semantics: the track entries are static `article` elements rather than non-functional buttons. The only command in the section remains the assessment CTA.
- Responsiveness: at tablet widths the section becomes one column and the ledger becomes two columns. At 390px the existing mobile atelier composition remains authoritative and the desktop taxonomy section stays hidden.
- Overflow: browser measurements reported no horizontal overflow at 1440px, 1866px or 390px.

**Interaction And Regression Verification**

- `查看你的赛道建议` still enters the existing lead and assessment journey.
- All 18 configured categories render exactly once from `categoryWeights`.
- The assessment calculation, category ordering and recommendation logic were not changed.
- The desktop homepage retains the existing header, hero and three-step section.
- The mobile homepage remains unchanged.
- `npm run build` and `npm test` completed successfully.

**Follow-up Polish**

- P3: browser font rasterization can vary slightly between Windows display scaling modes, but labels remain readable and do not clip.

final result: passed

## July 15 Modification Completion Pass

- Scope: commercial assessment, AI assessment, OPC positioning report, account history and administrator workspace.
- Logic: the L1-L9 growth path is sequential, including L7 to L8; Top3 explanations are generated from the same weighted category scores shown in the result; all six AI dimensions map to a concrete solution and official tool set.
- Report access: the free OPC result keeps the score, level, positioning and Top3 visible. Six-dimension analysis, AI workflow and 30-day route require an administrator unlock. Locked data is redacted by the Worker API instead of only being hidden with CSS.
- Account history: independent commercial and AI reports remain directly readable. OPC detail access follows the server-side unlock state.
- Administration: super administrators can group records by registered user, inspect every report, assign an advisor, unlock or revoke OPC detail access and manage advisor accounts. Advisors can only view and update records assigned to them and cannot delete or reassign records.
- AI tool library: ten tools cover all six assessment dimensions. Chinese route aliases and standalone share URLs are available for all three assessments and the tool library.
- Accessibility: the result page now has a single primary `h1`; locked-state commands meet the 44px mobile target; reduced-motion preferences are respected.
- Verification: 10 assessment tests pass, the production build completes, the remote D1 migration applies successfully, and API integration verifies locked redaction, unlocking, advisor isolation and user aggregation.

final result: passed
