"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts"

export default function MonthlyRevenueChart({ data }: { data: any[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-white">Ingresos Mensuales</CardTitle>
        <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="month" stroke="#a3a3a3" />
            <YAxis stroke="#a3a3a3" />
            <Tooltip
              contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040" }}
              labelStyle={{ color: "#ffffff" }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
