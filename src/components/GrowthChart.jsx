import React from 'react';

export const GrowthChart = ({ invoices = [] }) => {
  // Let's generate a beautiful SVG growth chart similar to what was injected.
  // In standard SVG, we can draw a grid and a smooth line or bar chart.
  // Let's draw a nice bar chart for standard and premium growth.
  
  // We can mock some months data or compute it from invoices.
  // In the original dashboard: Year 2026.
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = [12000, 19000, 32000, 45000, 68000, 85000]; // total cumulative growth or monthly MRR
  
  const maxVal = Math.max(...values);
  const height = 180;
  const width = 450;
  const padding = 30;

  return (
    <svg viewBox={`0 0 ${width} ${height + padding}`} style={{ width: '100%', height: '100%' }}>
      {/* Background Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const y = padding + (1 - ratio) * (height - padding);
        return (
          <g key={index}>
            <line 
              x1={padding} 
              y1={y} 
              x2={width - padding} 
              y2={y} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
              strokeDasharray="4 4"
            />
            <text 
              x={padding - 5} 
              y={y + 4} 
              textAnchor="end" 
              fontSize="10" 
              fill="#94a3b8" 
              fontWeight="600"
            >
              ₹{Math.round((ratio * maxVal) / 1000)}k
            </text>
          </g>
        );
      })}

      {/* Bars representing growth */}
      {months.map((month, idx) => {
        const x = padding + 20 + idx * ((width - 2 * padding) / months.length);
        const val = values[idx];
        const barHeight = (val / maxVal) * (height - padding);
        const y = height - barHeight;

        return (
          <g key={idx}>
            {/* Draw a beautiful gradient bar */}
            <defs>
              <linearGradient id={`gradient-bar-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <rect
              x={x}
              y={y}
              width="30"
              height={barHeight}
              rx="4"
              fill={`url(#gradient-bar-${idx})`}
              style={{ transition: 'all 0.5s ease-in-out' }}
            />
            {/* Month labels */}
            <text
              x={x + 15}
              y={height + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
              fontWeight="700"
            >
              {month}
            </text>
            {/* Value on hover or simply text */}
            <text
              x={x + 15}
              y={y - 6}
              textAnchor="middle"
              fontSize="10"
              fill="var(--black)"
              fontWeight="700"
            >
              ₹{val / 1000}k
            </text>
          </g>
        );
      })}
    </svg>
  );
};
