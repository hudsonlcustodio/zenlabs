# DEFINITION OF DONE

A structural change is done only when:
- canonical decision updated;
- machine-readable contract updated;
- tests added/updated;
- security/tenant/cost impact reviewed;
- observability included;
- migration/rollback considered;
- docs and implementation agree.

A provider integration is not done until:
- contract verified against current official docs;
- errors mapped;
- idempotency proven;
- timeout/retry defined;
- cost attribution defined;
- mock exists;
- live staging evidence exists.
