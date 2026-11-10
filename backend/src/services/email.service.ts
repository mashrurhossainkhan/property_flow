import nodemailer from "nodemailer";

const recipient = "mashrurhossaink@gmail.com";

export type EmailNotification = {
  status: "sent" | "failed" | "not_configured";
  recipient: string;
  message: string;
};

export async function emailAgentResult(result: unknown): Promise<EmailNotification> {
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASSWORD;
  if (!user || !password) {
    return {
      status: "not_configured", recipient,
      message: "SMTP email is not configured. Set SMTP_USER and SMTP_APP_PASSWORD in the backend."
    };
  }

  const port = Number(process.env.SMTP_PORT || 465);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { status: "not_configured", recipient, message: "SMTP_PORT must be a valid port number." };
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass: password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true
  });

  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || { name: "PropertyFlow AI", address: user },
      to: recipient,
      subject: "PropertyFlow AI - Lead agent result",
      text: [
        "PropertyFlow AI has completed a lead analysis.",
        "Review the lead and CRM result below.",
        JSON.stringify(result, null, 2)
      ].join("\n\n")
    });
    if (!info.accepted?.some((address) => String(address).toLowerCase() === recipient)) {
      return { status: "failed", recipient, message: "Agent completed, but the SMTP server did not accept the recipient." };
    }
    return { status: "sent", recipient, message: "Result accepted by the SMTP server for email delivery." };
  } catch (error) {
    const code = (error as { code?: string }).code;
    console.error("Agent SMTP notification failed:", code || "SMTP_ERROR");
    return {
      status: "failed", recipient,
      message: code === "EAUTH"
        ? "Agent completed, but SMTP authentication failed. Check SMTP_USER and your app password."
        : "Agent completed, but email delivery could not be confirmed. Check SMTP settings and your inbox before retrying."
    };
  } finally {
    transport.close();
  }
}
