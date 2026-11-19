// GDG on Campus AJCE — Component Library (shadcn/ui + Warm Paper Design System)
// Central barrel exports for easy element consumption

// Primitives
export { Button, buttonVariants } from "./Button";
export type { ButtonProps } from "./Button";
export { Input } from "./Input";
export type { InputProps } from "./Input";
export { Textarea } from "./textarea";
export type { TextareaProps } from "./textarea";
export { Label } from "./label";
export { Badge, badgeVariants } from "./Badge";
export type { BadgeProps } from "./Badge";
export { Skeleton } from "./skeleton";

// Layout & Surfaces
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
export { Separator } from "./separator";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";
export { ScrollArea, ScrollBar } from "./scroll-area";

// Navigation & Structure
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion";

// Overlays & Modals
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";
export { Popover, PopoverTrigger, PopoverContent } from "./popover";

// Controls & Forms
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";
export { Checkbox } from "./checkbox";
export { Switch } from "./switch";
export { Progress } from "./progress";
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";

// Feedback & Custom Brand Elements
export { default as Alert } from "./Alert";
export type { AlertProps } from "./Alert";
export { default as StatusDot } from "./StatusDot";
export { default as Chip } from "./Chip";
export { Toaster, toast } from "./sonner";

// GDG Brand Marks
export { default as GDGLogoMark } from "./GDGLogoMark";
export { default as GDGFullLogo } from "./GDGFullLogo";
export { default as GDGFooterAdapter } from "./GDGFooterAdapter";
export { default as TextLoop } from "./TextLoop";
