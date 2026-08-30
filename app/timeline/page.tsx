import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historical Timeline | Orunto Owu Abeokuta",
  description: "A timeline of key events in Owu history, Orunto traditions, and the founding of Abeokuta.",
};

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  era: string;
}

const EVENTS: TimelineEvent[] = [
  // Ancient
  { year: "c. 1100", title: "Founding of Ile-Ife", description: "Ile-Ife established as the spiritual centre of the Yoruba world, birthplace of Oduduwa and the cradle of Yoruba civilization.", era: "Ancient" },
  { year: "c. 1300", title: "Owu Kingdom Flourishes", description: "The Owu people establish a powerful kingdom known for skilled ironwork, weaving, and formidable warrior traditions.", era: "Ancient" },
  { year: "c. 1400", title: "Owu Warrior Culture Peaks", description: "Owu warriors become legendary across Yorubaland for their bravery, tactical brilliance, and distinctive war regalia (Agbo).", era: "Ancient" },

  // Pre-Colonial
  { year: "1821", title: "Owu War Begins", description: "The devastating Owu War erupts between Owu and neighbouring Yoruba states, compounded by Fulani raids from the north.", era: "Pre-Colonial" },
  { year: "1826", title: "Owu War Ends", description: "The war concludes with the dispersal of Owu communities across Yorubaland, creating the Owu Diaspora that spans present-day Nigeria.", era: "Pre-Colonial" },
  { year: "1830", title: "Egbas Migrate to Abeokuta", description: "Under the leadership of Sodeke (Shodeke), the Egba people migrate and settle under the shelter of Olumo Rock, founding Abeokuta.", era: "Pre-Colonial" },
  { year: "1843", title: "Christian Missionaries Arrive", description: "The Church Missionary Society (CMS) establishes a presence in Abeokuta, introducing Western education and Christianity.", era: "Pre-Colonial" },
  { year: "1846", title: "Abeokuta Kingdom Consolidates", description: "The different Egba groups (Owu, Oke-Ona, Gbagura) formalise their political structure with the Alake as paramount ruler.", era: "Pre-Colonial" },
  { year: "1851", title: "Abeokuta Repels Lagos Attack", description: "The people of Abeokuta successfully defend their city against an attack by the forces of the King of Lagos.", era: "Pre-Colonial" },
  { year: "1862", title: "British Bombardment of Lagos", description: "The British bombard and capture Lagos, beginning the process of British colonial expansion into Yorubaland.", era: "Pre-Colonial" },
  { year: "1864", title: "Ijaiye War Begins", description: "Conflict erupts between Abeokuta and Ibadan over control of Ijaiye, with Owu warriors playing significant roles.", era: "Pre-Colonial" },
  { year: "1877", title: "Ijaiye War Ends", description: "The war concludes with Ibadan's forces gaining control of Ijaiye, marking a shift in regional power dynamics.", era: "Pre-Colonial" },

  // Colonial
  { year: "1893", title: "British Protectorate", description: "Abeokuta comes under British protection through the Abeokuta Treaty, beginning the formal colonial period.", era: "Colonial" },
  { year: "1914", title: "Nigerian Amalgamation", description: "Sir Frederick Lugard amalgamates the Northern and Southern Protectorates, creating the Colony and Protectorate of Nigeria.", era: "Colonial" },
  { year: "1930", title: "Centenary Hall Built", description: "The historic Centenary Hall is constructed in Abeokuta to commemorate 100 years of Egba settlement under Olumo Rock.", era: "Colonial" },
  { year: "1942", title: "Adire Industry Thrives", description: "Abeokuta's Itoku Market becomes the epicentre of Adire (tie-and-dye) textile production, a cultural export known worldwide.", era: "Colonial" },

  // Modern
  { year: "1960", title: "Nigerian Independence", description: "Nigeria gains independence from Britain on October 1st. Abeokuta becomes part of the Western Region.", era: "Modern" },
  { year: "1967", title: "State Creation", description: "Nigeria is reorganised into 12 states. Abeokuta becomes part of the Western State.", era: "Modern" },
  { year: "1976", title: "Ogun State Created", description: "Ogun State is created from the old Western State, with Abeokuta as its capital. Named after the Ogun River.", era: "Modern" },
  { year: "1977", title: "FESTAC '77", description: "The Second World Black and African Festival of Arts and Culture (FESTAC) is held in Nigeria, showcasing Yoruba and Owu cultural heritage to the world.", era: "Modern" },
  { year: "2000", title: "Digital Age Dawns", description: "Abeokuta embraces the digital era while maintaining its rich cultural heritage. New media begins documenting Owu traditions.", era: "Modern" },
  { year: "2023", title: "Orunto Owu Abeokuta Founded", description: "The Orunto Owu Abeokuta platform is established to preserve, document, and share Owu heritage, Orunto traditions, and Abeokuta's rich history with the world.", era: "Modern" },
];

const eras = [...new Set(EVENTS.map((e) => e.era))];

export default function TimelinePage() {
  return (
    <div className="container">
      <section className="section">
        <div className="section-head">
          <h1>Historical Timeline</h1>
        </div>
        <p style={{ fontSize: 15, color: "#666", marginBottom: 40 }}>
          A journey through the key events that shaped Orunto, Owu heritage, and the city of Abeokuta.
        </p>

        <div className="timeline">
          {eras.map((era) => {
            const eraEvents = EVENTS.filter((e) => e.era === era);
            return (
              <div key={era} className="timeline-era">
                <h2 className="timeline-era-title">{era}</h2>
                {eraEvents.map((event, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <span className="timeline-year">{event.year}</span>
                      <h3 className="timeline-event-title">{event.title}</h3>
                      <p className="timeline-desc">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
