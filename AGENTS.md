# Sifr project working rules

- This is the separate Common Ground Makeathon release, explicitly requested by the user on 11 October 2026. Use its own Site ID and GitHub repository. Preserve the original live Sifr Site unchanged.
- Preserve Git history and all saved Site versions. Read VERSION_HISTORY.md before an iteration or rollback.
- The source derives from the verified Sifr v0.1.3 baseline plus today's unpublished work; baseline evidence is in VERSION_HISTORY.md. Follow the new-Site workflow for this separate project.
- Publish iterations as new archive-backed versions. Never overwrite the baseline or force-push/rewrite history.
- Update semantic release notes and the on-site version for each user-visible iteration.
- Rollback means redeploying a verified saved Site version, not resetting or deleting source history.
- Preserve lib/sifr-data.json unless the user explicitly requests a data-model change. Visualization work must not silently change particles, coordinates, or scores.
- Keep the three projections and Compare on the same model and coordinate system. Field samples are not molecules.
- Verify selection continuity, mobile layout, original data integrity, and the production build before publishing.
