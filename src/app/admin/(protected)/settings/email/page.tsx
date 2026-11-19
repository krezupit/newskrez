import React from "react";
import { Metadata } from "next";
import { EmailSettingsClient } from "./EmailSettingsClient";

export const metadata: Metadata = {
  title: "Hostinger SMTP Email Configuration | NewsKrez Admin",
  description:
    "Configure Hostinger SMTP credentials, test socket connections, send verified test emails, and monitor delivery quotas.",
};

export const dynamic = "force-dynamic";

export default function AdminEmailSettingsPage() {
  return <EmailSettingsClient />;
}
