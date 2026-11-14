import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Upwork Pricing Calculator | First Tech Hub Solutions",
  description:
    "Calculate Upwork service fees, Nigeria VAT on service fees, withdrawal costs, hourly rates and project quotes. Free tool by First Tech Hub Solutions.",
  applicationName: "FTHS Upwork Pricing Calculator",
  keywords: ["Upwork calculator", "freelancer pricing", "Upwork fees", "hourly rate calculator"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
