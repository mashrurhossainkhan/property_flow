import { Router } from "express";
import { getHubSpotContacts, markContactHumanReviewed } from "../services/hubspot.service";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const data = await getHubSpotContacts();

    res.json({
      success: true,
      contacts: data.results,
      nextCursor: data.paging?.next?.after ?? null
    });
  } catch (error) {
    console.error("HubSpot contacts request failed:", error);

    res.status(502).json({
      success: false,
      message: "Unable to retrieve HubSpot contacts"
    });
  }
});

router.patch("/:id/human-review", async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    res.status(400).json({ success: false, message: "Invalid contact ID" });
    return;
  }
  try {
    const contact = await markContactHumanReviewed(req.params.id);
    res.json({ success: true, contact });
  } catch (error) {
    console.error("HubSpot human review update failed:", error);
    res.status(502).json({ success: false, message: "Unable to mark contact as reviewed" });
  }
});

export default router;
