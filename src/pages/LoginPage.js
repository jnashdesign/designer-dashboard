import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      const role = userDoc.data()?.role;

      if (role === 'designer') {
        navigate('/dashboard');
      } else if (role === 'client') {
        navigate('/client-dashboard');
      } else {
        alert('Unknown user role.');
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Failed to log in.");
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert("Password reset email sent!");
      setShowResetForm(false);
    } catch (err) {
      console.error(err);
      alert("Error sending reset email.");
    }
  };

  return (
    <div className="container">
      <h2>Log In</h2>
      <form onSubmit={handleLogin}>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log In</button>
      </form>
      <p>Don't have an account? <a href="/signup">Register here</a></p>
      <p>
        <button type="button" onClick={() => setShowResetForm(true)}>
          Forgot Password?
        </button>
      </p>
      {showResetForm && (
        <div style={{ marginTop: '1rem' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button onClick={handlePasswordReset}>Send Reset Email</button>
        </div>
      )}
    </div>
  );
}