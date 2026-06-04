---
type: decision
summary: "Payload uploads live in a `media` collection on Vercel Blob storage; a sharp beforeChange hook writes a base64 blur placeholder onto each media doc so next/image keeps blur-up (via the MediaImage wrapper). BlurImage/BLUR_DATA stays for the static /img assets."
tags: [payload, media, storage, image]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[payload-backend]]", "[[image-loading]]", "[[service-pages]]"]
sources: ["[[2026-06-04-services-payload-collection-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
Service images moved into Payload. Vercel's filesystem is ephemeral, so uploads
need durable storage; and the site values instant blur-up previews.
## Decision
Register `@payloadcms/storage-vercel-blob` (token `BLOB_READ_WRITE_TOKEN`) for the
`media` collection. A `beforeChange` hook runs `sharp(buf).resize(16).webp().toBuffer()`
→ base64 and stores it on `media.blurDataURL` (mirrors scripts/gen-blur.mjs). The new
`MediaImage` component renders next/image with that blur; `BlurImage`/`BLUR_DATA` keep
serving the static /img assets (projects, guides, winter, auth hero). Files are stored
in Blob and served via Payload's `/api/media/file/...` route.
## Why
Durable prod storage + preserved image quality, with one CMS media library.
## Consequences
`BLOB_READ_WRITE_TOKEN` is a required env (dev + prod); without it the plugin silently
falls back to local disk (files lost on redeploy). next.config `remotePatterns` allows
`*.public.blob.vercel-storage.com`. A future full media migration of the other static
images is possible but out of scope.
