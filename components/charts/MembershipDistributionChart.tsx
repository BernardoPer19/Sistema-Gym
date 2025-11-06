"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

export default function MembershipDistributionChart({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-white">Distribución de Membresías</CardTitle>
        <p className="text-sm text-muted-foreground">Por número de socios</p>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff", // Fondo claro
                border: "1px solid #d4d4d4",
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}
              labelStyle={{
                color: "#111111", // Texto de título
                fontWeight: 600,
              }}
              itemStyle={{
                color: "#111111", // Texto de items
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
