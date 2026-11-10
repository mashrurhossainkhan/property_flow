import { z } from "zod";
import { extractLead } from "../services/gemini.service";
import {
  findContactByEmail,
  createHubSpotContact
} from "../services/hubspot.service";

export async function runLeadAgent(message: string) {
  const lead = await extractLead(message);

  if (!lead.email) {
    return {
      lead,
      toolCalls: [],
      crm: {
        lookupPerformed: false,
        contactExists: null,
        contactId: null,
        created: false
      },
      recommendedAction: "REQUEST_CONTACT_DETAILS",
      status: "PENDING_HUMAN_REVIEW"
    };
  }

  const email = z.string().email().parse(lead.email.trim()).toLowerCase();
  const existingContact = await findContactByEmail(email);
  const toolCalls = [{
    tool: "search_hubspot_contact",
    arguments: { email },
    result: existingContact ? "CONTACT_FOUND" : "CONTACT_NOT_FOUND"
  }];

  // Writes are controlled by application code, not model-generated instructions.
  const contact = existingContact ?? await createHubSpotContact({
    email,
    fullName: lead.name,
    humanReviewed: "false"
  });

  if (!existingContact) {
    toolCalls.push({
      tool: "create_hubspot_contact",
      arguments: { email },
      result: "CONTACT_CREATED"
    });
  }

  return {
    lead,
    toolCalls,
    crm: {
      lookupPerformed: true,
      contactExists: true,
      contactId: contact.id,
      created: !existingContact
    },
    recommendedAction: existingContact
      ? "REVIEW_EXISTING_CONTACT"
      : "REVIEW_NEW_CONTACT",
    status: "PENDING_HUMAN_REVIEW"
  };
}
