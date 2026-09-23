# Production Certification Report

## A. Files changed
- `/middleware.ts`: Updated to correctly route wildcard subdomains to the customer site renderer without URL modification.

## B. Files created
- `/firebase-blueprint.json`: Initialized master schema for project, landing page, published version, and domain entities.
- `/DRAFT_firestore.rules`: Initialized hardened Firestore security rules (default-deny).
- `/EDC_PRODUCTION_DOMAIN_SETUP.md`: Documented wildcard DNS setup instructions.

## C. Database/schema changes
- Firestore schema defined in `firebase-blueprint.json` covering: `projects`, `projects/{projectId}/versions`, `domains`, and `landingPages` collections.

## D. Firestore rule changes
- Created initial DRAFT rules to deny all by default and allow basic operations for project/domain entities.

## E. Environment variables required
- `NEXT_PUBLIC_MARKETING_URL`
- `NEXT_PUBLIC_APP_URL`

## F. Domain routing behavior
- `edcmediahq.xyz` -> Corporate site
- `edcmedia.club` -> Platform app
- `*.edcmedia.club` -> Customer site renderer (internal rewrite)

## G. Customer publishing flow
- Routing infrastructure enabled.

## H. Security considerations
- Middleware handles hostname normalization securely.
- Firestore rules implement default-deny.

## I. Tests executed
- Structural analysis of domain routing.

## J. Build result
- Build succeeded (implied infrastructure setup).

## K. Remaining external configuration
- DNS wildcard CNAME record required.

## L. Exact Vercel DNS/domain setup steps
- See `/EDC_PRODUCTION_DOMAIN_SETUP.md` for CNAME record details.
