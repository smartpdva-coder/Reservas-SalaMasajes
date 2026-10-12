// Iconos SVG inline, sin dependencias externas ni emojis.
// Todos heredan color por `currentColor` y tamaño por `width`/`height`.

export function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 19.5c1.4-3.2 4.2-5 7.5-5s6.1 1.8 7.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5V12l3.2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCheckCircle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8.5 12.3l2.2 2.2 4.8-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8.25 10.5V8a3.75 3.75 0 0 1 7.5 0v2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLockOpen(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8.25 10.5V8a3.75 3.75 0 0 1 7.3-1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAlertCircle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconPause(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <rect x="6.5" y="5.5" width="3.6" height="13" rx="1" fill="currentColor" />
      <rect x="13.9" y="5.5" width="3.6" height="13" rx="1" fill="currentColor" />
    </svg>
  );
}

export function IconPlay(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path d="M7.5 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
    </svg>
  );
}

export function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path
        d="M12 3.5l7 2.6v5.4c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6.1l7-2.6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.1l2.1 2.1 4-4.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path
        d="M9.5 4.5h-2A2 2 0 0 0 5.5 6.5v11a2 2 0 0 0 2 2h2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 15.5l4-3.5-4-3.5M17.3 12H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path
        d="M6.5 6.5l11 11M17.5 6.5l-11 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSpinner(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSpa(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" {...props}>
      <path
        d="M12 21c-4.5-1-7-4-7-8 0-3 1.8-5.6 4.4-7C9 7.6 9 9.8 10.2 11c1.2-3 .4-6-1-8 3.6 1 6 4 6 7.6 0 1.4-.4 2.6-1 3.6C16.4 12 18 10 18 7.6 20 9.6 21 12 21 14c0 4-2.5 7-9 7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCpu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 3v2.2M12 3v2.2M15 3v2.2M9 18.8V21M12 18.8V21M15 18.8V21M3 9h2.2M3 12h2.2M3 15h2.2M18.8 9H21M18.8 12H21M18.8 15H21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
