// A quiet balloon cluster for celebration sections: pearl, blush, champagne gold and deep rose, matte-satin with one
// highlight each, fine cream ribbons gathered by a small blush bow. Decorative: aria-hidden. Styles: 10-home.css (.balloons).
let seq = 0;

export function balloons(cls = '') {
  const g = `bl${(++seq).toString(36)}`;
  const grad = (id, a, b, c) =>
    `<radialGradient id="${g}${id}" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  // [gradient, cx, cy, rx, ry, tilt]
  const B = [
    ['g', 196, 92, 47, 57, 8],
    ['b', 108, 118, 45, 55, -10],
    ['p', 238, 178, 42, 51, 12],
    ['r', 146, 196, 44, 53, -4],
  ];
  const knot = (x, y) => `<path d="M${x - 5} ${y + 3}L${x} ${y - 3}L${x + 5} ${y + 3}Z" fill="currentColor"/>`;
  const balloon = ([id, cx, cy, rx, ry, tilt], i) => {
    const by = cy + ry; // bottom of the balloon
    return `<g class="balloons__b" style="--d:${i * -1.7}s; transform-origin:${cx}px ${by + 150}px">
      <path class="balloons__string" d="M${cx} ${by + 2}C${cx + 14} ${by + 40} ${cx - 16} ${by + 80} ${172 + (cx - 172) * 0.15} ${330}"/>
      <g transform="rotate(${tilt} ${cx} ${cy})">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${g}${id})"/>
        <ellipse cx="${cx - rx * 0.38}" cy="${cy - ry * 0.42}" rx="${rx * 0.16}" ry="${ry * 0.26}" fill="#fff" opacity=".55" transform="rotate(-24 ${cx - rx * 0.38} ${cy - ry * 0.42})"/>
        <g style="color:${id === 'g' ? '#A87A2E' : id === 'b' ? '#C9758C' : id === 'p' ? '#CDB5A2' : '#7A1630'}">${knot(cx, by + 2)}</g>
      </g>
    </g>`;
  };
  return `<div class="balloons${cls ? ` ${cls}` : ''}" aria-hidden="true">
  <svg viewBox="0 0 320 380" focusable="false">
    <defs>
      ${grad('g', '#FFF4D6', '#E9C27D', '#A87A2E')}
      ${grad('b', '#FFE8EE', '#F2B3C3', '#C9758C')}
      ${grad('p', '#FFFFFF', '#F4E7DC', '#CDB5A2')}
      ${grad('r', '#F08DA4', '#B8304E', '#7A1630')}
    </defs>
    ${B.map(balloon).join('\n    ')}
    <g class="balloons__bow" transform="translate(172 332)">
      <path d="M0 0C-16 -12 -30 -6 -26 4C-22 12 -8 8 0 0Z" fill="#F2B3C3"/>
      <path d="M0 0C16 -12 30 -6 26 4C22 12 8 8 0 0Z" fill="#E9A3B5"/>
      <path d="M0 0C-4 12 -10 24 -16 36M0 0C5 13 12 25 20 34" stroke="#F2B3C3" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle r="4" fill="#C9758C"/>
    </g>
  </svg>
</div>`;
}
