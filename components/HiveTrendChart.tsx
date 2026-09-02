"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function HiveTrendChart({
  data,
}: {
  data: { time: string; temp: number; weight: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE0" vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#6B5B47" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6B5B47" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #EFEAE0", fontSize: 13 }}
          labelStyle={{ color: "#231A10" }}
        />
        <Line type="monotone" dataKey="temp" name="Temperature °C" stroke="#8C5A1E" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="weight" name="Weight kg" stroke="#0F6E56" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
