import React, { useEffect, useRef, useCallback } from 'react';

/**
 * VideoCall — Production-ready video calling via Jitsi Meet External API.
 *
 * Uses meet.jit.si (free, WebRTC, no account needed).
 * Room name is deterministic from the bookingId so both trainer and user
 * always join the exact same room.
 *
 * @param {string}   bookingId   - Booking UUID; first 8 chars used as room suffix
 * @param {string}   displayName - User's display name shown in the call
 * @param {Function} onClose     - Called when user leaves / closes the modal
 */
const VideoCall = ({ bookingId, displayName, onClose }) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  /* Derive a short, URL-safe room name from the bookingId */
  const roomName = `MPowerFitness-${(bookingId || 'session').replace(/-/g, '').slice(0, 10)}`;

  const loadJitsiScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Jitsi script'));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;

        apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: displayName || 'MPower Member' },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            toolbarButtons: [
              'microphone', 'camera', 'closedcaptions', 'desktop',
              'fullscreen', 'fodeviceselection', 'hangup', 'chat',
              'tileview', 'select-background',
            ],
            subject: 'MPower Fitness Training Session',
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            DEFAULT_BACKGROUND: '#111111',
            TOOLBAR_ALWAYS_VISIBLE: false,
            APP_NAME: 'MPower Fitness',
          },
        });

        /* Auto-close the modal when the user hangs up */
        apiRef.current.addEventListener('readyToClose', () => {
          if (!cancelled) onClose();
        });
        apiRef.current.addEventListener('videoConferenceLeft', () => {
          if (!cancelled) onClose();
        });
      })
      .catch(() => {
        /* Jitsi script failed to load — fall back to opening in a new tab */
        if (!cancelled) {
          window.open(`https://meet.jit.si/${roomName}`, '_blank', 'noopener,noreferrer');
          onClose();
        }
      });

    return () => {
      cancelled = true;
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch (_) {}
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, loadJitsiScript, onClose]);

  return (
    /* Full-screen overlay */
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--success, #4ade80)',
            boxShadow: '0 0 6px var(--success, #4ade80)',
          }}/>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>
            MPower Live Session
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
            #{roomName.slice(-10)}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,68,68,0.18)', border: '1px solid rgba(255,68,68,0.35)',
            color: '#ff6b6b', borderRadius: 8, padding: '5px 14px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ✕ Leave
        </button>
      </div>

      {/* Jitsi iframe mount point */}
      <div ref={containerRef} style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {/* Jitsi External API mounts its iframe here */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', color: 'rgba(255,255,255,0.35)', fontSize: 13,
        }}>
          Connecting to video call…
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
