import { randomUUID } from "node:crypto";
import { db } from "./db.service";
import {
  findContactByEmail,
  createHubSpotContact
} from "./hubspot.service";

type ProposalInput = {
  email: string;
  fullName: string | null;
  budget: number | null;
  location: string | null;
  timeline: string | null;
  intent: string;
  summary: string;
};

export async function createProposal(input: ProposalInput) {
  const id = randomUUID();

  await db.query(
    `INSERT INTO contact_proposals
    (id, email, full_name, budget, location,
     timeline, intent, summary)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      id, input.email.toLowerCase(),
      input.fullName, input.budget,
      input.location, input.timeline,
      input.intent, input.summary
    ]
  );

  await db.query(
    `INSERT INTO approval_events
     (proposal_id, actor, action)
     VALUES ($1, 'AI_AGENT', 'PROPOSED')`,
    [id]
  );

  return { id, status: "PENDING" };
}

export async function approveProposal(id: string) {
  // Atomic transition: only one request can claim
  // a proposal that is still PENDING.
  const claimed = await db.query(
    `UPDATE contact_proposals
     SET status = 'PROCESSING',
         reviewer_id = 'local-reviewer',
         reviewed_at = NOW()
     WHERE id = $1 AND status = 'PENDING'
     RETURNING *`,
    [id]
  );

  if (claimed.rowCount !== 1) {
    return {
      success: false,
      message: "Proposal is not pending or does not exist"
    };
  }

  const proposal = claimed.rows[0];

  await db.query(
    `INSERT INTO approval_events
     (proposal_id, actor, action)
     VALUES ($1, 'local-reviewer', 'APPROVED')`,
    [id]
  );

  try {
    // Recheck immediately before creating.
    const existing = await findContactByEmail(
      proposal.email
    );

    const contactId = existing
      ? existing.id
      : (await createHubSpotContact({
          email: proposal.email,
          fullName: proposal.full_name
        })).id;

    const finalStatus = existing
      ? "ALREADY_EXISTS"
      : "CREATED";

    await db.query(
      `UPDATE contact_proposals
       SET status = $2,
           hubspot_contact_id = $3,
           completed_at = NOW()
       WHERE id = $1 AND status = 'PROCESSING'`,
      [id, finalStatus, contactId]
    );

    await db.query(
      `INSERT INTO approval_events
       (proposal_id, actor, action, details)
       VALUES ($1, 'SYSTEM', $2, $3)`,
      [
        id,
        finalStatus,
        JSON.stringify({ hubspotContactId: contactId })
      ]
    );

    return {
      success: true,
      status: finalStatus,
      hubspotContactId: contactId
    };

  } catch (error) {
    console.error("Approval execution failed:", error);

    // We don't know whether HubSpot completed the
    // external write before a network failure.
    // Therefore, do NOT automatically retry.
    await db.query(
      `UPDATE contact_proposals
       SET status = 'REQUIRES_RECONCILIATION'
       WHERE id = $1 AND status = 'PROCESSING'`,
      [id]
    );

    await db.query(
      `INSERT INTO approval_events
       (proposal_id, actor, action)
       VALUES ($1, 'SYSTEM', 'RECONCILIATION_REQUIRED')`,
      [id]
    );

    return {
      success: false,
      status: "REQUIRES_RECONCILIATION",
      message: "Check HubSpot and reconcile before retrying"
    };
  }
}

export async function rejectProposal(id: string) {
  const result = await db.query(
    `UPDATE contact_proposals
     SET status = 'REJECTED',
         reviewer_id = 'local-reviewer',
         reviewed_at = NOW()
     WHERE id = $1 AND status = 'PENDING'
     RETURNING id, status`,
    [id]
  );

  if (result.rowCount !== 1) {
    return null;
  }

  await db.query(
    `INSERT INTO approval_events
     (proposal_id, actor, action)
     VALUES ($1, 'local-reviewer', 'REJECTED')`,
    [id]
  );

  return result.rows[0];
}
