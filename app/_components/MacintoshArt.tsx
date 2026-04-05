export default function MacintoshArt() {
  return (
    <div className="mac-art-wrap glance--right" aria-hidden="true">
      <svg viewBox="0 0 120 170" width="120" height="170" role="img" aria-label="Macintosh icon">
        <rect x="8" y="10" width="104" height="138" fill="#fff" stroke="#000" strokeWidth="6" />
        <rect x="24" y="26" width="72" height="72" fill="#fff" stroke="#000" strokeWidth="6" />

        <g className="face">
          <g className="eyes">
            <rect className="eye" x="36" y="46" width="6" height="14" fill="#000" />
            <rect className="eye" x="76" y="46" width="6" height="14" fill="#000" />
          </g>

          <g className="nose">
            <rect x="52" y="46" width="4" height="18" fill="#000" />
            <rect x="56" y="62" width="8" height="4" fill="#000" />
          </g>

          <rect x="44" y="78" width="8" height="6" fill="#000" />
          <rect x="68" y="78" width="8" height="6" fill="#000" />
          <rect x="52" y="86" width="20" height="6" fill="#000" />
        </g>

        <rect x="24" y="114" width="18" height="6" fill="#000" />
        <rect x="70" y="114" width="26" height="6" fill="#000" />
        <rect x="14" y="148" width="92" height="18" fill="#fff" stroke="#000" strokeWidth="6" />
      </svg>

      <style jsx>{`
        .mac-art-wrap {
          width: 120px;
          min-width: 120px;
          height: 170px;
          display: grid;
          place-items: start center;
          align-self: start;
          justify-self: start;
          pointer-events: none;
        }

        svg {
          display: block;
          image-rendering: pixelated;
          shape-rendering: crispEdges;
        }

        .face,
        .eyes,
        .nose {
          transform-box: fill-box;
          transform-origin: center;
        }

        .glance--right .face {
          animation: sideLook 2s infinite step-end;
        }

        .glance--right .nose {
          animation: noseTwitch 2s infinite step-end;
        }

        @keyframes noseTwitch {
          0% {
            transform: translateX(1px);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(1px);
          }
        }

        @keyframes sideLook {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
