"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email?: string;
  full_name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

const ROLES = ["superadmin", "editor", "author", "subscriber"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "subscriber",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  async function fetchUsers() {
    const params = new URLSearchParams();
    if (roleFilter) params.set("role", roleFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function handleUpdateRole(userId: string, newRole: string) {
    setSaving(true);
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setSaving(false);
    fetchUsers();
  }

  async function handleUpdateProfile() {
    if (!editingUser) return;
    setSaving(true);
    await fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: editingUser.full_name,
        bio: editingUser.bio,
      }),
    });
    setSaving(false);
    setEditingUser(null);
    fetchUsers();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    }
    setSaving(false);
    setShowCreate(false);
    setCreateForm({ email: "", password: "", full_name: "", role: "subscriber" });
    fetchUsers();
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await fetch(`/api/users/${userId}`, { method: "DELETE" });
    fetchUsers();
  }

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Users</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          Add User
        </button>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create User</h2>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="field">
                <label>Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Creating..." : "Create"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                value={editingUser.full_name}
                onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Bio</label>
              <textarea
                value={editingUser.bio || ""}
                onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleUpdateProfile} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="btn-secondary" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {users.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.full_name || "No name"}</strong></td>
                <td>{u.email || "-"}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                    disabled={saving}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-links">
                    <button onClick={() => setEditingUser(u)} className="link-btn">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="link-btn link-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">No users found.</div>
      )}
    </div>
  );
}
