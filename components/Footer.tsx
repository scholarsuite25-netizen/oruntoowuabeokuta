import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import SubscribeForm from "@/components/SubscribeForm";

const LOGO = "/images/logo.png";
const CALL = "tel:+2348037171759";
const WA = "https://wa.me/2348027191291";
const DWC = "https://digitalwealthcreators.com.ng";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Newsletter band */}
        <div className="footer-news">
          <div className="fn-text">
            <h4>Subscribe for News Updates</h4>
            <p>Get the latest creative news from Orunto Owu Abeokuta.</p>
          </div>
          <SubscribeForm />
        </div>

        {/* Social icons row — one WhatsApp here */}
        <div className="footer-social-bar">
          <a href={WA} aria-label="WhatsApp">
            WhatsApp
          </a>
        </div>

        {/* Main 5-column grid */}
        <div className="footer-top">
          {/* Column 1: Coverage Areas (part 1) */}
          <div className="footer-col">
            <h4>Coverage Areas</h4>
            <Link href="/category/orunto">Orunto</Link>
            <Link href="/category/owu">Owu</Link>
            <Link href="/category/abeokuta">Abeokuta</Link>
            <Link href="/category/sixthsense">SixthSense</Link>
            <Link href="/category/publication">Publication</Link>
            <Link href="/category/personalities">Personalities</Link>
            <Link href="/category/news">News</Link>
          </div>

          {/* Column 2: Coverage Areas (part 2) */}
          <div className="footer-col">
            <h4>Coverage Areas</h4>
            <Link href="/category/entertainment">Entertainment</Link>
            <Link href="/category/owu-people">Owu People</Link>
            <Link href="/category/culturee">Culture</Link>
            <Link href="/category/corporate-spotlight">Corporate Spotlight</Link>
            <Link href="/category/trending-news">Trending News</Link>
            <Link href="/category/featured">Featured News</Link>
            <Link href="/services">Services</Link>
          </div>

          {/* Column 3: Services — all point to /services */}
          <div className="footer-col">
            <h4>Services</h4>
            <Link href="/services">Event Planning</Link>
            <Link href="/services">Media Consultation</Link>
            <Link href="/services">Book Publications</Link>
            <Link href="/services">Heritage Advocacy</Link>
            <Link href="/services">The SixthSense Initiative</Link>
            <Link href="/services">Work With Us</Link>
          </div>

          {/* Column 4: Brand + Legal + Copyright */}
          <div className="footer-col">
            <div className="footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="Orunto Owu Abeokuta" />
              <h4>Orunto Owu Abeokuta</h4>
              <p>
                Tradition, culture and news from the Owu Kingdom, Abeokuta and
                the wider Yoruba world.
              </p>
            </div>
            <div className="footer-legal">
              <Link href="/page/about">Privacy Policy</Link>
              <Link href="/page/about">Terms</Link>
              <Link href="/page/about">Accessibility</Link>
            </div>
            <div className="footer-dwc">
              © {year} Orunto Owu Abeokuta.{" "}
              <a href={DWC} target="_blank" rel="noopener noreferrer">
                Designed by Digital Wealth Creators
              </a>
            </div>
          </div>

          {/* Column 5: Contact — one WhatsApp here (text link) */}
          <div className="footer-col footer-contact">
            <h4>Contact</h4>
            <p>
              📍 Agbole Orunto, Oke Ago-Owu, Abeokuta, Ogun State
            </p>
            <p>
              <a href={CALL}>📞 +234 803 717 1759</a>
            </p>
            <p>
              <a href={WA}>💬 WhatsApp: +234 802 719 1291</a>
            </p>
            <div className="footer-actions">
              <a href={CALL}>Call Now</a>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </footer>
  );
}
