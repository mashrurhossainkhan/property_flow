import type { Metadata } from "next";
import ContactForm from "./contact-form";
export const metadata: Metadata = { title: "Contact Us", description: "Share your property enquiry with PropertyFlow." };
export default function ContactPage() {
  return <main className="section-shell contact-layout"><section className="contact-intro"><p className="eyebrow">CONTACT PROPERTYFLOW</p><h1>Let’s talk about<br /><span>your next move.</span></h1><p>Have a property in mind or a question to explore? Share a few details and tell us how we can help.</p><div className="contact-aside"><h2>A little context goes a long way.</h2><p>Include your preferred location, budget, and timeline if you have them. It helps us understand what matters to you.</p></div></section><ContactForm /></main>;
}
