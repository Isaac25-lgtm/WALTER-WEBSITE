# Project decisions (locked)

Prompt 2 of 18. These decisions govern later implementation. They do not authorise building the site in this prompt.

## Public visual specification

- **https://metalfabrication.ie/** is the binding public visual reference.
- ATS content will replace the reference organisation’s identity and content.
- Later prompts must reproduce the reference’s **recorded** layout, geometry, hierarchy, responsiveness and interactions.
- Do **not** redesign or creatively reinterpret the public site.
- **ATS determines what the site says and shows.**
- **The reference determines how the public site looks and behaves.**
- `/walter` is visually independent and designed as a simple management application.

Do not add public sections merely because the ATS documents contain extra material. Reference analysis (a later prompt) decides where canonical ATS content fits.

## Locked hosting and backend

| Concern | Decision |
| --- | --- |
| Public website | Static Next.js export on Render Static Sites |
| Private management route | `/walter` |
| Protected backend API | Render Web Service |
| Database | Neon PostgreSQL |
| Authentication | Neon Auth |
| Schema and migrations | Drizzle ORM |
| Images and attachments | Cloudflare R2 |
| Email notifications | Resend |
| Publishing | Draft in Neon → preview → publish → server-side Render deploy hook rebuilds the static public site |
| Secrets and deploy-hook URLs | Server-side only |
| Privileged database credentials | Never in browser code |
| Uploaded media | Not stored in Neon or on Render’s ephemeral filesystem |
| Public project media vs private inquiry attachments | Separate storage policies |

## Free-tier constraints

- Render’s free API may **sleep** when idle.
- The public site must remain **static and fast** even when the API sleeps.
- Neon data must stay within the approved free-tier design.
- Media must **not** consume database storage.
- Free-tier assumptions must be rechecked before production deployment.

## Source-control status

- This workspace is **not** currently a Git repository.
- **Do not initialize Git during Prompt 2.**
- Before the first remote push, the two large source PDFs (`active company profile new 2025 civil and construction-1.pdf`, `COMPANY CONTEXT.pdf`) and generated extraction assets (`context/assets/_raw_extract/`, `context/assets/previews/`, JPEG2000 objects) need a deliberate **Git LFS, archive, or ignore** policy.

## Organization (from user authority)

- Uganda and Tanzania belong to **one company**.
- Tanzania is a **branch**.
- Uganda is the **primary public operation**.
- Public brand: Active Technical Services / ATS, mark Gift of God.
- Walter is owner/administrator for `/walter` only — not a public legal name.

## Implementation freeze for this prompt

No Next.js scaffold, package install, database, auth, `/walter` UI, deploy, or Git init in Prompt 2.
