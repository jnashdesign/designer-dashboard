import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Logo_icon from '../components/shared/Logo_icon';
export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('designer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document with role
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date()
      });

      // Navigate based on role
      navigate(role === 'designer' ? '/dashboard' : '/client-dashboard');
    } catch (err) {
      setError(err.message.includes('email-already-in-use') 
        ? 'An account with this email already exists' 
        : 'Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, []);


  return (
    <div className="dashboard-container signup-page">
      <div className="row justify-content-center">
        <div className="col-md-6">
        <div className="card shadow mt-3">
        <div className="card-body p-6">
            <div className="text-center">
            <Logo_icon />
            </div>
              <h2 className="text-center mb-4">Sign Up</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">I am a...</label>
                  <select 
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="designer">Designer</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Log In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}