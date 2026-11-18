import { db, schema } from "@/db";
import { eq, or, sql } from "drizzle-orm";
import {
  fetchOpenFDADrugEnforcement,
  fetchOpenFDADeviceEnforcement,
  fetchOpenFDADevice510k,
  fetchOpenFDADevicePMA,
} from "./connectors/openfda";
import { fetchGenericRSS } from "./connectors/rss";
import { NormalizedItem, IngestionResult } from "./types";

export class NewsIngestionEngine {
  private static isRunning = false;

  public static async runAllSources(sourceCodeFilter?: string): Promise<IngestionResult[]> {
    if (this.isRunning) {
      console.warn("⚠️ Ingestion engine is already running. Skipping concurrent trigger.");
      return [
        {
          sourceCode: "global_lock",
          status: "warning",
          fetched: 0,
          inserted: 0,
          skipped: 0,
          errorMessage: "Ingestion lock active: process currently running.",
          executionTimeMs: 0,
        },
      ];
    }

    this.isRunning = true;
    const results: IngestionResult[] = [];

    try {
      // Fetch active sources from database
      const allSources = await db.query.sources.findMany({
        where: sourceCodeFilter
          ? eq(schema.sources.code, sourceCodeFilter)
          : eq(schema.sources.isActive, true),
      });

      // Cache categories by slug
      const allCats = await db.query.categories.findMany();
      const catMap = new Map<string, number>();
      for (const c of allCats) {
        catMap.set(c.slug, c.id);
      }
      const defaultCatId = catMap.get("regulatory-intelligence") || (allCats[0]?.id ?? 1);

      // Default editorial author
      const adminUser = await db.query.users.findFirst({
        where: eq(schema.users.role, "Superadmin"),
      });
      const authorId = adminUser?.id || 1;

      for (const src of allSources) {
        const startTime = Date.now();
        let fetchedItems: NormalizedItem[] = [];
        let errorMsg: string | undefined;

        try {
          // Route to appropriate connector
          if (src.code === "openfda_drug_enforcement") {
            fetchedItems = await fetchOpenFDADrugEnforcement(8);
          } else if (src.code === "openfda_device_enforcement") {
            fetchedItems = await fetchOpenFDADeviceEnforcement(8);
          } else if (src.code === "openfda_device_510k") {
            fetchedItems = await fetchOpenFDADevice510k(8);
          } else if (src.code === "openfda_device_pma") {
            fetchedItems = await fetchOpenFDADevicePMA(8);
          } else if (src.feedUrl && (src.type.startsWith("rss_") || src.type === "rss_general")) {
            fetchedItems = await fetchGenericRSS(src.feedUrl, src.name, src.categorySlug, 8);
          }
        } catch (err: any) {
          console.error(`Error fetching source ${src.code}:`, err);
          errorMsg = err.message || "Failed to fetch source";
        }

        let inserted = 0;
        let skipped = 0;

        for (const item of fetchedItems) {
          try {
            // Deduplication check: check by sourceUrlHash or externalRecordId
            const existing = await db.query.articles.findFirst({
              where: or(
                eq(schema.articles.sourceUrlHash, item.sourceUrlHash),
                eq(schema.articles.externalRecordId, item.externalId)
              ),
            });

            if (existing) {
              skipped++;
              continue;
            }

            const targetCatId = catMap.get(item.categorySlug) || defaultCatId;
            const articleStatus = src.autoPublish ? "Published" : "Pending Review";

            // Insert into articles table
            const cleanTitle = item.title.slice(0, 290);
            const [insertedArt] = await db.insert(schema.articles).values({
              title: cleanTitle,
              slug: item.slug.slice(0, 310),
              excerpt: item.excerpt ? item.excerpt.slice(0, 450) : null,
              content: item.content,
              featuredImage: item.featuredImage,
              imageCaption: item.imageCaption || `Source: ${src.name}`,
              status: articleStatus,
              authorId,
              primaryCategoryId: targetCatId,
              sourceId: src.id,
              sourceUrl: item.sourceUrl,
              sourceUrlHash: item.sourceUrlHash,
              externalRecordId: item.externalId ? item.externalId.slice(0, 480) : null,
              canonicalUrl: item.sourceUrl,
              seoTitle: `${cleanTitle.slice(0, 50)} | NewsKrez`,
              metaDescription: (item.excerpt || cleanTitle).slice(0, 160),
              isBreaking: item.isBreaking || false,
              viewsCount: Math.floor(Math.random() * 40) + 10,
              readingTimeMinutes: 3,
              publishedAt: articleStatus === "Published" ? item.publishedAt : null,
            });

            inserted++;

            // If item has regulatoryData, sync to regulatory tables
            if (item.regulatoryData) {
              const reg = item.regulatoryData;

              // Insert into regulatory_alerts
              try {
                const existingAlert = await db.query.regulatoryAlerts.findFirst({
                  where: eq(schema.regulatoryAlerts.slug, item.slug),
                });
                if (!existingAlert) {
                  await db.insert(schema.regulatoryAlerts).values({
                    agency: reg.agency,
                    alertType: reg.alertType,
                    title: item.title,
                    slug: item.slug,
                    summary: item.excerpt,
                    content: item.content,
                    recallClass: reg.recallClass || null,
                    affectedProduct: reg.affectedProduct || null,
                    manufacturer: reg.manufacturer || null,
                    distributionPattern: reg.distributionPattern || null,
                    alertDate: item.publishedAt,
                    sourceUrl: item.sourceUrl,
                    externalReferenceId: item.externalId,
                    status: "active",
                  });
                }
              } catch (alertErr) {
                console.error("Alert insertion error:", alertErr);
              }

              // If Medical Device record (510k / PMA / recall)
              if (reg.recordType) {
                try {
                  let devId: number | null = null;
                  if (reg.affectedProduct && reg.manufacturer) {
                    const existingDev = await db.query.medicalDevices.findFirst({
                      where: eq(schema.medicalDevices.deviceName, reg.affectedProduct),
                    });
                    if (existingDev) {
                      devId = existingDev.id;
                    } else {
                      const [newDev] = await db.insert(schema.medicalDevices).values({
                        deviceName: reg.affectedProduct,
                        manufacturerName: reg.manufacturer,
                        productCode: reg.productCode || null,
                        deviceClass: reg.deviceClass || "Class II",
                        clearanceType: reg.recordType === "PMA" ? "PMA" : "510(k)",
                        status: "Active",
                      });
                      devId = newDev.insertId;
                    }
                  }

                  if (reg.submissionNumber) {
                    const existingRecord = await db.query.medicalDeviceRegulatoryRecords.findFirst({
                      where: eq(schema.medicalDeviceRegulatoryRecords.submissionNumber, reg.submissionNumber),
                    });
                    if (!existingRecord) {
                      await db.insert(schema.medicalDeviceRegulatoryRecords).values({
                        deviceId: devId,
                        agency: reg.agency,
                        recordType: reg.recordType,
                        submissionNumber: reg.submissionNumber,
                        applicant: reg.manufacturer || "Manufacturer",
                        deviceName: reg.affectedProduct || item.title,
                        decisionDate: item.publishedAt,
                        decisionDescription: item.excerpt,
                        productCode: reg.productCode || null,
                        deviceClass: reg.deviceClass || "Class II",
                        sourceUrl: item.sourceUrl,
                        externalId: item.externalId,
                      });
                    }
                  }
                } catch (devErr) {
                  console.error("Device record insertion error:", devErr);
                }
              }
            }
          } catch (itemErr) {
            console.error("Item insertion error:", itemErr);
            skipped++;
          }
        }

        const duration = Date.now() - startTime;
        const status = errorMsg ? "error" : "success";

        // Log fetch status
        await db.insert(schema.fetchLogs).values({
          sourceId: src.id,
          status,
          recordsFetched: fetchedItems.length,
          recordsInserted: inserted,
          recordsSkipped: skipped,
          errorMessage: errorMsg || null,
          executionTimeMs: duration,
        });

        // Update source health
        await db
          .update(schema.sources)
          .set({
            lastFetchedAt: new Date(),
            lastStatus: status,
            failureCount: status === "error" ? src.failureCount + 1 : 0,
          })
          .where(eq(schema.sources.id, src.id));

        results.push({
          sourceCode: src.code,
          status,
          fetched: fetchedItems.length,
          inserted,
          skipped,
          errorMessage: errorMsg,
          executionTimeMs: duration,
        });
      }
    } finally {
      this.isRunning = false;
    }

    return results;
  }
}
