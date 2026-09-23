# EDC MEDIA — DOMAIN & PUBLISHING ARCHITECTURE (BUILD 01.5)

## 1. Domain Topology

- **Corporate Website (`edcmediahq.xyz`)**: Brand, products, services, pricing, case studies, company information, and marketing.
- **Customer Platform (`edcmedia.club`)**: Authentication, dashboard, workspaces, project builders, analytics, publishing manager, billing, and settings.
- **Free Customer Subdomains (`*.edcmedia.club`)**: Authoritative public delivery hostnames for customer sites (e.g. `lumina-dental.edcmedia.club`).
- **Custom Domains (`*.*`)**: Enterprise custom domain mappings (e.g. `www.luminadental.com`) with external DNS propagation requirements.

---

## 2. Public Publishing & Hostname Resolution Architecture

```
Incoming Request (Hostname)
       ↓
Hostname Resolver (middleware / API / router)
       ↓
DomainConnection Lookup (EDC Subdomain or Custom Domain)
       ↓
Project Resolution (via projectId)
       ↓
PublishedVersion Lookup (Explicitly published version, ignoring drafts)
       ↓
PublicSiteRenderer (Secure SSR render with canonical URL & SEO metadata)
```

---

## 3. Hostname Security & Isolation

- **No Arbitrary Queries**: Hostnames are strictly normalized and matched against verified `DomainConnection` records.
- **Tenant Isolation**: Cross-tenant IDOR attacks are blocked at the service level. A workspace cannot claim or resolve a domain owned by another tenant.
- **Draft Protection**: Public hostnames exclusively serve published versions (`publishedVersionId`). Working drafts remain confined to authenticated previews (`/preview/[projectId]`).

---

## 4. Reality-Based Status (Sandbox vs Production)

- **EDC Subdomains**: Provisioned and resolved instantly through EDC Edge routing.
- **Custom Domains**: Require external DNS CNAME and TXT record configuration. The platform accurately reports `PENDING` or `NOT_CONFIGURED` without faking external DNS status or simulated SSL certificates.
