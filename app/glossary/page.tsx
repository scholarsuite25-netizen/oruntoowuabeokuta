import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary | Orunto Owu Abeokuta",
  description: "Key terms related to Orunto tradition, Owu heritage, and Abeokuta history.",
};

interface Term {
  term: string;
  definition: string;
  category: string;
}

const TERMS: Term[] = [
  // Orunto
  { term: "Orunto", definition: "The traditional cultural and spiritual system of the Owu people, encompassing governance, customs, rites of passage, and communal ceremonies that preserve social order and ancestral connections.", category: "Orunto" },
  { term: "Oluwo", definition: "The traditional ruler or king of an Owu community. The Oluwo serves as the spiritual and political head, custodian of traditions, and mediator between the living and ancestors.", category: "Orunto" },
  { term: "Igbona", definition: "A senior chief or elder in the Owu traditional council. Igbona titles are earned through service, wisdom, and contribution to community welfare.", category: "Orunto" },
  { term: "Igbeyawo", definition: "Traditional Owu marriage ceremony, involving elaborate negotiations between families, bride price (ewe), and communal celebrations that unite two families.", category: "Orunto" },
  { term: "Isedayo", definition: "The traditional Owu funeral rites that honour the deceased and ensure their peaceful transition to the ancestral realm. Includes specific rituals, libations, and communal mourning.", category: "Orunto" },
  { term: "Egungun", definition: "Masquerade festival honouring ancestors. In Owu tradition, Egungun ceremonies feature elaborate costumes, drumming, and dancing, serving as a bridge between the living and the dead.", category: "Orunto" },
  { term: "Aro", definition: "A traditional Owu healing and divination practice involving spiritual consultation, herbal medicine, and ritual cleansing to restore balance and health.", category: "Orunto" },
  { term: "Omo Onile", definition: "Children of the land — a term referring to indigenous community members with ancestral claims and responsibilities to the land and its traditions.", category: "Orunto" },

  // Owu
  { term: "Owu", definition: "One of the original Yoruba ethnic groups, historically known as formidable warriors. The Owu people have a distinct dialect, customs, and a proud heritage tracing back to ancient Ile-Ife.", category: "Owu" },
  { term: "Owu War", definition: "The devastating conflict (1821-1826) between Owu and other Yoruba states, combined with Fulani raids, that led to the dispersal of Owu communities across present-day Nigeria and beyond.", category: "Owu" },
  { term: "Owu Diaspora", definition: "The scattered Owu communities established after the Owu War, found across Yorubaland, parts of northern Nigeria, and even in Sierra Leone and other West African countries.", category: "Owu" },
  { term: "Ijaiye War", definition: "The prolonged conflict (1860s-1870s) over the ruins of Ijaiye, fought between the forces of Abeokuta and Ibadan, with Owu warriors playing significant roles.", category: "Owu" },
  { term: "Owu Dialect", definition: "The distinct Yoruba dialect spoken by the Owu people, featuring unique vocabulary, tonal patterns, and expressions that differentiate it from standard Yoruba.", category: "Owu" },
  { term: "Agbo", definition: "Traditional Owu warrior regalia and insignia, symbolizing military prowess and courage. Passed down through families as heritage items.", category: "Owu" },

  // Abeokuta
  { term: "Abeokuta", definition: 'Meaning "Under the Rock" in Yoruba, referring to the city built under Olumo Rock. Founded in the 1830s as a fortress against slave raiders, now the capital of Ogun State.', category: "Abeokuta" },
  { term: "Olumo Rock", definition: "The sacred granite rock formation that served as a natural fortress for the early settlers of Abeokuta. It is a major historical landmark and tourist attraction.", category: "Abeokuta" },
  { term: "Sodeke", definition: "Also spelled Shodeke, the legendary Egba warrior-leader who led the migration to Abeokuta and united the Egbas under the shelter of Olumo Rock.", category: "Abeokuta" },
  { term: "Egba", definition: "The dominant ethnic group of Abeokuta, comprising several sub-groups (Owu, Oke-Ona, Gbagura, Protos) who settled together under Sodeke's leadership.", category: "Abeokuta" },
  { term: "Alake", definition: "The paramount ruler of the Egba people, based in Abeokuta. The Alake's palace (Ake Palace) is a major historical and cultural site.", category: "Abeokuta" },
  { term: "Itoku Market", definition: "Historic market in Abeokuta famous for Adire (tie-and-dye) fabric production, a centuries-old textile art form that is a cultural icon of the city.", category: "Abeokuta" },
  { term: "Adire", definition: "Traditional Yoruba tie-and-dye textile art, particularly associated with Abeokuta's Itoku Market. Features indigo-dyed patterns on cotton fabric using various resist techniques.", category: "Abeokuta" },
  { term: "Centenary Hall", definition: "Historic hall in Abeokuta built in 1930 to commemorate 100 years of Egba settlement. It serves as a venue for important cultural and political events.", category: "Abeokuta" },
  { term: "Ake Festival", definition: "Annual cultural festival held in the Ake area of Abeokuta, featuring traditional performances, art exhibitions, and celebrations of Egba heritage.", category: "Abeokuta" },
  { term: "Igan festival", definition: "The grand festival of the Gbagura quarter of Abeokuta, featuring colourful processions, traditional music, and celebrations of community identity.", category: "Abeokuta" },
  { term: "Ogun State", definition: "Nigerian state created in 1976, with Abeokuta as its capital. Named after the Ogun River, it is known for its rich cultural heritage and proximity to Lagos.", category: "Abeokuta" },

  // General
  { term: "Yoruba", definition: "One of the largest ethnic groups in West Africa, with a rich cultural tradition spanning language, religion, art, and political systems across Nigeria, Benin, and Togo.", category: "General" },
  { term: "Ile-Ife", definition: "The ancient Yoruba city regarded as the spiritual birthplace of the Yoruba people and the seat of Oduduwa, the progenitor of the Yoruba race.", category: "General" },
  { term: "Oodua/Oduduwa", definition: "The legendary ancestor and founder of the Yoruba race. All Yoruba kings trace their lineage to Oduduwa through Ile-Ife.", category: "General" },
  { term: "Ori", definition: "In Yoruba cosmology, the personal divinity or inner consciousness. 'Ori' literally means 'head' and represents one's destiny, character, and spiritual essence.", category: "General" },
  { term: "Ase/Ache", definition: "The divine power or life force in Yoruba tradition. Ase is the energy that makes things happen — the power of speech, blessing, and manifestation.", category: "General" },
];

const categories = [...new Set(TERMS.map((t) => t.category))];

export default function GlossaryPage() {
  return (
    <div className="container">
      <section className="section">
        <div className="section-head">
          <h1>Glossary</h1>
        </div>
        <p style={{ fontSize: 15, color: "#666", marginBottom: 32 }}>
          Key terms related to Orunto tradition, Owu heritage, and the historic city of Abeokuta.
        </p>

        {categories.map((cat) => {
          const catTerms = TERMS.filter((t) => t.category === cat);
          return (
            <div key={cat} className="glossary-section">
              <h2 className="glossary-category">{cat}</h2>
              <div className="glossary-list">
                {catTerms.map((item) => (
                  <div key={item.term} className="glossary-item">
                    <dt className="glossary-term">{item.term}</dt>
                    <dd className="glossary-def">{item.definition}</dd>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
