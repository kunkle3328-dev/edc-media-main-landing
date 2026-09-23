# EDC Production Domain Setup

## Overview
To support `*.edcmedia.club` wildcard subdomains, you must configure your DNS provider (e.g., Vercel, Cloudflare) with a wildcard CNAME record.

## DNS Records

| Type | Name | Target / Value |
| :--- | :--- | :--- |
| CNAME | *.edcmedia.club | [YOUR_VERCEL_APP_TARGET_DOMAIN] |

## Production Domains
- **Corporate**: `edcmediahq.xyz`
- **Platform**: `edcmedia.club`
- **Customer Pages**: `*.edcmedia.club`
