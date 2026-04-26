import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import type { DocumentNode } from 'graphql';

const LOGIN_MUTATION: DocumentNode = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      email
      role
    }
  }
`;

interface LoginData {
  login: {
    token: string;
    email: string;
    role: string;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [login, { loading }] = useMutation<LoginData>(LOGIN_MUTATION, {
    onCompleted: (data: LoginData) => {
      localStorage.setItem('token', data.login.token);
      localStorage.setItem('role', data.login.role);
      localStorage.setItem('email', data.login.email);
      localStorage.setItem('platform', 'retail');
      navigate('/dashboard');
    },
    onError: (err: Error) => {
      setError(err.message || 'Invalid credentials');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login({ variables: { input: { email, password } } });
  };

  return (
    <div className="login-container">
      <div className="ambient-glow ambient-glow-top-left" />
      <div className="ambient-glow ambient-glow-bottom-right" />

      <main className="login-main">
        <div className="login-header">
          <div className="store-icon">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <h1 className="brand-title">A-Spree</h1>
          <p className="brand-subtitle">Retail Management System</p>
        </div>

        <div className="glass-panel">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="input-label" htmlFor="store-id">Store ID / Email</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">badge</span>
                <input
                  id="store-id"
                  name="store-id"
                  type="text"
                  placeholder="e.g. BR-042 or user@aspree.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label className="input-label" htmlFor="security-key">Security Key</label>
                <a href="#" className="recover-link">Recover Access</a>
              </div>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">key</span>
                <input
                  id="security-key"
                  name="security-key"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Authenticating...' : 'Authenticate Terminal'}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>

            <div className="secure-footer">
              <p className="secure-text">
                Secure connection established.<br />
                Terminal ID: <span className="terminal-id">T-8942-NYC</span>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}