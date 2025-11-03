"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { expenses, getTotalExpenses } from "@/lib/mock-data"
import type { Expense } from "@/lib/types"
import { Receipt, TrendingUp, DollarSign, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const categoryLabels: Record<Expense["category"], string> = {
  limpieza: "Limpieza",
  luz: "Luz/Electricidad",
  personal: "Personal",
  mantenimiento: "Mantenimiento",
  equipamiento: "Equipamiento",
  otros: "Otros",
}

const categoryColors: Record<Expense["category"], string> = {
  limpieza: "bg-blue-500",
  luz: "bg-yellow-500",
  personal: "bg-purple-500",
  mantenimiento: "bg-orange-500",
  equipamiento: "bg-green-500",
  otros: "bg-gray-500",
}

export default function GastosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const { toast } = useToast()

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthlyTotal = getTotalExpenses(currentMonth, currentYear)

  // Calculate totals by category
  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      const expenseDate = new Date(expense.date)
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryLabels[expense.category].toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleAddExpense = () => {
    toast({
      title: "Gasto agregado",
      description: "El gasto ha sido registrado exitosamente",
    })
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gastos</h1>
        <p className="text-muted-foreground">Gestiona los gastos operativos del gimnasio</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${monthlyTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Enero 2025</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Categorías Activas</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Object.keys(categoryTotals).length}</div>
            <p className="text-xs text-muted-foreground">Con gastos este mes</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Promedio Diario</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${Math.round(monthlyTotal / now.getDate()).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Basado en días transcurridos</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-secondary border-border">
        <CardHeader>
          <CardTitle className="text-white">Gastos por Categoría</CardTitle>
          <CardDescription>Distribución de gastos del mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryTotals).map(([category, total]) => {
              const percentage = (total / monthlyTotal) * 100
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{categoryLabels[category as Expense["category"]]}</span>
                    <span className="text-muted-foreground">
                      ${total.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black">
                    <div
                      className={`h-full rounded-full ${categoryColors[category as Expense["category"]]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="bg-secondary border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Historial de Gastos</CardTitle>
              <CardDescription>Todos los gastos registrados</CardDescription>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Gasto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-border text-white"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] bg-black border-border text-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-black">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Descripción</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-white">Monto</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-black/50">
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(expense.date).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${categoryColors[expense.category]}`}
                      >
                        {categoryLabels[expense.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{expense.description}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-white">
                      ${expense.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          expense.status === "paid"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {expense.status === "paid" ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <Card className="w-full max-w-md bg-secondary border-border">
            <CardHeader>
              <CardTitle className="text-white">Agregar Nuevo Gasto</CardTitle>
              <CardDescription>Registra un nuevo gasto operativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">
                  Categoría
                </Label>
                <Select>
                  <SelectTrigger className="bg-black border-border text-white">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Descripción
                </Label>
                <Input
                  id="description"
                  placeholder="Describe el gasto..."
                  className="bg-black border-border text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Monto
                </Label>
                <Input id="amount" type="number" placeholder="0.00" className="bg-black border-border text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">
                  Fecha
                </Label>
                <Input id="date" type="date" className="bg-black border-border text-white" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddExpense} className="flex-1 bg-primary hover:bg-primary/90">
                  Guardar
                </Button>
                <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
