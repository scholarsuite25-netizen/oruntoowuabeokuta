"use client";

import { useState } from "react";

type FormType = "member" | "volunteer" | "partner";

const FORM_LABELS: Record<FormType, { title: string; desc: string }> = {
  member: {
    title: "Become a Member",
    desc: "Join the Orunto Owu Abeokuta community and help preserve our heritage.",
  },
  volunteer: {
    title: "Volunteer With Us",
    desc: "Contribute your time and skills to support Owu cultural initiatives.",
  },
  partner: {
    title: "Partner / Sponsor",
    desc: "Collaborate with us on cultural events, publications, and projects.",
  },
};

export default function JoinPage() {
  const [formType, setFormType] = useState<FormType>("member");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      form_type: formType,
      full_name: data.get("full_name"),
      email: data.get("email"),
      phone: data.get("phone"),
      location: data.get("location"),
      message: data.get("message"),
    };

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="join-page">
        <div className="join-card">
          <div className="join-success">
            <span className="join-success-icon">✓</span>
            <h2>Thank You!</h2>
            <p>
              Your {FORM_LABELS[formType].title.toLowerCase()} application has
              been received. We will contact you at the email address provided.
            </p>
            <p className="join-success-note">
              Check your inbox for a confirmation email.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormKey((k) => k + 1);
              }}
              className="join-btn"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="join-page">
      <div className="join-hero">
        <h1>Join Us</h1>
        <p>
          Be part of the movement to preserve and promote the rich heritage of
          the Owu people, the Orunto tradition, and the historic city of
          Abeokuta.
        </p>
      </div>

      <div className="join-type-selector">
        {(Object.keys(FORM_LABELS) as FormType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFormType(type)}
            className={`join-type-btn ${formType === type ? "active" : ""}`}
          >
            {FORM_LABELS[type].title}
          </button>
        ))}
      </div>

      <div className="join-card">
        <div className="join-card-header">
          <h2>{FORM_LABELS[formType].title}</h2>
          <p>{FORM_LABELS[formType].desc}</p>
        </div>

        <form key={formKey} onSubmit={handleSubmit} className="join-form">
          <div className="join-field">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="join-field">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="join-field">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+234 xxx xxx xxxx"
            />
          </div>

          <div className="join-field">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="City, State, Country"
            />
          </div>

          <div className="join-field">
            <label htmlFor="message">
              {formType === "member"
                ? "Why do you want to join?"
                : formType === "volunteer"
                ? "What skills can you contribute?"
                : "How would you like to partner?"}
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          {error && <div className="join-error">{error}</div>}

          <button type="submit" className="join-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

      <div className="join-contact-info">
        <h3>Other Ways to Reach Us</h3>
        <div className="join-contact-grid">
          <div className="join-contact-item">
            <strong>Phone</strong>
            <a href="tel:+2348037171759">+234 803 717 1759</a>
          </div>
          <div className="join-contact-item">
            <strong>WhatsApp</strong>
            <a href="https://wa.me/2348027191291">+234 802 719 1291</a>
          </div>
          <div className="join-contact-item">
            <strong>Email</strong>
            <a href="mailto:info@oruntoowuabeokuta.org.ng">
              info@oruntoowuabeokuta.org.ng
            </a>
          </div>
          <div className="join-contact-item">
            <strong>Address</strong>
            <span>Agbole Orunto, Oke Ago-Owu, Abeokuta, Ogun State</span>
          </div>
        </div>
      </div>
    </div>
  );
}
