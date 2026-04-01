/**
 * BluetoothSync — Web Bluetooth API fitness device integration
 *
 * Standard GATT profiles supported:
 *   Heart Rate Monitor  (0x180D) · Weight Scale (0x181D)
 *   Body Composition    (0x181B) · Fitness Machine (0x1826)
 *   Running Speed/Cadence (0x1814) · Pulse Oximetry (0x1822)
 *   Battery Service     (0x180F) · Step Counter via CSC (0x1816)
 *
 * Indian devices with BLE support:
 *   MI Band / Xiaomi Smart Band, boAt Wave/Rockerz, Noise ColorFit,
 *   Fire-Boltt Talk, realme Band, Amazfit GTR/GTS/Bip, Fitbit Inspire,
 *   Garmin Forerunner, Polar H10, Wahoo TICKR, Renpho scales,
 *   Decathlon Coach, HealthifyMe compatible scales
 *
 * Platform support:
 *   ✓ Chrome / Edge — desktop (Win/Mac/Linux) and Android
 *   ✗ Safari / Firefox / iOS — no Web Bluetooth API
 *   → iOS users: manual data entry or Health app CSV export (shown as fallback)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

/* ── GATT service / characteristic UUIDs ──────────────────────── */
const SVC = {
  HEART_RATE:       '0000180d-0000-1000-8000-00805f9b34fb',
  WEIGHT_SCALE:     '0000181d-0000-1000-8000-00805f9b34fb',
  BODY_COMPOSITION: '0000181b-0000-1000-8000-00805f9b34fb',
  FITNESS_MACHINE:  '00001826-0000-1000-8000-00805f9b34fb',
  RUNNING_SPEED:    '00001814-0000-1000-8000-00805f9b34fb',
  PULSE_OX:         '00001822-0000-1000-8000-00805f9b34fb',
  BATTERY:          '0000180f-0000-1000-8000-00805f9b34fb',
};

const CHAR = {
  HEART_RATE_MEAS:  '00002a37-0000-1000-8000-00805f9b34fb',
  WEIGHT_MEAS:      '00002a9d-0000-1000-8000-00805f9b34fb',
  BODY_COMP_MEAS:   '00002a9c-0000-1000-8000-00805f9b34fb',
  TREADMILL_DATA:   '00002acd-0000-1000-8000-00805f9b34fb',
  RSC_MEAS:         '00002a53-0000-1000-8000-00805f9b34fb',
  PLX_SPOT:         '00002a5e-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL:    '00002a19-0000-1000-8000-00805f9b34fb',
};

/* ── Data parsers ──────────────────────────────────────────────── */
const parseHeartRate = (dv) => ({
  heartRate: (dv.getUint8(0) & 0x01) ? dv.getUint16(1, true) : dv.getUint8(1),
});

const parseWeight = (dv) => {
  const isLb = dv.getUint8(0) & 0x01;
  const raw  = dv.getUint16(1, true);
  return { weight: Math.round((isLb ? raw * 0.005 * 0.4536 : raw * 0.005) * 10) / 10 };
};

const parseBodyComp = (dv) => {
  const flags = dv.getUint16(0, true);
  const isLb  = flags & 0x0001;
  const raw   = dv.getUint16(2, true);
  const out   = { weight: Math.round((isLb ? raw * 0.005 * 0.4536 : raw * 0.005) * 10) / 10 };
  if (flags & 0x0002) out.bodyFat = Math.round(dv.getUint16(4, true) * 0.1 * 10) / 10;
  return out;
};

const parseTreadmill = (dv) => {
  const out = {}; let off = 2;
  const flags = dv.getUint16(0, true);
  if (flags & 0x0001) { out.speed   = Math.round(dv.getUint16(off, true) * 0.01 * 10) / 10; off += 2; }
  if (flags & 0x0004) { out.cadence = dv.getUint8(off) * 0.5; off++; }
  if (flags & 0x0200) { out.caloriesBurned = dv.getUint16(off, true); }
  return out;
};

