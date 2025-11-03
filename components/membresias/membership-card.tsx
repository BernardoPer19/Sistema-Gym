import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import type { Membership } from "@/lib/types"

interface MembershipCardProps {
  membership: Membership
  memberCount: number
}

export function MembershipCard({ membership, memberCount }: MembershipCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="text-white">{membership.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{membership.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-4xl font-bold text-white">${membership.price}</p>
          <p className="text-sm text-muted-foreground">por mes</p>
        </div>

        <div className="space-y-2">
          {membership.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-white">{memberCount}</span> socios activos
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Asignar Membresía</Button>
      </CardFooter>
    </Card>
  )
}
