import { db, schema } from "./index";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting NewsKrez database seeding...");

  // 1. Roles
  const rolesList = [
    { name: "Superadmin", description: "Full system administration and control" },
    { name: "Administrator", description: "Site, content, and source management" },
    { name: "Editor", description: "Article review, editing, and publishing" },
    { name: "Regulatory Reviewer", description: "Specialized review of regulatory records and recalls" },
    { name: "Author", description: "Drafts and submits news articles" },
  ];

  for (const r of rolesList) {
    const existing = await db.query.roles.findFirst({
      where: eq(schema.roles.name, r.name),
    });
    if (!existing) {
      await db.insert(schema.roles).values(r);
    }
  }
  console.log("✓ Roles seeded");

  // 2. Default Superadmin User
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@newskrez.com";
  const adminPass = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@NewsKrez2026!";
  const passwordHash = await bcrypt.hash(adminPass, 10);

  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });

  let adminUser = existingAdmin;
  if (!existingAdmin) {
    const [inserted] = await db.insert(schema.users).values({
      name: "NewsKrez Editorial Desk",
      email: adminEmail,
      passwordHash,
      role: "Superadmin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Chief Editor & Regulatory Intelligence Lead at NewsKrez.",
      isActive: true,
    });
    adminUser = { id: inserted.insertId } as any;
    console.log(`✓ Default admin created: ${adminEmail}`);
  }

  // 3. Categories (Parent & Subcategories)
  const categoryStructure = [
    {
      name: "General News",
      slug: "general-news",
      description: "National and international headlines across economy, science, environment, sports, and policy.",
      displayOrder: 1,
      subcategories: [
        { name: "India News", slug: "india-news" },
        { name: "World News", slug: "world-news" },
        { name: "Politics", slug: "politics" },
        { name: "Business & Economy", slug: "business-economy" },
        { name: "Sports", slug: "sports" },
        { name: "Entertainment", slug: "entertainment" },
        { name: "Education", slug: "education" },
        { name: "Science", slug: "science" },
        { name: "Environment", slug: "environment" },
        { name: "Government Updates", slug: "government-updates" },
        { name: "Breaking News", slug: "breaking-news" },
        { name: "Trending News", slug: "trending-news" },
      ],
    },
    {
      name: "Pharmaceutical",
      slug: "pharmaceutical",
      description: "Global pharmaceutical developments, drug approvals, biotechnology breakthroughs, and safety.",
      displayOrder: 2,
      subcategories: [
        { name: "Drug Approvals", slug: "drug-approvals" },
        { name: "Drug Recalls", slug: "drug-recalls" },
        { name: "Drug Development", slug: "drug-development" },
        { name: "Biotechnology", slug: "biotechnology" },
        { name: "Vaccines", slug: "vaccines" },
        { name: "Clinical Research", slug: "clinical-research" },
        { name: "Pharmacovigilance", slug: "pharmacovigilance" },
        { name: "Pharmaceutical Manufacturing", slug: "pharma-manufacturing" },
        { name: "API Manufacturing", slug: "api-manufacturing" },
        { name: "Drug Safety", slug: "drug-safety" },
      ],
    },
    {
      name: "Medical Devices",
      slug: "medical-devices",
      description: "Medical device engineering, 510(k) clearances, PMA authorizations, recalls, and AI diagnostics.",
      displayOrder: 3,
      subcategories: [
        { name: "Device Industry News", slug: "device-industry-news" },
        { name: "FDA Approvals & Clearances", slug: "device-approvals-clearances" },
        { name: "Device Recalls", slug: "fda-device-recalls" },
        { name: "Device Safety Alerts", slug: "device-safety-alerts" },
        { name: "In Vitro Diagnostics (IVD)", slug: "ivd-diagnostics" },
        { name: "Implantable & Surgical", slug: "implantable-surgical" },
        { name: "Cardiovascular Devices", slug: "cardiovascular-devices" },
        { name: "Orthopedic Devices", slug: "orthopedic-devices" },
        { name: "Medical Imaging (MRI/CT)", slug: "medical-imaging" },
        { name: "Robotic Surgery", slug: "robotic-surgery" },
        { name: "AI Medical Devices", slug: "ai-medical-devices" },
        { name: "Software as a Medical Device (SaMD)", slug: "samd" },
        { name: "Device Cybersecurity", slug: "device-cybersecurity" },
      ],
    },
    {
      name: "FDA News",
      slug: "fda-news",
      description: "Official United States Food and Drug Administration actions, warning letters, and updates.",
      displayOrder: 4,
      subcategories: [
        { name: "FDA Drug Approvals", slug: "fda-drug-approvals" },
        { name: "FDA Drug Recalls", slug: "fda-drug-recalls" },
        { name: "FDA Device Recalls", slug: "fda-recalls-device" },
        { name: "FDA Warning Letters", slug: "fda-warning-letters" },
        { name: "FDA Guidance", slug: "fda-guidance" },
        { name: "FDA Safety Communications", slug: "fda-safety-communications" },
        { name: "FDA Inspection Updates", slug: "fda-inspections" },
      ],
    },
    {
      name: "WHO & Healthcare",
      slug: "who-healthcare",
      description: "World Health Organization bulletins, disease outbreaks, and global health initiatives.",
      displayOrder: 5,
      subcategories: [
        { name: "WHO Announcements", slug: "who-announcements" },
        { name: "Disease Outbreaks", slug: "disease-outbreaks" },
        { name: "Global Health", slug: "global-health" },
        { name: "Public Health", slug: "public-health" },
        { name: "Healthcare Innovation", slug: "healthcare-innovation" },
        { name: "Hospitals & Care Delivery", slug: "hospitals-care" },
      ],
    },
    {
      name: "Technology",
      slug: "technology",
      description: "Artificial Intelligence, cybersecurity, cloud infrastructure, and frontier computing.",
      displayOrder: 6,
      subcategories: [
        { name: "Artificial Intelligence", slug: "artificial-intelligence" },
        { name: "Cybersecurity", slug: "cybersecurity" },
        { name: "Healthcare AI", slug: "healthcare-ai" },
        { name: "Pharma AI & Discovery", slug: "pharma-ai" },
        { name: "Cloud & Enterprise Tech", slug: "cloud-enterprise" },
        { name: "Digital Transformation", slug: "digital-transformation" },
      ],
    },
    {
      name: "Regulatory Intelligence",
      slug: "regulatory-intelligence",
      description: "GxP, GMP, 21 CFR Part 11, EU MDR, CDSCO, data integrity, and compliance strategies.",
      displayOrder: 7,
      subcategories: [
        { name: "US FDA Regulations", slug: "us-fda-regs" },
        { name: "EMA Regulations", slug: "ema-regulations" },
        { name: "CDSCO Regulations", slug: "cdsco-regulations" },
        { name: "GMP & cGMP Compliance", slug: "gmp-cgmp" },
        { name: "21 CFR Part 11 & EU Annex 11", slug: "21-cfr-part-11" },
        { name: "Data Integrity", slug: "data-integrity" },
        { name: "ISO Standards (13485/14971)", slug: "iso-standards" },
        { name: "QMSR & CSV/CSA", slug: "qmsr-csv-csa" },
      ],
    },
  ];

  const categoryMap = new Map<string, number>();

  for (const cat of categoryStructure) {
    let parent = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, cat.slug),
    });

    let parentId = parent?.id;
    if (!parent) {
      const [newParent] = await db.insert(schema.categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isNav: true,
        isActive: true,
        metaTitle: `${cat.name} News & Intelligence | NewsKrez`,
        metaDescription: cat.description,
      });
      parentId = newParent.insertId;
    }
    categoryMap.set(cat.slug, parentId!);

    // Insert subcategories
    if (cat.subcategories) {
      for (let i = 0; i < cat.subcategories.length; i++) {
        const sub = cat.subcategories[i];
        const existingSub = await db.query.categories.findFirst({
          where: eq(schema.categories.slug, sub.slug),
        });
        if (!existingSub) {
          const [newSub] = await db.insert(schema.categories).values({
            name: sub.name,
            slug: sub.slug,
            parentId: parentId!,
            displayOrder: i + 1,
            isNav: false,
            isActive: true,
            metaTitle: `${sub.name} - ${cat.name} | NewsKrez`,
            metaDescription: `Latest updates and regulatory alerts on ${sub.name}.`,
          });
          categoryMap.set(sub.slug, newSub.insertId);
        } else {
          categoryMap.set(sub.slug, existingSub.id);
        }
      }
    }
  }
  console.log("✓ Categories and subcategories seeded");

  // 4. API Ingestion Sources
  const defaultSources = [
    {
      name: "openFDA Drug Enforcement & Recalls",
      code: "openfda_drug_enforcement",
      type: "api_openfda",
      baseUrl: "https://api.fda.gov/drug/enforcement.json",
      categorySlug: "fda-news",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "openFDA Medical Device 510(k) Clearances",
      code: "openfda_device_510k",
      type: "api_openfda",
      baseUrl: "https://api.fda.gov/device/510k.json",
      categorySlug: "medical-devices",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "openFDA Medical Device Recalls",
      code: "openfda_device_enforcement",
      type: "api_openfda",
      baseUrl: "https://api.fda.gov/device/enforcement.json",
      categorySlug: "medical-devices",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "openFDA Medical Device PMA Approvals",
      code: "openfda_device_pma",
      type: "api_openfda",
      baseUrl: "https://api.fda.gov/device/pma.json",
      categorySlug: "medical-devices",
      fetchIntervalMinutes: 120,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "WHO Official Disease Outbreaks & News",
      code: "who_news_rss",
      type: "rss_who",
      baseUrl: "https://www.who.int",
      feedUrl: "https://www.who.int/rss-feeds/news-english.xml",
      categorySlug: "who-healthcare",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "CDC Public Health News & Advisories",
      code: "cdc_public_health_rss",
      type: "rss_cdc",
      baseUrl: "https://tools.cdc.gov",
      feedUrl: "https://tools.cdc.gov/api/v2/resources/media/403372.rss",
      categorySlug: "who-healthcare",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "ClinicalTrials.gov Global Studies API",
      code: "clinical_trials_api",
      type: "api_clinicaltrials",
      baseUrl: "https://clinicaltrials.gov/api/v2/studies",
      categorySlug: "pharmaceutical",
      fetchIntervalMinutes: 180,
      isActive: true,
      autoPublish: false,
    },
    {
      name: "Google News Regulatory & Pharma Intelligence",
      code: "google_news_pharma_rss",
      type: "rss_general",
      baseUrl: "https://news.google.com",
      feedUrl: "https://news.google.com/rss/search?q=pharmaceutical+FDA+approval+OR+recall&hl=en-US&gl=US&ceid=US:en",
      categorySlug: "pharmaceutical",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "Google News Medical Device Technology",
      code: "google_news_devices_rss",
      type: "rss_general",
      baseUrl: "https://news.google.com",
      feedUrl: "https://news.google.com/rss/search?q=medical+devices+FDA+clearance+OR+EU+MDR&hl=en-US&gl=US&ceid=US:en",
      categorySlug: "medical-devices",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
    {
      name: "Google News Artificial Intelligence & Cybersecurity",
      code: "google_news_tech_rss",
      type: "rss_general",
      baseUrl: "https://news.google.com",
      feedUrl: "https://news.google.com/rss/search?q=artificial+intelligence+healthcare+OR+cybersecurity&hl=en-US&gl=US&ceid=US:en",
      categorySlug: "technology",
      fetchIntervalMinutes: 60,
      isActive: true,
      autoPublish: true,
    },
  ];

  for (const src of defaultSources) {
    const existing = await db.query.sources.findFirst({
      where: eq(schema.sources.code, src.code),
    });
    if (!existing) {
      await db.insert(schema.sources).values(src);
    }
  }
  console.log("✓ Ingestion sources seeded");

  // 5. Website Settings
  const settingsList = [
    {
      settingKey: "site_name",
      settingValue: "NewsKrez",
      settingGroup: "general",
      description: "Official portal name",
    },
    {
      settingKey: "site_tagline",
      settingValue: "Global News. Healthcare. Technology. Regulatory Intelligence.",
      settingGroup: "general",
      description: "Primary site tagline",
    },
    {
      settingKey: "site_description",
      settingValue: "NewsKrez delivers authoritative global news, pharmaceutical updates, FDA medical device clearances, WHO health alerts, and regulatory intelligence.",
      settingGroup: "seo",
      description: "Default meta description for search engines",
    },
    {
      settingKey: "contact_email",
      settingValue: "editor@newskrez.com",
      settingGroup: "general",
      description: "Public contact email",
    },
    {
      settingKey: "adsense_publisher_id",
      settingValue: "ca-pub-0000000000000000",
      settingGroup: "ads",
      description: "Google AdSense Publisher ID",
    },
    {
      settingKey: "ads_enabled",
      settingValue: "true",
      settingGroup: "ads",
      description: "Master switch for advertisement banners",
    },
    {
      settingKey: "ticker_enabled",
      settingValue: "true",
      settingGroup: "general",
      description: "Show breaking news ticker on homepage",
    },
  ];

  for (const s of settingsList) {
    const existing = await db.query.websiteSettings.findFirst({
      where: eq(schema.websiteSettings.settingKey, s.settingKey),
    });
    if (!existing) {
      await db.insert(schema.websiteSettings).values(s);
    }
  }
  console.log("✓ Website settings seeded");

  // 6. Seed High-Impact Initial Articles
  const pharmaCatId = categoryMap.get("pharmaceutical") || 1;
  const deviceCatId = categoryMap.get("medical-devices") || 2;
  const fdaCatId = categoryMap.get("fda-news") || 3;
  const whoCatId = categoryMap.get("who-healthcare") || 4;
  const regCatId = categoryMap.get("regulatory-intelligence") || 5;
  const techCatId = categoryMap.get("technology") || 6;

  const sampleArticles = [
    {
      title: "FDA Grants Accelerated Approval for First-in-Class Targeted Oncology Therapy for Advanced Solid Tumors",
      slug: "fda-grants-accelerated-approval-targeted-oncology-therapy",
      excerpt: "The U.S. FDA has finalized an accelerated approval pathway for a novel dual-mechanism kinase inhibitor, opening treatment avenues for refractory solid tumors with specific genetic alterations.",
      content: `<p>The United States Food and Drug Administration (FDA) today granted accelerated approval for a first-in-class small molecule kinase inhibitor indicated for adult patients with advanced, unresectable solid tumors harboring specific oncogenic pathway fusions.</p>
      <h2>Clinical Efficacy and Trial Outcomes</h2>
      <p>The landmark decision follows evaluation of multicenter Phase II trial data comprising 284 evaluable patients across 14 international trial sites. The confirmed overall response rate (ORR) reached 58.4%, with complete responses observed in 12.1% of patients. Median duration of response (DoR) exceeded 14.8 months.</p>
      <blockquote>"This regulatory milestone represents a paradigm shift in biomarker-driven precision oncology, where patient selection is guided strictly by genomic profiling rather than traditional tissue of origin," stated the Director of Oncology Center of Excellence.</blockquote>
      <h2>Post-Marketing Commitments & Confirmatory Trials</h2>
      <p>Under the accelerated approval provisions outlined in 21 CFR 314 Subpart H, the manufacturer is mandated to conduct and complete randomized controlled confirmatory Phase III studies to verify and describe clinical benefit, specifically measuring progression-free survival (PFS) and overall survival (OS).</p>
      <p>Health systems and specialized oncology centers are advised to review updated prescribing guidelines regarding liver enzyme monitoring and dose adjustment protocols.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80",
      imageCaption: "Biopharmaceutical laboratory precision research and oncology drug synthesis.",
      status: "Published",
      authorId: adminUser?.id || 1,
      primaryCategoryId: pharmaCatId,
      seoTitle: "FDA Grants Accelerated Approval for First-in-Class Targeted Oncology Therapy | NewsKrez",
      metaDescription: "FDA approves novel targeted kinase inhibitor for advanced solid tumors under accelerated pathway.",
      isBreaking: true,
      isFeatured: true,
      isEditorPick: true,
      viewsCount: 1420,
      readingTimeMinutes: 4,
      publishedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    },
    {
      title: "FDA Clears AI-Powered Autonomous Cardiac Ultrasound System with Real-Time Guiding Algorithms",
      slug: "fda-clears-ai-cardiac-ultrasound-system-samd",
      excerpt: "In a landmark 510(k) clearance, the FDA has authorized an advanced Software as a Medical Device (SaMD) platform that directs bedside ultrasound probes and captures diagnostic-grade echocardiograms.",
      content: `<p>Medical device regulators at the FDA Center for Devices and Radiological Health (CDRH) have issued 510(k) clearance for a state-of-the-art cardiovascular imaging system powered by real-time deep learning navigation.</p>
      <h2>Bridging Sonographer Shortages with Guided Diagnostics</h2>
      <p>The system integrates real-time computer vision with point-of-care ultrasound (POCUS) transducers. As healthcare personnel position the probe on the patient's chest, on-screen dynamic vectors guide acoustic alignment to acquire standard diagnostic views including apical four-chamber and parasternal long-axis projections.</p>
      <h2>Clinical Evaluation and Substantial Equivalence</h2>
      <p>The premarket notification demonstrated substantial equivalence to predicate cardiovascular diagnostic imaging systems under 21 CFR 892.1600 (Product Code: IYO, Class II). Validation studies across three emergency departments and intensive care units proved image acquisition accuracy exceeding 94.6% among non-expert operators.</p>
      <blockquote>"AI-guided ultrasound democratization empowers critical care physicians and emergency teams to rapidly identify pericardial effusion and severe systolic dysfunction within seconds of patient presentation."</blockquote>`,
      featuredImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop&q=80",
      imageCaption: "Point-of-care cardiac ultrasound equipment utilized in modern acute clinical care.",
      status: "Published",
      authorId: adminUser?.id || 1,
      primaryCategoryId: deviceCatId,
      seoTitle: "FDA Clears AI Cardiac Ultrasound System Under 510(k) | NewsKrez",
      metaDescription: "FDA 510(k) clearance issued for AI-guided echocardiography software facilitating point-of-care cardiac diagnostics.",
      isBreaking: false,
      isFeatured: true,
      isEditorPick: true,
      viewsCount: 2310,
      readingTimeMinutes: 5,
      publishedAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    },
    {
      title: "FDA Enacts Class I Urgent Recall for Infusion Pump Firmware Due to Upstream Occlusion Sensor Anomalies",
      slug: "urgent-class-i-recall-infusion-pump-firmware-safety",
      excerpt: "The FDA has classified a global recall of large-volume infusion pumps as Class I, warning that intermittent firmware sensor errors can cause unintended interruption of high-risk medication infusions.",
      content: `<p>The U.S. Food and Drug Administration has posted an urgent Class I recall notice regarding select serial numbers of large-volume smart infusion pumps distributed worldwide. Class I recalls indicate situations where exposure to a violative product carries a reasonable probability of serious adverse health consequences or death.</p>
      <h2>Root Cause Analysis</h2>
      <p>Internal engineering evaluations and post-market surveillance alerts identified that a timing vulnerability within firmware versions 4.2.1 through 4.3.0 may fail to recognize upstream air-in-line or pressure occlusion alarms during micro-dose vasopressor administration.</p>
      <h2>Action Steps for Biomedical Engineering Teams</h2>
      <ul>
        <li>Immediately verify inventory against listed model identifiers and firmware builds.</li>
        <li>Isolate unverified infusion units from critical care and pediatric units.</li>
        <li>Apply manufacturer firmware patch v4.3.2 per field safety corrective action protocols.</li>
        <li>Report any adverse events or infusion discrepancies to FDA MedWatch Form 3500A.</li>
      </ul>`,
      featuredImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80",
      imageCaption: "Hospital intravenous infusion delivery station and biomedical monitoring hardware.",
      status: "Published",
      authorId: adminUser?.id || 1,
      primaryCategoryId: fdaCatId,
      seoTitle: "Class I Medical Device Recall: Infusion Pump Sensor Firmware | NewsKrez",
      metaDescription: "FDA declares Class I recall for smart infusion pumps due to sensor occlusion vulnerabilities.",
      isBreaking: true,
      isFeatured: false,
      isEditorPick: false,
      viewsCount: 980,
      readingTimeMinutes: 3,
      publishedAt: new Date(Date.now() - 3600000 * 8), // 8 hours ago
    },
    {
      title: "WHO Issues Updated Pandemic Preparedness Guidance on Avian Influenza Surveillance Across Animal-Human Interfaces",
      slug: "who-guidance-avian-influenza-surveillance-pandemic-preparedness",
      excerpt: "The World Health Organization has issued technical recommendations to national ministries of health, urging aggressive genomic sequencing and occupational protection for dairy and poultry personnel.",
      content: `<p>In an inter-agency briefing from Geneva, the World Health Organization (WHO), in coordination with WOAH and FAO, released comprehensive technical directives concerning the ongoing transboundary evolution of Highly Pathogenic Avian Influenza (HPAI) H5N1 clade 2.3.4.4b.</p>
      <h2>Enhanced Genomic Sequencing Directives</h2>
      <p>The guidance stresses prompt sharing of full-length viral gene sequences through public repositories such as GISAID to detect molecular signatures associated with mammalian adaptation, particularly mutations conferring increased affinity for alpha-2,6 sialic acid receptors in the human upper respiratory tract.</p>
      <h2>Stockpiling Medical Countermeasures</h2>
      <p>WHO highlighted the status of global pre-pandemic candidate vaccine viruses (CVVs) and recommended member states evaluate national reserves of neuraminidase inhibitors and baloxavir marboxil.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&auto=format&fit=crop&q=80",
      imageCaption: "WHO global disease intelligence and laboratory diagnostic surveillance network.",
      status: "Published",
      authorId: adminUser?.id || 1,
      primaryCategoryId: whoCatId,
      seoTitle: "WHO Guidance on Avian Influenza Surveillance & Preparedness | NewsKrez",
      metaDescription: "WHO releases comprehensive global guidance for avian influenza genomic monitoring and biosecurity.",
      isBreaking: false,
      isFeatured: true,
      isEditorPick: false,
      viewsCount: 1750,
      readingTimeMinutes: 4,
      publishedAt: new Date(Date.now() - 3600000 * 12),
    },
    {
      title: "FDA Quality Management System Regulation (QMSR) Transition: Harmonizing 21 CFR Part 820 with ISO 13485:2016",
      slug: "fda-qmsr-transition-harmonizing-21-cfr-820-iso-13485",
      excerpt: "Global medical device manufacturers face critical deadlines as the FDA replaces legacy Good Manufacturing Practices (CGMP) with the modernized QMSR framework, aligning inspection criteria with ISO 13485.",
      content: `<p>The United States FDA's final rule amending the medical device Quality System regulation (21 CFR Part 820) represents the most significant overhaul of device quality regulations in over three decades. Designated as the Quality Management System Regulation (QMSR), the rule harmonizes US requirements with the international standard ISO 13485:2016.</p>
      <h2>Key Operational Adjustments for Device Manufacturers</h2>
      <p>Quality and regulatory affairs leadership must adapt standard operating procedures across five core domains:</p>
      <ol>
        <li><strong>Risk Management Across the Product Lifecycle:</strong> Direct incorporation of ISO 14971 risk management principles into design controls, supplier evaluations, and post-market vigilance.</li>
        <li><strong>Clarified Terminology:</strong> Shifting from legacy terms such as 'DMR' (Device Master Record) and 'DHR' (Device History Record) to ISO standard documentation architectures.</li>
        <li><strong>Supply Chain and Outsourced Process Controls:</strong> Rigorous vendor qualification requirements with documented traceability.</li>
        <li><strong>Computer Software Assurance (CSA):</strong> Transitioning from cumbersome traditional CSV methodologies to risk-based, automated CSA testing.</li>
      </ol>`,
      featuredImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
      imageCaption: "Quality management system documentation and regulatory inspection compliance audit.",
      status: "Published",
      authorId: adminUser?.id || 1,
      primaryCategoryId: regCatId,
      seoTitle: "FDA QMSR Transition: Harmonizing 21 CFR 820 with ISO 13485 | NewsKrez",
      metaDescription: "Detailed regulatory analysis of the FDA QMSR final rule harmonizing device manufacturing with ISO 13485.",
      isBreaking: false,
      isFeatured: false,
      isEditorPick: true,
      viewsCount: 3120,
      readingTimeMinutes: 6,
      publishedAt: new Date(Date.now() - 3600000 * 16),
    },
    {
      title: "Generative AI in De Novo Molecular Design: Accelerating Small Molecule Hit-to-Lead Optimization",
      slug: "generative-ai-de-novo-molecular-design-drug-discovery",
      excerpt: "Computational chemistry platforms integrating transformer architectures and diffusion models are demonstrating unprecedented compression of pre-clinical discovery timelines from years to months.",
      content: `<p>Biopharmaceutical research divisions are accelerating drug discovery pipelines through generative artificial intelligence models capable of designing drug-like molecules that bind with high affinity to previously 'undruggable' biological targets.</p>
      <h2>Deep Learning Models in Target Identification</h2>
      <p>By leveraging 3D equivariant neural networks trained on crystallographic protein structures from the Protein Data Bank (PDB), the generative framework proposes stereochemically valid chemical scaffolds while simultaneously optimizing for ADMET (Absorption, Distribution, Metabolism, Excretion, and Toxicity) profiles.</p>
      <p>Synthesizability filters prevent the generation of chemically intractable structures, enabling automated wet-lab robotic synthesis within 72 hours of algorithmic proposal.</p>`,
      featuredImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&auto=format&fit=crop&q=80",
      imageCaption: "High-performance computational modeling of molecular docking and neural network representations.",
      status: "Published",
      authorId: adminUser?.id || 1,
      primaryCategoryId: techCatId,
      seoTitle: "Generative AI in De Novo Molecular Design & Drug Discovery | NewsKrez",
      metaDescription: "How diffusion models and transformers are revolutionizing pharmaceutical drug discovery and hit-to-lead pipelines.",
      isBreaking: false,
      isFeatured: true,
      isEditorPick: false,
      viewsCount: 2040,
      readingTimeMinutes: 5,
      publishedAt: new Date(Date.now() - 3600000 * 20),
    },
  ];

  for (const art of sampleArticles) {
    const existing = await db.query.articles.findFirst({
      where: eq(schema.articles.slug, art.slug),
    });
    if (!existing) {
      await db.insert(schema.articles).values(art);
    }
  }
  console.log("✓ Initial curated articles seeded");

  // 7. Seed Medical Device Regulatory Records & Intelligence
  const sampleDevices = [
    {
      deviceName: "EndoFlow Next-Gen Vascular Stent System",
      brandName: "EndoFlow Flex",
      manufacturerName: "Medtronic Inc.",
      productCode: "NIQ",
      regulationNumber: "870.3375",
      deviceClass: "Class III",
      medicalSpecialty: "Cardiovascular",
      clearanceType: "PMA",
      status: "Active",
      description: "Drug-eluting coronary stent system indicated for improving luminal diameter in native coronary arteries.",
    },
    {
      deviceName: "NeuroVision AI Intraoperative Guidance Station",
      brandName: "NeuroVision Core",
      manufacturerName: "Stryker Corporation",
      productCode: "HAW",
      regulationNumber: "882.4560",
      deviceClass: "Class II",
      medicalSpecialty: "Neurology",
      clearanceType: "510(k)",
      status: "Active",
      description: "Stereotaxic surgical instrument software system with optical tracking for neurosurgical navigation.",
    },
    {
      deviceName: "AcuPoint Robotic Orthopedic Joint Replacement Console",
      brandName: "AcuPoint Mako",
      manufacturerName: "Zimmer Biomet",
      productCode: "ORO",
      regulationNumber: "888.3560",
      deviceClass: "Class II",
      medicalSpecialty: "Orthopedic",
      clearanceType: "510(k)",
      status: "Active",
      description: "Robotic-assisted orthopedic surgical positioning system for total knee and hip arthroplasty.",
    },
    {
      deviceName: "UltraPulse Smart Dual-Chamber Pacemaker",
      brandName: "UltraPulse Sync",
      manufacturerName: "Boston Scientific",
      productCode: "LWP",
      regulationNumber: "870.3610",
      deviceClass: "Class III",
      medicalSpecialty: "Cardiovascular",
      clearanceType: "PMA",
      status: "Active",
      description: "Implantable dual-chamber pacemaker equipped with Bluetooth low energy telemetry and physiological pacing.",
    },
    {
      deviceName: "RapidPath AI Cervical Screening Diagnostic Module",
      brandName: "RapidPath Cytology",
      manufacturerName: "Hologic, Inc.",
      productCode: "QFM",
      regulationNumber: "864.5260",
      deviceClass: "Class II",
      medicalSpecialty: "Pathology / IVD",
      clearanceType: "De Novo",
      status: "Active",
      description: "Automated digital cytology image analysis software for computer-assisted cervical screening.",
    },
  ];

  for (const d of sampleDevices) {
    const existing = await db.query.medicalDevices.findFirst({
      where: eq(schema.medicalDevices.deviceName, d.deviceName),
    });
    let devId: number;
    if (!existing) {
      const [newDev] = await db.insert(schema.medicalDevices).values(d);
      devId = newDev.insertId;
    } else {
      devId = existing.id;
    }

    // Add corresponding regulatory record
    const subNum = d.clearanceType === "PMA" ? `P2400${devId}1` : (d.clearanceType === "De Novo" ? `DEN2300${devId}` : `K2410${devId}8`);
    const existingRec = await db.query.medicalDeviceRegulatoryRecords.findFirst({
      where: eq(schema.medicalDeviceRegulatoryRecords.submissionNumber, subNum),
    });
    if (!existingRec) {
      await db.insert(schema.medicalDeviceRegulatoryRecords).values({
        deviceId: devId,
        agency: "FDA",
        recordType: d.clearanceType === "PMA" ? "PMA" : (d.clearanceType === "De Novo" ? "De_Novo" : "510k"),
        submissionNumber: subNum,
        applicant: d.manufacturerName,
        deviceName: d.deviceName,
        decisionDate: new Date(Date.now() - 3600000 * 24 * (devId * 7)),
        decisionDescription: `Substantially equivalent or approved for marketing under Section 510(k) or PMA of the FD&C Act.`,
        productCode: d.productCode,
        deviceClass: d.deviceClass,
        advisoryCommittee: d.medicalSpecialty,
        sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${subNum}`,
        externalId: subNum,
      });
    }
  }
  console.log("✓ Medical devices and regulatory records seeded");

  // 8. Seed Regulatory Alerts (FDA Recalls, Safety Communications)
  const sampleAlerts = [
    {
      agency: "FDA",
      alertType: "recall",
      title: "Class I Recall: Baxter Healthcare Corrects Baxter ExactaMix Compounding Systems Due to Sensor Sensor Misalignment",
      slug: "baxter-exactamix-compounding-recall-class-i",
      summary: "Baxter is recalling ExactaMix 2400 and ExactaMix 1200 automated compounding devices due to intermittent weight calibration anomalies causing incorrect ingredient dispensing in parenteral nutrition.",
      recallClass: "Class I",
      affectedProduct: "ExactaMix 2400 and ExactaMix 1200 Automated Compounders",
      manufacturer: "Baxter Healthcare",
      distributionPattern: "Nationwide in the United States and international health jurisdictions.",
      alertDate: new Date(Date.now() - 3600000 * 24 * 2),
      sourceUrl: "https://www.fda.gov/medical-devices/medical-device-recalls",
      externalReferenceId: "Z-0921-2026",
      status: "active",
    },
    {
      agency: "FDA",
      alertType: "safety_communication",
      title: "FDA Safety Communication: Cybersecurity Vulnerabilities Identified in Legacy DICOM Medical Imaging Gateways",
      slug: "fda-safety-comm-cybersecurity-dicom-gateways",
      summary: "The FDA CDRH warns healthcare providers regarding unauthenticated remote code execution vulnerabilities impacting specific third-party PACS and DICOM routing servers.",
      recallClass: "Class II",
      affectedProduct: "Legacy DICOM Router Firmware builds prior to v3.8.4",
      manufacturer: "Multiple PACS Integration Vendors",
      distributionPattern: "Worldwide healthcare facilities running exposed radiological networks.",
      alertDate: new Date(Date.now() - 3600000 * 24 * 4),
      sourceUrl: "https://www.fda.gov/medical-devices/safety-communications",
      externalReferenceId: "FDA-SC-2026-081",
      status: "active",
    },
    {
      agency: "EMA",
      alertType: "guidance",
      title: "EMA Quality and Safety Notice: Implementation of Nitrosamine Impurity Risk Assessments in Synthetic Drug Substances",
      slug: "ema-nitrosamine-impurity-risk-assessment-guidance",
      summary: "The European Medicines Agency issues comprehensive guidance reinforcing mandatory confirmatory testing and limit thresholds for N-nitrosamines in pharmaceutical APIs.",
      recallClass: "Class II",
      affectedProduct: "Synthetic active pharmaceutical ingredients (APIs)",
      manufacturer: "Global Pharmaceutical API Manufacturers",
      distributionPattern: "European Union Member States",
      alertDate: new Date(Date.now() - 3600000 * 24 * 6),
      sourceUrl: "https://www.ema.europa.eu",
      externalReferenceId: "EMA-QMS-2026-004",
      status: "active",
    },
    {
      agency: "CDSCO",
      alertType: "guidance",
      title: "CDSCO Circular: Mandatory Registration & Audit Requirements for Class C & Class D Medical Devices in India",
      slug: "cdsco-circular-registration-audit-class-c-d-devices",
      summary: "Central Drugs Standard Control Organisation mandates online compliance portals and notified body inspection checklists for high-risk medical device imports.",
      recallClass: "Class II",
      affectedProduct: "High-risk implantable and critical care medical devices",
      manufacturer: "Domestic and international manufacturers marketing in India",
      distributionPattern: "India nationwide",
      alertDate: new Date(Date.now() - 3600000 * 24 * 9),
      sourceUrl: "https://cdsco.gov.in",
      externalReferenceId: "CDSCO-MD-2026-118",
      status: "active",
    },
  ];

  for (const a of sampleAlerts) {
    const existing = await db.query.regulatoryAlerts.findFirst({
      where: eq(schema.regulatoryAlerts.slug, a.slug),
    });
    if (!existing) {
      await db.insert(schema.regulatoryAlerts).values(a);
    }
  }
  console.log("✓ Regulatory alerts seeded");

  // 9. Seed Advertisements (AdSense & Banner Placements)
  const sampleAds = [
    {
      title: "Header Premium Leaderboard Banner (728x90)",
      placement: "header_top",
      adType: "custom_banner",
      sponsorName: "Regulatory Affairs Global Summit 2026",
      imageUrl: "https://images.unsplash.com/photo-1542744094-3a31727220c3?w=1200&auto=format&fit=crop&q=80",
      targetUrl: "https://newskrez.com/conferences/global-regulatory-summit-2026",
      isActive: true,
      impressions: 450,
      clicks: 32,
    },
    {
      title: "Homepage Mid-Feed Responsive Sponsor (970x250)",
      placement: "homepage_middle",
      adType: "sponsored_post",
      sponsorName: "BioCompliance Cloud Enterprise",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      targetUrl: "https://newskrez.com/solutions/biocompliance",
      isActive: true,
      impressions: 890,
      clicks: 64,
    },
    {
      title: "Article Sidebar Sticky Half-Page (300x600)",
      placement: "sidebar_top",
      adType: "adsense",
      codeSnippet: `<!-- Google AdSense Mock -->
<div class="w-full h-full min-h-[300px] bg-slate-100 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 text-center">
  <span class="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Advertisement</span>
  <p class="text-sm font-medium text-slate-600">Enterprise Medical Device Compliance Suite</p>
  <span class="text-xs text-brandTeal-600 mt-2 hover:underline">Learn More →</span>
</div>`,
      isActive: true,
      impressions: 1200,
      clicks: 85,
    },
  ];

  for (const ad of sampleAds) {
    const existing = await db.query.advertisements.findFirst({
      where: eq(schema.advertisements.title, ad.title),
    });
    if (!existing) {
      await db.insert(schema.advertisements).values(ad);
    }
  }
  console.log("✓ Advertisements seeded");

  console.log("🎉 Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
