import type { Metadata } from "next";
import CrmView from "./crm-view";
export const metadata: Metadata = { title: "CRM", description: "Review HubSpot contacts with PropertyFlow." };
export default function CrmPage() { return <CrmView />; }
