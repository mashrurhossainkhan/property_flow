import { Router } from "express";
import { qualifyLead } from "../agents/lead.agent";
import { runLeadAgent } from "../agents/tool-calling.agent";
import { emailAgentResult } from "../services/email.service";

const router = Router();

router.post("/qualify", async (req, res) => {
  try {
    const { message } = req.body ?? {};

    if (
      typeof message !== "string" ||
      message.trim().length < 10 ||
      message.length > 5000
    ) {
      res.status(400).json({
        success: false,
        error: "Message must contain 10–5000 characters"
      });
      return;
    }

    const result = await qualifyLead(message);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error("Lead qualification failed:", error);

    res.status(502).json({
      success: false,
      error: "Unable to qualify lead"
    });
  }
});

router.post("/agent", async (req, res) => {
  try {
    const { message } = req.body ?? {};

    if (
      typeof message !== "string" ||
      message.trim().length < 10 ||
      message.length > 5000
    ) {
      res.status(400).json({
        success: false,
        error: "Message must contain 10–5000 characters"
      });
      return;
    }

    const result = await runLeadAgent(message);
    const notification = await emailAgentResult(result);

    res.json({
      success: true,
      result,
      notification
    });

  } catch (error) {
    console.error("AI Agent failed:", error);

    res.status(502).json({
      success: false,
      error: "AI Agent execution failed"
    });
  }
});

export default router;
