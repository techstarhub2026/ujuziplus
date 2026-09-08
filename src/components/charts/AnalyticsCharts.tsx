"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { ChartPoint } from "@/lib/analytics/chart-data";

export function RevenueLineChart({
  data,
  title = "Revenue",
}: {
  data: ChartPoint[];
  title?: string;
}) {
  return (
    <Card className="p-4">
      <CardTitle className="text-sm mb-4">{title}</CardTitle>
      {data.every((d) => d.value === 0) ? (
        <p className="h-48 flex items-center justify-center text-sm text-gray-400">
          No revenue data yet
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `TZS ${Number(v ?? 0).toLocaleString()}`} />
            <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function EnrollmentsBarChart({
  data,
  title = "Enrollments",
}: {
  data: ChartPoint[];
  title?: string;
}) {
  return (
    <Card className="p-4">
      <CardTitle className="text-sm mb-4">{title}</CardTitle>
      {data.every((d) => d.value === 0) ? (
        <p className="h-48 flex items-center justify-center text-sm text-gray-400">
          No enrollments in this period
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" name="Enrollments" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function AnalyticsChartsRow({
  revenueData,
  enrollmentData,
  revenueTitle,
}: {
  revenueData: ChartPoint[];
  enrollmentData: ChartPoint[];
  revenueTitle?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RevenueLineChart data={revenueData} title={revenueTitle} />
      <EnrollmentsBarChart data={enrollmentData} />
    </div>
  );
}
