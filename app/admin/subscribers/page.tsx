"use client";

import { useState, useEffect } from "react";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  active: boolean;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    const res = await fetch("/api/subscribers");
    const data = await res.json();
    setSubscribers(data.subscribers || []);
    setLoading(false);
  }

  async function toggleActive(id: number, current: boolean) {
    await fetch("/api/subscribers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !current }),
    });
    fetchSubscribers();
  }

  if (loading) return <div className="admin-content">Loading...</div>;

  const active = subscribers.filter((s) => s.active).length;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Subscribers</h1>
        <a href="/admin/newsletter" className="btn-primary">
          Send Newsletter
        </a>
      </div>

      <div className="admin-info">
        {active} active subscriber{active !== 1 ? "s" : ""} /{" "}
        {subscribers.length} total
      </div>

      {subscribers.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <strong>{sub.email}</strong>
                </td>
                <td>{sub.name || "-"}</td>
                <td>
                  <button
                    onClick={() => toggleActive(sub.id, sub.active)}
                    className={`badge ${sub.active ? "badge-published" : "badge-archived"}`}
                  >
                    {sub.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>
                  {new Date(sub.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          No subscribers yet. The subscribe form is in the site footer.
        </div>
      )}
    </div>
  );
}
