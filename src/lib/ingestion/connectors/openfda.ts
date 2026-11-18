import crypto from "crypto";
import slugify from "slugify";
import { NormalizedItem } from "../types";

function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function safeSlug(text: string): string {
  const base = slugify(text, { lower: true, strict: true, trim: true });
  const rand = crypto.randomBytes(3).toString("hex");
  return `${base.slice(0, 80)}-${rand}`;
}

export async function fetchOpenFDADrugEnforcement(limit = 10): Promise<NormalizedItem[]> {
  const url = `https://api.fda.gov/drug/enforcement.json?limit=${limit}&sort=report_date:desc`;
  const res = await fetch(url, { headers: { "User-Agent": "NewsKrez-Intelligence/1.0" }, cache: "no-store" });

  if (!res.ok) {
    throw new Error(`openFDA drug enforcement error HTTP ${res.status}`);
  }

  const json = await res.json();
  const results = json.results || [];
  const items: NormalizedItem[] = [];

  for (const r of results) {
    const recallNum = r.recall_number || `DRUG-${Date.now()}`;
    const firm = r.recalling_firm || "Pharmaceutical Manufacturer";
    const product = r.product_description || "Regulated Drug Product";
    const reason = r.reason_for_recall || "Safety defect or manufacturing deviation identified.";
    const title = `FDA ${r.classification || "Recall"}: ${firm} Recalls ${product.slice(0, 80)}`;
    const sourceUrl = `https://www.fda.gov/drugs/drug-safety-and-availability/drug-recalls#${encodeURIComponent(recallNum)}`;
    const pubDate = r.report_date ? new Date(r.report_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")) : new Date();

    const content = `
      <p>The U.S. Food and Drug Administration (FDA) has posted an official drug enforcement report concerning <strong>${firm}</strong>.</p>
      <h2>Product and Classification Details</h2>
      <ul>
        <li><strong>Recall Number:</strong> ${recallNum}</li>
        <li><strong>Classification:</strong> ${r.classification || "Class II"}</li>
        <li><strong>Recalling Firm:</strong> ${firm}</li>
        <li><strong>Status:</strong> ${r.status || "Ongoing"}</li>
      </ul>
      <h2>Reason for Enforcement Action</h2>
      <p>${reason}</p>
      <h2>Distribution Information</h2>
      <p>${r.distribution_pattern || "Nationwide distribution across licensed commercial channels."}</p>
      <blockquote>Official notification published per FDA Center for Drug Evaluation and Research (CDER) surveillance databases.</blockquote>
    `;

    items.push({
      externalId: recallNum,
      title,
      slug: safeSlug(`fda-recall-${firm}-${recallNum}`),
      excerpt: `${r.classification || "Recall"} announced by FDA for ${product.slice(0, 120)}. Reason: ${reason.slice(0, 150)}...`,
      content,
      featuredImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80",
      imageCaption: "Pharmaceutical product recall and laboratory testing.",
      sourceUrl,
      sourceUrlHash: sha256(sourceUrl + recallNum),
      sourceName: "openFDA Drug Enforcement",
      categorySlug: "fda-news",
      publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
      isBreaking: r.classification?.includes("I") && !r.classification?.includes("II"),
      regulatoryData: {
        agency: "FDA",
        alertType: "recall",
        recallClass: r.classification || "Class II",
        affectedProduct: product.slice(0, 250),
        manufacturer: firm,
        distributionPattern: r.distribution_pattern,
      },
    });
  }

  return items;
}

export async function fetchOpenFDADeviceEnforcement(limit = 10): Promise<NormalizedItem[]> {
  const url = `https://api.fda.gov/device/enforcement.json?limit=${limit}&sort=report_date:desc`;
  const res = await fetch(url, { headers: { "User-Agent": "NewsKrez-Intelligence/1.0" }, cache: "no-store" });

  if (!res.ok) {
    throw new Error(`openFDA device enforcement error HTTP ${res.status}`);
  }

  const json = await res.json();
  const results = json.results || [];
  const items: NormalizedItem[] = [];

  for (const r of results) {
    const recallNum = r.recall_number || `DEV-${Date.now()}`;
    const firm = r.recalling_firm || "Medical Device Manufacturer";
    const product = r.product_description || "Medical Device Equipment";
    const reason = r.reason_for_recall || "Medical device malfunction or safety non-conformance identified.";
    const title = `FDA Medical Device ${r.classification || "Recall"}: ${firm} – ${product.slice(0, 80)}`;
    const sourceUrl = `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=${encodeURIComponent(recallNum)}`;
    const pubDate = r.report_date ? new Date(r.report_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")) : new Date();

    const content = `
      <p>The FDA Center for Devices and Radiological Health (CDRH) has issued an official medical device recall determination for <strong>${product}</strong> produced by <strong>${firm}</strong>.</p>
      <h2>Regulatory Recall Specification</h2>
      <ul>
        <li><strong>Recall Number:</strong> ${recallNum}</li>
        <li><strong>Recall Classification:</strong> ${r.classification || "Class II"}</li>
        <li><strong>Firm Name:</strong> ${firm}</li>
        <li><strong>Current Status:</strong> ${r.status || "Ongoing"}</li>
      </ul>
      <h2>Reason for Device Recall</h2>
      <p>${reason}</p>
      <h2>Clinical & Corrective Actions</h2>
      <p>Healthcare facilities and clinical engineering departments are advised to review the affected serial numbers and follow the manufacturer's field safety notice instructions.</p>
    `;

    items.push({
      externalId: recallNum,
      title,
      slug: safeSlug(`fda-device-recall-${firm}-${recallNum}`),
      excerpt: `${r.classification || "Medical Device Recall"} issued for ${product.slice(0, 120)}. ${reason.slice(0, 140)}...`,
      content,
      featuredImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80",
      imageCaption: "Clinical medical device equipment and regulatory inspection notice.",
      sourceUrl,
      sourceUrlHash: sha256(sourceUrl + recallNum),
      sourceName: "openFDA Device Enforcement",
      categorySlug: "medical-devices",
      publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
      isBreaking: r.classification?.includes("I") && !r.classification?.includes("II"),
      regulatoryData: {
        agency: "FDA",
        alertType: "recall",
        recallClass: r.classification || "Class II",
        affectedProduct: product.slice(0, 250),
        manufacturer: firm,
        distributionPattern: r.distribution_pattern,
      },
    });
  }

  return items;
}

export async function fetchOpenFDADevice510k(limit = 10): Promise<NormalizedItem[]> {
  const url = `https://api.fda.gov/device/510k.json?limit=${limit}&sort=decision_date:desc`;
  const res = await fetch(url, { headers: { "User-Agent": "NewsKrez-Intelligence/1.0" }, cache: "no-store" });

  if (!res.ok) {
    throw new Error(`openFDA device 510(k) error HTTP ${res.status}`);
  }

  const json = await res.json();
  const results = json.results || [];
  const items: NormalizedItem[] = [];

  for (const r of results) {
    const kNum = r.k_number || `K${Date.now()}`;
    const devName = r.device_name || "Medical Device System";
    const applicant = r.applicant || "MedTech Enterprise";
    const productCode = r.product_code || "N/A";
    const decisionDesc = r.decision_description || "Substantially Equivalent (SESE)";
    const title = `FDA CDRH 510(k) Clearance (${kNum}): ${devName} by ${applicant}`;
    const sourceUrl = `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${encodeURIComponent(kNum)}`;
    const pubDate = r.decision_date ? new Date(r.decision_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")) : new Date();

    const content = `
      <p>The FDA Center for Devices and Radiological Health (CDRH) has finalized premarket notification review under Section 510(k) for <strong>${devName}</strong>.</p>
      <h2>Premarket Clearance Dossier</h2>
      <ul>
        <li><strong>Submission Number:</strong> ${kNum}</li>
        <li><strong>Applicant / Sponsor:</strong> ${applicant}</li>
        <li><strong>Device Trade Name:</strong> ${devName}</li>
        <li><strong>Product Code:</strong> ${productCode}</li>
        <li><strong>Advisory Committee:</strong> ${r.advisory_committee_description || "General Hospital"}</li>
        <li><strong>Regulatory Decision:</strong> ${decisionDesc}</li>
      </ul>
      <p>The FDA determined that the device is substantially equivalent to legally marketed predicate devices for the indications specified in the submission summary.</p>
    `;

    items.push({
      externalId: kNum,
      title,
      slug: safeSlug(`fda-510k-${kNum}-${devName}`),
      excerpt: `FDA issues 510(k) premarket notification clearance for ${devName} (${kNum}) manufactured by ${applicant}.`,
      content,
      featuredImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1000&auto=format&fit=crop&q=80",
      imageCaption: "Medical device engineering and FDA 510(k) clearance documentation.",
      sourceUrl,
      sourceUrlHash: sha256(sourceUrl + kNum),
      sourceName: "openFDA Device 510(k)",
      categorySlug: "medical-devices",
      publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
      isBreaking: false,
      regulatoryData: {
        agency: "FDA",
        alertType: "guidance",
        recordType: "510k",
        submissionNumber: kNum,
        affectedProduct: devName,
        manufacturer: applicant,
        productCode,
        deviceClass: "Class II",
      },
    });
  }

  return items;
}

export async function fetchOpenFDADevicePMA(limit = 10): Promise<NormalizedItem[]> {
  const url = `https://api.fda.gov/device/pma.json?limit=${limit}&sort=decision_date:desc`;
  const res = await fetch(url, { headers: { "User-Agent": "NewsKrez-Intelligence/1.0" }, cache: "no-store" });

  if (!res.ok) {
    throw new Error(`openFDA device PMA error HTTP ${res.status}`);
  }

  const json = await res.json();
  const results = json.results || [];
  const items: NormalizedItem[] = [];

  for (const r of results) {
    const pmaNum = r.pma_number || `P${Date.now()}`;
    const tradeName = r.trade_name || "High-Risk Class III Device";
    const applicant = r.applicant || "Device Corporation";
    const productCode = r.product_code || "N/A";
    const title = `FDA Grants Premarket Approval (PMA ${pmaNum}): ${tradeName} by ${applicant}`;
    const sourceUrl = `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=${encodeURIComponent(pmaNum)}`;
    const pubDate = r.decision_date ? new Date(r.decision_date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")) : new Date();

    const content = `
      <p>The FDA Center for Devices and Radiological Health has granted Premarket Approval (PMA) for <strong>${tradeName}</strong>, classified as a Class III life-supporting or life-sustaining medical device.</p>
      <h2>PMA Approval Dossier</h2>
      <ul>
        <li><strong>PMA Number:</strong> ${pmaNum}</li>
        <li><strong>Applicant:</strong> ${applicant}</li>
        <li><strong>Device Designation:</strong> ${tradeName}</li>
        <li><strong>Product Code:</strong> ${productCode}</li>
        <li><strong>Decision Code:</strong> ${r.decision_code || "Approved"}</li>
      </ul>
      <p>Approval was based on rigorous review of valid scientific evidence, including bench testing, animal studies, and human clinical trial outcomes establishing a reasonable assurance of safety and effectiveness.</p>
    `;

    items.push({
      externalId: pmaNum,
      title,
      slug: safeSlug(`fda-pma-${pmaNum}-${tradeName}`),
      excerpt: `FDA awards Class III Premarket Approval (PMA ${pmaNum}) for ${tradeName} sponsored by ${applicant}.`,
      content,
      featuredImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80",
      imageCaption: "Class III medical device technology receiving FDA premarket approval.",
      sourceUrl,
      sourceUrlHash: sha256(sourceUrl + pmaNum),
      sourceName: "openFDA Device PMA",
      categorySlug: "medical-devices",
      publishedAt: isNaN(pubDate.getTime()) ? new Date() : pubDate,
      isBreaking: false,
      regulatoryData: {
        agency: "FDA",
        alertType: "guidance",
        recordType: "PMA",
        submissionNumber: pmaNum,
        affectedProduct: tradeName,
        manufacturer: applicant,
        productCode,
        deviceClass: "Class III",
      },
    });
  }

  return items;
}