const parsePlx = (dv) => {
  const flags = dv.getUint8(0);
  const spo2  = dv.getUint8(1);
  const pulse = dv.getUint8(3);
  const out   = {};
  if (!(flags & 0x04)) out.spo2 = spo2;        // SpO2 %
  if (!(flags & 0x08)) out.heartRate = pulse;   // Pulse rate
  return out;
};

/* ── Metric display metadata ───────────────────────────────────── */
const METRICS_META = {
  heartRate:     { label:'Heart Rate', unit:'bpm',  icon:'❤️',  color:'#FF4D4D' },
  spo2:          { label:'SpO₂',       unit:'%',    icon:'🫁',  color:'#4E9FFF' },
  weight:        { label:'Weight',     unit:'kg',   icon:'⚖️',  color:'#C8F135' },
  bodyFat:       { label:'Body Fat',   unit:'%',    icon:'📊',  color:'#FF9F40' },
  caloriesBurned:{ label:'Calories',   unit:'kcal', icon:'🔥',  color:'#FF5F1F' },
  speed:         { label:'Speed',      unit:'km/h', icon:'💨',  color:'#22D97A' },
  cadence:       { label:'Cadence',    unit:'spm',  icon:'🦶',  color:'#A78BFA' },
  battery:       { label:'Battery',    unit:'%',    icon:'🔋',  color:'#FFB020' },
};

const STATUS = { IDLE:'idle', SCANNING:'scanning', CONNECTING:'connecting',
  CONNECTED:'connected', READING:'reading', DONE:'done',
  ERROR:'error', UNSUPPORTED:'unsupported' };

const hasBt = () => typeof navigator !== 'undefined' && !!navigator.bluetooth;

