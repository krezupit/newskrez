import {
  mysqlTable,
  int,
  varchar,
  text,
  mediumtext,
  boolean,
  timestamp,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// 1. USERS & ROLES
// ============================================================================

export const roles = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull().unique(), // Superadmin, Administrator, Editor, Regulatory Reviewer, Author
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 191 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("Author"), // Superadmin, Administrator, Editor, Regulatory Reviewer, Author
    avatar: varchar("avatar", { length: 255 }),
    bio: text("bio"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    roleIdx: index("idx_users_role").on(table.role),
  })
);

export const permissions = mysqlTable("permissions", {
  id: int("id").primaryKey().autoincrement(),
  roleId: int("role_id").notNull(),
  module: varchar("module", { length: 50 }).notNull(), // articles, devices, fda, who, sources, users, ads, newsletter, settings
  canRead: boolean("can_read").notNull().default(true),
  canWrite: boolean("can_write").notNull().default(false),
  canDelete: boolean("can_delete").notNull().default(false),
  canPublish: boolean("can_publish").notNull().default(false),
});

export const sessions = mysqlTable("sessions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// 2. CATEGORIES & TAGS
// ============================================================================

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    description: text("description"),
    parentId: int("parent_id"), // hierarchical categories & subcategories
    displayOrder: int("display_order").notNull().default(0),
    isNav: boolean("is_nav").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    metaTitle: varchar("meta_title", { length: 160 }),
    metaDescription: varchar("meta_description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("idx_categories_slug").on(table.slug),
    parentIdx: index("idx_categories_parent").on(table.parentId),
  })
);

export const tags = mysqlTable(
  "tags",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("idx_tags_slug").on(table.slug),
  })
);

// ============================================================================
// 3. ARTICLES & METADATA
// ============================================================================

export const articles = mysqlTable(
  "articles",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 300 }).notNull(),
    slug: varchar("slug", { length: 320 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: mediumtext("content").notNull(),
    featuredImage: varchar("featured_image", { length: 500 }),
    imageCaption: varchar("image_caption", { length: 255 }),
    status: varchar("status", { length: 30 }).notNull().default("Draft"), // Draft, Pending Review, Approved, Published, Rejected, Archived
    authorId: int("author_id"),
    reviewerId: int("reviewer_id"),
    primaryCategoryId: int("primary_category_id").notNull(),
    sourceId: int("source_id"), // null if original/manual editorial
    provider: varchar("provider", { length: 50 }).default("newskrez"),
    sourceName: varchar("source_name", { length: 150 }),
    country: varchar("country", { length: 50 }),
    language: varchar("language", { length: 20 }).default("en"),
    importTimestamp: timestamp("import_timestamp").defaultNow(),
    sourceUrl: text("source_url"),
    sourceUrlHash: varchar("source_url_hash", { length: 64 }), // sha256 for fast deduplication
    externalRecordId: varchar("external_record_id", { length: 500 }), // external API identifier
    canonicalUrl: text("canonical_url"),
    seoTitle: varchar("seo_title", { length: 160 }),
    metaDescription: varchar("meta_description", { length: 255 }),
    isBreaking: boolean("is_breaking").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    isEditorPick: boolean("is_editor_pick").notNull().default(false),
    viewsCount: int("views_count").notNull().default(0),
    readingTimeMinutes: int("reading_time_minutes").notNull().default(3),
    publishedAt: timestamp("published_at"),
    scheduledAt: timestamp("scheduled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("idx_articles_slug").on(table.slug),
    hashIdx: index("idx_articles_url_hash").on(table.sourceUrlHash),
    statusIdx: index("idx_articles_status").on(table.status),
    publishedAtIdx: index("idx_articles_published_at").on(table.publishedAt),
    categoryIdx: index("idx_articles_category").on(table.primaryCategoryId),
    featuredIdx: index("idx_articles_featured").on(table.isFeatured),
    breakingIdx: index("idx_articles_breaking").on(table.isBreaking),
  })
);

export const articleCategories = mysqlTable(
  "article_categories",
  {
    id: int("id").primaryKey().autoincrement(),
    articleId: int("article_id").notNull(),
    categoryId: int("category_id").notNull(),
  },
  (table) => ({
    articleCategoryUnique: uniqueIndex("idx_art_cat_unique").on(table.articleId, table.categoryId),
  })
);

