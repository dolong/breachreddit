import { useState } from 'react';

// Standalone (no ?view=) tab picker for manual iteration in a browser tab.
// Each tab iframes a real view so the dc-runtime gets its own document.
const TABS = [
  { id: 'post', label: 'Post View (Postview)', w: 390, h: 520 },
  { id: 'mobile', label: 'Game (Space Dice Run v15)', w: 390, h: 844 },
];

export const Shell = () => {
  const [active, setActive] = useState('post');
  const tab = TABS.find((t) => t.id === active);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <nav style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#1a1a1a', borderBottom: '1px solid #333' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            style={{
              padding: '6px 14px',
              background: active === t.id ? '#d93900' : '#2a2a2a',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            {t.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', alignSelf: 'center', color: '#666', fontSize: 11 }}>Breach · dev tools</span>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
        <iframe key={tab.id} title={tab.label} src={`/?view=${tab.id}`} style={{ width: tab.w, height: tab.h, border: '1px solid #333' }} />
      </div>
    </div>
  );
};
