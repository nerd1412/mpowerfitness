/**
 * BluetoothSync — Web Bluetooth API fitness device integration
 *
 * Supports standard Bluetooth GATT fitness profiles:
 *   • Heart Rate Monitor  (0x180D)  → heart rate BPM
 *   • Weight Scale        (0x181D)  → body weight in kg
 *   • Body Composition    (0x181B)  → weight + body fat %
 *   • Fitness Machine     (0x1826)  → calories, speed, cadence
 *   • Running Speed       (0x1814)  → cadence, speed
 *
 * Works with:  Polar, Garmin, Wahoo, Withings, Xiaomi Mi Scale,
 *              Renpho, FitTrack, most ANT+/BLE heart rate straps.
 *
 * Falls back gracefully on unsupported browsers (Safari, older Android).
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

/* ── GATT service / characteristic UUIDs ──────────────────────── */
const SERVICES = {
  HEART_RATE:       '0000180d-0000-1000-8000-00805f9b34fb',
  WEIGHT_SCALE:     '0000181d-0000-1000-8000-00805f9b34fb',
  BODY_COMPOSITION: '0000181b-0000-1000-8000-00805f9b34fb',
  FITNESS_MACHINE:  '00001826-0000-1000-8000-00805f9b34fb',
  RUNNING_SPEED:    '00001814-0000-1000-8000-00805f9b34fb',
  BATTERY:          '0000180f-0000-1000-8000-00805f9b34fb',
};

const CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT:      '00002a37-0000-1000-8000-00805f9b34fb',
  WEIGHT_MEASUREMENT:          '00002a9d-0000-1000-8000-00805f9b34fb',
  BODY_COMPOSITION_MEASUREMENT:'00002a9c-0000-1000-8000-00805f9b34fb',
  TREADMILL_DATA:               '00002acd-0000-1000-8000-00805f9b34fb',
  RSC_MEASUREMENT:              '00002a53-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL:                '00002a19-0000-1000-8000-00805f9b34fb',
};

/* ── Parsers ───────────────────────────────────────────────────── */
const parseHeartRate = (dv) => {
  const flags = dv.getUint8(0);
  const is16bit = flags & 0x01;
  return { heartRate: is16bit ? dv.getUint16(1, true) : dv.getUint8(1) };
};

const parseWeight = (dv) => {
  // Flags byte
  const flags = dv.getUint8(0);
  const isImperial = flags & 0x01;
  const rawWeight = dv.getUint16(1, true);
  const weightKg = isImperial ? rawWeight * 0.005 * 0.4536 : rawWeight * 0.005;
  return { weight: Math.round(weightKg * 10) / 10 };
};

const parseBodyComposition = (dv) => {
  const flags = dv.getUint16(0, true);
  const isImperial = flags & 0x0001;
  const hasFat = flags & 0x0002;
  const rawWeight = dv.getUint16(2, true);
  const weightKg = isImperial ? rawWeight * 0.005 * 0.4536 : rawWeight * 0.005;
  const result = { weight: Math.round(weightKg * 10) / 10 };
  if (hasFat) {
    const rawFat = dv.getUint16(4, true);
    result.bodyFat = Math.round((rawFat * 0.1) * 10) / 10;
  }
  return result;
};

const parseTreadmill = (dv) => {
  // Treadmill data characteristic (simplified)
  const result = {};
  try {
    const flags = dv.getUint16(0, true);
    let offset = 2;
    if (flags & 0x0001) { result.speed = dv.getUint16(offset, true) * 0.01; offset += 2; }
    if (flags & 0x0004) { result.cadence = dv.getUint8(offset) * 0.5; offset += 1; }
    if (flags & 0x0200) { result.caloriesBurned = dv.getUint16(offset, true); }
  } catch (_) {}
  return result;
};

/* ── Status labels ─────────────────────────────────────────────── */
const STATUS = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  READING: 'reading',
  DONE: 'done',
  ERROR: 'error',
  UNSUPPORTED: 'unsupported',
};

/* ── Device metric display name map ────────────────────────────── */
const METRIC_LABELS = {
  heartRate:     { label: 'Heart Rate', unit: 'bpm', icon: '❤️' },
  weight:        { label: 'Weight',     unit: 'kg',  icon: '⚖️' },
  bodyFat:       { label: 'Body Fat',   unit: '%',   icon: '📊' },
  caloriesBurned:{ label: 'Calories',   unit: 'cal', icon: '🔥' },
  speed:         { label: 'Speed',      unit: 'km/h',icon: '💨' },
  cadence:       { label: 'Cadence',    unit: 'spm', icon: '🦶' },
  battery:       { label: 'Battery',    unit: '%',   icon: '🔋' },
};