export const articleTags = mysqlTable(
  "article_tags",
  {
    id: int("id").primaryKey().autoincrement(),
    articleId: int("article_id").notNull(),
    tagId: int("tag_id").notNull(),
  },
  (table) => ({
    articleTagUnique: uniqueIndex("idx_art_tag_unique").on(table.articleId, table.tagId),
  })
);

// ============================================================================
// 4. API SOURCES, CREDENTIALS & INGESTION LOGS
// ============================================================================

export const sources = mysqlTable(
  "sources",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull(), // e.g. openFDA Drug Enforcement, WHO News, CDC Outbreaks
    code: varchar("code", { length: 50 }).notNull().unique(), // e.g. fda_drug_enforcement, fda_device_510k, who_news_rss
    type: varchar("type", { length: 50 }).notNull(), // api_openfda, api_clinicaltrials, api_pubmed, rss_general, rss_who, rss_cdc, rss_ema
    baseUrl: varchar("base_url", { length: 500 }).notNull(),
    feedUrl: varchar("feed_url", { length: 500 }),
    categorySlug: varchar("category_slug", { length: 120 }).notNull().default("regulatory-intelligence"),
    fetchIntervalMinutes: int("fetch_interval_minutes").notNull().default(60),
    isActive: boolean("is_active").notNull().default(true),
    autoPublish: boolean("auto_publish").notNull().default(false), // true -> Published, false -> Pending Review
    lastFetchedAt: timestamp("last_fetched_at"),
    lastStatus: varchar("last_status", { length: 30 }).default("idle"), // success, error, warning, idle
    failureCount: int("failure_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("idx_sources_code").on(table.code),
    activeIdx: index("idx_sources_active").on(table.isActive),
  })
);

export const sourceCredentials = mysqlTable("source_credentials", {
  id: int("id").primaryKey().autoincrement(),
  sourceId: int("source_id").notNull(),
  apiKey: varchar("api_key", { length: 255 }),
  apiSecret: varchar("api_secret", { length: 255 }),
  extraHeaders: text("extra_headers"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const fetchLogs = mysqlTable(
  "fetch_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    sourceId: int("source_id").notNull(),
    status: varchar("status", { length: 30 }).notNull(), // success, error, warning
    recordsFetched: int("records_fetched").notNull().default(0),
    recordsInserted: int("records_inserted").notNull().default(0),
    recordsSkipped: int("records_skipped").notNull().default(0),
    errorMessage: text("error_message"),
    executionTimeMs: int("execution_time_ms").notNull().default(0),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("idx_fetch_logs_source").on(table.sourceId),
    fetchedAtIdx: index("idx_fetch_logs_date").on(table.fetchedAt),
  })
);

export const ingestionCheckpoints = mysqlTable(
  "ingestion_checkpoints",
  {
    id: int("id").primaryKey().autoincrement(),
    sourceCode: varchar("source_code", { length: 50 }).notNull().unique(),
    checkpointKey: varchar("checkpoint_key", { length: 100 }).notNull(), // e.g. last_report_date, last_item_guid
    checkpointValue: text("checkpoint_value").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeKeyUnique: uniqueIndex("idx_checkpoint_source").on(table.sourceCode),
  })
);

export const newsProviders = mysqlTable(
  "news_providers",
  {
    id: int("id").primaryKey().autoincrement(),
    code: varchar("code", { length: 50 }).notNull().unique(), // gnews, newsapi, currents, mediastack, newsdata
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    websiteUrl: varchar("website_url", { length: 255 }),
    envKeyName: varchar("env_key_name", { length: 100 }).notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    priority: int("priority").notNull().default(1),
    rateLimitPerDay: int("rate_limit_per_day"),
    rateLimitPerMinute: int("rate_limit_per_minute"),
    quotaUsedToday: int("quota_used_today").notNull().default(0),
    quotaRemaining: int("quota_remaining"),
    quotaResetAt: timestamp("quota_reset_at"),
    lastFetchAt: timestamp("last_fetch_at"),
    lastSuccessAt: timestamp("last_success_at"),
    lastStatus: varchar("last_status", { length: 30 }).default("idle"),
    lastErrorMessage: text("last_error_message"),
    totalArticlesImported: int("total_articles_imported").notNull().default(0),
    supportedCategories: text("supported_categories"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("idx_news_providers_code").on(table.code),
    enabledIdx: index("idx_news_providers_enabled").on(table.isEnabled),
  })
);

