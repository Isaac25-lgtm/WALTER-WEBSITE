import "./setup-env.js";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_ERROR_CODES,
  CONTENT_DRAFT_KEYS,
  contentDraftItemSchema,
  contentDraftListResponseSchema,
  contentPublicationDetailSchema,
  contentPublicationListResponseSchema,
  contentVersionConflictErrorSchema,
  managementAuthUnavailableErrorSchema,
} from "@ats/contracts";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";
import { MemoryContentDraftRepository } from "../src/repositories/memory-content-draft-repository.js";
import { MemoryPublicationRepository } from "../src/repositories/memory-publication-repository.js";
import { createTestAuthVerifier, expectManagementHeaders, signTestToken, TEST_ADMIN_SUBJECT } from "./auth-test-helpers.js";

const baseConfig = loadConfig();
const apps: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  while (apps.length > 0) {
    const app = apps.pop();
    if (app) await app.close();
  }
});

describe("authenticated content drafts", () => {
  it("uses /management/content/drafts with atomic optimistic concurrency", async () => {
    const repository = new MemoryContentDraftRepository();
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      contentDraftRepository: repository,
      publicationRepository: new MemoryPublicationRepository(),
      authVerifier: verifier,
    });
    apps.push(app);
    const headers = { authorization: `Bearer ${token}` };

    const retired = await app.inject({ method: "GET", url: "/management/content-drafts", headers });
    expect(retired.statusCode).toBe(404);

    const list = await app.inject({ method: "GET", url: "/management/content/drafts", headers });
    expect(list.statusCode).toBe(200);
    expectManagementHeaders(list);
    const listed = contentDraftListResponseSchema.parse(list.json());
    expect(listed.drafts.map((item) => item.key)).toEqual([...CONTENT_DRAFT_KEYS]);
    expect(listed.drafts[0]?.version).toBe(0);
    expect(listed.drafts[0]?.page).toBe("homepage");
    expect(listed.drafts[0]?.plainTextPolicy).toBe("plain_text_no_html");
    const registrySource = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/content/registry.ts"),
      "utf8",
    );
    expect(registrySource).not.toContain("Engineering, fabrication");
    expect(registrySource).toContain("CONTENT_DRAFT_FIELDS");

    const saved = await app.inject({
      method: "PUT",
      url: "/management/content/drafts/homepage.heroHeading",
      headers: { ...headers, "content-type": "application/json" },
      payload: { value: "Local draft heading", expectedVersion: 0 },
    });
    expect(saved.statusCode).toBe(200);
    expect(contentDraftItemSchema.parse(saved.json()).version).toBe(1);

    const conflict = await app.inject({
      method: "PUT",
      url: "/management/content/drafts/homepage.heroHeading",
      headers: { ...headers, "content-type": "application/json" },
      payload: { value: "Stale write", expectedVersion: 0 },
    });
    expect(conflict.statusCode).toBe(409);
    expect(contentVersionConflictErrorSchema.parse(conflict.json()).error.code).toBe(
      API_ERROR_CODES.content_version_conflict,
    );

    const resetConflict = await app.inject({
      method: "POST",
      url: "/management/content/drafts/homepage.heroHeading/reset",
      headers: { ...headers, "content-type": "application/json" },
      payload: { expectedVersion: 0 },
    });
    expect(resetConflict.statusCode).toBe(409);

    const reset = await app.inject({
      method: "POST",
      url: "/management/content/drafts/homepage.heroHeading/reset",
      headers: { ...headers, "content-type": "application/json" },
      payload: { expectedVersion: 1 },
    });
    expect(reset.statusCode).toBe(200);
    expect(repository.records.has("homepage.heroHeading")).toBe(false);
  }, 15_000);

  it("rejects one of two concurrent first saves", async () => {
    const repository = new MemoryContentDraftRepository();
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      contentDraftRepository: repository,
      publicationRepository: new MemoryPublicationRepository(),
      authVerifier: verifier,
    });
    apps.push(app);
    const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
    const [first, second] = await Promise.all([
      app.inject({
        method: "PUT",
        url: "/management/content/drafts/homepage.heroHeading",
        headers,
        payload: { value: "First concurrent heading", expectedVersion: 0 },
      }),
      app.inject({
        method: "PUT",
        url: "/management/content/drafts/homepage.heroHeading",
        headers,
        payload: { value: "Second concurrent heading", expectedVersion: 0 },
      }),
    ]);
    const statuses = [first.statusCode, second.statusCode].sort();
    expect(statuses).toEqual([200, 409]);
    expect(repository.records.size).toBe(1);
  }, 15_000);

  it("prepares an immutable publication without exposing administrator subjects", async () => {
    const drafts = new MemoryContentDraftRepository();
    const publications = new MemoryPublicationRepository(drafts);
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      contentDraftRepository: drafts,
      publicationRepository: publications,
      authVerifier: verifier,
    });
    apps.push(app);
    const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

    await app.inject({
      method: "PUT",
      url: "/management/content/drafts/homepage.heroHeading",
      headers,
      payload: { value: "Local draft heading", expectedVersion: 0 },
    });
    await app.inject({
      method: "PUT",
      url: "/management/content/drafts/contact.heading",
      headers,
      payload: { value: "Selected contact heading", expectedVersion: 0 },
    });

    const allCanonical = await app.inject({
      method: "POST",
      url: "/management/content/publications/prepare",
      headers,
      payload: { expectedDraftVersions: {} },
    });
    expect(allCanonical.statusCode).toBe(201);
    const canonicalDetail = contentPublicationDetailSchema.parse(allCanonical.json());
    expect(canonicalDetail.entries.find((entry) => entry.key === "homepage.heroHeading")?.source).toBe("canonical");
    expect(canonicalDetail.entries.find((entry) => entry.key === "contact.heading")?.source).toBe("canonical");
    expect(canonicalDetail.entries.map((entry) => entry.key)).toEqual(
      [...CONTENT_DRAFT_KEYS].sort((left, right) => left.localeCompare(right)),
    );

    const missing = await app.inject({
      method: "POST",
      url: "/management/content/publications/prepare",
      headers,
      payload: { expectedDraftVersions: { "thankYou.heading": 1 } },
    });
    expect(missing.statusCode).toBe(409);

    const listedZero = await app.inject({
      method: "POST",
      url: "/management/content/publications/prepare",
      headers,
      payload: { expectedDraftVersions: { "homepage.heroHeading": 0 } },
    });
    expect(listedZero.statusCode).toBe(400);

    const stale = await app.inject({
      method: "POST",
      url: "/management/content/publications/prepare",
      headers,
      payload: { expectedDraftVersions: { "homepage.heroHeading": 2 } },
    });
    expect(stale.statusCode).toBe(409);

    const created = await app.inject({
      method: "POST",
      url: "/management/content/publications/prepare",
      headers,
      payload: { expectedDraftVersions: { "homepage.heroHeading": 1 } },
    });
    expect(created.statusCode).toBe(201);
    const detail = contentPublicationDetailSchema.parse(created.json());
    expect(detail.status).toBe("prepared");
    expect(detail.entryCount).toBe(CONTENT_DRAFT_KEYS.length);
    expect(detail.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(detail.entries.find((entry) => entry.key === "homepage.heroHeading")).toEqual({
      key: "homepage.heroHeading",
      value: "Local draft heading",
      source: "draft",
      sourceDraftVersion: 1,
    });
    expect(detail.entries.find((entry) => entry.key === "contact.heading")).toEqual({
      key: "contact.heading",
      value: expect.any(String),
      source: "canonical",
      sourceDraftVersion: null,
    });
    expect(detail.entries.find((entry) => entry.key === "contact.heading")?.value).not.toBe("Selected contact heading");
    expect(JSON.stringify(detail)).not.toContain(TEST_ADMIN_SUBJECT);
    expect(JSON.stringify(detail)).not.toContain("createdBySubject");

    const fetched = await app.inject({
      method: "GET",
      url: `/management/content/publications/${detail.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(fetched.statusCode).toBe(200);
    expect(contentPublicationDetailSchema.parse(fetched.json()).id).toBe(detail.id);
    expect(JSON.stringify(fetched.json())).not.toContain(TEST_ADMIN_SUBJECT);
    expect(JSON.stringify(fetched.json())).not.toContain("createdBySubject");

    const patchPublication = await app.inject({
      method: "PATCH",
      url: `/management/content/publications/${detail.id}`,
      headers,
      payload: { status: "published" },
    });
    expect(patchPublication.statusCode).toBe(404);
    const deletePublication = await app.inject({
      method: "DELETE",
      url: `/management/content/publications/${detail.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(deletePublication.statusCode).toBe(404);

    const listed = await app.inject({
      method: "GET",
      url: "/management/content/publications",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(listed.statusCode).toBe(200);
    const page = contentPublicationListResponseSchema.parse(listed.json());
    expect(page.publications).toHaveLength(2);
    expect(JSON.stringify(page)).not.toContain(TEST_ADMIN_SUBJECT);

    const snapshots = await app.inject({
      method: "GET",
      url: "/management/content/snapshots",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(snapshots.statusCode).toBe(404);
    const postSnapshot = await app.inject({
      method: "POST",
      url: "/management/content/snapshots",
      headers,
      payload: {},
    });
    expect(postSnapshot.statusCode).toBe(404);
    const publish = await app.inject({
      method: "POST",
      url: "/management/content/publish",
      headers,
      payload: {},
    });
    expect(publish.statusCode).toBe(404);

    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/routes/management.ts"),
      "utf8",
    );
    expect(source).not.toContain("STATIC_SITE_DEPLOY_HOOK");
    expect(source).not.toContain("/management/content-drafts");
    expect(source).not.toContain("/management/content/snapshots");
    expect(source).toContain("preparePublication");
    const prepareBlock = source.slice(source.indexOf("/management/content/publications/prepare"));
    expect(prepareBlock).not.toContain("listDrafts");
    expect(prepareBlock).not.toContain("getDraft");
    const drizzlePublicationSource = readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../src/repositories/drizzle-publication-repository.ts",
      ),
      "utf8",
    );
    expect(drizzlePublicationSource).toContain(".transaction");
    expect(drizzlePublicationSource).toContain('.for("update")');
    expect(drizzlePublicationSource).not.toContain("isBeforeCursor");
    expect(drizzlePublicationSource).toContain("query.limit + 1");
    expect(drizzlePublicationSource).toContain("lt(contentPublications.createdAt");
    const dbClientSource = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/db/client.ts"),
      "utf8",
    );
    expect(dbClientSource).toContain("drizzle-orm/neon-serverless");
    expect(dbClientSource).not.toContain("neon-http");
    expect(dbClientSource).toContain("pool.end");
    const appSource = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/app.ts"),
      "utf8",
    );
    expect(appSource).toContain("createAppPersistence");
    expect(appSource).toContain("onClose");
    expect(appSource).toContain("created.end");
    const persistenceSource = readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../src/repositories/create-content-persistence.ts",
      ),
      "utf8",
    );
    expect(persistenceSource).toContain("createAppPersistence");
    expect(persistenceSource).not.toContain("persistenceByUrl");
    const drizzleSource = readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../src/repositories/drizzle-content-draft-repository.ts",
      ),
      "utf8",
    );
    expect(drizzleSource).toContain("onConflictDoNothing");
    expect(drizzleSource).toContain("eq(contentDrafts.version, expectedVersion)");
    expect(drizzleSource).toContain(".returning");
  }, 15_000);

  it("merges Authorization into Vary on success and error responses", async () => {
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      contentDraftRepository: new MemoryContentDraftRepository(),
      publicationRepository: new MemoryPublicationRepository(),
      authVerifier: verifier,
    });
    apps.push(app);
    const origin = "http://localhost:3000";
    const ok = await app.inject({
      method: "GET",
      url: "/management/session",
      headers: { authorization: `Bearer ${token}`, origin },
    });
    expect(ok.statusCode).toBe(200);
    const okVary = String(ok.headers.vary)
      .split(/\s*,\s*/)
      .map((part) => part.toLowerCase());
    expect(okVary).toContain("origin");
    expect(okVary).toContain("authorization");

    const missing = await app.inject({
      method: "GET",
      url: "/management/session",
      headers: { origin },
    });
    expect(missing.statusCode).toBe(401);
    const errorVary = String(missing.headers.vary)
      .split(/\s*,\s*/)
      .map((part) => part.toLowerCase());
    expect(errorVary).toContain("origin");
    expect(errorVary).toContain("authorization");
  }, 15_000);

  it("returns management_storage_unavailable when draft storage is down", async () => {
    const repository = new MemoryContentDraftRepository();
    repository.failNext = true;
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      contentDraftRepository: repository,
      publicationRepository: new MemoryPublicationRepository(),
      authVerifier: verifier,
    });
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: "/management/content/drafts",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe(API_ERROR_CODES.management_storage_unavailable);
  }, 15_000);

  it("pages publications with identical timestamps without duplicates or omissions", async () => {
    const publications = new MemoryPublicationRepository();
    const stamp = new Date("2026-09-01T12:00:00.000Z");
    for (const id of [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000003",
    ]) {
      publications.seed({
        id,
        status: "prepared",
        contentHash: "a".repeat(64),
        entryCount: CONTENT_DRAFT_KEYS.length,
        createdAt: stamp,
        createdBySubject: TEST_ADMIN_SUBJECT,
        entries: [],
      });
    }
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      contentDraftRepository: new MemoryContentDraftRepository(),
      publicationRepository: publications,
      authVerifier: verifier,
    });
    apps.push(app);
    const first = await app.inject({
      method: "GET",
      url: "/management/content/publications?limit=2",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(first.statusCode).toBe(200);
    const firstPage = contentPublicationListResponseSchema.parse(first.json());
    expect(firstPage.publications.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000002",
    ]);
    expect(firstPage.nextCursor).toEqual(expect.any(String));
    expect(JSON.stringify(firstPage)).not.toContain(TEST_ADMIN_SUBJECT);
    const second = await app.inject({
      method: "GET",
      url: `/management/content/publications?limit=2&cursor=${encodeURIComponent(firstPage.nextCursor ?? "")}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(second.statusCode).toBe(200);
    const secondPage = contentPublicationListResponseSchema.parse(second.json());
    expect(secondPage.publications.map((item) => item.id)).toEqual(["00000000-0000-4000-8000-000000000001"]);
    expect(secondPage.nextCursor).toBeNull();
    const ids = [...firstPage.publications, ...secondPage.publications].map((item) => item.id);
    expect(new Set(ids).size).toBe(3);
  }, 15_000);
});

describe("management auth unavailable", () => {
  it("does not use the public inquiry service_unavailable envelope", async () => {
    const app = await buildApp({ config: { ...baseConfig, managementAuthEnabled: false }, logger: false });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/management/session" });
    expect(response.statusCode).toBe(503);
    expect(managementAuthUnavailableErrorSchema.parse(response.json()).error.code).toBe(
      API_ERROR_CODES.management_auth_unavailable,
    );
  });
});
