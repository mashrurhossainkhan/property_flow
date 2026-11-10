# Agent result emails over SMTP

After a successful POST to `/api/leads/agent`, the backend sends the complete
agent result as plain text to `mashrurhossaink@gmail.com`. The API returns email
status in `notification` independently of the successful lead/HubSpot result.
The agent page already displays this status.

Add these settings to the ignored `backend/.env`:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-sending-account@gmail.com
SMTP_APP_PASSWORD=your-app-password
# Optional: defaults to PropertyFlow AI with SMTP_USER as the sender
# EMAIL_FROM=PropertyFlow AI <your-sending-account@gmail.com>
```

Existing SMTP_USER and SMTP_APP_PASSWORD settings are used automatically.
SMTP_PASSWORD is also supported as an alternative to SMTP_APP_PASSWORD.
Use the sending provider's app password or SMTP credential. Restart the backend
after editing `.env`. Never put these credentials in frontend configuration.

Port 465 uses TLS immediately. Other ports (normally 587) require STARTTLS.
The host defaults to smtp.gmail.com and the port defaults to 465.
No automatic send retries occur: an interrupted SMTP exchange may still have
delivered the message. Check your inbox before rerunning the agent.
A `sent` status means SMTP acceptance, not confirmed inbox delivery.

Reference: https://nodemailer.com/smtp