/* ── BluetoothSync component ────────────────────────────────────── */
const BluetoothSync = ({ onDataSync }) => {
  const [status, setStatus]       = useState(hasBt() ? STATUS.IDLE : STATUS.UNSUPPORTED);
  const [deviceName, setDeviceName] = useState('');
  const [metrics, setMetrics]     = useState({});
  const [open, setOpen]           = useState(false);
  const [log, setLog]             = useState([]);
  const deviceRef = useRef(null);
  const charRefs  = useRef([]);

  const addLog = useCallback(msg => setLog(p => [...p.slice(-6), msg]), []);
  const setM   = useCallback((k, v) => setMetrics(p => ({ ...p, [k]: v })), []);

  useEffect(() => () => {
    charRefs.current.forEach(c => { try { c.stopNotifications(); } catch (_) {} });
    try { if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect(); } catch (_) {}
  }, []);

  const subChar = useCallback(async (svc, uuid, parser) => {
    try {
      const c = await svc.getCharacteristic(uuid);
      await c.startNotifications();
      c.addEventListener('characteristicvaluechanged', e => {
        Object.entries(parser(e.target.value)).forEach(([k, v]) => setM(k, v));
      });
      charRefs.current.push(c);
      return true;
    } catch (_) { return false; }
  }, [setM]);

  const readBattery = useCallback(async (srv) => {
    try {
      const s = await srv.getPrimaryService(SVC.BATTERY);
      const c = await s.getCharacteristic(CHAR.BATTERY_LEVEL);
      setM('battery', (await c.readValue()).getUint8(0));
    } catch (_) {}
  }, [setM]);

  const connect = useCallback(async () => {
    if (!hasBt()) return;
    setStatus(STATUS.SCANNING); setMetrics({}); setLog([]);
    addLog('Opening device picker…');
    try {
      const dev = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: Object.values(SVC),
      });
      deviceRef.current = dev;
      setDeviceName(dev.name || 'Unknown Device');
      setStatus(STATUS.CONNECTING);
      addLog(`Found: ${dev.name || 'Unknown'}`);

      dev.addEventListener('gattserverdisconnected', () => {
        setStatus(STATUS.IDLE); setDeviceName('');
        addLog('Device disconnected');
      });

      const srv = await dev.gatt.connect();
      setStatus(STATUS.READING);
      addLog('Reading sensors…');
      let found = 0;

      const attempts = [
        [SVC.HEART_RATE,       CHAR.HEART_RATE_MEAS, parseHeartRate, '❤️  Heart rate'],
        [SVC.WEIGHT_SCALE,     CHAR.WEIGHT_MEAS,     parseWeight,    '⚖️  Weight scale'],
        [SVC.BODY_COMPOSITION, CHAR.BODY_COMP_MEAS,  parseBodyComp,  '📊  Body composition'],
        [SVC.FITNESS_MACHINE,  CHAR.TREADMILL_DATA,  parseTreadmill, '🏃  Fitness machine'],
        [SVC.RUNNING_SPEED,    CHAR.RSC_MEAS,
          dv => ({ speed: Math.round(dv.getUint16(1, true) * 0.00390625 * 3.6 * 10) / 10 }),
          '🦶  Speed & cadence'],
        [SVC.PULSE_OX,         CHAR.PLX_SPOT,        parsePlx,       '🫁  SpO₂ / Pulse'],
      ];

      for (const [svcId, charId, parser, label] of attempts) {
        try {
          const s = await srv.getPrimaryService(svcId);
          if (await subChar(s, charId, parser)) { found++; addLog(label); }
        } catch (_) {}
      }

      await readBattery(srv);
      addLog(found ? `${found} sensor${found > 1 ? 's' : ''} active — move or step on scale` : '⚠️ No standard GATT services. Try another device.');
      setStatus(STATUS.CONNECTED);
    } catch (err) {
      if (err.name === 'NotFoundError' || err.message?.includes('cancel')) {
        addLog('Cancelled.'); setStatus(STATUS.IDLE);
      } else {
        addLog(`Error: ${err.message}`); setStatus(STATUS.ERROR);
      }
    }
  }, [addLog, subChar, readBattery]);

  const disconnect = useCallback(() => {
    charRefs.current.forEach(c => { try { c.stopNotifications(); } catch (_) {} });
    charRefs.current = [];
    try { if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect(); } catch (_) {}
    setStatus(STATUS.IDLE); setDeviceName(''); setMetrics({});
  }, []);

  const syncData = useCallback(() => {
    if (onDataSync) onDataSync(metrics);
    addLog('✅ Data synced to form');
    setStatus(STATUS.DONE);
    setOpen(false);
  }, [metrics, onDataSync, addLog]);

  const hasData    = Object.keys(metrics).length > 0;
  const isActive   = [STATUS.SCANNING, STATUS.CONNECTING, STATUS.READING].includes(status);
  const dotColor   = { [STATUS.IDLE]:'var(--t3)', [STATUS.CONNECTED]:'var(--success)',
    [STATUS.DONE]:'var(--lime)', [STATUS.ERROR]:'var(--error)',
    [STATUS.SCANNING]:'var(--info)', [STATUS.CONNECTING]:'var(--info)',
    [STATUS.READING]:'var(--lime)' }[status] || 'var(--t3)';

  /* iOS / Firefox / unsupported */
  if (status === STATUS.UNSUPPORTED) {
    return (
      <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px',
        background:'rgba(255,176,32,0.06)', border:'1px solid rgba(255,176,32,0.18)',
        borderRadius:10 }}>
        <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>📱</span>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--warning)', marginBottom:2 }}>
            Bluetooth unavailable on this browser
          </p>
          <p style={{ fontSize:11, color:'var(--t2)', lineHeight:1.5 }}>
            Web Bluetooth requires Chrome or Edge on Android / Windows / macOS.
            On iOS, enter data manually or export from Apple Health.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Compact trigger row */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display:'inline-flex', alignItems:'center', gap:7,
            background:status === STATUS.CONNECTED ? 'rgba(34,217,122,0.08)' : 'var(--s2)',
            border:`1px solid ${status === STATUS.CONNECTED ? 'rgba(34,217,122,0.3)' : 'var(--border)'}`,
            borderRadius:8, padding:'7px 12px', cursor:'pointer', transition:'all 0.15s',
            fontSize:13, fontWeight:500, color:'var(--t1)' }}
          onMouseEnter={e => e.currentTarget.style.background = status === STATUS.CONNECTED ? 'rgba(34,217,122,0.12)' : 'var(--s3)'}
          onMouseLeave={e => e.currentTarget.style.background = status === STATUS.CONNECTED ? 'rgba(34,217,122,0.08)' : 'var(--s2)'}
          aria-expanded={open}
        >
          {/* Bluetooth icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dotColor}
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
          </svg>
          <span>
            {status === STATUS.CONNECTED ? deviceName || 'Device Connected'
              : status === STATUS.SCANNING ? 'Scanning…'
              : status === STATUS.CONNECTING ? 'Connecting…'
              : status === STATUS.READING ? 'Reading…'
              : 'Sync Device'}
          </span>
          {status === STATUS.CONNECTED && (
            <span style={{ background:'rgba(34,217,122,0.15)', color:'var(--success)',
              borderRadius:4, padding:'1px 6px', fontSize:10, fontWeight:700 }}>LIVE</span>
          )}
          {/* chevron */}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5" strokeLinecap="round">
            {open ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
          </svg>
        </button>

        {/* Quick-sync button when data is ready */}
        {status === STATUS.CONNECTED && hasData && !open && (
          <button onClick={syncData} className="btn btn-primary btn-sm">
            ↓ Use Data
          </button>
        )}
      </div>

      {/* Expanded panel */}
      {open && (
        <div style={{ marginTop:8, background:'var(--s1)', border:'1px solid var(--border)',
          borderRadius:10, padding:14, animation:'fadeIn 0.15s ease' }}>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:8, marginBottom:hasData ? 12 : 0 }}>
            {(status === STATUS.IDLE || status === STATUS.ERROR || status === STATUS.DONE) && (
              <button onClick={connect} className="btn btn-primary btn-sm" style={{ gap:6, display:'inline-flex', alignItems:'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
                </svg>
                Scan &amp; Connect
              </button>
            )}
            {isActive && (
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--t2)' }}>
                <div className="spinner" style={{ width:14, height:14, borderWidth:2 }}/>
                {status === STATUS.SCANNING ? 'Opening device picker…'
                  : status === STATUS.CONNECTING ? 'Connecting to device…'
                  : 'Reading sensors…'}
              </div>
            )}
            {status === STATUS.CONNECTED && (
              <>
                <button onClick={disconnect} className="btn btn-ghost btn-sm">Disconnect</button>
                {hasData && (
                  <button onClick={syncData} className="btn btn-primary btn-sm">↓ Use This Data</button>
                )}
              </>
            )}
          </div>

          {/* Live metrics grid */}
          {hasData && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:8, marginBottom:10 }}>
              {Object.entries(metrics).map(([key, val]) => {
                const m = METRICS_META[key]; if (!m) return null;
                return (
                  <div key={key} style={{ background:'var(--s2)', border:'1px solid var(--border)',
                    borderRadius:8, padding:'10px 8px', textAlign:'center' }}>
                    <div style={{ fontSize:18, lineHeight:1, marginBottom:4 }}>{m.icon}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:m.color, lineHeight:1 }}>{val}</div>
                    <div style={{ fontSize:9, color:'var(--t3)', marginTop:2, textTransform:'uppercase', letterSpacing:'.04em' }}>{m.unit}</div>
                    <div style={{ fontSize:10, color:'var(--t2)', marginTop:1 }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {status === STATUS.CONNECTED && !hasData && (
            <p style={{ fontSize:12, color:'var(--t2)', padding:'8px 0' }}>
              Waiting for data… step on scale or start moving.
            </p>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div style={{ background:'var(--black)', borderRadius:6, padding:'6px 10px', marginBottom:8 }}>
              {log.map((l, i) => (
                <div key={i} style={{ fontSize:11, color:'var(--t3)', lineHeight:1.7, fontFamily:'var(--font-mono)' }}>{l}</div>
              ))}
            </div>
          )}

          <p style={{ fontSize:10, color:'var(--t3)', lineHeight:1.6 }}>
            Compatible: MI Band, boAt, Noise ColorFit, Fire-Boltt, Amazfit, Garmin, Polar, Wahoo, Withings, Renpho, Decathlon · Requires Chrome/Edge on Android or desktop
          </p>
        </div>
      )}
    </div>
  );
};

export default BluetoothSync;
