"use client";

import { useState } from "react";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
}

const SAMPLE_EVENTS: Event[] = [
  {
    id: 1,
    title: "Owu Day Celebration",
    date: "2026-03-15",
    location: "Abeokuta, Ogun State",
    description: "Annual celebration of Owu heritage featuring traditional dances, music, and cultural exhibitions. A gathering of Owu descendants from across Nigeria and the diaspora.",
    category: "Festival",
  },
  {
    id: 2,
    title: "Orunto Cultural Festival",
    date: "2026-06-20",
    location: "Abeokuta, Ogun State",
    description: "A grand festival showcasing Orunto traditions, including masquerade performances (Egungun), traditional Owu cuisine, and storytelling sessions by community elders.",
    category: "Festival",
  },
  {
    id: 3,
    title: "Adire Art Exhibition",
    date: "2026-04-10",
    location: "Itoku Market, Abeokuta",
    description: "Exhibition and workshop on traditional Adire textile art. Learn the ancient tie-and-dye techniques that have made Abeokuta famous worldwide.",
    category: "Workshop",
  },
  {
    id: 4,
    title: "Owu Heritage Lecture Series",
    date: "2026-05-08",
    location: "Ake, Abeokuta",
    description: "Academic and cultural lecture series exploring Owu history, migration patterns, and contributions to Yoruba civilization. Open to researchers and the public.",
    category: "Lecture",
  },
  {
    id: 5,
    title: "Olumo Rock Cultural Walk",
    date: "2026-07-12",
    location: "Olumo Rock, Abeokuta",
    description: "Guided cultural walk through the historic Olumo Rock, exploring the caves, shrines, and monuments that tell the story of Abeokuta's founding.",
    category: "Tour",
  },
  {
    id: 6,
    title: "Egungun Festival",
    date: "2026-08-01",
    location: "Various locations, Abeokuta",
    description: "Traditional Egungun masquerade festival honouring ancestors. Features elaborate costumes, drumming, and dancing across different quarters of Abeokuta.",
    category: "Festival",
  },
];

const CATEGORIES = ["All", "Festival", "Workshop", "Lecture", "Tour"];

export default function EventsPage() {
  const [filter, setFilter] = useState("All");

  const events =
    filter === "All"
      ? SAMPLE_EVENTS
      : SAMPLE_EVENTS.filter((e) => e.category === filter);

  return (
    <div className="container">
      <section className="section">
        <div className="section-head">
          <h1>Events</h1>
        </div>
        <p style={{ fontSize: 15, color: "#666", marginBottom: 24 }}>
          Upcoming cultural events, festivals, and activities celebrating Owu heritage and Orunto traditions.
        </p>

        <div className="filter-group" style={{ marginBottom: 28 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={filter === cat ? "active" : ""}
            >
              {cat}
            </button>
          ))}
        </div>

        {events.length > 0 ? (
          <div className="events-grid">
            {events.map((event) => {
              const d = new Date(event.date);
              return (
                <div key={event.id} className="event-card">
                  <div className="event-date-badge">
                    <span className="event-day">{d.getDate()}</span>
                    <span className="event-month">
                      {d.toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                  </div>
                  <div className="event-info">
                    <span className="event-category">{event.category}</span>
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-location">{event.location}</p>
                    <p className="event-desc">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">No upcoming events in this category.</div>
        )}
      </section>
    </div>
  );
}
