import React, { useEffect, useMemo, useState } from 'react';
import './CSS/UserProfile.css';
import NavBar from './NavBar';

const API_BASE = 'http://localhost:3001';

function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const userId = useMemo(() => localStorage.getItem('userId') || '', []);
  const token = useMemo(() => localStorage.getItem('token') || '', []);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      setLoading(true);
      setLoadError('');
      try {
        if (token) {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            if (ignore) return;
            setName(data.name || '');
            setEmail(data.email || '');
            setLoading(false);
            return;
          }
        }

        if (userId) {
          const res2 = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`);
          if (res2.ok) {
            const data2 = await res2.json();
            if (ignore) return;
            setName(data2.name || '');
            setEmail(data2.email || '');
            setLoading(false);
            return;
          }
        }

        if (!ignore) {
          setLoading(false);
          setLoadError('Unable to load user profile. Please ensure you are logged in.');
        }
      } catch (e) {
        if (!ignore) {
          setLoading(false);
          setLoadError(e?.message || 'Failed to load user profile.');
        }
      }
    }

    loadUser();
    return () => { ignore = true; };
  }, [token, userId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    if (!name.trim()) return setProfileErr('Name is required.');
    if (!emailOk) return setProfileErr('Enter a valid email address.');

    setSavingProfile(true);
    try {
      if (token) {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
          credentials: 'include',
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Update failed (${res.status})`);
        }
        setProfileMsg('Profile updated successfully.');
        return;
      }

      if (userId) {
        const res2 = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        });
        if (!res2.ok) {
          const err = await res2.json().catch(() => ({}));
          throw new Error(err.message || `Update failed (${res2.status})`);
        }
        setProfileMsg('Profile updated successfully.');
        return;
      }

      throw new Error('Not authenticated.');
    } catch (e) {
      setProfileErr(e?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(''); setPasswordErr('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPasswordErr('Fill in all password fields.');
    }
    if (newPassword.length < 8) {
      return setPasswordErr('New password must be at least 8 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setPasswordErr('New password and confirmation do not match.');
    }

    setChangingPassword(true);
    try {
      if (token) {
        const res = await fetch(`${API_BASE}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
          credentials: 'include',
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Password change failed (${res.status})`);
        }
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        return;
      }

      if (userId) {
        const res2 = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (!res2.ok) {
          const err = await res2.json().catch(() => ({}));
          throw new Error(err.message || `Password change failed (${res2.status})`);
        }
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        return;
      }

      throw new Error('Not authenticated.');
    } catch (e) {
      setPasswordErr(e?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profilePage">
      <div className="profileOverlay">
        <NavBar />
        <div className="profileContainer">
          <h2 className="profileTitle">Your Account</h2>

          {loading ? (
            <div className="profileBox" style={{ color: '#000' }}>Loading profile…</div>
          ) : loadError ? (
            <div className="profileBox error">{loadError}</div>
          ) : (
            <>
              <form className="profileBox" onSubmit={handleSaveProfile}>
                <h3 className="profileSectionTitle">Profile</h3>

                {profileMsg && <div className="profileAlert success">{profileMsg}</div>}
                {profileErr && <div className="profileAlert error">{profileErr}</div>}

                <div className="mb-3">
                  <label htmlFor="userName" className="profileLabel">Name</label>
                  <input
                    id="userName"
                    type="text"
                    className="profileInput"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="userEmail" className="profileLabel">Email</label>
                  <input
                    id="userEmail"
                    type="email"
                    className="profileInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="profileActions">
                  <button
                    type="submit"
                    className="profileBtn"
                    disabled={savingProfile}
                    aria-label="Save profile"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>

              <form className="profileBox" onSubmit={handleChangePassword}>
                <h3 className="profileSectionTitle">Change Password</h3>

                {passwordMsg && <div className="profileAlert success">{passwordMsg}</div>}
                {passwordErr && <div className="profileAlert error">{passwordErr}</div>}

                <div className="mb-3">
                  <label htmlFor="currentPassword" className="profileLabel">Current password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="profileInput"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="profileLabel">New password</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="profileInput"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="profileLabel">Confirm new password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="profileInput"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="profileActions">
                  <button
                    type="submit"
                    className="profileBtn"
                    disabled={changingPassword}
                    aria-label="Change password"
                  >
                    {changingPassword ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;