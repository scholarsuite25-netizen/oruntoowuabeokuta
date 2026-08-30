"use client";

import { useState, useEffect } from "react";

interface Settings {
  site_title: string;
  site_description: string;
  site_url: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_whatsapp: string;
  default_category: string;
  posts_per_page: string;
  enable_comments: string;
  enable_newsletter: string;
}

const DEFAULTS: Settings = {
  site_title: "Orunto Owu Abeokuta",
  site_description: "Tradition, Culture & News",
  site_url: "https://oruntoowuabeokuta.org.ng",
  social_facebook: "",
  social_twitter: "",
  social_instagram: "",
  social_whatsapp: "+2348027191291",
  default_category: "",
  posts_per_page: "20",
  enable_comments: "true",
  enable_newsletter: "true",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings({ ...DEFAULTS, ...data.settings });
      }
    } catch {
      // Use defaults
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateSetting(key: keyof Settings, value: string) {
    setSettings({ ...settings, [key]: value });
  }

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-content">
      <h1>Settings</h1>

      <div className="settings-grid">
        <section className="settings-section">
          <h2>General</h2>
          <div className="field">
            <label>Site Title</label>
            <input
              type="text"
              value={settings.site_title}
              onChange={(e) => updateSetting("site_title", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Site Description</label>
            <input
              type="text"
              value={settings.site_description}
              onChange={(e) => updateSetting("site_description", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Site URL</label>
            <input
              type="url"
              value={settings.site_url}
              onChange={(e) => updateSetting("site_url", e.target.value)}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Social Media</h2>
          <div className="field">
            <label>Facebook Page URL</label>
            <input
              type="url"
              value={settings.social_facebook}
              onChange={(e) => updateSetting("social_facebook", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="field">
            <label>Twitter/X Handle</label>
            <input
              type="text"
              value={settings.social_twitter}
              onChange={(e) => updateSetting("social_twitter", e.target.value)}
              placeholder="@handle"
            />
          </div>
          <div className="field">
            <label>Instagram Handle</label>
            <input
              type="text"
              value={settings.social_instagram}
              onChange={(e) => updateSetting("social_instagram", e.target.value)}
              placeholder="@handle"
            />
          </div>
          <div className="field">
            <label>WhatsApp Number</label>
            <input
              type="text"
              value={settings.social_whatsapp}
              onChange={(e) => updateSetting("social_whatsapp", e.target.value)}
              placeholder="+234..."
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Publishing</h2>
          <div className="field">
            <label>Posts Per Page</label>
            <input
              type="number"
              value={settings.posts_per_page}
              onChange={(e) => updateSetting("posts_per_page", e.target.value)}
              min="5"
              max="50"
            />
          </div>
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={settings.enable_comments === "true"}
                onChange={(e) => updateSetting("enable_comments", e.target.checked ? "true" : "false")}
              />
              {" "}Enable Comments
            </label>
          </div>
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={settings.enable_newsletter === "true"}
                onChange={(e) => updateSetting("enable_newsletter", e.target.checked ? "true" : "false")}
              />
              {" "}Enable Newsletter
            </label>
          </div>
        </section>
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <span className="save-success">Settings saved!</span>}
      </div>
    </div>
  );
}
