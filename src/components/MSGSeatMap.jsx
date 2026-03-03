import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/helpers';

// SVG-based interactive seat map modeled after Madison Square Garden's real layout
// MSG is a circular/oval arena with sections arranged around a central floor/court

const SECTION_PATHS = {
  // Floor sections (concert layout - rectangular blocks near stage)
  'floor-a': { cx: 220, cy: 250, w: 60, h: 80, label: 'A' },
  'floor-b': { cx: 300, cy: 250, w: 60, h: 80, label: 'B' },
  'floor-c': { cx: 380, cy: 250, w: 60, h: 80, label: 'C' },
  'floor-d': { cx: 220, cy: 345, w: 60, h: 60, label: 'D' },
  'floor-e': { cx: 300, cy: 345, w: 60, h: 60, label: 'E' },
  'floor-f': { cx: 380, cy: 345, w: 60, h: 60, label: 'F' },

  // Sports floor
  'courtside': { cx: 300, cy: 300, w: 200, h: 100, label: 'Court' },
};

// 100-level sections arranged in a ring around the floor
const LEVEL_100_SECTIONS_CONCERT = [
  { id: '100-rear', secs: ['111','112','113'], startAngle: -30, endAngle: 30 },
  { id: '100-side', secs: ['110','114','120','101','102','103','104'], startAngle: 30, endAngle: 75 },
  { id: '100-stage', secs: ['105','106','107','108','109'], startAngle: 75, endAngle: 140 },
  { id: '100-stage', secs: ['115','116','117','118','119'], startAngle: -140, endAngle: -75 },
  { id: '100-side', secs: ['101','102','103','104'], startAngle: -75, endAngle: -30 },
];

