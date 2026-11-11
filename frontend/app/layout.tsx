import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "PropertyFlow | Property enquiries, connected", template: "%s | PropertyFlow" },
  description: "Bring property enquiries, AI-powered lead processing, and HubSpot contact reviews together with PropertyFlow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#page-content" className="skip-link">Skip to content</a>
        <header className="site-header"><div className="header-inner">
          <Link href="/" className="brand" aria-label="PropertyFlow home"><span className="brand-mark" aria-hidden="true">P</span>PropertyFlow<span className="brand-dot">.</span></Link>
          <nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/crm">CRM</Link><Link href="/contact-us" className="nav-contact">Contact Us ↗</Link></nav>
        </div></header>
        <div id="page-content" tabIndex={-1} className="page-content">{children}</div>
        <footer className="site-footer"><div className="footer-inner"><Link href="/" className="footer-brand">PropertyFlow.</Link><p>Property enquiries. Connected conversations.</p><nav aria-label="Footer navigation"><Link href="/crm">CRM</Link><Link href="/contact-us">Contact Us</Link></nav></div></footer>
      </body>
    </html>
  );
}
