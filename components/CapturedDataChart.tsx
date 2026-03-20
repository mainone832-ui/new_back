import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CapturedDataChartProps {
  formSubmissions: number;
  cardPayments: number;
  netBankingCount: number;
}

const CapturedDataChart: React.FC<CapturedDataChartProps> = ({
  formSubmissions,
  cardPayments,
  netBankingCount,
}) => {
  const data = [
    { name: "Forms", value: formSubmissions },
    { name: "Cards", value: cardPayments },
    { name: "Banking", value: netBankingCount },
  ];

  const COLORS = ["#F27C6D", "#F2C366", "#9884D1"];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="58%"
            outerRadius="86%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="rounded-xl border border-(--border) bg-(--surface-subtle) px-3 py-2"
          >
            <p className="flex items-center gap-2 text-xs text-(--text-muted)">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              No of {entry.name}
            </p>
            <p className="mt-1 text-base font-semibold text-(--text-main)">
              {entry.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapturedDataChart;
