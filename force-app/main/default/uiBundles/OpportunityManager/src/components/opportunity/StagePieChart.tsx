import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from 'recharts';
import type { StageTotal } from '@/lib/opportunity';

const COLORS = [
  '#0176D3',
  '#2E844A',
  '#DD7A01',
  '#9050E9',
  '#BA0517',
  '#0B827C',
  '#C23934',
  '#5867E8',
];

const RADIAN = Math.PI / 180;
const amountFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

// Based on the Recharts "Pie Chart With Customized Label" example: percentage
// drawn at the radial midpoint of each slice. Slices under 5% get no label.
function renderCustomizedLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx);
  const cy = Number(props.cy);
  const innerRadius = Number(props.innerRadius);
  const outerRadius = Number(props.outerRadius);
  const midAngle = Number(props.midAngle ?? 0);
  const percent = Number(props.percent ?? 0);
  if (percent < 0.05) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function StagePieChart({ data }: { data: StageTotal[] }) {
  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No open opportunities with an amount for this account.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            labelLine={false}
            label={renderCustomizedLabel}
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell key={entry.stage} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={value => amountFormat.format(Number(value))} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