export const providerFetchLogs = mysqlTable(
  "provider_fetch_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    providerCode: varchar("provider_code", { length: 50 }).notNull(),
    endpoint: varchar("endpoint", { length: 255 }),
    categorySlug: varchar("category_slug", { length: 100 }),
    status: varchar("status", { length: 30 }).notNull(),
    httpStatus: int("http_status"),
    articlesFetched: int("articles_fetched").notNull().default(0),
    articlesInserted: int("articles_inserted").notNull().default(0),
    articlesSkipped: int("articles_skipped").notNull().default(0),
    errorMessage: text("error_message"),
    executionTimeMs: int("execution_time_ms").notNull().default(0),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (table) => ({
    providerIdx: index("idx_prov_logs_code").on(table.providerCode),
    dateIdx: index("idx_prov_logs_date").on(table.fetchedAt),
  })
);

// ============================================================================
// 5. REGULATORY ALERTS (FDA, WHO, EMA, CDSCO)
// ============================================================================

export const regulatoryAlerts = mysqlTable(
  "regulatory_alerts",
  {
    id: int("id").primaryKey().autoincrement(),
    agency: varchar("agency", { length: 50 }).notNull(), // FDA, WHO, EMA, CDSCO, HEALTH_CANADA, MHRA
    alertType: varchar("alert_type", { length: 50 }).notNull(), // recall, safety_communication, warning_letter, outbreak, guidance, inspection
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 360 }).notNull().unique(),
    summary: text("summary"),
    content: mediumtext("content"),
    recallClass: varchar("recall_class", { length: 30 }), // Class I, Class II, Class III
    affectedProduct: varchar("affected_product", { length: 500 }),
    manufacturer: varchar("manufacturer", { length: 255 }),
    distributionPattern: text("distribution_pattern"),
    alertDate: timestamp("alert_date").notNull(),
    sourceUrl: varchar("source_url", { length: 800 }),
    externalReferenceId: varchar("external_reference_id", { length: 120 }),
    status: varchar("status", { length: 30 }).notNull().default("active"), // active, resolved, archived
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agencyIdx: index("idx_reg_agency").on(table.agency),
    alertTypeIdx: index("idx_reg_type").on(table.alertType),
    alertDateIdx: index("idx_reg_date").on(table.alertDate),
    slugIdx: uniqueIndex("idx_reg_slug").on(table.slug),
    extIdIdx: index("idx_reg_ext_id").on(table.externalReferenceId),
  })
);

// ============================================================================
// 6. MEDICAL DEVICES INTELLIGENCE & REGULATORY RECORDS
// ============================================================================

export const medicalDevices = mysqlTable(
  "medical_devices",
  {
    id: int("id").primaryKey().autoincrement(),
    deviceName: varchar("device_name", { length: 500 }).notNull(),
    brandName: varchar("brand_name", { length: 255 }),
    manufacturerName: varchar("manufacturer_name", { length: 255 }).notNull(),
    productCode: varchar("product_code", { length: 20 }),
    regulationNumber: varchar("regulation_number", { length: 50 }),
    deviceClass: varchar("device_class", { length: 30 }).notNull().default("Class II"), // Class I, Class II, Class III, Unclassified
    medicalSpecialty: varchar("medical_specialty", { length: 150 }), // Cardiovascular, Orthopedic, Radiology, etc.
    clearanceType: varchar("clearance_type", { length: 50 }).notNull().default("510(k)"), // 510(k), PMA, De Novo, UDI, Exemption
    status: varchar("status", { length: 50 }).notNull().default("Active"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    nameIdx: index("idx_med_dev_name").on(table.deviceName),
    mfgIdx: index("idx_med_dev_mfg").on(table.manufacturerName),
    codeIdx: index("idx_med_dev_code").on(table.productCode),
    classIdx: index("idx_med_dev_class").on(table.deviceClass),
  })
);

