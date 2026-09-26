import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

/* ------------------------------------------------------------------ */
/* Auth integration                                                    */
/* Mirrors the existing backend contract (POST /api/auth/login →       */
/* { success, message, token, user }). Keep all network concerns here  */
/* so the UI below never needs to change if the endpoint does.         */
/* ------------------------------------------------------------------ */

const LOGIN_ENDPOINT = "http://localhost:5000/api/auth/login";
const REDIRECT_PATH = "/dashboard";
const REDIRECT_DELAY_MS = 900;

async function requestLogin(credentials) {
  let response;
  try {
    response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error(
      "We couldn't reach the StockSense server. Check your connection and try again."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Unable to sign in. Please try again.");
  }

  return data;
}

// "Remember me" keeps the session in localStorage; otherwise it only lives
// for this browser tab. The other storage is cleared so a stale token from a
// previous session can't linger.
function persistSession({ token, user }, remember) {
  const keep = remember ? window.localStorage : window.sessionStorage;
  const drop = remember ? window.sessionStorage : window.localStorage;

  drop.removeItem("token");
  drop.removeItem("user");
  if (token) keep.setItem("token", token);
  if (user) keep.setItem("user", JSON.stringify(user));
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Matches the signup form's minLength so every registered user can sign in.
const MIN_PASSWORD_LENGTH = 6;

function validateLogin({ email, password }) {
  const errors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "That doesn't look like a valid email address.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/* Icons (inline — the project has no icon library)                    */
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

const CapsLockIcon = (props) => (
  <Icon {...props}>
    <path d="M9 17v-5H5l7-7 7 7h-4v5z" />
    <path d="M9 21h6" />
  </Icon>
);

const PackageIcon = (props) => (
  <Icon {...props}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7" />
    <path d="m7.5 4.27 9 5.15" />
  </Icon>
);

const BellIcon = (props) => (
  <Icon {...props}>
    <path d="M10.27 21a2 2 0 0 0 3.46 0" />
    <path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33" />
  </Icon>
);

const TrendIcon = (props) => (
  <Icon {...props}>
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
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
/* Hero — isometric "inventory hub" built from CSS 3D transforms       */
/* ------------------------------------------------------------------ */

// 3×3 grid of product stacks on the hub plate. h = boxes per stack.
// Cell (1, 2) is intentionally empty — it's the "low stock" slot the
// alert card points at.
const HUB_STACKS = [
  { x: 0, y: 0, h: 3 },
  { x: 1, y: 0, h: 2, tone: "blue" },
  { x: 2, y: 0, h: 3 },
  { x: 0, y: 1, h: 2 },
  { x: 1, y: 1, h: 4, tone: "violet" },
  { x: 2, y: 1, h: 1 },
  { x: 0, y: 2, h: 1 },
  { x: 2, y: 2, h: 1, tone: "blue" },
];

const PARTICLES = [
  { x: 5.5, y: 9, size: 0.42, delay: 0, tone: "teal" },
  { x: 14, y: 5.5, size: 0.28, delay: -5, tone: "blue" },
  { x: 21.5, y: 3.5, size: 0.32, delay: -7.5, tone: "teal" },
  { x: 31, y: 11.5, size: 0.3, delay: -3, tone: "violet" },
  { x: 9, y: 19.5, size: 0.3, delay: -4, tone: "blue" },
  { x: 25, y: 26, size: 0.36, delay: -2, tone: "teal" },
  { x: 33.5, y: 22.5, size: 0.26, delay: -6, tone: "violet" },
];

// Scene links in SVG units (1 unit = 0.1em). The viewBox starts at y=17.5
// because the scene canvas is cropped by 1.75em at the top.
const HUB_LINKS = [
  { id: "login-link-stock", d: "M118 92 C 140 98, 146 112, 150 128", dur: "3.6s" },
  { id: "login-link-sync", d: "M262 62 C 250 82, 236 92, 214 104", dur: "4.2s" },
  { id: "login-link-alert", d: "M146 192 C 140 212, 124 222, 108 232", dur: "3.2s" },
];

const clamp = (value) => Math.max(-1, Math.min(1, value));

function LoginHero() {
  const stageRef = useRef(null);

  // Lightweight parallax: pointer position is written to two CSS custom
  // properties (at most once per frame). CSS transitions do the easing,
  // so there is no animation loop and no React re-render on mouse move.
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
      stage.style.setProperty("--login-mx", clamp(x).toFixed(3));
      stage.style.setProperty("--login-my", clamp(y).toFixed(3));
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
      stage.style.setProperty("--login-mx", "0");
      stage.style.setProperty("--login-my", "0");
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
    <aside className="login-hero" aria-labelledby="login-hero-title">
      <div className="login-hero__stage" ref={stageRef}>
        <div className="login-hero__backdrop" aria-hidden="true">
          <span className="login-hero__orb login-hero__orb--cyan" />
          <span className="login-hero__orb login-hero__orb--blue" />
          <span className="login-hero__orb login-hero__orb--violet" />
          <span className="login-hero__grid" />
        </div>

        <div className="login-hero__visual" aria-hidden="true">
          <div className="login-scene">
            <svg className="login-scene__links" viewBox="0 17.5 360 275" fill="none">
              {HUB_LINKS.map((link) => (
                <g key={link.id}>
                  <path id={link.id} className="login-scene__link" d={link.d} />
                  <circle className="login-scene__packet" r="2.4">
                    <animateMotion dur={link.dur} repeatCount="indefinite">
                      <mpath href={`#${link.id}`} />
                    </animateMotion>
                  </circle>
                </g>
              ))}
            </svg>

            <div className="login-hub">
              <span className="login-hub__shadow" />
              <div className="login-hub__float">
                <div className="login-hub__tilt">
                  <div className="login-hub__spin">
                    <div className="login-hub__plate">
                      <span className="login-hub__slab login-hub__slab--front" />
                      <span className="login-hub__slab login-hub__slab--side" />
                      <span className="login-hub__slot" />
                      {HUB_STACKS.map((stack) => (
                        <div
                          key={`${stack.x}-${stack.y}`}
                          className={`login-hub__stack login-hub__stack--${stack.tone ?? "teal"}`}
                          style={{ "--x": stack.x, "--y": stack.y, "--h": stack.h }}
                        >
                          <span className="login-hub__face login-hub__face--top" />
                          <span className="login-hub__face login-hub__face--front" />
                          <span className="login-hub__face login-hub__face--side" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <span className="login-sphere login-sphere--cyan" />
            <span className="login-sphere login-sphere--violet" />
            <span className="login-sphere login-sphere--blue" />

            {PARTICLES.map((particle) => (
              <span
                key={`${particle.x}-${particle.y}`}
                className={`login-particle login-particle--${particle.tone}`}
                style={{
                  "--px": particle.x,
                  "--py": particle.y,
                  "--ps": particle.size,
                  "--pd": `${particle.delay}s`,
                }}
              />
            ))}

            <div className="login-float login-float--stock">
              <div className="login-float__body">
                <div className="login-float__head">
                  <span className="login-float__badge login-float__badge--teal">
                    <PackageIcon />
                  </span>
                  <span className="login-float__label">Stock health</span>
                </div>
                <div className="login-float__metric">
                  <strong>92%</strong>
                  <span className="login-float__delta">+4.2%</span>
                </div>
                <div className="login-float__meter">
                  <span />
                </div>
              </div>
            </div>

            <div className="login-float login-float--sync">
              <div className="login-float__body login-float__body--pill">
                <span className="login-float__live" />
                <span>All warehouses synced</span>
              </div>
            </div>

            <div className="login-float login-float--orders">
              <div className="login-float__body">
                <div className="login-float__head">
                  <span className="login-float__badge login-float__badge--blue">
                    <TrendIcon />
                  </span>
                  <span className="login-float__label">Orders today</span>
                </div>
                <div className="login-float__metric">
                  <strong>248</strong>
                  <span className="login-float__delta login-float__delta--blue">+18%</span>
                </div>
                <svg className="login-float__spark" viewBox="0 0 106 30" fill="none">
                  <defs>
                    <linearGradient id="login-spark-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38CBF4" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#38CBF4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    className="login-float__spark-area"
                    d="M2 24 L16 20 L28 22 L42 14 L56 17 L70 9 L84 12 L102 4 L102 30 L2 30 Z"
                    fill="url(#login-spark-fill)"
                  />
                  <path
                    className="login-float__spark-line"
                    d="M2 24 L16 20 L28 22 L42 14 L56 17 L70 9 L84 12 L102 4"
                    pathLength="1"
                  />
                  <circle cx="102" cy="4" r="2.6" className="login-float__spark-dot" />
                </svg>
              </div>
            </div>

            <div className="login-float login-float--alert">
              <div className="login-float__body login-float__body--row">
                <span className="login-float__badge login-float__badge--violet">
                  <BellIcon />
                </span>
                <span className="login-float__stack">
                  <strong>3 items running low</strong>
                  <span>Below reorder point</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-hero__copy">
          <p className="login-hero__eyebrow">
            <span className="login-hero__pulse" aria-hidden="true" />
            Inventory intelligence
          </p>
          <h2 id="login-hero-title" className="login-hero__title">
            Every unit, every warehouse, <span>in sync.</span>
          </h2>
          <p className="login-hero__text">
            Track receipts, deliveries and internal transfers in one place&nbsp;— and
            catch low stock before it slows you down.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Form field                                                          */
/* ------------------------------------------------------------------ */

function LoginField({ id, label, icon, error, hint, trailing, className = "", ref, ...inputProps }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`login-field${error ? " login-field--invalid" : ""} ${className}`.trim()}>
      <label className="login-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="login-field__control">
        <span className="login-field__icon">{icon}</span>
        <input
          ref={ref}
          id={id}
          className="login-field__input"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <p className="login-field__message login-field__message--error" id={errorId}>
          <AlertIcon />
          {error}
        </p>
      )}
      {hint && (
        <p className="login-field__message login-field__message--hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

const CURRENT_YEAR = new Date().getFullYear();

function LoginComponent() {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [authError, setAuthError] = useState("");

  const errors = validateLogin(values);
  const showError = (field) => (submitAttempted || touched[field] ? errors[field] : undefined);
  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  // Give the success state a moment on screen before leaving the page.
  useEffect(() => {
    if (status !== "success") return undefined;
    const timer = window.setTimeout(
      () => navigate(REDIRECT_PATH, { replace: true }),
      REDIRECT_DELAY_MS
    );
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (authError) setAuthError("");
  };

  // Format errors appear once a field has been filled and left;
  // "required" errors wait until the first submit so empty fields
  // don't nag while the user tabs through.
  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (value && !touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handlePasswordKey = (event) => {
    setCapsLockOn(event.getModifierState?.("CapsLock") ?? false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status !== "idle") return;

    setSubmitAttempted(true);
    const currentErrors = validateLogin(values);
    if (currentErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (currentErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setStatus("submitting");
    setAuthError("");

    try {
      const data = await requestLogin({
        email: values.email.trim(),
        password: values.password,
      });
      persistSession(data, rememberMe);
      setStatus("success");
    } catch (error) {
      setAuthError(error.message || "Unable to sign in. Please try again.");
      setStatus("idle");
    }
  };

  const emailError = showError("email");
  const passwordError = showError("password");

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-panel__inner">
          <div className="login-card">
            <div className="login-brand">
              <span className="login-brand__mark">
                <BrandMark />
              </span>
              <span className="login-brand__text">
                <span className="login-brand__name">StockSense</span>
                <span className="login-brand__tag">Inventory Management</span>
              </span>
            </div>

            <h1 id="login-title" className="login-card__title">
              Welcome back
            </h1>
            <p className="login-card__subtitle">Sign in to continue managing your inventory.</p>

            {authError && (
              <div className="login-alert login-alert--error" role="alert">
                <AlertIcon />
                <span>{authError}</span>
              </div>
            )}

            {isSuccess && (
              <div className="login-alert login-alert--success">
                <CheckCircleIcon />
                <span>Signed in. Taking you to your dashboard…</span>
              </div>
            )}

            <p className="login-sr-only" role="status" aria-live="polite">
              {isSubmitting && "Signing in…"}
              {isSuccess && "Signed in. Redirecting to your dashboard."}
            </p>

            <form
              className="login-form"
              method="post"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
            >
              <LoginField
                ref={emailRef}
                id="login-email"
                name="email"
                type="email"
                label="Email address"
                icon={<MailIcon />}
                placeholder="you@company.com"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={emailError}
              />

              <LoginField
                ref={passwordRef}
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                icon={<LockIcon />}
                className="login-field--password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                onBlur={(event) => {
                  handleBlur(event);
                  setCapsLockOn(false);
                }}
                onKeyDown={handlePasswordKey}
                onKeyUp={handlePasswordKey}
                error={passwordError}
                hint={
                  capsLockOn && (
                    <>
                      <CapsLockIcon />
                      Caps Lock is on
                    </>
                  )
                }
                trailing={
                  <button
                    type="button"
                    className="login-field__toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-controls="login-password"
                  >
                    <span className="login-field__toggle-icon" key={showPassword ? "hide" : "show"}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                  </button>
                }
              />

              <div className="login-form__row">
                <label className="login-check">
                  <input
                    type="checkbox"
                    className="login-check__input"
                    name="remember"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span className="login-check__box" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <span>Remember me</span>
                </label>

                <Link className="login-link" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={`login-btn${isSubmitting ? " is-loading" : ""}${isSuccess ? " is-success" : ""}`}
                disabled={status !== "idle"}
              >
                <span className="login-btn__sheen" aria-hidden="true" />
                {isSubmitting && (
                  <>
                    <span className="login-btn__spinner" aria-hidden="true" />
                    <span>Signing in…</span>
                  </>
                )}
                {isSuccess && (
                  <>
                    <CheckIcon className="login-btn__icon" />
                    <span>Signed in</span>
                  </>
                )}
                {status === "idle" && (
                  <>
                    <span>Sign in</span>
                    <ArrowRightIcon className="login-btn__icon login-btn__arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>New to StockSense?</span>
            </div>

            <Link className="login-btn-outline" to="/signup">
              Create an account
            </Link>
          </div>
        </div>

        <p className="login-panel__footer">
          © {CURRENT_YEAR} StockSense · Inventory Management System
        </p>
      </section>

      <LoginHero />
    </main>
  );
}

export default LoginComponent;
