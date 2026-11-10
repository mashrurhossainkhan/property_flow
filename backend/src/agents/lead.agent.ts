import {
  extractLead
} from "../services/gemini.service";

import {
  findContactByEmail
} from "../services/hubspot.service";

async function timed<T>(label: string, operation: () => Promise<T>): Promise<T> {
  const started = Date.now();
  console.log(`${label} started`);
  try {
    return await operation();
  } catch (error) {
    console.error(`${label} failed`);
    throw error;
  } finally {
    console.log(`${label} finished after ${Date.now() - started} ms`);
  }
}

export async function qualifyLead(message: string) {

  const lead = await timed("Gemini API", () => extractLead(message));

  let existingContact = null;

  if (lead.email) {
    const email = lead.email;
    existingContact = await timed("HubSpot API", () => findContactByEmail(email));
  }

  const recommendedAction = existingContact
    ? "REVIEW_EXISTING_CONTACT"
    : lead.email
      ? "REVIEW_NEW_CONTACT"
      : "REQUEST_CONTACT_DETAILS";

  return {
    lead,
    crm: {
      contactExists: existingContact !== null,
      contactId: existingContact?.id ?? null,
      lookupPerformed: Boolean(lead.email)
    },
    recommendedAction,
    status: "PENDING_HUMAN_REVIEW"
  };
}
