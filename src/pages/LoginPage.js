import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import Logo_icon from '../components/shared/Logo_icon';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
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
    <div className="dashboard-container login-page">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow mt-3">
            <div className="card-body p-5">
            <div className="text-center">
              <Logo_icon />
              </div>
              <h2 className="text-center mb-4">Log In</h2>
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
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
              <div className="text-center mt-3">
                <button
                  className="btn btn-link"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="text-center mt-3">
                Need an account? <Link to="/signup">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}