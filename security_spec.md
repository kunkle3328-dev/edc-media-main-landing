# EDC Media Landing Engine v1.0 - Security Specification

## Data Invariants
1. **Organization Isolation**: A user can only read/write resources (Projects, Drafts, Versions, Domains) if they are an active member of the parent Organization.
2. **Project Ownership**: Projects must always belong to an Organization.
3. **Immutable Versions**: Once a version status is 'published' or 'superseded', its snapshot and metadata are immutable.
4. **Draft Consistency**: A draft must always reference its parent Project and Organization.
5. **Domain Uniqueness**: A domain hostname should be unique across the system (enforced by application logic, guarded by rules).

## The "Dirty Dozen" Payloads (Deny Matrix)

| # | Target Path | Actor | Action | Payload / Scenario | Reason for Denial |
|---|-------------|-------|--------|--------------------|-------------------|
| 1 | `/organizations/orgA/projects/projA` | UserB | READ | N/A | UserB is not a member of orgA. |
| 2 | `/organizations/orgA` | UserA | UPDATE | `{ "ownerId": "attackerUID" }` | ownerId is immutable. |
| 3 | `/organizations/orgA/projects/projA` | UserA | CREATE | `{ "organizationId": "orgB" }` | projectId/orgId mismatch with path. |
| 4 | `/organizations/orgA/projects/projA/versions/v1` | UserA | UPDATE | `{ "snapshot": { "malicious": true } }` | Versions are immutable after creation. |
| 5 | `/organizations/orgA/projects/projA/drafts/current` | UserA | UPDATE | `{ "revision": 10 }` (where existing is 15) | Revision conflict (Stale update). |
| 6 | `/organizations/orgA/members/userA` | UserA | UPDATE | `{ "role": "owner" }` | Users cannot escalate their own role. |
| 7 | `/organizations/orgA/projects/projA` | UserA | CREATE | `{ "status": "published" }` (without version) | Project cannot be published without Version. |
| 8 | `/audit_logs/log123` | UserA | DELETE | N/A | Audit logs are append-only. |
| 9 | `/organizations/orgA/projects/projA/domains/dom1` | UserA | CREATE | `{ "hostname": "google.com" }` | Invalid or reserved hostname. |
| 10 | `/organizations/orgA/projects/projA/drafts/current` | UserA | UPDATE | `{ "content": "massive_payload_10MB" }` | Size limit enforcement. |
| 11 | `/organizations/orgA` | Admin | DELETE | N/A | Organizations cannot be deleted by standard users (Archival only). |
| 12 | `/organizations/orgA/projects/projA/versions/v2` | UserA | CREATE | `{ "versionNumber": -1 }` | Version number must be positive. |

## Test Runner (Conceptual)
The `firestore.rules.test.ts` will verify these boundaries using the `@firebase/rules-unit-testing` library.