// Generate arc path for a section of the bowl
function arcPath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const cos = Math.cos;
  const sin = Math.sin;

  const s = toRad(startAngle);
  const e = toRad(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const x1 = cx + innerR * cos(s);
  const y1 = cy + innerR * sin(s);
  const x2 = cx + innerR * cos(e);
  const y2 = cy + innerR * sin(e);
  const x3 = cx + outerR * cos(e);
  const y3 = cy + outerR * sin(e);
  const x4 = cx + outerR * cos(s);
  const y4 = cy + outerR * sin(s);

  return `M ${x1} ${y1} A ${innerR} ${innerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${outerR} ${outerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

function midAngle(start, end) {
  return ((start + end) / 2) * (Math.PI / 180);
}

export default function MSGSeatMap({ sections, onSelectSection, venueLayout = 'msg-concert' }) {
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [priceFilter, setPriceFilter] = useState([0, 2000]);
  const [selectedLevel, setSelectedLevel] = useState('all');

  const isConcert = venueLayout === 'msg-concert';
  const cx = 300, cy = 300;

  const maxPrice = Math.max(...sections.map((s) => s.price));
  const minPrice = Math.min(...sections.map((s) => s.price));

  const filteredSections = useMemo(() => {
    return sections.filter(s => {
      if (s.price < priceFilter[0] || s.price > priceFilter[1]) return false;
      if (selectedLevel !== 'all' && s.level !== selectedLevel) return false;
      return true;
    });
  }, [sections, priceFilter, selectedLevel]);

  const levels = useMemo(() => {
    const lvls = [...new Set(sections.map(s => s.level))];
    return lvls;
  }, [sections]);

  const handleClick = (section) => {
    if (!filteredSections.find(s => s.id === section.id)) return;
    setActiveSection(section.id);
    onSelectSection(section);
  };

  const getSectionStyle = (section) => {
    const isFiltered = filteredSections.find(s => s.id === section.id);
    const isActive = activeSection === section.id;
    const isHovered = hoveredSection === section.id;

    if (!isFiltered) return { fill: '#1e293b', stroke: '#475569', opacity: 0.3, cursor: 'not-allowed' };
    if (isActive) return { fill: section.color, stroke: '#ffffff', opacity: 1, cursor: 'pointer', strokeWidth: 2.5 };
    if (isHovered) return { fill: section.color, stroke: '#ffffff', opacity: 0.85, cursor: 'pointer', strokeWidth: 1.5 };
    return { fill: section.color + '88', stroke: section.color, opacity: 0.8, cursor: 'pointer' };
  };

  // Build ring sections for the SVG
  const ringData = useMemo(() => {
    const rings = [];
    sections.forEach(section => {
      const level = section.level;

      if (level === 'floor') {
        // Floor sections rendered as rectangles
        if (isConcert) {
          const pos = SECTION_PATHS[section.id] || SECTION_PATHS[section.id.replace(/^[a-z]+-/, '')];
          if (pos) {
            rings.push({ ...section, shape: 'rect', ...pos });
          }
        } else {
          // Sports: single court
          rings.push({ ...section, shape: 'rect', cx: 300, cy: 300, w: 200, h: 100, label: 'Courtside' });
        }
      } else if (level === 'club') {
        // Club between 100 and 200 — small ring
        const innerR = 175, outerR = 190;
        rings.push({
          ...section,
          shape: 'arc',
          path: arcPath(cx, cy, innerR, outerR, -145, 145),
          labelX: cx, labelY: cy - innerR - 2,
          labelAngle: midAngle(-145, 145),
          innerR, outerR,
        });
      } else if (level === '100') {
        // 100-level ring
        let startA, endA;
        if (section.id.includes('stage') && section.id === sections.find(s => s.id.includes('100-stage'))?.id) {
          startA = 30; endA = 165;
        } else if (section.id.includes('stage')) {
          startA = -165; endA = -30;
        } else if (section.id.includes('rear')) {
          startA = -30; endA = 30;
        } else if (section.id.includes('side')) {
          if (isConcert) {
            startA = 165; endA = 195;
          } else {
            startA = -165; endA = -30;
          }
        } else if (section.id.includes('end')) {
          startA = -30; endA = 30;
        }

        // Assign different angle ranges for sports
        if (!isConcert) {
          if (section.id.includes('side')) {
            // Two arcs for sideline
            const innerR = 130, outerR = 175;
            const path1 = arcPath(cx, cy, innerR, outerR, 30, 150);
            const path2 = arcPath(cx, cy, innerR, outerR, -150, -30);
            rings.push({ ...section, shape: 'multiArc', paths: [path1, path2], innerR, outerR, angles: [[30,150],[-150,-30]] });
            return;
          } else {
            // Baseline arcs
            const innerR = 130, outerR = 175;
            const path1 = arcPath(cx, cy, innerR, outerR, -30, 30);
            const path2 = arcPath(cx, cy, innerR, outerR, 150, 210);
            rings.push({ ...section, shape: 'multiArc', paths: [path1, path2], innerR, outerR, angles: [[-30,30],[150,210]] });
            return;
          }
        }

        const innerR = 130, outerR = 175;
        if (startA !== undefined) {
          rings.push({
            ...section,
            shape: 'arc',
            path: arcPath(cx, cy, innerR, outerR, startA, endA),
            innerR, outerR, startA, endA,
          });
        }
      } else if (level === '200') {
        if (!isConcert) {
          if (section.id.includes('side')) {
            const innerR = 195, outerR = 240;
            const path1 = arcPath(cx, cy, innerR, outerR, 30, 150);
            const path2 = arcPath(cx, cy, innerR, outerR, -150, -30);
            rings.push({ ...section, shape: 'multiArc', paths: [path1, path2], innerR, outerR, angles: [[30,150],[-150,-30]] });
            return;
          } else {
            const innerR = 195, outerR = 240;
            const path1 = arcPath(cx, cy, innerR, outerR, -30, 30);
            const path2 = arcPath(cx, cy, innerR, outerR, 150, 210);
            rings.push({ ...section, shape: 'multiArc', paths: [path1, path2], innerR, outerR, angles: [[-30,30],[150,210]] });
            return;
          }
        }

        let startA, endA;
        if (section.id.includes('stage')) {
          startA = 30; endA = 165;
        } else if (section.id.includes('rear')) {
          startA = -30; endA = 30;
        } else {
          startA = -165; endA = -30;
        }
        const innerR = 195, outerR = 240;
        rings.push({
          ...section,
          shape: 'arc',
          path: arcPath(cx, cy, innerR, outerR, startA, endA),
          innerR, outerR, startA, endA,
        });
      }
    });
    return rings;
  }, [sections, isConcert, cx, cy, filteredSections]);

  const tooltip = hoveredSection
    ? sections.find(s => s.id === hoveredSection)
    : null;

  return (
    <div className="bg-surface rounded-xl border border-gray-800 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          {isConcert ? 'MSG Concert Seating' : 'MSG Arena Seating'}
        </h3>
        <span className="text-xs text-gray-500">Madison Square Garden, NYC</span>
      </div>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedLevel('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedLevel === 'all' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          All Levels
        </button>
        {levels.map(lvl => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(selectedLevel === lvl ? 'all' : lvl)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              selectedLevel === lvl ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {lvl === '100' ? '100 Level' : lvl === '200' ? '200 Level' : lvl}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Price Range</span>
          <span>{formatCurrency(priceFilter[0])} – {formatCurrency(priceFilter[1])}</span>
        </div>
        <div className="flex gap-3">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceFilter[0]}
            onChange={(e) => setPriceFilter([+e.target.value, priceFilter[1]])}
            className="flex-1 accent-blue-500"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceFilter[1]}
            onChange={(e) => setPriceFilter([priceFilter[0], +e.target.value])}
            className="flex-1 accent-blue-500"
          />
        </div>
      </div>

      {/* SVG Seat Map */}
      <div className="relative bg-gray-800 rounded-xl p-2 mb-4 overflow-hidden border border-gray-700">
        <svg viewBox="50 50 500 500" className="mx-auto" width="460" height="460">
          {/* Dark arena background */}
          <rect x="50" y="50" width="500" height="500" rx="12" fill="#0f172a" />
          {/* Background ring for arena outline */}
          <circle cx={cx} cy={cy} r="245" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx={cx} cy={cy} r="178" fill="none" stroke="#475569" strokeWidth="0.8" />
          <circle cx={cx} cy={cy} r="128" fill="none" stroke="#475569" strokeWidth="0.8" />

          {/* Stage or Court */}
          {isConcert ? (
            <g>
              <rect x={cx - 80} y={155} width="160" height="35" rx="8" fill="#3b82f620" stroke="#3b82f6" strokeWidth="1.5" />
              <text x={cx} y={177} textAnchor="middle" className="fill-blue-400 text-[11px] font-bold">
                STAGE
              </text>
            </g>
          ) : (
            <g>
              <rect x={cx - 70} y={cy - 35} width="140" height="70" rx="4" fill="#1a1a2e" stroke="#374151" strokeWidth="1" />
              <rect x={cx - 60} y={cy - 25} width="120" height="50" rx="2" fill="none" stroke="#4a5568" strokeWidth="0.5" />
              <circle cx={cx} cy={cy} r="12" fill="none" stroke="#4a5568" strokeWidth="0.5" />
              <text x={cx} y={cy + 4} textAnchor="middle" className="fill-gray-500 text-[9px]">
                COURT
              </text>
            </g>
          )}

          {/* Render all sections */}
          {ringData.map((section) => {
            const style = getSectionStyle(section);
            const isFiltered = !!filteredSections.find(s => s.id === section.id);

            if (section.shape === 'rect') {
              return (
                <g key={section.id}>
                  <rect
                    x={section.cx - section.w / 2}
                    y={section.cy - section.h / 2}
                    width={section.w}
                    height={section.h}
                    rx="4"
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth || 1}
                    opacity={style.opacity}
                    style={{ cursor: style.cursor, transition: 'all 0.2s' }}
                    onClick={() => handleClick(section)}
                    onMouseEnter={() => isFiltered && setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                  />
                  <text
                    x={section.cx}
                    y={section.cy + 4}
                    textAnchor="middle"
                    className="fill-white text-[10px] font-bold pointer-events-none"
                    opacity={style.opacity}
                  >
                    {section.label || section.name.split('(')[0].trim()}
                  </text>
                  <text
                    x={section.cx}
                    y={section.cy + 16}
                    textAnchor="middle"
                    className="fill-gray-300 text-[8px] pointer-events-none"
                    opacity={style.opacity}
                  >
                    {formatCurrency(section.price)}
                  </text>
                </g>
              );
            }

            if (section.shape === 'multiArc') {
              return (
                <g key={section.id}>
                  {section.paths.map((path, i) => {
                    const [sA, eA] = section.angles[i];
                    const mid = midAngle(sA, eA);
                    const labelR = (section.innerR + section.outerR) / 2;
                    return (
                      <g key={i}>
                        <path
                          d={path}
                          fill={style.fill}
                          stroke={style.stroke}
                          strokeWidth={style.strokeWidth || 1}
                          opacity={style.opacity}
                          style={{ cursor: style.cursor, transition: 'all 0.2s' }}
                          onClick={() => handleClick(section)}
                          onMouseEnter={() => isFiltered && setHoveredSection(section.id)}
                          onMouseLeave={() => setHoveredSection(null)}
                        />
                        {i === 0 && (
                          <text
                            x={cx + labelR * Math.cos(mid)}
                            y={cy + labelR * Math.sin(mid) + 3}
                            textAnchor="middle"
                            className="fill-white text-[7px] font-medium pointer-events-none"
                            opacity={style.opacity}
                          >
                            {section.name.split('(')[1]?.replace(')', '') || section.name.split(' ').pop()}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            }

            if (section.shape === 'arc') {
              const mid = midAngle(section.startA || -90, section.endA || 90);
              const labelR = (section.innerR + section.outerR) / 2;
              return (
                <g key={section.id}>
                  <path
                    d={section.path}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth || 1}
                    opacity={style.opacity}
                    style={{ cursor: style.cursor, transition: 'all 0.2s' }}
                    onClick={() => handleClick(section)}
                    onMouseEnter={() => isFiltered && setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                  />
                  <text
                    x={cx + labelR * Math.cos(mid)}
                    y={cy + labelR * Math.sin(mid) + 3}
                    textAnchor="middle"
                    className="fill-white text-[7px] font-medium pointer-events-none"
                    opacity={Math.min(style.opacity + 0.2, 1)}
                  >
                    {section.name.length > 20 ? section.name.split('(')[1]?.replace(')','') || '' : section.name.split(' ').slice(-1)[0]}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Section number labels around the 100 level */}
          {isConcert && (
            <g className="pointer-events-none">
              {[101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120].map((num, i) => {
                const angle = ((i / 20) * 360 - 90) * (Math.PI / 180);
                const r = 157;
                return (
                  <text
                    key={num}
                    x={cx + r * Math.cos(angle)}
                    y={cy + r * Math.sin(angle) + 3}
                    textAnchor="middle"
                    className="fill-gray-500 text-[6px]"
                  >
                    {num}
                  </text>
                );
              })}
            </g>
          )}

          {/* Compass labels */}
          <text x={cx} y={65} textAnchor="middle" className="fill-gray-600 text-[8px] uppercase tracking-widest">
            {isConcert ? '8th Ave' : 'North'}
          </text>
          <text x={cx} y={545} textAnchor="middle" className="fill-gray-600 text-[8px] uppercase tracking-widest">
            {isConcert ? '7th Ave' : 'South'}
          </text>
          <text x={60} y={cy + 3} textAnchor="middle" className="fill-gray-600 text-[8px] uppercase tracking-widest">
            {isConcert ? '33rd' : 'West'}
          </text>
          <text x={540} y={cy + 3} textAnchor="middle" className="fill-gray-600 text-[8px] uppercase tracking-widest">
            {isConcert ? '31st' : 'East'}
          </text>
        </svg>

        {/* Hover tooltip */}
        {tooltip && (
          <div className="absolute top-3 right-3 bg-gray-900/95 border border-gray-700 rounded-lg p-3 min-w-[180px] pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tooltip.color }} />
              <span className="text-sm font-semibold text-white">{tooltip.name}</span>
            </div>
            <div className="text-xs text-gray-400 space-y-0.5">
              <p>{formatCurrency(tooltip.price)} per ticket</p>
              <p>{tooltip.available} seats available</p>
              {tooltip.sectionNums && (
                <p className="text-gray-500">Sections: {tooltip.sectionNums.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section list below map */}
      <div className="space-y-2">
        {sections.map((section) => {
          const isFiltered = !!filteredSections.find(s => s.id === section.id);
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleClick(section)}
              disabled={!isFiltered}
              onMouseEnter={() => isFiltered && setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                !isFiltered
                  ? 'opacity-30 cursor-not-allowed border-gray-800 bg-gray-900'
                  : isActive
                  ? 'border-white bg-gray-800 ring-1 ring-white'
                  : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-700 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: section.color }} />
                <div className="text-left">
                  <span className={`font-medium ${isFiltered ? 'text-white' : 'text-gray-600'}`}>
                    {section.name}
                  </span>
                  {section.sectionNums && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Sec {section.sectionNums.slice(0, 5).join(', ')}{section.sectionNums.length > 5 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className={isFiltered ? 'text-gray-400' : 'text-gray-700'}>
                  {section.available} avail
                </span>
                <span className={`font-bold ${isFiltered ? 'text-white' : 'text-gray-700'}`}>
                  {formatCurrency(section.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap gap-3 text-[10px] text-gray-500">
        <span>Floor · 100 Level · Club · 200 Level</span>
        <span className="ml-auto">Capacity: 20,789</span>
      </div>
    </div>
  );
}
