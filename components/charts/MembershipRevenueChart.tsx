"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export default function MembershipRevenueChart({ data }: { data: any[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-white">Ingresos por Membresía</CardTitle>
        <p className="text-sm text-muted-foreground">Distribución de ingresos</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis type="number" stroke="#a3a3a3" />
            <YAxis dataKey="name" type="category" stroke="#a3a3a3" width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040" }}
              labelStyle={{ color: "#ffffff" }}
            />
            <Bar dataKey="revenue" fill="#ef4444" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
