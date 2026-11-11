"use client";
import { useState, type FormEvent } from "react";
import { API_BASE_URL } from "@/lib/api";
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enquiry, setEnquiry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const message = `Name: ${name.trim()}\nEmail: ${email.trim()}${phone.trim() ? `\nPhone: ${phone.trim()}` : ""}\nEnquiry: ${enquiry.trim()}`;
  const tooLong = message.length > 5000;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!name.trim() || !email.trim() || enquiry.trim().length < 10 || tooLong) {
      setError("Enter your name, a valid email, and an enquiry of at least 10 non-space characters. Keep the complete submission within 5,000 characters.");
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
  if (submitted) return <section className="contact-form success-panel" role="status"><span className="success-icon" aria-hidden="true">&#10003;</span><h2>Thank you for your enquiry.</h2><p>Your enquiry has been processed. We appreciate you sharing the details with PropertyFlow.</p><button type="button" className="button-secondary" onClick={() => { setSubmitted(false); setName(""); setEmail(""); setPhone(""); setEnquiry(""); }}>Send another enquiry</button></section>;
  return <form onSubmit={submit} className="contact-form" aria-busy={loading}><h2>How can we help?</h2><p className="form-description">Fields marked with * are required.</p><fieldset disabled={loading}>
    <label htmlFor="contact-name">Full name *</label><input id="contact-name" name="name" autoComplete="name" required maxLength={200} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
    <label htmlFor="contact-email">Email address *</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
    <label htmlFor="contact-phone">Phone number <span className="optional">(optional)</span></label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={50} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" />
    <label htmlFor="contact-enquiry">Your enquiry *</label><textarea id="contact-enquiry" name="enquiry" required minLength={10} maxLength={5000} value={enquiry} onChange={e => setEnquiry(e.target.value)} placeholder="Tell us what you’re looking for…" aria-describedby="message-limit" aria-invalid={tooLong || undefined} />
    <p id="message-limit" className={`field-hint${tooLong ? " field-error" : ""}`}>{message.length.toLocaleString()} / 5,000 characters including contact details. Enquiry must contain at least 10 non-space characters.</p><button type="submit" disabled={loading || tooLong} className="button-primary submit-button">{loading ? "Processing enquiry…" : "Send enquiry"}</button>
  </fieldset>{error && <p role="alert" className="form-error">{error}</p>}<p className="form-note" role="status">{loading ? "Your enquiry is being processed. This may take a moment." : "Please share only the details needed for your enquiry."}</p></form>;
}
