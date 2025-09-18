import React, { useEffect, useMemo, useState } from 'react';
import './CSS/UserProfile.css';
import NavBar from './NavBar';
import Toast from './components/Toast';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

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

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('info');

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
    if (!name.trim()) { setProfileErr('Name is required.'); setToastType('error'); setToastMsg('Name is required.'); setToastOpen(true); return; }
    if (!emailOk) { setProfileErr('Enter a valid email address.'); setToastType('error'); setToastMsg('Enter a valid email address.'); setToastOpen(true); return; }

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
        setToastType('success'); setToastMsg('Profile updated successfully.'); setToastOpen(true);
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
        setToastType('success'); setToastMsg('Profile updated successfully.'); setToastOpen(true);
        return;
      }

      throw new Error('Not authenticated.');
    } catch (e) {
      setProfileErr(e?.message || 'Failed to update profile.');
      setToastType('error'); setToastMsg(e?.message || 'Failed to update profile.'); setToastOpen(true);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(''); setPasswordErr('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErr('Fill in all password fields.');
      setToastType('error'); setToastMsg('Fill in all password fields.'); setToastOpen(true);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErr('New password must be at least 8 characters.');
      setToastType('error'); setToastMsg('New password must be at least 8 characters.'); setToastOpen(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr('New password and confirmation do not match.');
      setToastType('error'); setToastMsg('New password and confirmation do not match.'); setToastOpen(true);
      return;
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
        setToastType('success'); setToastMsg('Password changed successfully.'); setToastOpen(true);
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
        setToastType('success'); setToastMsg('Password changed successfully.'); setToastOpen(true);
        return;
      }

      throw new Error('Not authenticated.');
    } catch (e) {
      setPasswordErr(e?.message || 'Failed to change password.');
      setToastType('error'); setToastMsg(e?.message || 'Failed to change password.'); setToastOpen(true);
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

      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        duration={2500}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

export default UserProfile;