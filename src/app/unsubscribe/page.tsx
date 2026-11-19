import React, { Suspense } from "react";
import { Metadata } from "next";
import { UnsubscribeClient } from "./UnsubscribeClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Email Preferences & Unsubscribe | NewsKrez",
  description:
    "Update your NewsKrez intelligence email subscription preferences, change dispatch frequency, or unsubscribe.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading preferences...</span>
          </div>
        </div>
      }
    >
      <UnsubscribeClient />
    </Suspense>
  );
}