export const medicalDeviceRegulatoryRecords = mysqlTable(
  "medical_device_regulatory_records",
  {
    id: int("id").primaryKey().autoincrement(),
    deviceId: int("device_id"),
    agency: varchar("agency", { length: 50 }).notNull().default("FDA"), // FDA, EU MDR, CDSCO, Health Canada
    recordType: varchar("record_type", { length: 50 }).notNull(), // 510k, PMA, De_Novo, MAUDE, recall, warning_letter, qmsr
    submissionNumber: varchar("submission_number", { length: 60 }).notNull(), // e.g. K241890, P230012, DEN220045
    applicant: varchar("applicant", { length: 255 }).notNull(),
    deviceName: varchar("device_name", { length: 500 }).notNull(),
    decisionDate: timestamp("decision_date").notNull(),
    decisionDescription: text("decision_description"),
    productCode: varchar("product_code", { length: 20 }),
    deviceClass: varchar("device_class", { length: 20 }),
    advisoryCommittee: varchar("advisory_committee", { length: 100 }),
    sourceUrl: varchar("source_url", { length: 800 }),
    externalId: varchar("external_id", { length: 100 }),
    rawJson: mediumtext("raw_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    subNumIdx: uniqueIndex("idx_mdr_sub_num").on(table.submissionNumber, table.recordType),
    applicantIdx: index("idx_mdr_applicant").on(table.applicant),
    recordTypeIdx: index("idx_mdr_record_type").on(table.recordType),
    decisionDateIdx: index("idx_mdr_decision_date").on(table.decisionDate),
  })
);

export const deviceRecalls = mysqlTable(
  "device_recalls",
  {
    id: int("id").primaryKey().autoincrement(),
    deviceId: int("device_id"),
    recallNumber: varchar("recall_number", { length: 60 }).notNull().unique(), // e.g. Z-1234-2024
    resEventNumber: varchar("res_event_number", { length: 60 }),
    firmName: varchar("firm_name", { length: 255 }).notNull(),
    productName: varchar("product_name", { length: 300 }).notNull(),
    reasonForRecall: mediumtext("reason_for_recall").notNull(),
    action: text("action"),
    recallClass: varchar("recall_class", { length: 30 }).notNull(), // Class I, Class II, Class III
    eventDate: timestamp("event_date").notNull(),
    terminationDate: timestamp("termination_date"),
    status: varchar("status", { length: 50 }).notNull().default("Ongoing"), // Ongoing, Terminated, Completed
    sourceUrl: varchar("source_url", { length: 800 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    recallNumIdx: uniqueIndex("idx_dev_recall_num").on(table.recallNumber),
    firmIdx: index("idx_dev_recall_firm").on(table.firmName),
    classIdx: index("idx_dev_recall_class").on(table.recallClass),
    dateIdx: index("idx_dev_recall_date").on(table.eventDate),
  })
);

export const clinicalTrials = mysqlTable(
  "clinical_trials",
  {
    id: int("id").primaryKey().autoincrement(),
    nctId: varchar("nct_id", { length: 30 }).notNull().unique(), // e.g. NCT05829104
    title: varchar("title", { length: 400 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(), // Recruiting, Completed, Active, etc.
    phase: varchar("phase", { length: 50 }), // Phase 1, Phase 2, Phase 3, Phase 4
    condition: varchar("condition", { length: 255 }),
    intervention: varchar("intervention", { length: 255 }),
    sponsor: varchar("sponsor", { length: 255 }),
    studyType: varchar("study_type", { length: 100 }),
    completionDate: timestamp("completion_date"),
    url: varchar("url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    nctIdx: uniqueIndex("idx_clinical_nct").on(table.nctId),
    statusIdx: index("idx_clinical_status").on(table.status),
    conditionIdx: index("idx_clinical_cond").on(table.condition),
  })
);

// ============================================================================
// 7. NEWSLETTER, ADVERTISEMENTS & SETTINGS
// ============================================================================

export const newsletterSubscribers = mysqlTable(
  "newsletter_subscribers",
  {
    id: int("id").primaryKey().autoincrement(),
    email: varchar("email", { length: 191 }).notNull().unique(),
    token: varchar("token", { length: 100 }).notNull(),
    isVerified: boolean("is_verified").notNull().default(false),
    preferences: json("preferences"), // ["pharma", "devices", "fda", "who", "tech", "regulatory"]
    frequency: varchar("frequency", { length: 30 }).notNull().default("daily"), // daily, weekly, breaking_alerts
    isActive: boolean("is_active").notNull().default(true),
    unsubscribedAt: timestamp("unsubscribed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("idx_subscribers_email").on(table.email),
  })
);

export const advertisements = mysqlTable(
  "advertisements",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 150 }).notNull(),
    placement: varchar("placement", { length: 50 }).notNull(), // header_top, homepage_middle, sidebar_top, sidebar_bottom, in_article, footer_banner
    adType: varchar("ad_type", { length: 50 }).notNull().default("adsense"), // adsense, custom_banner, sponsored_post
    codeSnippet: text("code_snippet"),
    imageUrl: varchar("image_url", { length: 500 }),
    targetUrl: varchar("target_url", { length: 500 }),
    sponsorName: varchar("sponsor_name", { length: 150 }),
    isActive: boolean("is_active").notNull().default(true),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    impressions: int("impressions").notNull().default(0),
    clicks: int("clicks").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    placementIdx: index("idx_ads_placement").on(table.placement),
    activeIdx: index("idx_ads_active").on(table.isActive),
  })
);

