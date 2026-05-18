.register-root {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.register-root::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 6px;
  height: 100%;
  background: var(--accent);
}

.register-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 48px 44px;
  width: 100%;
  max-width: 560px;
  animation: fadeUp 0.5s ease forwards;
  box-shadow: 0 24px 60px rgba(0,0,0,0.08);
  position: relative;
  z-index: 1;
}

.register-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 36px;
  cursor: pointer;
}
.register-logo-icon {
  width: 42px; height: 42px;
  background: var(--accent);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.register-logo-text {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 4px;
  color: var(--text-primary);
}
.register-logo-text span { color: var(--accent); }

.register-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 36px;
}

.step-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.step-bubble {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s;
}
.step-bubble--done {
  background: var(--accent);
  color: white;
  border: none;
}
.step-bubble--active {
  background: var(--accent);
  color: white;
  border: none;
  box-shadow: 0 0 0 4px var(--accent-glow);
}
.step-bubble--pending {
  background: var(--bg-secondary);
  color: var(--text-muted);
  border: 1.5px solid var(--border);
}

.step-label {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-left: 8px;
  white-space: nowrap;
}
.step-label--active { color: var(--accent); }
.step-label--done { color: var(--text-secondary); }
.step-label--pending { color: var(--text-muted); }

.step-line {
  flex: 1;
  height: 2px;
  margin: 0 8px;
  border-radius: 2px;
  transition: background 0.3s;
}
.step-line--done { background: var(--accent); }
.step-line--pending { background: var(--border); }

.register-heading {
  font-family: var(--font-display);
  font-size: 36px;
  letter-spacing: 2px;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1;
}
.register-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 28px;
  line-height: 1.6;
}

.register-error {
  background: rgba(220,38,38,0.07);
  border: 1px solid rgba(220,38,38,0.2);
  border-left: 3px solid #dc2626;
  color: #dc2626;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 20px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.register-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.register-field label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text-secondary);
  text-transform: uppercase;
}
.register-field input,
.register-field select {
  background: var(--bg-secondary);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  font-size: 14px;
  font-family: var(--font-body);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}
.register-field input:focus,
.register-field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
  background: var(--bg-card);
}
.register-field input::placeholder { color: var(--text-muted); }

.register-hint {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.pass-wrap { position: relative; }
.pass-wrap input { padding-right: 44px; }
.pass-eye {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex; align-items: center;
  transition: color 0.2s;
}
.pass-eye:hover { color: var(--accent); }

.register-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.register-btn-back {
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  background: transparent;
  border: 1.5px solid var(--border-bright);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 6px;
}
.register-btn-back:hover { background: var(--bg-hover); color: var(--text-primary); }

.register-btn-next,
.register-btn-submit {
  flex: 1;
  padding: 13px;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.register-btn-next:hover,
.register-btn-submit:hover:not(:disabled) {
  background: var(--accent-dim);
  box-shadow: 0 4px 20px var(--accent-glow);
  transform: translateY(-1px);
}
.register-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

.reg-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.register-success {
  text-align: center;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.success-icon {
  width: 64px; height: 64px;
  background: rgba(22,163,74,0.12);
  border: 2px solid rgba(22,163,74,0.3);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--success);
}
.register-success h2 {
  font-family: var(--font-display);
  font-size: 40px;
  letter-spacing: 2px;
  color: var(--text-primary);
}
.register-success p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.confirm-summary {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}
.confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.confirm-label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  text-transform: uppercase;
  flex-shrink: 0;
}
.confirm-value {
  font-size: 14px;
  color: var(--text-primary);
  text-align: right;
  word-break: break-word;
}

.register-login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-muted);
}
.register-login-link a { color: var(--accent); font-weight: 600; }

.minor-section {
  background: rgba(245,158,11,0.07);
  border: 1px solid rgba(245,158,11,0.2);
  border-left: 3px solid var(--warning);
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-top: 4px;
}
.minor-section-title {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--warning);
  margin-bottom: 14px;
}

@media (max-width: 600px) {
  .register-card { padding: 32px 24px; }
  .step-label { display: none; }
}