/* ── Main component ─────────────────────────────────────────────── */
const BluetoothSync = ({ onDataSync }) => {
  const [status, setStatus] = useState(
    typeof navigator !== 'undefined' && navigator.bluetooth
      ? STATUS.IDLE
      : STATUS.UNSUPPORTED
  );
  const [deviceName, setDeviceName] = useState('');
  const [metrics, setMetrics] = useState({});
  const [log, setLog]       = useState([]);
  const [open, setOpen]     = useState(false);
  const deviceRef           = useRef(null);
  const charRefs            = useRef([]);

  const addLog = useCallback((msg) => {
    setLog(prev => [...prev.slice(-8), msg]);
  }, []);

  const updateMetric = useCallback((key, value) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  }, []);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      charRefs.current.forEach(c => {
        try { c.removeEventListener('characteristicvaluechanged', () => {}); } catch (_) {}
      });
      try {
        if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect();
      } catch (_) {}
    };
  }, []);

  const handleDisconnect = useCallback(() => {
    setStatus(STATUS.IDLE);
    setDeviceName('');
    addLog('Device disconnected');
  }, [addLog]);

  const subscribeChar = useCallback(async (service, uuid, parser) => {
    try {
      const char = await service.getCharacteristic(uuid);
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', (e) => {
        const parsed = parser(e.target.value);
        Object.entries(parsed).forEach(([k, v]) => updateMetric(k, v));
      });
      charRefs.current.push(char);
      return true;
    } catch (_) { return false; }
  }, [updateMetric]);

  const readBattery = useCallback(async (server) => {
    try {
      const svc  = await server.getPrimaryService(SERVICES.BATTERY);
      const char = await svc.getCharacteristic(CHARACTERISTICS.BATTERY_LEVEL);
      const val  = await char.readValue();
      updateMetric('battery', val.getUint8(0));
    } catch (_) {}
  }, [updateMetric]);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) return;
    setStatus(STATUS.SCANNING);
    setMetrics({});
    setLog([]);
    addLog('Scanning for Bluetooth devices…');

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: Object.values(SERVICES),
      });

      deviceRef.current = device;
      setDeviceName(device.name || 'Unknown Device');
      addLog(`Found: ${device.name || 'Unknown Device'}`);
      setStatus(STATUS.CONNECTING);

      device.addEventListener('gattserverdisconnected', handleDisconnect);

      const server = await device.gatt.connect();
      setStatus(STATUS.READING);
      addLog('Connected — reading services…');

      let discovered = 0;

      // Heart Rate
      try {
        const svc = await server.getPrimaryService(SERVICES.HEART_RATE);
        const ok = await subscribeChar(svc, CHARACTERISTICS.HEART_RATE_MEASUREMENT, parseHeartRate);
        if (ok) { discovered++; addLog('❤️ Heart rate monitor ready'); }
      } catch (_) {}

      // Weight Scale
      try {
        const svc = await server.getPrimaryService(SERVICES.WEIGHT_SCALE);
        const ok = await subscribeChar(svc, CHARACTERISTICS.WEIGHT_MEASUREMENT, parseWeight);
        if (ok) { discovered++; addLog('⚖️ Weight scale ready'); }
      } catch (_) {}

      // Body Composition
      try {
        const svc = await server.getPrimaryService(SERVICES.BODY_COMPOSITION);
        const ok = await subscribeChar(svc, CHARACTERISTICS.BODY_COMPOSITION_MEASUREMENT, parseBodyComposition);
        if (ok) { discovered++; addLog('📊 Body composition sensor ready'); }
      } catch (_) {}

      // Fitness Machine (treadmill / bike)
      try {
        const svc = await server.getPrimaryService(SERVICES.FITNESS_MACHINE);
        const ok = await subscribeChar(svc, CHARACTERISTICS.TREADMILL_DATA, parseTreadmill);
        if (ok) { discovered++; addLog('🏃 Fitness machine ready'); }
      } catch (_) {}

      // Running Speed & Cadence
      try {
        const svc = await server.getPrimaryService(SERVICES.RUNNING_SPEED);
        const ok = await subscribeChar(svc, CHARACTERISTICS.RSC_MEASUREMENT, (dv) => {
          const speed = dv.getUint16(1, true) * 0.00390625 * 3.6; // m/s → km/h
          return { speed: Math.round(speed * 10) / 10 };
        });
        if (ok) { discovered++; addLog('🦶 Running sensor ready'); }
      } catch (_) {}

      await readBattery(server);

      if (discovered === 0) {
        addLog('⚠️ No standard fitness services found. Device data limited.');
      }

      setStatus(STATUS.CONNECTED);
      addLog(`Ready — ${discovered} service${discovered !== 1 ? 's' : ''} active`);
    } catch (err) {
      if (err.name === 'NotFoundError' || err.message?.includes('cancelled')) {
        addLog('Scan cancelled by user.');
        setStatus(STATUS.IDLE);
      } else {
        addLog(`Error: ${err.message}`);
        setStatus(STATUS.ERROR);
      }
    }
  }, [addLog, handleDisconnect, subscribeChar, readBattery]);

  const disconnect = useCallback(() => {
    try {
      charRefs.current.forEach(c => {
        try { c.stopNotifications(); } catch (_) {}
      });
      charRefs.current = [];
      if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect();
    } catch (_) {}
    setStatus(STATUS.IDLE);
    setDeviceName('');
    setMetrics({});
  }, []);

  const syncToForm = useCallback(() => {
    if (onDataSync) onDataSync(metrics);
    addLog('✅ Data synced to log form');
    setStatus(STATUS.DONE);
  }, [metrics, onDataSync, addLog]);

  const hasData = Object.keys(metrics).length > 0;

  /* ── Unsupported browser ──────────────────────────────────────── */
  if (status === STATUS.UNSUPPORTED) {
    return (
      <div style={{
        background: 'rgba(255,176,32,0.06)', border: '1px solid rgba(255,176,32,0.2)',
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 2 }}>
            Bluetooth not available
          </p>
          <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
            Use Chrome or Edge on desktop / Android. iOS Safari does not support Web Bluetooth.
          </p>
        </div>
      </div>
    );
  }

  /* ── Collapsed pill trigger ───────────────────────────────────── */
  const pillColor = {
    [STATUS.IDLE]:       'var(--t3)',
    [STATUS.CONNECTED]:  'var(--success)',
    [STATUS.DONE]:       'var(--lime)',
    [STATUS.ERROR]:      'var(--error)',
    [STATUS.SCANNING]:   'var(--info)',
    [STATUS.CONNECTING]: 'var(--info)',
    [STATUS.READING]:    'var(--lime)',
  }[status] || 'var(--t3)';

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--s2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '9px 14px', cursor: 'pointer',
          width: '100%', transition: 'all 0.15s',
          borderColor: status === STATUS.CONNECTED ? 'rgba(34,217,122,0.3)' : 'var(--border)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--s3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--s2)'}
        aria-expanded={open}
      >
        {/* Bluetooth icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pillColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', flex: 1, textAlign: 'left' }}>
          {status === STATUS.CONNECTED
            ? `Connected: ${deviceName}`
            : status === STATUS.SCANNING
            ? 'Scanning…'
            : status === STATUS.CONNECTING
            ? 'Connecting…'
            : 'Connect Fitness Device'}
        </span>
        {status === STATUS.CONNECTED && (
          <span style={{
            background: 'rgba(34,217,122,0.12)', color: 'var(--success)',
            borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
          }}>LIVE</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round">
          {open
            ? <polyline points="18 15 12 9 6 15"/>
            : <polyline points="6 9 12 15 18 9"/>}
        </svg>
      </button>

      {/* Expanded panel */}
      {open && (
        <div style={{
          marginTop: 8, background: 'var(--s1)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16, animation: 'fadeIn 0.18s ease',
        }}>

          {/* Connection controls */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {status === STATUS.IDLE || status === STATUS.ERROR || status === STATUS.DONE ? (
              <button
                onClick={connect}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
                </svg>
                Scan &amp; Connect
              </button>
            ) : status === STATUS.CONNECTED ? (
              <>
                <button
                  onClick={disconnect}
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                >
                  Disconnect
                </button>
                {hasData && (
                  <button
                    onClick={syncToForm}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    ↓ Use This Data
                  </button>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}/>
                <span style={{ fontSize: 13, color: 'var(--t2)' }}>
                  {status === STATUS.SCANNING ? 'Opening device picker…'
                    : status === STATUS.CONNECTING ? 'Connecting…'
                    : 'Reading sensors…'}
                </span>
              </div>
            )}
          </div>

          {/* Live metrics */}
          {hasData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 8, marginBottom: 12,
            }}>
              {Object.entries(metrics).map(([key, value]) => {
                const meta = METRIC_LABELS[key];
                if (!meta) return null;
                return (
                  <div key={key} style={{
                    background: 'var(--s2)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '10px 12px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{meta.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--lime)', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{meta.unit}</div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>{meta.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {!hasData && status === STATUS.CONNECTED && (
            <div style={{
              textAlign: 'center', padding: '16px 0', color: 'var(--t2)', fontSize: 13,
            }}>
              Waiting for sensor data… Step on scale or start moving.
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div style={{
              background: 'var(--black)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 10px', maxHeight: 120, overflowY: 'auto',
            }}>
              {log.map((entry, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>
                  {entry}
                </div>
              ))}
            </div>
          )}

          {/* Help text */}
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 10, lineHeight: 1.6 }}>
            Works with Polar, Garmin, Wahoo, Withings, Mi Scale, Renpho & most BLE fitness devices.
            Keep device nearby and Bluetooth enabled on your device.
          </p>
        </div>
      )}
    </div>
  );
};

export default BluetoothSync;
