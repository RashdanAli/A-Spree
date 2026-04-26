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

export default function WarehouseLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const [login, { loading }] = useMutation<LoginData>(LOGIN_MUTATION, {
    onCompleted: (data: LoginData) => {
      localStorage.setItem('token', data.login.token);
      localStorage.setItem('role', data.login.role);
      localStorage.setItem('email', data.login.email);
      localStorage.setItem('platform', 'warehouse');
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
    <div className="warehouse-login-container">
      <style>{`
        .warehouse-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #f9f9f9;
        }

        .ambient-shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .shape-1 {
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: rgba(175, 16, 26, 0.05);
          filter: blur(120px);
          mix-blend-mode: multiply;
        }

        .shape-2 {
          bottom: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: rgba(123, 209, 248, 0.1);
          filter: blur(150px);
          mix-blend-mode: multiply;
        }

        .shape-3 {
          top: 20%;
          right: 10%;
          width: 30vw;
          height: 30vw;
          background: rgba(255, 179, 172, 0.15);
          filter: blur(100px);
          mix-blend-mode: multiply;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          z-index: 10;
          position: relative;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(26, 28, 28, 0.06);
          border: 1px solid rgba(228, 190, 186, 0.15);
        }

        .card-accent {
          height: 8px;
          width: 100%;
          background: linear-gradient(to right, #af101a, #d32f2f);
        }

        .card-body {
          padding: 2.5rem;
        }

        .branding {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .brand-title {
          font-size: 2rem;
          font-weight: 800;
          font-style: italic;
          color: #af101a;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .brand-tagline {
          font-size: 1.25rem;
          font-weight: 400;
          color: #1a1c1c;
          letter-spacing: -0.01em;
        }

        .brand-access {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #5b403d;
          margin-top: 1rem;
        }

        .form-group {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          background: #e8e8e8;
          border-radius: 0.5rem;
          padding: 0 1rem;
          height: 3.5rem;
          transition: background 0.2s;
        }

        .input-wrapper:focus-within {
          background: #ffffff;
        }

        .input-icon {
          color: #5f5e5e;
          margin-right: 0.75rem;
          font-size: 1.25rem;
          transition: color 0.2s;
        }

        .input-wrapper:focus-within .input-icon {
          color: #af101a;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 1rem;
          color: #1a1c1c;
        }

        .input-wrapper input::placeholder {
          color: rgba(143, 111, 108, 0.6);
        }

        .input-focus-line {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 0;
          background: #af101a;
          transition: width 0.3s;
          border-radius: 0 0 4px 4px;
        }

        .form-group:focus-within .input-focus-line {
          width: 100%;
        }

        .password-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #5f5e5e;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #af101a;
        }

        .options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background: #e8e8e8;
          border: none;
          cursor: pointer;
          appearance: none;
          position: relative;
        }

        .checkbox-wrapper input[type="checkbox"]:checked {
          background: #af101a;
        }

        .checkbox-wrapper input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-label {
          margin-left: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #5b403d;
          cursor: pointer;
        }

        .reset-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: #af101a;
          text-decoration: none;
          transition: color 0.2s;
        }

        .reset-link:hover {
          color: #d32f2f;
        }

        .reset-link:focus {
          outline: none;
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          height: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0 1rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(to right, #af101a, #d32f2f);
          box-shadow: 0 4px 20px rgba(175, 16, 26, 0.2);
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1rem;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(to right, #d32f2f, #af101a);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-btn .material-symbols-outlined {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .error-message {
          background: #ffdad6;
          color: #93000a;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .card-footer {
          background: #eeeeee;
          padding: 1.25rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(228, 190, 186, 0.15);
        }

        .footer-text {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #5b403d;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #5b403d;
        }

        .secure-badge .material-symbols-outlined {
          font-size: 0.875rem;
          color: #af101a;
        }

        .ambient-shadow {
          position: absolute;
          bottom: -2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 83.33%;
          height: 3rem;
          background: rgba(26, 28, 28, 0.03);
          filter: blur(30px);
          border-radius: 50%;
          z-index: -1;
        }
      `}</style>

      {/* Background shapes */}
      <div className="ambient-shape shape-1" />
      <div className="ambient-shape shape-2" />
      <div className="ambient-shape shape-3" />

      {/* Login card */}
      <div className="login-card">
        <div className="card-accent" />

        <div className="card-body">
          <div className="branding">
            <h1 className="brand-title">A-Spree</h1>
            <p className="brand-tagline">The Kinetic Ledger</p>
            <p className="brand-access">Warehouse Access</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  placeholder="Operator ID / Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="input-focus-line" />
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">key</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Security Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <div className="input-focus-line" />
            </div>

            <div className="options-row">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="checkbox-label" htmlFor="remember-me">
                  Retain Session
                </label>
              </div>
              <a href="#" className="reset-link">Reset Clearance?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Authenticate Protocol'}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>
        </div>

        <div className="card-footer">
          <span className="footer-text">Sys Version 4.2.1</span>
          <div className="secure-badge">
            <span className="material-symbols-outlined">verified_user</span>
            Secure Conx
          </div>
        </div>

        <div className="ambient-shadow" />
      </div>
    </div>
  );
}
