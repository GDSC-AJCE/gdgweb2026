"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// StatusDot: default export, uses color prop ("green" | "yellow" | "red" | "blue" | "gray") + ping
import StatusDot from "@/components/ui/StatusDot";
// Chip: default export, uses children + color ("blue"|"green"|"yellow"|"red"|"purple"|"slate") + variant
import Chip from "@/components/ui/Chip";
import Alert from "@/components/ui/Alert";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Settings,
  User,
  LogOut,
  Bell,
  Heart,
  Star,
  Zap,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[#2c2e2a]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[#80827f]">{description}</p>
        )}
        <div className="h-px bg-[#e5e1d5] mt-3" />
      </div>
      <div>{children}</div>
    </section>
  );
}

// ─── Code snippet with copy ────────────────────────────────────────────────────
function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-2xl bg-[#2c2e2a] text-[#f5f1e4] text-xs font-mono p-4 overflow-x-auto">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[#8ed462]" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-[#80827f]" />
        )}
      </button>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────
function ColorSwatch({
  name,
  hex,
  label,
}: {
  name: string;
  hex: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="group flex flex-col gap-2 cursor-pointer"
    >
      <div
        className="w-full h-16 rounded-2xl border border-[#e5e1d5] transition-transform group-hover:scale-105"
        style={{ backgroundColor: hex }}
      />
      <div className="text-left">
        <p className="text-xs font-semibold text-[#2c2e2a]">{name}</p>
        <p className="text-xs text-[#80827f] font-mono">
          {copied ? "Copied!" : hex}
        </p>
        <p className="text-xs text-[#80827f]">{label}</p>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DesignSystemPage() {
  const [switchOn, setSwitchOn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [inputVal, setInputVal] = useState("");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f5f1e4]">
        {/* Header */}
        <div className="border-b border-[#e5e1d5] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            <GDGLogoMark className="w-8 h-8" />
            <div>
              <h1 className="text-sm font-bold text-[#2c2e2a] tracking-tight">
                GDG AJCE Design System
              </h1>
              <p className="text-xs text-[#80827f]">
                Component Library · shadcn/ui + GDG Brand Tokens
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="grass">v2.0</Badge>
              <Badge variant="sky">shadcn/ui</Badge>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

          {/* ── COLOR SYSTEM ── */}
          <Section
            title="Color System"
            description="GDG AJCE Warm Paper design tokens — the single source of truth for all UI."
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#80827f] mb-3 uppercase tracking-widest">
                  Foundation
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <ColorSwatch name="Cream Paper" hex="#f5f1e4" label="Canvas / BG" />
                  <ColorSwatch name="Pure White" hex="#ffffff" label="Cards / Surfaces" />
                  <ColorSwatch name="Sandstone" hex="#e0dbce" label="Muted fills" />
                  <ColorSwatch name="Ink Black" hex="#2c2e2a" label="Primary text" />
                  <ColorSwatch name="Stone Gray" hex="#80827f" label="Muted text" />
                  <ColorSwatch name="Hairline" hex="#d5d5d4" label="Borders" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#80827f] mb-3 uppercase tracking-widest">
                  Brand Accents
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <ColorSwatch name="Fresh Grass" hex="#8ed462" label="Primary accent" />
                  <ColorSwatch name="Coral Pop" hex="#ff705d" label="CTA / Alerts" />
                  <ColorSwatch name="Sky Pop" hex="#2ba0ff" label="Secondary / Info" />
                  <ColorSwatch name="Sunshine" hex="#ffd600" label="Highlights" />
                  <ColorSwatch name="Google Blue" hex="#4285F4" label="Google brand" />
                  <ColorSwatch name="Google Red" hex="#EA4335" label="Google brand" />
                </div>
              </div>
            </div>
          </Section>

          {/* ── TYPOGRAPHY ── */}
          <Section
            title="Typography"
            description="Inter at every scale — from 9px micro-labels to 215px display."
          >
            <div className="space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-[#e5e1d5] space-y-6 overflow-hidden">
                <div className="overflow-hidden">
                  <p className="text-[80px] sm:text-[120px] font-black leading-none tracking-[-0.065em] text-[#2c2e2a]">
                    GDG.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-4xl font-bold tracking-tight text-[#2c2e2a]">
                    Heading Large — Build with Google
                  </p>
                  <p className="text-2xl font-semibold text-[#2c2e2a]">
                    Heading Medium — Innovate Together
                  </p>
                  <p className="text-xl font-medium text-[#2c2e2a]">
                    Heading Small — Learn. Connect. Grow.
                  </p>
                  <p className="text-base text-[#2c2e2a]">
                    Body — The GDG on Campus AJCE community empowers students
                    with Google technologies.
                  </p>
                  <p className="text-sm text-[#80827f]">
                    Body Small — Join 500+ members exploring AI, Cloud, Android,
                    and Web development.
                  </p>
                  <p className="text-xs text-[#80827f] font-semibold uppercase tracking-widest">
                    Micro Label — Google Developer Groups
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* ── BUTTONS ── */}
          <Section
            title="Buttons"
            description="Pill-shaped buttons with GDG brand variants. All use rounded-[50px] by default."
          >
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="coral">Coral</Button>
                <Button variant="grass">Grass</Button>
                <Button variant="sky">Sky</Button>
                <Button variant="google">Google</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Plus />
                </Button>
                <Button size="pill">
                  <Sparkles className="h-4 w-4" /> With Icon
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button disabled>Disabled</Button>
                <Button variant="coral">
                  <Heart className="h-4 w-4" /> Like
                </Button>
                <Button variant="grass">
                  <CheckCircle className="h-4 w-4" /> Register
                </Button>
                <Button variant="sky">
                  <ArrowRight className="h-4 w-4" /> Learn More
                </Button>
              </div>
              <CodeSnippet
                code={`import { Button } from "@/components/ui/Button"\n\n<Button variant="coral" size="lg">Register Now</Button>\n<Button variant="grass"><CheckCircle /> Confirm</Button>`}
              />
            </div>
          </Section>

          {/* ── BADGES & CHIPS ── */}
          <Section
            title="Badges & Chips"
            description="Status indicators, tags, and category labels."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center p-6 bg-white rounded-3xl border border-[#e5e1d5]">
                <Badge>Default</Badge>
                <Badge variant="grass">Grass</Badge>
                <Badge variant="coral">Coral</Badge>
                <Badge variant="sky">Sky</Badge>
                <Badge variant="yellow">Yellow</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="google">Google</Badge>
                <Badge dot variant="grass">
                  Live
                </Badge>
                <Badge dot variant="coral">
                  Closed
                </Badge>
                <Badge dot variant="sky">
                  Online
                </Badge>
              </div>
              {/* Chip: children-based, colors: blue|green|yellow|red|purple|slate */}
              <div className="flex flex-wrap gap-2 items-center p-6 bg-white rounded-3xl border border-[#e5e1d5]">
                <Chip color="blue">Android</Chip>
                <Chip color="green">Web Dev</Chip>
                <Chip color="red">Cloud</Chip>
                <Chip color="yellow">AI/ML</Chip>
                <Chip color="purple">Open Source</Chip>
                <Chip color="slate">Default</Chip>
                <Chip color="blue" variant="bold">Bold</Chip>
                <Chip color="green" variant="outline">Outline</Chip>
              </div>
            </div>
          </Section>

          {/* ── FORM ELEMENTS ── */}
          <Section
            title="Form Elements"
            description="Inputs, selects, checkboxes, switches, and labels with GDG styling."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Text Inputs</CardTitle>
                  <CardDescription>Standard and error states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Abin Varghese"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@ajce.in"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="err">Error State</Label>
                    <Input
                      id="err"
                      error
                      placeholder="Invalid input"
                      defaultValue="wrong@"
                    />
                    <p className="text-xs text-[#ff705d]">
                      Please enter a valid email
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message</Label>
                    <Textarea placeholder="Tell us about yourself..." rows={3} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Controls</CardTitle>
                  <CardDescription>
                    Checkbox, Switch, and Select
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label>Domain</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">AI / ML</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="web">Web Dev</SelectItem>
                        <SelectItem value="open-source">Open Source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="terms"
                      checked={checked}
                      onCheckedChange={(v) => setChecked(!!v)}
                    />
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to the terms and conditions
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="news" defaultChecked />
                    <Label htmlFor="news" className="cursor-pointer">
                      Subscribe to GDG newsletter
                    </Label>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifs" className="cursor-pointer">
                      Enable notifications
                    </Label>
                    <Switch
                      id="notifs"
                      checked={switchOn}
                      onCheckedChange={setSwitchOn}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public" className="cursor-pointer">
                      Public profile
                    </Label>
                    <Switch id="public" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── CARDS ── */}
          <Section
            title="Cards"
            description="Bento-style cards with 36px radius — the foundation of the layout system."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#8ed462]/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#5a9e30]" />
                    </div>
                    <div>
                      <CardTitle>Hackathon</CardTitle>
                      <CardDescription>48-hour challenge</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#80827f]">
                    Build innovative solutions using Google technologies. Open to
                    all AJCE students.
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Badge variant="grass" dot>
                    Registrations Open
                  </Badge>
                  <Button size="sm" variant="coral">
                    Join
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#2ba0ff]/20 flex items-center justify-center">
                      <Star className="h-5 w-5 text-[#2ba0ff]" />
                    </div>
                    <div>
                      <CardTitle>Workshop</CardTitle>
                      <CardDescription>Google Cloud Next</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#80827f]">
                    Learn Vertex AI, BigQuery, and Cloud Run with hands-on labs
                    guided by GDEs.
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Badge variant="sky" dot>
                    Upcoming
                  </Badge>
                  <Button size="sm" variant="sky">
                    Register
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#ffd600]/20 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-[#80827f]" />
                    </div>
                    <div>
                      <CardTitle>Study Jam</CardTitle>
                      <CardDescription>Google Certifications</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#80827f]">
                    Prepare for Google Cloud Associate and Professional
                    certifications together.
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Badge variant="yellow" dot>
                    This Week
                  </Badge>
                  <Button size="sm">Join</Button>
                </CardFooter>
              </Card>
            </div>
          </Section>

          {/* ── TABS ── */}
          <Section
            title="Tabs"
            description="Segmented control navigation with GDG muted background."
          >
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      GDG on Campus AJCE is the official Google Developer Group
                      at Amal Jyothi College of Engineering, empowering students
                      with Google technologies.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="events" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      60+ events hosted — hackathons, workshops, study jams, and
                      speaker sessions.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="members" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      500+ active members across all branches and years at AJCE.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="gallery" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      Memories from MindMarket, SlushArena, SkyHack, and more.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Section>

          {/* ── ALERTS ── */}
          <Section
            title="Alerts"
            description="Contextual feedback using Google brand colors."
          >
            <div className="space-y-3">
              <Alert
                title="Information"
                description="Your registration for SkyHack 2026 has been received. Check your email for confirmation."
                variant="info"
              />
              <Alert
                title="Success"
                description="Certificate generated successfully! Download it from your profile."
                variant="success"
              />
              <Alert
                title="Warning"
                description="Registration closes in 2 hours. Complete your profile to secure your spot."
                variant="warning"
              />
              <Alert
                title="Error"
                description="Payment failed. Please check your UPI ID and try again."
                variant="error"
              />
            </div>
          </Section>

          {/* ── DIALOGS & OVERLAYS ── */}
          <Section
            title="Dialogs & Overlays"
            description="Modal dialogs, dropdowns, and tooltips."
          >
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register for SkyHack</DialogTitle>
                    <DialogDescription>
                      Fill in your details to register for the 48-hour
                      hackathon.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label>Team Name</Label>
                      <Input placeholder="Team Innovators" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Domain</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose domain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai">AI / ML</SelectItem>
                          <SelectItem value="web">Web Dev</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="coral">Register</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-1.5" /> Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" /> Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[#ff705d]">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like this event</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Star / Bookmark</TooltipContent>
              </Tooltip>
            </div>
          </Section>

          {/* ── STATUS ── */}
          <Section
            title="Status Indicators"
            description="Real-time status dots and separators."
          >
            {/*
              StatusDot props:
                color: "green" | "yellow" | "red" | "blue" | "gray"
                ping?: boolean
            */}
            <div className="p-6 bg-white rounded-3xl border border-[#e5e1d5] space-y-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <StatusDot color="green" ping />
                  <span className="text-sm text-[#2c2e2a]">Active / Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="yellow" />
                  <span className="text-sm text-[#2c2e2a]">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="gray" />
                  <span className="text-sm text-[#2c2e2a]">Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="red" />
                  <span className="text-sm text-[#2c2e2a]">Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="blue" />
                  <span className="text-sm text-[#2c2e2a]">Info / Online</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4 text-sm text-[#80827f]">
                <span>Left</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Center</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Right</span>
              </div>
            </div>
          </Section>

          {/* ── BORDER RADII ── */}
          <Section
            title="Border Radii"
            description="GDG's radius hierarchy — from inner items to full pill buttons."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { label: "10px", class: "rounded-[10px]", role: "sm" },
                { label: "16px", class: "rounded-[16px]", role: "md" },
                { label: "20px", class: "rounded-[20px]", role: "lg" },
                { label: "28px", class: "rounded-[28px]", role: "inner items" },
                { label: "36px", class: "rounded-[36px]", role: "bento cards" },
                { label: "50px", class: "rounded-[50px]", role: "pills / buttons" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col gap-2">
                  <div
                    className={`${r.class} h-16 bg-[#2c2e2a] flex items-center justify-center`}
                  >
                    <span className="text-white text-xs font-mono font-bold">
                      {r.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#80827f] text-center">{r.role}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── IMPORT GUIDE ── */}
          <Section
            title="Usage Guide"
            description="How to import and use components from the GDG AJCE component library."
          >
            <div className="space-y-4">
              <CodeSnippet
                code={`// Primitives
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/Badge"

// Layout & Containers
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Navigation
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Overlays
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Controls
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

// Feedback — both are DEFAULT exports
import Alert from "@/components/ui/Alert"
import StatusDot from "@/components/ui/StatusDot"   // color: "green"|"yellow"|"red"|"blue"|"gray", ping?: boolean
import Chip from "@/components/ui/Chip"              // children, color: "blue"|"green"|"yellow"|"red"|"purple"|"slate", variant?: "subtle"|"bold"|"outline"

// GDG-specific
import GDGLogoMark from "@/components/ui/GDGLogoMark"
import GDGFullLogo from "@/components/ui/GDGFullLogo"`}
              />
            </div>
          </Section>

          {/* Footer */}
          <div className="text-center py-8 border-t border-[#e5e1d5] space-y-2">
            <div className="flex items-center justify-center gap-2">
              <GDGLogoMark className="w-5 h-5" />
              <p className="text-sm font-semibold text-[#2c2e2a]">
                GDG on Campus AJCE
              </p>
            </div>
            <p className="text-xs text-[#80827f]">
              Component Library built on shadcn/ui + Radix UI + Tailwind CSS v4
              · Warm Paper Design System
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
