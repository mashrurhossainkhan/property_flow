
"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type AgentResponse = {
  success: boolean;
  notification?: {
    status: "sent" | "failed" | "not_configured";
    recipient: string;
    message: string;
  };
  result: {
    lead: {
      name: string | null;
      email: string | null;
      budget: number | null;
      location: string | null;
      timeline: string | null;
      intent: string;
      summary: string;
    };
    toolCalls: {
      tool: string;
      arguments: Record<string, unknown>;
      result: string;
    }[];
    crm: {
      lookupPerformed: boolean;
      contactExists: boolean | null;
      contactId: string | null;
    };
    recommendedAction: string;
    status: string;
  };
};

export default function AgentPage() {
  const [message, setMessage] = useState("");
  const [data, setData] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAgent() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/leads/agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: AgentResponse = await response.json();
      setData(result);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Request failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">
          PropertyFlow AI Agent
        </h1>

        <p className="mt-2 text-gray-600">
          AI-powered lead analysis and HubSpot CRM lookup
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <label className="font-semibold">
            Customer Enquiry
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-3 h-36 w-full rounded-lg border p-3"
            placeholder="Enter a customer enquiry..."
          />

          <button
            onClick={runAgent}
            disabled={loading || message.trim().length < 10}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
          >
            {loading ? "AI Agent Running..." : "Run AI Agent"}
          </button>

          {error && (
            <p className="mt-4 text-red-600">{error}</p>
          )}
        </div>

        {data && (
          <div className="mt-6 space-y-6">
            {data.notification && (
              <p role="status" className={`rounded-xl p-4 ${data.notification.status === "sent" ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"}`}>
                {data.notification.status === "sent"
                  ? `Result submitted for email delivery to ${data.notification.recipient}.`
                  : data.notification.message}
              </p>
            )}

            {/* Lead Information */}
            <section className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">
                Lead Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <p><strong>Name:</strong> {data.result.lead.name ?? "N/A"}</p>
                <p><strong>Email:</strong> {data.result.lead.email ?? "N/A"}</p>
                <p><strong>Budget:</strong> {data.result.lead.budget ?? "N/A"}</p>
                <p><strong>Location:</strong> {data.result.lead.location ?? "N/A"}</p>
                <p><strong>Timeline:</strong> {data.result.lead.timeline ?? "N/A"}</p>
                <p><strong>Intent:</strong> {data.result.lead.intent}</p>
              </div>

              <p className="mt-4">
                <strong>Summary:</strong> {data.result.lead.summary}
              </p>
            </section>

            {/* HubSpot Result */}
            <section className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">
                HubSpot CRM
              </h2>

              <p>
                <strong>Lookup Performed:</strong>{" "}
                {data.result.crm.lookupPerformed ? "Yes" : "No"}
              </p>

              <p className="mt-2">
                <strong>Contact Exists:</strong>{" "}
                {data.result.crm.contactExists === null
                  ? "Not checked"
                  : data.result.crm.contactExists
                    ? "Yes"
                    : "No"}
              </p>

              <p className="mt-2">
                <strong>Contact ID:</strong>{" "}
                {data.result.crm.contactId ?? "N/A"}
              </p>

              <p className="mt-2">
                <strong>Recommended Action:</strong>{" "}
                {data.result.recommendedAction}
              </p>
            </section>

            {/* Tool Calls */}
            <section className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">
                Agent Tool Calls
              </h2>

              {data.result.toolCalls.length === 0 ? (
                <p>No tools executed.</p>
              ) : (
                data.result.toolCalls.map((tool, index) => (
                  <div
                    key={index}
                    className="mb-3 rounded-lg bg-gray-100 p-4"
                  >
                    <p><strong>Tool:</strong> {tool.tool}</p>
                    <p><strong>Result:</strong> {tool.result}</p>

                    <pre className="mt-2 overflow-x-auto text-sm">
                      {JSON.stringify(tool.arguments, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </section>

            {/* Raw JSON */}
            <section className="rounded-xl bg-gray-900 p-6 text-green-400">
              <h2 className="mb-4 text-xl font-bold">
                Raw Agent JSON
              </h2>

              <pre className="overflow-x-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </section>

          </div>
        )}
      </div>
    </main>
  );
}
