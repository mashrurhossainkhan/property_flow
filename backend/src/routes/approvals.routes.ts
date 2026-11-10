import { Router } from "express";
import { z } from "zod";

import { reviewerAuth } from "../middleware/reviewer-auth";
import { db } from "../services/db.service";

import {
  createProposal,
  approveProposal,
  rejectProposal
} from "../services/approval.service";

const router = Router();

router.use(reviewerAuth);

const proposalSchema = z.object({
  email: z.string().email(),
  fullName: z.string().nullable(),
  budget: z.number().nonnegative().nullable(),
  location: z.string().nullable(),
  timeline: z.string().nullable(),
  intent: z.enum([
    "investment",
    "owner_occupier",
    "unknown"
  ]),
  summary: z.string().min(1)
});

// Create a pending proposal
router.post("/", async (req, res) => {
  const parsed = proposalSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid proposal data"
    });
    return;
  }

  try {
    const result = await createProposal(parsed.data);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to create proposal" });
  }
});

// List all proposals
router.get("/", async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM contact_proposals
       ORDER BY created_at DESC LIMIT 100`
    );

    res.json({ proposals: result.rows });
  } catch {
    res.status(500).json({ error: "Unable to list proposals" });
  }
});

// Approve a proposal
router.post("/:id/approve", async (req, res) => {
  if (!z.string().uuid().safeParse(req.params.id).success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  try {
    const result = await approveProposal(req.params.id);

    res.status(result.success ? 200 : 409).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Approval failed" });
  }
});

// Reject a proposal
router.post("/:id/reject", async (req, res) => {
  if (!z.string().uuid().safeParse(req.params.id).success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  try {
    const result = await rejectProposal(req.params.id);

    if (!result) {
      res.status(409).json({
        error: "Proposal is not pending or does not exist"
      });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({ error: "Rejection failed" });
  }
});

export default router;
