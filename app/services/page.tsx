import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Orunto Owu Abeokuta",
  description:
    "Expert programme and event planning, media consultation, book publications, and cultural advocacy from Orunto Owu Abeokuta.",
};

const CALL = "tel:+2348037171759";
const WA = "https://wa.me/2348027191291";

const services = [
  {
    title: "Expert Programme and Event Planning",
    desc: "Our team excels in crafting innovative programmes and events that surpass expectations.",
    features: [
      "Concept development — creating novel ideas and products that support human aspirations",
      "Customized solutions — designing unique concepts tailored to meet specific objectives",
      "Strategic planning — transforming ideas into actionable plans, from inception to execution",
    ],
    differentiators: [
      "Originality — we develop fresh, bespoke ideas rather than replicating existing concepts",
      "Creativity — our team thinks outside the box to deliver exceptional results",
      "Attention to detail — we meticulously plan and execute every aspect",
    ],
  },
  {
    title: "Media Consultation",
    desc: "A versatile media career spanning broadcasting, print, and social media.",
    features: [
      "Broadcasting — TV and Radio production and presentation",
      "Print — publications and literature",
      "Social Media — pioneering the future of digital media",
    ],
    differentiators: [
      "Craft compelling content strategies",
      "Develop innovative media solutions",
      "Enhance your brand's media presence",
    ],
  },
  {
    title: "Books and Magazines Publications",
    desc: "The Sixth Sense Series Publications has been a trusted partner in the publishing industry for over two decades, since 2000.",
    features: [
      "Expert guidance and editorial support",
      "Professional publishing services",
      "Global distribution networks",
    ],
    differentiators: [],
  },
  {
    title: "Advocacies and Humanity Services",
    desc: "Lassa Fever is a killer disease — we must stop it. Let's make our children read, again!",
    features: [
      "Public health awareness campaigns",
      "Promotion of children's reading culture",
      "Community engagement and education",
    ],
    differentiators: [],
  },
  {
    title: "Promote and Preserve Our Heritage",
    desc: "Using culture, customs, and traditions to teach life — fostering innovations within tradition while safeguarding heritage values.",
    features: [
      "Cultural documentation and preservation",
      "Heritage education programmes",
      "Community heritage events",
    ],
    differentiators: [],
  },
  {
    title: "The SixthSense Initiative",
    desc: "Promoting literacy and reading culture with passion — encouraging critical thinking, creativity, and morals in young ones.",
    features: [
      "Youth literacy programmes",
      "Critical thinking and creativity workshops",
      "Moral and character development",
    ],
    differentiators: [],
  },
];

export default function ServicesPage() {
  return (
    <div className="container">
      <div className="article" style={{ marginTop: 28 }}>
        <span className="cat">Services</span>
        <h1>Our Services</h1>
        <p className="meta">
          Expert programme and event planning, media consultation, book
          publications, and cultural advocacy — serving the Owu Kingdom,
          Abeokuta, and the wider Yoruba world.
        </p>

        <div className="prose" style={{ marginTop: 24 }}>
          {services.map((s) => (
            <section key={s.title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 22 }}>{s.title}</h2>
              <p>{s.desc}</p>
              {s.features.length > 0 && (
                <>
                  <h3 style={{ fontSize: 17, marginTop: 14 }}>What we offer</h3>
                  <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                    {s.features.map((f) => (
                      <li key={f} style={{ marginBottom: 6 }}>
                        {f}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {s.differentiators.length > 0 && (
                <>
                  <h3 style={{ fontSize: 17, marginTop: 14 }}>
                    What sets us apart
                  </h3>
                  <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                    {s.differentiators.map((d) => (
                      <li key={d} style={{ marginBottom: 6 }}>
                        {d}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          ))}
        </div>

        <div
          style={{
            background: "var(--red)",
            color: "#fff",
            borderRadius: 12,
            padding: 28,
            marginTop: 20,
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#fff", fontSize: 22, marginBottom: 8 }}>
            Ready to Get Started?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.85)",
              marginBottom: 18,
              fontSize: 15,
            }}
          >
            Contact us today to discuss your project, event, or publishing
            needs.
          </p>
          <div
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a
              href={CALL}
              style={{
                background: "#fff",
                color: "var(--red)",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              📞 Call Us
            </a>
            <a
              href={WA}
              style={{
                background: "#25D366",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
