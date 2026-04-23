/* ── api/og.jsx ─────────────────────────────────
   Generates the Open Graph preview image that
   shows up when the link is shared in iMessage,
   WhatsApp, etc.  Runs on Vercel Edge Runtime.
──────────────────────────────────────────────── */
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#CC1122',
          padding: '72px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Giant ghost watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-24px',
            fontSize: '340px',
            fontWeight: '900',
            color: 'rgba(255,255,255,0.05)',
            lineHeight: '1',
            letterSpacing: '-12px',
            fontFamily: 'sans-serif',
          }}
        >
          MALIK
        </div>

        {/* Top label */}
        <div
          style={{
            display: 'flex',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '17px',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            fontWeight: '500',
          }}
        >
          A NOTE FOR MS. LOPEZ
        </div>

        {/* Main name block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: '128px',
              fontWeight: '900',
              letterSpacing: '-5px',
              lineHeight: '0.88',
              fontFamily: 'sans-serif',
            }}
          >
            MALIK
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: '128px',
              fontWeight: '900',
              letterSpacing: '-5px',
              lineHeight: '0.88',
              fontFamily: 'sans-serif',
            }}
          >
            ELGOMATI
          </div>

          {/* Tagline */}
          <div
            style={{
              color: 'rgba(255,255,255,0.62)',
              fontSize: '22px',
              fontWeight: '300',
              marginTop: '32px',
              lineHeight: '1.55',
              fontFamily: 'sans-serif',
              maxWidth: '640px',
            }}
          >
            Biology → Software Engineering → The Exotics Network
          </div>
        </div>

        {/* Bottom section row */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {['Family', 'Sports', 'Hobbies', 'College', 'The Switch', 'Exotics'].map(label => (
            <div
              key={label}
              style={{
                color: 'rgba(255,255,255,0.38)',
                fontSize: '13px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
