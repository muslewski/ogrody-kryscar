This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Payload MCP

The ops collections (`services`, `service-requests`, `lawns`, `visits`, `tenants`) are
exposed for full CRUD over the Model Context Protocol at `/api/mcp`, via
[`@payloadcms/plugin-mcp`](https://www.npmjs.com/package/@payloadcms/plugin-mcp). The
Better Auth customer collections, `admins`, and `media` are NOT exposed.

Access is gated by Bearer API keys. Mint one in `/admin` → **MCP → API Keys**, pick which
collections/capabilities it may use, and copy the generated key. **Treat the key like an
admin password** — it resolves to the `admins` principal and reaches customer data.

Connect an MCP client (dev server runs on port 1111):

```
claude mcp add --transport http payload http://localhost:1111/api/mcp --header "Authorization: Bearer <YOUR_KEY>"
```
