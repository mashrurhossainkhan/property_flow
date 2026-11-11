"use client";
import { useState, type FormEvent } from "react";
import { API_BASE_URL } from "@/lib/api";
export default function ContactForm() {
  const [enquiry, setEnquiry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const message = enquiry.trim();
  const tooLong = message.length > 5000;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (message.length < 10 || tooLong) {
      setError("Enter an enquiry between 10 and 5,000 characters, excluding leading and trailing spaces.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/agent`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      if (!response.ok) throw new Error("Submission failed");
      const result: { success?: boolean } = await response.json();
      if (result.success !== true) throw new Error("Submission failed");
      setSubmitted(true);
    } catch { setError("We couldn’t process your enquiry. Please try again. Your details are still here."); }
    finally { setLoading(false); }
  }
  if (submitted) return <section className="contact-form success-panel" role="status"><span className="success-icon" aria-hidden="true">&#10003;</span><h2>Thank you for your enquiry.</h2><p>Your enquiry has been processed. We appreciate you sharing the details with PropertyFlow.</p><button type="button" className="button-secondary" onClick={() => { setSubmitted(false); setEnquiry(""); }}>Send another enquiry</button></section>;
  return <form onSubmit={submit} className="contact-form" aria-busy={loading}><h2>How can we help?</h2><p className="form-description">Describe your enquiry in your own words. Gemini extracts the relevant property details.</p><fieldset disabled={loading}>
    <label htmlFor="contact-enquiry">Your enquiry *</label><textarea id="contact-enquiry" name="enquiry" required minLength={10} maxLength={5000} value={enquiry} onChange={e => setEnquiry(e.target.value)} placeholder="Tell us what you’re looking for…" aria-describedby="message-limit" aria-invalid={tooLong || undefined} />
    <p id="message-limit" className={`field-hint${tooLong ? " field-error" : ""}`}>{message.length.toLocaleString()} / 5,000 characters. Minimum 10 characters, excluding leading and trailing spaces.</p><button type="submit" disabled={loading || tooLong} className="button-primary submit-button">{loading ? "Processing enquiry…" : "Send enquiry"}</button>
  </fieldset>{error && <p role="alert" className="form-error">{error}</p>}<p className="form-note" role="status">{loading ? "Your enquiry is being processed. This may take a moment." : "Please share only the details needed for your enquiry."}</p></form>;
}