export const websiteSettings = mysqlTable(
  "website_settings",
  {
    id: int("id").primaryKey().autoincrement(),
    settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
    settingValue: mediumtext("setting_value").notNull(),
    settingGroup: varchar("setting_group", { length: 50 }).notNull().default("general"), // general, seo, branding, analytics, apis, ads
    description: varchar("description", { length: 255 }),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("idx_settings_key").on(table.settingKey),
  })
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id"),
    userEmail: varchar("user_email", { length: 191 }),
    action: varchar("action", { length: 80 }).notNull(), // create, update, delete, approve, reject, fetch, publish
    module: varchar("module", { length: 50 }).notNull(), // articles, devices, regulatory, sources, settings, users
    entityId: varchar("entity_id", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    details: mediumtext("details"), // JSON serialized string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    moduleIdx: index("idx_audit_module").on(table.module),
    userIdx: index("idx_audit_user").on(table.userId),
    dateIdx: index("idx_audit_date").on(table.createdAt),
  })
);

// ============================================================================
// 10. REELS (VERTICAL SHORT-FORM VIDEO & AI REELS)
// ============================================================================

export const reelSources = mysqlTable(
  "reel_sources",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(), // e.g. bbc-news, reuters-shorts, who-official, newskrez-ai
    sourceType: varchar("source_type", { length: 50 }).notNull().default("youtube_channel"), // youtube_channel, youtube_playlist, video_rss, api_feed
    channelId: varchar("channel_id", { length: 100 }),
    playlistId: varchar("playlist_id", { length: 100 }),
    feedUrl: varchar("feed_url", { length: 500 }),
    defaultCategorySlug: varchar("default_category_slug", { length: 100 }).default("general-news"),
    isEnabled: boolean("is_enabled").notNull().default(true),
    requiresEditorialApproval: boolean("requires_editorial_approval").notNull().default(false),
    dailyPublishLimit: int("daily_publish_limit").default(10),
    publishedToday: int("published_today").notNull().default(0),
    lastFetchedAt: timestamp("last_fetched_at"),
    lastSuccessAt: timestamp("last_success_at"),
    lastErrorMessage: text("last_error_message"),
    totalReelsImported: int("total_reels_imported").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("idx_reel_sources_code").on(table.code),
    enabledIdx: index("idx_reel_sources_enabled").on(table.isEnabled),
  })
);

