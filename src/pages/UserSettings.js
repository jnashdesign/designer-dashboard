import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Cropper from 'react-easy-crop';
import { useTheme } from '../context/ThemeContext';

// Correct cropping function using croppedAreaPixels
function getCroppedImg(imageSrc, croppedAreaPixels) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    };
    image.onerror = reject;
  });
}

export default function UserSettings() {
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Cropper states
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const [themeLoading, setThemeLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setName(userSnap.data().name || '');
        setPhotoURL(userSnap.data().photoURL || '');
        // Set theme from Firestore if present
        if (userSnap.data().theme === 'dark' && !isDarkMode) toggleDarkMode();
        if (userSnap.data().theme === 'light' && isDarkMode) toggleDarkMode();
      }
    };
    fetchUser();
  }, []); // Only run on mount

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: name.trim() });
      setStatus('Name updated successfully!');
    } catch (err) {
      setStatus('Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    if (!newPassword || newPassword !== confirmPassword) {
      setStatus('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      setStatus('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    // Read file as data URL for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCrop(true);
    };
    reader.onerror = () => setUploadError('Failed to read image.');
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    setUploading(true);
    setUploadError('');
    try {
      // Crop the image
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const storage = getStorage();
      const fileRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(fileRef, croppedBlob);
      const url = await getDownloadURL(fileRef);
      setPhotoURL(url);
      // Save to Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: url });
      setStatus('Profile photo updated!');
      setShowCrop(false);
      setImageSrc(null);
      // Notify sidebar to refresh
      window.dispatchEvent(new Event('profilePhotoUpdated'));
    } catch (err) {
      setUploadError('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    setImageSrc(null);
  };

  const handleThemeChange = async () => {
    setThemeLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const newTheme = !isDarkMode ? 'dark' : 'light';
    try {
      await updateDoc(userRef, { theme: newTheme });
      toggleDarkMode();
      setStatus('Theme updated!');
    } catch (err) {
      setStatus('Failed to update theme.');
    } finally {
      setThemeLoading(false);
    }
  };

  return (
    <div className="container p-4">
      <h2 className="mb-4">Settings</h2>
      {status && <div className="alert alert-info">{status}</div>}
      <form onSubmit={handleNameUpdate} className="mb-4">
        <div className="mb-3 col-12 col-md-6">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 col-12 col-md-6">
          <label className="form-label">Profile Photo</label>
          <div className="d-flex align-items-center gap-3">
            {photoURL && (
              <img className="mr-3"src={photoURL} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={uploading}
              style={{ maxWidth: 260 }}
            />
          </div>
          {uploadError && <div className="text-danger mt-2">{uploadError}</div>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Update Name and Photo'}
        </button>
      </form>
      <form onSubmit={handlePasswordUpdate}>
      <div className="mb-3 col-12 col-md-6">
      <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 col-12 col-md-6">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-secondary" disabled={loading}>
          {loading ? 'Saving...' : 'Update Password'}
        </button>
      </form>
      <div className="mb-4 col-12 col-md-6 mt-4">
      <label className="form-label mr-3" htmlFor="themeSwitch">Dark Mode</label>
      <div
        className={`custom-toggle${isDarkMode ? ' on' : ''}`}
        id="themeSwitch"
        tabIndex={0}
        role="button"
        aria-pressed={isDarkMode}
        onClick={themeLoading ? undefined : handleThemeChange}
        onKeyDown={e => {
          if (!themeLoading && (e.key === ' ' || e.key === 'Enter')) handleThemeChange();
        }}
        style={{ outline: 'none', }}
      >
        <div className="toggle-circle"></div>
      </div>
    </div>

      <div className="mt-4 text-muted">
        <small>Email address cannot be changed. Contact support if you need help.</small>
      </div>

      {/* Cropper Modal */}
      {showCrop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 400 }}>
            <h5 className="mb-3">Crop your photo</h5>
            <div style={{ position: 'relative', width: 300, height: 300, background: '#222' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary mr-3" onClick={handleCropSave} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Save'}
              </button>
              <button className="btn btn-secondary" onClick={handleCropCancel} disabled={uploading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 