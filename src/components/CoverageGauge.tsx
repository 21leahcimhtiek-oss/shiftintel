"use client";

interface CoverageGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function CoverageGauge({ score, size = "md" }: CoverageGaugeProps) {
  const dimensions = { sm: 80, md: 120, lg: 160 };
  const dim = dimensions[size];
  const radius = (dim / 2) - 10;
  const circumference = Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width={dim} height={dim / 2 + 20} viewBox={`0 0 ${dim} ${dim / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - 10} ${dim / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M 10 ${dim / 2} A ${radius} ${radius} 0 0 1 ${dim - 10} ${dim / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        {/* Score text */}
        <text
          x={dim / 2}
          y={dim / 2 - 4}
          textAnchor="middle"
          className="font-bold"
          style={{ fontSize: size === "sm" ? 14 : size === "lg" ? 28 : 22, fill: color, fontWeight: 700 }}
        >
          {score}%
        </text>
      </svg>
      <div className="flex justify-between w-full text-xs text-gray-400 mt-1 px-2">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}