export const reels = mysqlTable(
  "reels",
  {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    videoUrl: varchar("video_url", { length: 500 }).notNull(),
    videoType: varchar("video_type", { length: 50 }).notNull().default("youtube"), // youtube, mp4, ai_generated
    externalId: varchar("external_id", { length: 191 }), // e.g. YouTube Video ID
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    durationSeconds: int("duration_seconds").default(30),
    aspectRatio: varchar("aspect_ratio", { length: 20 }).default("9:16"),
    sourceId: int("source_id"),
    sourceName: varchar("source_name", { length: 100 }),
    sourceUrl: varchar("source_url", { length: 500 }),
    channelTitle: varchar("channel_title", { length: 150 }),
    primaryCategoryId: int("primary_category_id"),
    categorySlug: varchar("category_slug", { length: 100 }).default("general-news"),
    categoryName: varchar("category_name", { length: 100 }).default("General News"),
    relatedArticleId: int("related_article_id"),
    status: varchar("status", { length: 30 }).notNull().default("Published"), // Draft, Pending Review, Published, Archived, Rejected
    rightsStatus: varchar("rights_status", { length: 50 }).default("Authorized Embed"), // Authorized Embed, Original AI-Generated, Licensed
    isFeatured: boolean("is_featured").default(false),
    viewsCount: int("views_count").notNull().default(0),
    likesCount: int("likes_count").notNull().default(0),
    sharesCount: int("shares_count").notNull().default(0),
    metadata: text("metadata"), // JSON serialized string
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("idx_reels_slug").on(table.slug),
    statusIdx: index("idx_reels_status").on(table.status),
    catIdx: index("idx_reels_category").on(table.categorySlug),
    externalIdIdx: index("idx_reels_external_id").on(table.externalId),
    publishedIdx: index("idx_reels_published").on(table.publishedAt),
  })
);

export const reelGenerationJobs = mysqlTable(
  "reel_generation_jobs",
  {
    id: int("id").primaryKey().autoincrement(),
    articleId: int("article_id"),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary"),
    scriptText: text("script_text"),
    voiceProvider: varchar("voice_provider", { length: 50 }).default("web_speech"),
    voiceId: varchar("voice_id", { length: 100 }),
    audioUrl: varchar("audio_url", { length: 500 }),
    videoTemplate: varchar("video_template", { length: 50 }).default("vertical_news_v1"),
    status: varchar("status", { length: 30 }).notNull().default("pending"), // pending, scripting, narrating, rendering, completed, failed
    outputVideoUrl: varchar("output_video_url", { length: 500 }),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    errorMessage: text("error_message"),
    reelId: int("reel_id"),
    createdBy: int("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusIdx: index("idx_reel_jobs_status").on(table.status),
    articleIdx: index("idx_reel_jobs_article").on(table.articleId),
  })
);

export const reelViews = mysqlTable(
  "reel_views",
  {
    id: int("id").primaryKey().autoincrement(),
    reelId: int("reel_id").notNull(),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: varchar("user_agent", { length: 255 }),
    watchDurationSeconds: int("watch_duration_seconds").default(0),
    completed: boolean("completed").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    reelIdx: index("idx_reel_views_reel").on(table.reelId),
    dateIdx: index("idx_reel_views_date").on(table.createdAt),
  })
);

export const reelImportLogs = mysqlTable(
  "reel_import_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    sourceId: int("source_id"),
    sourceName: varchar("source_name", { length: 100 }),
    status: varchar("status", { length: 30 }).notNull(), // success, partial, failed
    reelsFound: int("reels_found").notNull().default(0),
    reelsImported: int("reels_imported").notNull().default(0),
    reelsSkipped: int("reels_skipped").notNull().default(0),
    errorMessage: text("error_message"),
    details: text("details"), // JSON serialized string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("idx_reel_import_source").on(table.sourceId),
    statusIdx: index("idx_reel_import_status").on(table.status),
    dateIdx: index("idx_reel_import_date").on(table.createdAt),
  })
);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parent_subcategories",
  }),
  subcategories: many(categories, {
    relationName: "parent_subcategories",
  }),
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  primaryCategory: one(categories, {
    fields: [articles.primaryCategoryId],
    references: [categories.id],
  }),
  source: one(sources, {
    fields: [articles.sourceId],
    references: [sources.id],
  }),
  articleCategories: many(articleCategories),
  articleTags: many(articleTags),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  articles: many(articles),
  fetchLogs: many(fetchLogs),
}));

export const medicalDevicesRelations = relations(medicalDevices, ({ many }) => ({
  regulatoryRecords: many(medicalDeviceRegulatoryRecords),
  recalls: many(deviceRecalls),
}));

export const medicalDeviceRegulatoryRecordsRelations = relations(
  medicalDeviceRegulatoryRecords,
  ({ one }) => ({
    device: one(medicalDevices, {
      fields: [medicalDeviceRegulatoryRecords.deviceId],
      references: [medicalDevices.id],
    }),
  })
);

export const deviceRecallsRelations = relations(deviceRecalls, ({ one }) => ({
  device: one(medicalDevices, {
    fields: [deviceRecalls.deviceId],
    references: [medicalDevices.id],
  }),
}));
