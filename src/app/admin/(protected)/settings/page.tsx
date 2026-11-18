import React from "react";
import { db } from "@/db";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await db.query.websiteSettings.findMany();

  return <SettingsClient initialSettings={settings} />;
}
