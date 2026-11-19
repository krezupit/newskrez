/**
 * NewsKrez Official Email Templates
 * Responsive, cross-client HTML & text email rendering
 */

const BRAND_NAVY = "#071324";
const BRAND_TEAL = "#0d9488";
const BRAND_GOLD = "#d97706";
const BRAND_BG = "#f8fafc";

function renderBaseLayout({
  title,
  preheader,
  contentHtml,
  unsubscribeUrl,
  preferencesUrl,
}: {
  title: string;
  preheader?: string;
  contentHtml: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background-color:${BRAND_BG}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1e293b; -webkit-font-smoothing:antialiased; }
    table { border-collapse:collapse; }
    a { color:${BRAND_TEAL}; text-decoration:none; }
    .btn { display:inline-block; padding:12px 24px; background-color:${BRAND_TEAL}; color:#ffffff !important; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; border-radius:8px; text-decoration:none; margin:16px 0; }
    .btn:hover { background-color:#0f766e; }
  </style>
</head>
<body style="margin:0; padding:20px 0; background-color:${BRAND_BG};">
  ${preheader ? `<div style="display:none; max-height:0px; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#ffffff;">${preheader}</div>` : ""}
  
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:10px 15px;">
        <table width="100%" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);" cellpadding="0" cellspacing="0">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_NAVY}; padding:28px 32px; text-align:center;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:1.5px; color:#38bdf8; text-transform:uppercase; margin-bottom:6px;">GLOBAL INTELLIGENCE DESK</span>
                    <h1 style="margin:0; font-family:Georgia, serif; font-size:26px; font-weight:900; color:#ffffff; letter-spacing:0.5px;">NEWSKREZ</h1>
                    <p style="margin:4px 0 0; font-size:11px; color:#94a3b8; letter-spacing:0.3px;">Healthcare • Technology • Regulatory Intelligence • Global News</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f5f9; padding:24px 32px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#64748b; line-height:1.6;">
              <p style="margin:0 0 10px; font-weight:600; color:#475569;">
                NewsKrez Global Intelligence Network • Verified Hostinger SMTP Node
              </p>
              <p style="margin:0 0 12px;">
                You are receiving this communication because you are subscribed to NewsKrez intelligence alerts via <strong style="color:#0f172a;">alert@newskrez.com</strong>.
              </p>
              <p style="margin:0;">
                ${preferencesUrl ? `<a href="${preferencesUrl}" style="color:${BRAND_TEAL}; font-weight:600; text-decoration:underline;">Update Preferences</a> • ` : ""}
                ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color:#dc2626; font-weight:600; text-decoration:underline;">Unsubscribe Immediately</a>` : ""}
              </p>
              <p style="margin:12px 0 0; font-size:10px; color:#94a3b8;">
                © ${currentYear} NewsKrez. All rights reserved. 21 CFR Part 820 & ISO 13485 Regulatory Intelligence Monitoring.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Subscription Confirmation Email
 */
export function renderConfirmationEmail(
  email: string,
  token: string,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const verifyUrl = `${baseUrl}/api/newsletter/verify?token=${token}`;
  const subject = "Please Confirm Your Subscription to NewsKrez Intelligence";
  const preheader = "Confirm your email to activate daily regulatory digests and breaking alerts.";

  const contentHtml = `
    <h2 style="font-family:Georgia, serif; font-size:20px; font-weight:800; color:${BRAND_NAVY}; margin:0 0 16px;">
      Confirm Your Intelligence Dispatch Subscription
    </h2>
    <p style="font-size:14px; line-height:1.6; color:#334155; margin:0 0 16px;">
      Hello,
    </p>
    <p style="font-size:14px; line-height:1.6; color:#334155; margin:0 0 20px;">
      We received a request to subscribe <strong>${email}</strong> to authoritative news, FDA recall notices, medical device clearances, biopharma breakthroughs, and daily global briefings on NewsKrez.
    </p>
    
    <div style="text-align:center; margin:28px 0;">
      <a href="${verifyUrl}" class="btn" style="background-color:${BRAND_TEAL}; color:#ffffff; padding:14px 28px; border-radius:8px; font-weight:700; font-size:14px; display:inline-block; text-decoration:none;">
        Confirm Subscription & Activate Updates
      </a>
    </div>

    <p style="font-size:12px; line-height:1.6; color:#64748b; margin:20px 0 0;">
      Or copy and paste this verification URL directly into your browser:<br>
      <a href="${verifyUrl}" style="color:${BRAND_TEAL}; word-break:break-all;">${verifyUrl}</a>
    </p>
    <p style="font-size:12px; color:#94a3b8; margin:20px 0 0;">
      If you did not make this request, you can safely ignore this email. No alerts will be sent to your inbox without confirmation.
    </p>
  `;

  const text = `Confirm Your Subscription to NewsKrez Intelligence

We received a request to subscribe ${email} to NewsKrez regulatory updates and daily global news.

To activate your subscription, visit:
${verifyUrl}

If you did not request this, please ignore this email.
`;

  return {
    subject,
    html: renderBaseLayout({ title: subject, preheader, contentHtml, unsubscribeUrl: `${baseUrl}/unsubscribe?token=${token}` }),
    text,
  };
}

/**
 * 2. Subscriber Welcome Email
 */
export function renderWelcomeEmail(
  email: string,
  preferences: string[],
  frequency: string,
  token: string,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const preferencesUrl = `${baseUrl}/unsubscribe?token=${token}`;
  const reelsUrl = `${baseUrl}/reels`;
  const subject = "Welcome to NewsKrez – Your Intelligence Feed is Active";
  const preheader = "Your subscription has been verified. Here is what to expect.";

  const prefBadges = (preferences || ["General News", "Regulatory", "Technology"])
    .map(
      (p) =>
        `<span style="display:inline-block; background-color:#e0f2fe; color:#0369a1; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; text-transform:uppercase; margin:3px 4px 3px 0;">${p}</span>`
    )
    .join("");

  const contentHtml = `
    <div style="background-color:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; padding:14px 18px; margin-bottom:24px;">
      <span style="color:#059669; font-weight:800; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">✓ Subscription Active</span>
      <p style="margin:4px 0 0; font-size:13px; color:#065f46;">
        Welcome aboard! <strong>${email}</strong> is now confirmed to receive vetted briefings.
      </p>
    </div>

    <h2 style="font-family:Georgia, serif; font-size:20px; font-weight:800; color:${BRAND_NAVY}; margin:0 0 12px;">
      What You Will Receive:
    </h2>
    <ul style="font-size:13px; color:#334155; line-height:1.7; padding-left:20px; margin:0 0 20px;">
      <li><strong>Daily News Digest:</strong> Top global headlines, technology developments, and financial markets.</li>
      <li><strong>Regulatory Dossiers:</strong> Critical FDA recalls, 510(k) clearances, and biopharma pipelines.</li>
      <li><strong>Visual Short Reels:</strong> Quick 30-second mobile briefings at <a href="${reelsUrl}" style="color:${BRAND_TEAL}; font-weight:600;">newskrez.com/reels</a>.</li>
    </ul>

    <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
      <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:6px;">Your Dispatch Settings:</div>
      <div style="font-size:13px; color:#1e293b; margin-bottom:8px;">Frequency: <strong style="text-transform:capitalize;">${frequency}</strong></div>
      <div>${prefBadges}</div>
    </div>

    <div style="text-align:center; margin:24px 0;">
      <a href="${baseUrl}" class="btn" style="background-color:${BRAND_NAVY}; color:#ffffff; padding:12px 24px; border-radius:8px; font-weight:700; font-size:13px; display:inline-block; text-decoration:none;">
        Explore Live Intelligence Portal
      </a>
    </div>
  `;

  const text = `Welcome to NewsKrez!

Your subscription for ${email} is now active.
Frequency: ${frequency}
Preferences: ${preferences.join(", ")}

Read latest news: ${baseUrl}
Watch News Reels: ${reelsUrl}
Manage preferences: ${preferencesUrl}
`;

  return {
    subject,
    html: renderBaseLayout({
      title: subject,
      preheader,
      contentHtml,
      unsubscribeUrl: `${baseUrl}/unsubscribe?token=${token}`,
      preferencesUrl,
    }),
    text,
  };
}

/**
 * 3. Daily News Newsletter Email
 */
export function renderDailyNewsletterEmail(
  articles: Array<{
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    categoryName?: string;
    imageUrl?: string | null;
  }>,
  token: string,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const subject = `NewsKrez Daily Intelligence Briefing – ${todayStr}`;
  const preheader = articles.length > 0 ? articles[0].title : "Your curated daily news dispatch from NewsKrez.";

  const leadArticle = articles[0];
  const otherArticles = articles.slice(1, 6);

  const leadHtml = leadArticle
    ? `
    <div style="border-bottom:2px solid #e2e8f0; padding-bottom:24px; margin-bottom:24px;">
      <span style="background-color:${BRAND_NAVY}; color:#ffffff; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1px; padding:4px 8px; border-radius:4px;">
        TOP LEAD INTELLIGENCE
      </span>
      <h2 style="font-family:Georgia, serif; font-size:22px; font-weight:900; line-height:1.3; color:${BRAND_NAVY}; margin:12px 0 8px;">
        <a href="${baseUrl}/article/${encodeURIComponent(leadArticle.slug)}" style="color:${BRAND_NAVY}; text-decoration:none;">
          ${leadArticle.title}
        </a>
      </h2>
      ${
        leadArticle.imageUrl
          ? `<div style="margin:14px 0;"><a href="${baseUrl}/article/${encodeURIComponent(leadArticle.slug)}"><img src="${leadArticle.imageUrl}" alt="${leadArticle.title}" style="width:100%; max-height:260px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1;" /></a></div>`
          : ""
      }
      <p style="font-size:14px; line-height:1.6; color:#475569; margin:0 0 16px;">
        ${leadArticle.excerpt || "Click below to read the complete executive briefing and verified regulatory sources on NewsKrez."}
      </p>
      <a href="${baseUrl}/article/${encodeURIComponent(leadArticle.slug)}" style="display:inline-block; font-size:12px; font-weight:700; color:${BRAND_TEAL}; text-transform:uppercase; letter-spacing:0.5px;">
        Read Full Dossier →
      </a>
    </div>`
    : "";

  const listHtml = otherArticles
    .map(
      (a) => `
    <div style="padding:14px 0; border-bottom:1px solid #f1f5f9;">
      ${
        a.categoryName
          ? `<span style="font-size:10px; font-weight:700; color:${BRAND_TEAL}; text-transform:uppercase; letter-spacing:0.5px;">${a.categoryName}</span>`
          : ""
      }
      <h3 style="margin:4px 0; font-family:Georgia, serif; font-size:15px; font-weight:700; line-height:1.4;">
        <a href="${baseUrl}/article/${encodeURIComponent(a.slug)}" style="color:#0f172a; text-decoration:none;">
          ${a.title}
        </a>
      </h3>
      ${a.excerpt ? `<p style="margin:4px 0 0; font-size:12px; color:#64748b; line-height:1.5;">${a.excerpt.slice(0, 160)}...</p>` : ""}
    </div>`
    )
    .join("");

  const contentHtml = `
    <div style="font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">
      Daily Executive Briefing • ${todayStr}
    </div>

    ${leadHtml}

    <div style="margin-top:16px;">
      <h4 style="font-size:12px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 10px;">
        Key Global & Regulatory Highlights
      </h4>
      ${listHtml}
    </div>

    <!-- News Reels promo card -->
    <div style="background:linear-gradient(135deg, #071324 0%, #0d9488 100%); border-radius:12px; padding:20px 24px; margin-top:28px; text-align:center; color:#ffffff;">
      <span style="font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:#5eead4;">NEW FEATURE</span>
      <h3 style="font-family:Georgia, serif; font-size:18px; font-weight:800; margin:6px 0 8px; color:#ffffff;">
        Watch News Reels in 9:16 Vertical Video
      </h3>
      <p style="font-size:12px; color:#ccfbf1; margin:0 0 14px; line-height:1.5;">
        Stay informed in seconds with swipeable vertical video feeds across 13 news categories.
      </p>
      <a href="${baseUrl}/reels" style="display:inline-block; padding:10px 20px; background-color:#ffffff; color:#0f172a !important; font-weight:800; font-size:12px; text-transform:uppercase; border-radius:6px; text-decoration:none;">
        Open News Reels →
      </a>
    </div>
  `;

  const text = `NewsKrez Daily Intelligence Briefing – ${todayStr}

${articles
  .map((a, i) => `${i + 1}. ${a.title}\n   ${baseUrl}/article/${encodeURIComponent(a.slug)}`)
  .join("\n\n")}

Watch News Reels: ${baseUrl}/reels
Unsubscribe: ${baseUrl}/unsubscribe?token=${token}
`;

  return {
    subject,
    html: renderBaseLayout({
      title: subject,
      preheader,
      contentHtml,
      unsubscribeUrl: `${baseUrl}/unsubscribe?token=${token}`,
      preferencesUrl: `${baseUrl}/unsubscribe?token=${token}`,
    }),
    text,
  };
}

/**
 * 4. Breaking News Email Alert
 */
export function renderBreakingAlertEmail(
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    categoryName?: string;
  },
  token: string,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const articleUrl = `${baseUrl}/article/${encodeURIComponent(article.slug)}`;
  const subject = `🚨 BREAKING ALERT: ${article.title}`;
  const preheader = `Urgent intelligence dispatch: ${article.title}`;

  const contentHtml = `
    <div style="background-color:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; border-radius:8px; padding:14px 18px; margin-bottom:20px;">
      <span style="color:#b91c1c; font-weight:900; font-size:12px; letter-spacing:1px; text-transform:uppercase;">
        ⚡ BREAKING INTELLIGENCE DISPATCH
      </span>
      <p style="margin:4px 0 0; font-size:12px; color:#991b1b;">
        An urgent high-priority news bulletin has been authorized by the NewsKrez Editorial Bureau.
      </p>
    </div>

    ${
      article.categoryName
        ? `<span style="font-size:11px; font-weight:800; color:${BRAND_TEAL}; text-transform:uppercase;">${article.categoryName}</span>`
        : ""
    }

    <h1 style="font-family:Georgia, serif; font-size:22px; font-weight:900; line-height:1.3; color:${BRAND_NAVY}; margin:8px 0 16px;">
      ${article.title}
    </h1>

    <div style="font-size:14px; line-height:1.7; color:#334155; margin:0 0 24px;">
      <p>${article.excerpt || article.content?.slice(0, 400) || "Urgent development in progress. Read verified facts on NewsKrez."}</p>
    </div>

    <div style="text-align:center; margin:28px 0;">
      <a href="${articleUrl}" class="btn" style="background-color:#dc2626; color:#ffffff; padding:14px 28px; border-radius:8px; font-weight:800; font-size:13px; display:inline-block; text-decoration:none;">
        Access Full Emergency Dossier →
      </a>
    </div>

    <div style="background-color:#f8fafc; border-radius:8px; padding:12px 16px; font-size:11px; color:#64748b;">
      Direct Article Link: <a href="${articleUrl}" style="color:${BRAND_TEAL}; word-break:break-all;">${articleUrl}</a>
    </div>
  `;

  const text = `BREAKING ALERT: ${article.title}

${article.excerpt || article.content?.slice(0, 300) || ""}

Read Full Story: ${articleUrl}
Unsubscribe: ${baseUrl}/unsubscribe?token=${token}
`;

  return {
    subject,
    html: renderBaseLayout({
      title: subject,
      preheader,
      contentHtml,
      unsubscribeUrl: `${baseUrl}/unsubscribe?token=${token}`,
      preferencesUrl: `${baseUrl}/unsubscribe?token=${token}`,
    }),
    text,
  };
}

/**
 * 5. Test SMTP Email
 */
export function renderTestEmail(
  recipient: string,
  timestamp: string,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const subject = "✓ NewsKrez SMTP Delivery Verification Successful";
  const preheader = "Your Hostinger SMTP node is fully configured and delivering emails.";

  const contentHtml = `
    <div style="background-color:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
      <span style="color:#059669; font-weight:800; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">✓ SMTP Connection Verified</span>
      <h3 style="margin:4px 0 0; font-size:16px; font-weight:800; color:#065f46;">
        Hostinger SMTP Node is Fully Operational
      </h3>
    </div>

    <p style="font-size:14px; line-height:1.6; color:#334155; margin:0 0 16px;">
      This test message confirms that <strong>NewsKrez</strong> has established a secure SSL/TLS connection with Hostinger Mail:
    </p>

    <table width="100%" style="font-size:12px; border-collapse:collapse; background-color:#f8fafc; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; margin-bottom:20px;" cellpadding="8">
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="color:#64748b; font-weight:700; width:35%;">SMTP Host:</td>
        <td style="color:#0f172a; font-family:monospace; font-weight:700;">smtp.hostinger.com</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="color:#64748b; font-weight:700;">Port & Encryption:</td>
        <td style="color:#0f172a;">465 (SSL/TLS Encrypted)</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="color:#64748b; font-weight:700;">Authenticated Account:</td>
        <td style="color:#0f172a; font-family:monospace;">alert@newskrez.com</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="color:#64748b; font-weight:700;">Recipient:</td>
        <td style="color:#0f172a; font-family:monospace;">${recipient}</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="color:#64748b; font-weight:700;">SPF / DKIM / DMARC:</td>
        <td style="color:#059669; font-weight:700;">Configured & Aligned (Hostinger DNS)</td>
      </tr>
      <tr>
        <td style="color:#64748b; font-weight:700;">Delivery Timestamp:</td>
        <td style="color:#0f172a;">${timestamp}</td>
      </tr>
    </table>

    <p style="font-size:13px; line-height:1.6; color:#475569; margin:0;">
      All automated features—including Subscription Confirmations, Subscriber Welcome Onboarding, Daily Intelligence Newsletters, and Breaking News Alerts—are ready for production dispatch.
    </p>
  `;

  const text = `NewsKrez SMTP Delivery Verification

Hostinger SMTP node is operational.
Host: smtp.hostinger.com:465 (SSL/TLS)
Authenticated User: alert@newskrez.com
Recipient: ${recipient}
Timestamp: ${timestamp}
`;

  return {
    subject,
    html: renderBaseLayout({ title: subject, preheader, contentHtml }),
    text,
  };
}
