import { ChevronDown } from 'lucide-react'
import { Logo } from '@renderer/components/logo'
import { GraphNode } from '@renderer/components/graph-node'
import { PrRow } from '@renderer/components/pr-row'
import { RingTab } from '@renderer/components/ring-tab'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-meta font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="rounded-xl border border-dashed border-border bg-card p-8">{children}</div>
    </section>
  )
}

/** Living component gallery. Reached from Settings → Components. */
function Gallery(): React.JSX.Element {
  const meta = 'routes/checkout.ts · 9 chunks · alex'
  return (
    <div className="flex flex-col gap-10">
      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-8">
          <Logo className="size-16" />
          <Logo variant="outline" className="size-16" />
          <Logo className="size-16 text-active" />
          <Logo variant="outline" className="size-16 text-active" />
          <div className="flex size-16 items-center justify-center rounded-xl bg-primary">
            <Logo className="size-10 text-primary-foreground" />
          </div>
        </div>
      </Section>

      <Section title="Graph node">
        <div className="flex flex-wrap justify-between gap-4">
          <GraphNode state="locked" label="functionName" />
          <GraphNode state="active" label="functionName" />
          <GraphNode state="current" label="functionName" />
          <GraphNode state="approved" label="functionName" />
          <GraphNode state="flagged" label="functionName" />
        </div>
      </Section>

      <Section title="Ring tab">
        <div className="flex flex-wrap gap-5">
          <RingTab state="locked" ring="R1" count="3 chunks" />
          <RingTab state="active" ring="R1" count="3 chunks" />
          <RingTab state="done" ring="R1" count="3 chunks" />
        </div>
      </Section>

      <Section title="Action button">
        <div className="flex flex-wrap gap-5">
          <Button>approve chunk</Button>
          <Button variant="success">approved</Button>
          <Button variant="destructive">request changes</Button>
          <Button variant="active">start review</Button>
          <Button variant="outline">skip</Button>
          <Button variant="ghost">cancel</Button>
        </div>
      </Section>

      <Section title="PR row">
        <div className="-m-2 flex flex-col gap-3 rounded-lg bg-muted p-6">
          <PrRow
            state="your-turn"
            num="#482"
            title="promo engine rewrite"
            meta={meta}
            badge="your turn"
          />
          <PrRow
            state="queued"
            num="#482"
            title="promo engine rewrite"
            meta={meta}
            badge="your turn"
          />
          <PrRow
            state="not-started"
            num="#482"
            title="promo engine rewrite"
            meta={meta}
            badge="your turn"
          />
          <PrRow
            state="done"
            num="#482"
            title="promo engine rewrite"
            meta={meta}
            badge="your turn"
          />
        </div>
      </Section>

      <Section title="shadcn primitives">
        <div className="flex flex-wrap items-start gap-6">
          <Card className="w-72">
            <CardHeader>
              <CardTitle className="text-body">Card</CardTitle>
              <CardDescription>
                Inherits border, radius and surface from the tokens.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>default</Badge>
              <Badge variant="active">active</Badge>
              <Badge variant="success">success</Badge>
              <Badge variant="flagged">flagged</Badge>
              <Badge variant="outline">outline</Badge>
            </CardContent>
          </Card>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                chunk actions <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>routes/checkout.ts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>approve chunk</DropdownMenuItem>
              <DropdownMenuItem>add note</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">request changes</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>
    </div>
  )
}

export { Gallery }
