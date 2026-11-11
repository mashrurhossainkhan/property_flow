"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type Contact = { id: string; properties: Record<string, string | null> };
const columns = [
  ["email", "Email"], ["phone", "Phone"], ["mobilephone", "Mobile"],
  ["budget", "Budget"], ["location", "Location"], ["timeline", "Timeline"],
  ["intent", "Intent"], ["summary", "Summary"],
  ["lifecyclestage", "Lifecycle stage"], ["hs_lead_status", "Lead status"],
  ["company", "Company"], ["jobtitle", "Job title"], ["city", "City"],
  ["state", "State"], ["country", "Country"]
];

function displayProperty(key: string, value: string | null | undefined) {
  if (value == null || value.trim() === "") return "—";
  if (key === "budget" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(value));
  }
  return value;
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    async function loadContacts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contacts`, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load contacts");
        const data = await response.json();
        setContacts(data.contacts);
      } catch {
        if (!controller.signal.aborted) setError("Unable to connect to HubSpot CRM");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadContacts();
    return () => controller.abort();
  }, []);

  async function markReviewed(id: string) {
    setSaving((current) => ({ ...current, [id]: true }));
    setReviewErrors((current) => ({ ...current, [id]: "" }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/${encodeURIComponent(id)}/human-review`, {
        method: "PATCH", signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) throw new Error("Unable to save review. Please try again.");
      const data = await response.json();
      setContacts((current) => current.map((contact) => contact.id === id
        ? { ...contact, properties: { ...contact.properties, ...data.contact.properties } }
        : contact));
    } catch (err) {
      setReviewErrors((current) => ({ ...current, [id]: err instanceof Error ? err.message : "Unable to save review" }));
    } finally {
      setSaving((current) => ({ ...current, [id]: false }));
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <h1 className="text-3xl font-bold">PropertyFlow AI</h1>
      <p className="mt-2 text-gray-600">AI-Powered Property CRM Automation</p>
      <section className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">HubSpot Contacts</h2>
        <p className="mb-4 mt-2 text-sm text-gray-600">Review contact details, then mark the contact as reviewed. Expand Properties to see additional fields.</p>
        {loading && <p>Loading contacts...</p>}
        {error && <p role="alert" className="text-red-600">{error}</p>}
        {!loading && !error && contacts.length === 0 && <p>No contacts found in HubSpot.</p>}
        {!loading && !error && contacts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Human reviewed</th>
                <th className="p-3">Action</th>
                {columns.map(([key, label]) => <th key={key} className="whitespace-nowrap p-3">{label}</th>)}
                <th className="p-3">Properties</th>
              </tr></thead>
              <tbody>{contacts.map((contact) => {
                const reviewed = contact.properties.human_reviewed === "true";
                const name = [contact.properties.firstname, contact.properties.lastname].filter(Boolean).join(" ") || "Unknown";
                return (
                  <tr key={contact.id} className="border-b align-top">
                    <td className="min-w-44 p-3">{name}</td>
                    <td className="whitespace-nowrap p-3">
                      <span className={`rounded-full px-3 py-1 ${reviewed ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {reviewed ? "Yes" : contact.properties.human_reviewed === "false" ? "No" : "Not set"}
                      </span>
                    </td>
                    <td className="min-w-48 p-3">
                      <button type="button" disabled={reviewed || saving[contact.id]} onClick={() => markReviewed(contact.id)}
                        aria-label={`Mark ${name} as reviewed by human`}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:bg-gray-200 disabled:text-gray-600">
                        {saving[contact.id] ? "Saving..." : reviewed ? "Reviewed" : "Reviewed by human"}
                      </button>
                      {reviewErrors[contact.id] && <p role="alert" className="mt-2 text-red-600">{reviewErrors[contact.id]}</p>}
                    </td>
                    {columns.map(([key]) => <td key={key} className={key === "summary" ? "min-w-72 max-w-96 whitespace-normal break-words p-3" : "min-w-32 p-3"}>{displayProperty(key, contact.properties[key])}</td>)}
                    <td className="min-w-80 p-3">
                      <details><summary className="cursor-pointer text-blue-700">Properties</summary>
                        <dl className="mt-3 space-y-2"><div><dt className="font-semibold">Contact ID</dt><dd>{contact.id}</dd></div>
                          {Object.entries(contact.properties).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => (
                            <div key={key}><dt className="font-semibold">{key}</dt><dd className="break-all">{value || "—"}</dd></div>
                          ))}
                        </dl>
                      </details>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
