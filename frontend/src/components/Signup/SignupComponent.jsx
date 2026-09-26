import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

/* ------------------------------------------------------------------ */
/* Auth integration & Endpoint                                         */
/* POST http://localhost:5000/api/auth/signup                          */
/* ------------------------------------------------------------------ */

const SIGNUP_ENDPOINT = "http://localhost:5000/api/auth/signup";
const REDIRECT_DELAY_MS = 1400;

async function requestSignup({ name, email, password }) {
  let response;
  try {
    response = await fetch(SIGNUP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    throw new Error(
      "Unable to reach the StockSense server. Please check your connection and try again."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Failed to create account. Please try again.");
  }

  return data;
}

/* ------------------------------------------------------------------ */
/* Validation & Password Strength Calculation                         */
/* ------------------------------------------------------------------ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

function calculatePasswordStrength(password) {
  if (!password) return { score: 0, text: "", labelClass: "" };

  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 9) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || (/[A-Z]/.test(password) && /[a-z]/.test(password))) {
    score += 1;
  }

  if (score === 1) return { score: 1, text: "Weak", labelClass: "weak" };
  if (score === 2) return { score: 2, text: "Medium", labelClass: "medium" };
  if (score === 3) return { score: 3, text: "Good", labelClass: "good" };
  if (score >= 4) return { score: 4, text: "Strong", labelClass: "strong" };

  return { score: 0, text: "", labelClass: "" };
}

function validateSignup({ name, email, password, confirmPassword, agreeTerms }) {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName) {
    errors.name = "Enter your full name.";
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!trimmedEmail) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Create a password.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!agreeTerms) {
    errors.agreeTerms = "You must accept the Terms of Service.";
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/* Accessible Inline SVG Icons                                        */
/* ------------------------------------------------------------------ */

function Icon({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

const UserIcon = (props) => (
  <Icon {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const MailIcon = (props) => (
  <Icon {...props}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
    <path d="m3.5 7.5 7.4 5.2a2 2 0 0 0 2.2 0l7.4-5.2" />
  </Icon>
);

const LockIcon = (props) => (
  <Icon {...props}>
    <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2.5" />
  </Icon>
);

const ShieldCheckIcon = (props) => (
  <Icon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const EyeIcon = (props) => (
  <Icon {...props}>
    <path d="M2.1 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.8 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.8 0" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const EyeOffIcon = (props) => (
  <Icon {...props}>
    <path d="M10.7 5.1a10.7 10.7 0 0 1 11.2 6.55 1 1 0 0 1 0 .7 10.8 10.8 0 0 1-1.44 2.49" />
    <path d="M14.1 14.16a3 3 0 0 1-4.24-4.24" />
    <path d="M17.5 17.5a10.75 10.75 0 0 1-15.4-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.44-5.14" />
    <path d="m2 2 20 20" />
  </Icon>
);

const AlertIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7.5v5" />
    <path d="M12 16.25h.01" />
  </Icon>
);

const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

const CheckCircleIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m8.5 12.25 2.4 2.4 4.6-4.9" />
  </Icon>
);

const ArrowRightIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
);

const PackageIcon = (props) => (
  <Icon {...props}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7" />
  </Icon>
);

const ZapIcon = (props) => (
  <Icon {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Icon>
);

const RefreshCwIcon = (props) => (
  <Icon {...props}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </Icon>
);

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 4.5 26.5 10.5 16 16.5 5.5 10.5Z" fill="#fff" />
      <path d="M5.5 10.5 16 16.5v11L5.5 21.5Z" fill="#fff" fillOpacity=".72" />
      <path d="M26.5 10.5 16 16.5v11l10.5-6Z" fill="#fff" fillOpacity=".45" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Signup Hero — 3D Isometric Product Composition                      */
/* ------------------------------------------------------------------ */

function SignupHero() {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const update = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const x = ((pointerX - rect.left) / rect.width) * 2 - 1;
      const y = ((pointerY - rect.top) / rect.height) * 2 - 1;
      const clampVal = (v) => Math.max(-1, Math.min(1, v));
      stage.style.setProperty("--signup-mx", clampVal(x).toFixed(3));
      stage.style.setProperty("--signup-my", clampVal(y).toFixed(3));
    };

    const handlePointerMove = (event) => {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handlePointerLeave = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      stage.style.setProperty("--signup-mx", "0");
      stage.style.setProperty("--signup-my", "0");
    };

    stage.addEventListener("pointermove", handlePointerMove, { passive: true });
    stage.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <aside className="signup-hero" aria-labelledby="signup-hero-title">
      <div className="signup-hero__stage" ref={stageRef}>
        <div className="signup-hero__backdrop" aria-hidden="true">
          <span className="signup-hero__orb signup-hero__orb--cyan" />
          <span className="signup-hero__orb signup-hero__orb--blue" />
          <span className="signup-hero__orb signup-hero__orb--purple" />
          <span className="signup-hero__grid" />
        </div>

        <div className="signup-scene" aria-hidden="true">
          {/* Animated connection lines */}
          <svg className="signup-scene__network" viewBox="0 0 400 320" fill="none">
            <path
              id="signup-link-1"
              className="signup-scene__line"
              d="M100 80 Q 200 120 200 160"
            />
            <path
              id="signup-link-2"
              className="signup-scene__line"
              d="M310 90 Q 230 130 200 160"
            />
            <path
              id="signup-link-3"
              className="signup-scene__line"
              d="M120 250 Q 180 200 200 160"
            />
            <path
              id="signup-link-4"
              className="signup-scene__line"
              d="M290 240 Q 240 190 200 160"
            />

            <circle className="signup-scene__packet" r="3">
              <animateMotion dur="4s" repeatCount="indefinite">
                <mpath href="#signup-link-1" />
              </animateMotion>
            </circle>
            <circle className="signup-scene__packet" r="3">
              <animateMotion dur="3.5s" repeatCount="indefinite">
                <mpath href="#signup-link-2" />
              </animateMotion>
            </circle>
          </svg>

          {/* Central 3D Cube */}
          <div className="signup-hub">
            <span className="signup-hub__glow" />
            <div className="signup-hub__core">
              <div className="signup-hub__box signup-hub__box--top" />
              <div className="signup-hub__box signup-hub__box--front" />
              <div className="signup-hub__box signup-hub__box--side" />
            </div>
          </div>

          {/* Floating Inventory Feature Cards */}
          <div className="signup-float signup-float--reorder">
            <div className="signup-float__card">
              <div className="signup-float__header">
                <span className="signup-float__icon signup-float__icon--cyan">
                  <ZapIcon />
                </span>
                <div>
                  <div className="signup-float__title">Smart Reorder Point</div>
                  <div className="signup-float__desc">Automated purchase triggers</div>
                </div>
              </div>
              <div className="signup-float__pill">⚡ Trigger set @ 25 units</div>
            </div>
          </div>

          <div className="signup-float signup-float--sync">
            <div className="signup-float__card">
              <div className="signup-float__header">
                <span className="signup-float__icon signup-float__icon--blue">
                  <RefreshCwIcon />
                </span>
                <div>
                  <div className="signup-float__title">Multi-Hub Sync</div>
                  <div className="signup-float__desc">Real-time ledger updates</div>
                </div>
              </div>
              <div className="signup-float__stat">4 Hubs Live</div>
            </div>
          </div>

          <div className="signup-float signup-float--velocity">
            <div className="signup-float__card">
              <div className="signup-float__header">
                <span className="signup-float__icon signup-float__icon--purple">
                  <PackageIcon />
                </span>
                <div>
                  <div className="signup-float__title">Stock Velocity</div>
                  <div className="signup-float__desc">Average turnover rate</div>
                </div>
              </div>
              <div className="signup-float__stat">+24.8%</div>
            </div>
          </div>

          <div className="signup-float signup-float--accuracy">
            <div className="signup-float__card">
              <div className="signup-float__header">
                <span className="signup-float__icon signup-float__icon--cyan">
                  <ShieldCheckIcon />
                </span>
                <div>
                  <div className="signup-float__title">Order Accuracy</div>
                  <div className="signup-float__desc">Zero dispatch discrepancies</div>
                </div>
              </div>
              <div className="signup-float__stat">99.8%</div>
            </div>
          </div>
        </div>

        <div className="signup-hero__copy">
          <div className="signup-hero__badge">
            <span className="signup-hero__badge-dot" />
            Next-Gen Inventory Control
          </div>
          <h2 id="signup-hero-title" className="signup-hero__title">
            Build smarter <span>inventory operations.</span>
          </h2>
          <p className="signup-hero__desc">
            Empower your logistics team with real-time stock telemetry, automated reordering,
            and flawless multi-warehouse synchronization.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Signup Form Component                                              */
/* ------------------------------------------------------------------ */

const CURRENT_YEAR = new Date().getFullYear();

function SignupComponent() {
  const navigate = useNavigate();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [apiError, setApiError] = useState("");

  const errors = validateSignup(formData);
  const strength = calculatePasswordStrength(formData.password);

  const showError = (field) => (submitAttempted || touched[field] ? errors[field] : undefined);
  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  useEffect(() => {
    if (status !== "success") return undefined;
    const timer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (apiError) setApiError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value && !touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;

    setSubmitAttempted(true);
    const currentErrors = validateSignup(formData);

    if (currentErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (currentErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (currentErrors.password) {
      passwordRef.current?.focus();
      return;
    }
    if (currentErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
      return;
    }
    if (currentErrors.agreeTerms) {
      return;
    }

    setStatus("submitting");
    setApiError("");

    try {
      await requestSignup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setStatus("success");
    } catch (err) {
      setApiError(err.message || "Failed to create account. Please try again.");
      setStatus("idle");
    }
  };

  const nameError = showError("name");
  const emailError = showError("email");
  const passwordError = showError("password");
  const confirmPasswordError = showError("confirmPassword");
  const termsError = showError("agreeTerms");

  return (
    <main className="signup-page">
      <section className="signup-panel" aria-labelledby="signup-title">
        <div className="signup-panel__inner">
          <div className="signup-card">
            {/* Brand Header */}
            <div className="signup-brand">
              <span className="signup-brand__mark">
                <BrandMark />
              </span>
              <span className="signup-brand__text">
                <span className="signup-brand__name">StockSense</span>
                <span className="signup-brand__tag">Inventory Management</span>
              </span>
            </div>

            <h1 id="signup-title" className="signup-card__title">
              Create your account
            </h1>
            <p className="signup-card__subtitle">
              Start orchestrating inventory, shipments, and warehouses with precision.
            </p>

            {/* Error Banner */}
            {apiError && (
              <div className="signup-alert signup-alert--error" role="alert">
                <AlertIcon />
                <span>{apiError}</span>
              </div>
            )}

            {/* Success Banner */}
            {isSuccess && (
              <div className="signup-alert signup-alert--success">
                <CheckCircleIcon />
                <span>Account created successfully! Taking you to sign in…</span>
              </div>
            )}

            <p className="signup-sr-only" role="status" aria-live="polite">
              {isSubmitting && "Creating account…"}
              {isSuccess && "Account created successfully. Redirecting to login."}
            </p>

            <form
              className="signup-form"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
            >
              {/* Full Name */}
              <div className={`signup-field${nameError ? " signup-field--invalid" : ""}`}>
                <label className="signup-field__label" htmlFor="signup-name">
                  Full Name
                </label>
                <div className="signup-field__control">
                  <span className="signup-field__icon">
                    <UserIcon />
                  </span>
                  <input
                    ref={nameRef}
                    id="signup-name"
                    name="name"
                    type="text"
                    className="signup-field__input"
                    placeholder="e.g. Alex Morgan"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={nameError ? "true" : undefined}
                  />
                </div>
                {nameError && (
                  <p className="signup-field__message signup-field__message--error">
                    <AlertIcon />
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className={`signup-field${emailError ? " signup-field--invalid" : ""}`}>
                <label className="signup-field__label" htmlFor="signup-email">
                  Work Email
                </label>
                <div className="signup-field__control">
                  <span className="signup-field__icon">
                    <MailIcon />
                  </span>
                  <input
                    ref={emailRef}
                    id="signup-email"
                    name="email"
                    type="email"
                    className="signup-field__input"
                    placeholder="alex@company.com"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={emailError ? "true" : undefined}
                  />
                </div>
                {emailError && (
                  <p className="signup-field__message signup-field__message--error">
                    <AlertIcon />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div
                className={`signup-field signup-field--password${
                  passwordError ? " signup-field--invalid" : ""
                }`}
              >
                <label className="signup-field__label" htmlFor="signup-password">
                  Password
                </label>
                <div className="signup-field__control">
                  <span className="signup-field__icon">
                    <LockIcon />
                  </span>
                  <input
                    ref={passwordRef}
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="signup-field__input"
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={passwordError ? "true" : undefined}
                  />
                  <button
                    type="button"
                    className="signup-field__toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="signup-field__toggle-icon" key={showPassword ? "hide" : "show"}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                  </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="signup-strength">
                    <div className="signup-strength__bar">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`signup-strength__segment ${
                            strength.score >= level
                              ? `signup-strength__segment--active-${strength.labelClass}`
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                    <div className="signup-strength__label">
                      <span>Password strength:</span>
                      <span
                        className={`signup-strength__text signup-strength__text--${strength.labelClass}`}
                      >
                        {strength.text}
                      </span>
                    </div>
                  </div>
                )}

                {passwordError && (
                  <p className="signup-field__message signup-field__message--error">
                    <AlertIcon />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div
                className={`signup-field signup-field--password${
                  confirmPasswordError ? " signup-field--invalid" : ""
                }`}
              >
                <label className="signup-field__label" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <div className="signup-field__control">
                  <span className="signup-field__icon">
                    <LockIcon />
                  </span>
                  <input
                    ref={confirmPasswordRef}
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="signup-field__input"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={confirmPasswordError ? "true" : undefined}
                  />
                  <button
                    type="button"
                    className="signup-field__toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <span
                      className="signup-field__toggle-icon"
                      key={showConfirmPassword ? "hide" : "show"}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="signup-field__message signup-field__message--error">
                    <AlertIcon />
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {/* Terms & Privacy */}
              <label className="signup-check">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  className="signup-check__input"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span className="signup-check__box" aria-hidden="true">
                  <CheckIcon />
                </span>
                <span>
                  I agree to the{" "}
                  <span className="signup-terms-link">Terms of Service</span> and{" "}
                  <span className="signup-terms-link">Privacy Policy</span>.
                </span>
              </label>
              {termsError && (
                <p className="signup-field__message signup-field__message--error">
                  <AlertIcon />
                  {termsError}
                </p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className={`signup-btn${isSubmitting ? " is-loading" : ""}${
                  isSuccess ? " is-success" : ""
                }`}
                disabled={status !== "idle"}
              >
                <span className="signup-btn__sheen" aria-hidden="true" />
                {isSubmitting && (
                  <>
                    <span className="signup-btn__spinner" aria-hidden="true" />
                    <span>Creating your account…</span>
                  </>
                )}
                {isSuccess && (
                  <>
                    <CheckIcon className="signup-btn__icon" />
                    <span>Account Created</span>
                  </>
                )}
                {status === "idle" && (
                  <>
                    <span>Create Account</span>
                    <ArrowRightIcon className="signup-btn__icon signup-btn__arrow" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="signup-footer">
              <span>Already have an account?</span>
              <Link to="/login" className="signup-signin-link">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <p className="signup-panel__footer">
          © {CURRENT_YEAR} StockSense · Enterprise Inventory Logistics
        </p>
      </section>

      <SignupHero />
    </main>
  );
}

export default SignupComponent;