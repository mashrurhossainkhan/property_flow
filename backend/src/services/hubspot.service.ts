export interface HubSpotContact {
  id: string;
  properties: {
    [key: string]: string | null | undefined;
    firstname?: string | null;
    lastname?: string | null;
    email?: string | null;
    phone?: string | null;
    lifecyclestage?: string | null;
    human_reviewed?: string | null;
    budget?: string | null;
    location?: string | null;
    timeline?: string | null;
    intent?: string | null;
    summary?: string | null;
  };
}

interface HubSpotContactsResponse {
  results: HubSpotContact[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export async function getHubSpotContacts(): Promise<HubSpotContactsResponse> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const version = process.env.HUBSPOT_API_VERSION || "2026-03";

  if (!token) {
    throw new Error("Missing HubSpot access token");
  }

  const url = new URL(
    `https://api.hubapi.com/crm/objects/${version}/contacts`
  );

  url.searchParams.set("limit", "20");
  url.searchParams.set(
    "properties",
    [
      "firstname", "lastname", "email", "phone", "mobilephone",
      "lifecyclestage", "human_reviewed", "company", "jobtitle",
      "website", "address", "city", "state", "zip", "country",
      "industry", "hs_lead_status", "hubspot_owner_id",
      "createdate", "lastmodifieddate",
      "budget", "location", "timeline", "intent", "summary"
    ].join(",")
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(
      `HubSpot request failed: HTTP ${response.status}`
    );
  }

  return response.json() as Promise<HubSpotContactsResponse>;
}

export async function markContactHumanReviewed(id: string): Promise<HubSpotContact> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error("Missing HubSpot credential");
  const version = process.env.HUBSPOT_API_VERSION || "2026-03";
  const response = await fetch(
    `https://api.hubapi.com/crm/objects/${version}/contacts/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ properties: { human_reviewed: "true" } }),
      signal: AbortSignal.timeout(15000)
    }
  );
  if (!response.ok) {
    throw new Error(`HubSpot review update failed: ${response.status}`);
  }
  return response.json() as Promise<HubSpotContact>;
}

export async function findContactByEmail(email: string) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Missing HubSpot credential");
  }

  const version =
    process.env.HUBSPOT_API_VERSION || "2026-03";

  const url =
    `https://api.hubapi.com/crm/objects/${version}/contacts/search`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: "email",
          operator: "EQ",
          value: email
        }]
      }],
      properties: [
        "firstname", "lastname", "email", "lifecyclestage"
      ],
      limit: 1
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`HubSpot lookup failed: ${response.status}`);
  }

  const data = await response.json() as {
    results: Array<{
      id: string;
      properties: Record<string, string | null>;
    }>;
  };

  return data.results[0] ?? null;
}

export async function createHubSpotContact(input: {
  email: string;
  fullName: string | null;
  humanReviewed?: "true" | "false";
  budget?: number | null;
  location?: string | null;
  timeline?: string | null;
  intent?: string | null;
  summary?: string | null;
}) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Missing HubSpot credential");
  }

  const version =
    process.env.HUBSPOT_API_VERSION || "2026-03";

  const nameParts = (input.fullName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstname = nameParts.shift() ?? "";
  const lastname = nameParts.join(" ");

  const response = await fetch(
    `https://api.hubapi.com/crm/objects/${version}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          email: input.email,
          ...(input.budget != null ? { budget: String(input.budget) } : {}),
          ...(input.location != null ? { location: input.location } : {}),
          ...(input.timeline != null ? { timeline: input.timeline } : {}),
          ...(input.intent != null ? { intent: input.intent } : {}),
          ...(input.summary != null ? { summary: input.summary } : {}),
          ...(input.humanReviewed ? { human_reviewed: input.humanReviewed } : {}),
          ...(firstname ? { firstname } : {}),
          ...(lastname ? { lastname } : {})
        }
      }),
      signal: AbortSignal.timeout(15000)
    }
  );

  if (!response.ok) {
    throw new Error(
      `HubSpot contact creation failed: ${response.status}`
    );
  }

  const data = await response.json() as {
    id: string;
  };

  return data;
}
