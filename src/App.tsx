import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { supabase } from "./integrations/supabase/client";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTitle,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  CardFooter,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import * as Collapsible from "@/components/ui/collapsible"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ResizableSeparator,
} from "@/components/ui/resizable"
import {
  Resizable,
  ResizableHandle as ResizableHandle2,
  ResizablePanel as ResizablePanel2,
  ResizablePanelGroup as ResizablePanelGroup2,
  ResizableSeparator as ResizableSeparator2,
} from "@/components/ui/resizable"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AspectRatio as AspectRatio2 } from "@/components/ui/aspect-ratio"
import { Calendar as Calendar2 } from "@/components/ui/calendar"
import {
  Command as Command2,
  CommandDialog,
  CommandEmpty as CommandEmpty2,
  CommandGroup as CommandGroup2,
  CommandInput as CommandInput2,
  CommandItem as CommandItem2,
  CommandList as CommandList2,
  CommandSeparator as CommandSeparator2,
  CommandShortcut as CommandShortcut2,
} from "@/components/ui/command"
import {
  Dialog as Dialog2,
  DialogClose,
  DialogContent as DialogContent2,
  DialogDescription as DialogDescription2,
  DialogFooter,
  DialogHeader as DialogHeader2,
  DialogTitle as DialogTitle2,
  DialogTrigger as DialogTrigger2,
} from "@/components/ui/dialog"
import {
  DropdownMenu as DropdownMenu2,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItem2,
  DropdownMenuContent as DropdownMenuContent2,
  DropdownMenuGroup as DropdownMenuGroup2,
  DropdownMenuItem as DropdownMenuItem2,
  DropdownMenuLabel as DropdownMenuLabel2,
  DropdownMenuRadioGroup as DropdownMenuRadioGroup2,
  DropdownMenuSeparator as DropdownMenuSeparator2,
  DropdownMenuShortcut as DropdownMenuShortcut2,
  DropdownMenuSub as DropdownMenuSub2,
  DropdownMenuSubContent as DropdownMenuSubContent2,
  DropdownMenuSubTrigger as DropdownMenuSubTrigger2,
  DropdownMenuTrigger as DropdownMenuTrigger2,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard as HoverCard2,
  HoverCardContent as HoverCardContent2,
  HoverCardDescription as HoverCardDescription2,
  HoverCardHeader as HoverCardHeader2,
  HoverCardTitle as HoverCardTitle2,
  HoverCardTrigger as HoverCardTrigger2,
} from "@/components/ui/hover-card"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuProvider,
  NavigationMenuSeparator,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import {
  Popover as Popover2,
  PopoverContent as PopoverContent2,
  PopoverTrigger as PopoverTrigger2,
} from "@/components/ui/popover"
import {
  Select as Select2,
  SelectContent as SelectContent2,
  SelectItem as SelectItem2,
  SelectSeparator,
  SelectTrigger as SelectTrigger2,
  SelectValue as SelectValue2,
} from "@/components/ui/select"
import {
  Sheet as Sheet2,
  SheetClose as SheetClose2,
  SheetContent as SheetContent2,
  SheetDescription as SheetDescription2,
  SheetFooter as SheetFooter2,
  SheetHeader as SheetHeader2,
  SheetTitle as SheetTitle2,
  SheetTrigger as SheetTrigger2,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useFormField,
} from "@/components/ui/form"
import {
  useDialog,
} from "@/components/ui/use-dialog"
import {
  useHoverCard,
} from "@/components/ui/use-hover-card"
import {
  useMenu,
} from "@/components/ui/use-menu"
import {
  usePopover,
} from "@/components/ui/use-popover"
import {
  useToast as useToast2,
} from "@/components/ui/use-toast"
import {
  useTransition,
} from "@/components/ui/use-transition"
import {
  AlertDialog as AlertDialog2,
  AlertDialogAction as AlertDialogAction2,
  AlertDialogCancel as AlertDialogCancel2,
  AlertDialogContent as AlertDialogContent2,
  AlertDialogDescription as AlertDialogDescription2,
  AlertDialogFooter as AlertDialogFooter2,
  AlertDialogHeader as AlertDialogHeader2,
  AlertDialogTitle as AlertDialogTitle2,
  AlertDialogTrigger as AlertDialogTrigger2,
} from "@/components/ui/alert-dialog"
import {
  Collapsible as Collapsible2,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu as ContextMenu2,
  ContextMenuCheckboxItem as ContextMenuCheckboxItem2,
  ContextMenuContent as ContextMenuContent2,
  ContextMenuGroup as ContextMenuGroup2,
  ContextMenuItem as ContextMenuItem2,
  ContextMenuLabel as ContextMenuLabel2,
  ContextMenuRadioGroup as ContextMenuRadioGroup2,
  ContextMenuSeparator as ContextMenuSeparator2,
  ContextMenuShortcut as ContextMenuShortcut2,
  ContextMenuSub as ContextMenuSub2,
  ContextMenuSubContent as ContextMenuSubContent2,
  ContextMenuSubTrigger as ContextMenuSubTrigger2,
  ContextMenuTrigger as ContextMenuTrigger2,
} from "@/components/ui/context-menu"
import {
  Dialog as Dialog3,
  DialogClose as DialogClose2,
  DialogContent as DialogContent3,
  DialogDescription as DialogDescription3,
  DialogFooter as DialogFooter2,
  DialogHeader as DialogHeader3,
  DialogTitle as DialogTitle3,
  DialogTrigger as DialogTrigger3,
} from "@/components/ui/dialog"
import {
  DropdownMenu as DropdownMenu3,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItem3,
  DropdownMenuContent as DropdownMenuContent3,
  DropdownMenuGroup as DropdownMenuGroup3,
  DropdownMenuItem as DropdownMenuItem3,
  DropdownMenuLabel as DropdownMenuLabel3,
  DropdownMenuRadioGroup as DropdownMenuRadioGroup3,
  DropdownMenuSeparator as DropdownMenuSeparator3,
  DropdownMenuShortcut as DropdownMenuShortcut3,
  DropdownMenuSub as DropdownMenuSub3,
  DropdownMenuSubContent as DropdownMenuSubContent3,
  DropdownMenuSubTrigger as DropdownMenuSubTrigger3,
  DropdownMenuTrigger as DropdownMenuTrigger3,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard as HoverCard3,
  HoverCardContent as HoverCardContent3,
  HoverCardDescription as HoverCardDescription3,
  HoverCardHeader as HoverCardHeader3,
  HoverCardTitle as HoverCardTitle3,
  HoverCardTrigger as HoverCardTrigger3,
} from "@/components/ui/hover-card"
import {
  NavigationMenu as NavigationMenu2,
  NavigationMenuContent as NavigationMenuContent2,
  NavigationMenuItem as NavigationMenuItem2,
  NavigationMenuLink as NavigationMenuLink2,
  NavigationMenuList as NavigationMenuList2,
  NavigationMenuProvider as NavigationMenuProvider2,
  NavigationMenuSeparator as NavigationMenuSeparator2,
  NavigationMenuTrigger as NavigationMenuTrigger2,
  NavigationMenuViewport as NavigationMenuViewport2,
} from "@/components/ui/navigation-menu"
import {
  Popover as Popover3,
  PopoverContent as PopoverContent3,
  PopoverTrigger as PopoverTrigger3,
} from "@/components/ui/popover"
import {
  Select as Select3,
  SelectContent as SelectContent3,
  SelectItem as SelectItem3,
  SelectSeparator as SelectSeparator2,
  SelectTrigger as SelectTrigger3,
  SelectValue as SelectValue3,
} from "@/components/ui/select"
import {
  Sheet as Sheet3,
  SheetClose as SheetClose3,
  SheetContent as SheetContent3,
  SheetDescription as SheetDescription3,
  SheetFooter as SheetFooter3,
  SheetHeader as SheetHeader3,
  SheetTitle as SheetTitle3,
  SheetTrigger as SheetTrigger3,
} from "@/components/ui/sheet"
import {
  Tabs as Tabs2,
  TabsContent as TabsContent2,
  TabsList as TabsList2,
  TabsTrigger as TabsTrigger2,
} from "@/components/ui/tabs"
import {
  Tooltip as Tooltip2,
  TooltipContent as TooltipContent2,
  TooltipProvider as TooltipProvider2,
  TooltipTrigger as TooltipTrigger2,
} from "@/components/ui/tooltip"
import {
  useFormField as useFormField2,
} from "@/components/ui/form"
import {
  useDialog as useDialog2,
} from "@/components/ui/use-dialog"
import {
  useHoverCard as useHoverCard2,
} from "@/components/ui/use-hover-card"
import {
  useMenu as useMenu2,
} from "@/components/ui/use-menu"
import {
  usePopover as usePopover2,
} from "@/components/ui/use-popover"
import {
  useToast as useToast3,
} from "@/components/ui/use-toast"
import {
  useTransition as useTransition2,
} from "@/components/ui/use-transition"
import {
  AlertDialog as AlertDialog3,
  AlertDialogAction as AlertDialogAction3,
  AlertDialogCancel as AlertDialogCancel3,
  AlertDialogContent as AlertDialogContent3,
  AlertDialogDescription as AlertDialogDescription3,
  AlertDialogFooter as AlertDialogFooter3,
  AlertDialogHeader as AlertDialogHeader3,
  AlertDialogTitle as AlertDialogTitle3,
  AlertDialogTrigger as AlertDialogTrigger3,
} from "@/components/ui/alert-dialog"
import {
  Collapsible as Collapsible3,
  CollapsibleContent as CollapsibleContent2,
  CollapsibleTrigger as CollapsibleTrigger2,
} from "@/components/ui/collapsible"
import {
  ContextMenu as ContextMenu3,
  ContextMenuCheckboxItem as ContextMenuCheckboxItem3,
  ContextMenuContent as ContextMenuContent3,
  ContextMenuGroup as ContextMenuGroup3,
  ContextMenuItem as ContextMenuItem3,
  ContextMenuLabel as ContextMenuLabel3,
  ContextMenuRadioGroup as ContextMenuRadioGroup3,
  ContextMenuSeparator as ContextMenuSeparator3,
  ContextMenuShortcut as ContextMenuShortcut3,
  ContextMenuSub as ContextMenuSub3,
  ContextMenuSubContent as ContextMenuSubContent3,
  ContextMenuSubTrigger as ContextMenuSubTrigger3,
  ContextMenuTrigger as ContextMenuTrigger3,
} from "@/components/ui/context-menu"
import {
  Dialog as Dialog4,
  DialogClose as DialogClose3,
  DialogContent as DialogContent4,
  DialogDescription as DialogDescription4,
  DialogFooter as DialogFooter3,
  DialogHeader as DialogHeader4,
  DialogTitle as DialogTitle4,
  DialogTrigger as DialogTrigger4,
} from "@/components/ui/dialog"
import {
  DropdownMenu as DropdownMenu4,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItem4,
  DropdownMenuContent as DropdownMenuContent4,
  DropdownMenuGroup as DropdownMenuGroup4,
  DropdownMenuItem as DropdownMenuItem4,
  DropdownMenuLabel as DropdownMenuLabel4,
  DropdownMenuRadioGroup as DropdownMenuRadioGroup4,
  DropdownMenuSeparator as DropdownMenuSeparator4,
  DropdownMenuShortcut as DropdownMenuShortcut4,
  DropdownMenuSub as DropdownMenuSub4,
  DropdownMenuSubContent as DropdownMenuSubContent4,
  DropdownMenuSubTrigger as DropdownMenuSubTrigger4,
  DropdownMenuTrigger as DropdownMenuTrigger4,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard as HoverCard4,
  HoverCardContent as HoverCardContent4,
  HoverCardDescription as HoverCardDescription4,
  HoverCardHeader as HoverCardHeader4,
  HoverCardTitle as HoverCardTitle4,
  HoverCardTrigger as HoverCardTrigger4,
} from "@/components/ui/hover-card"
import {
  NavigationMenu as NavigationMenu3,
  NavigationMenuContent as NavigationMenuContent3,
  NavigationMenuItem as NavigationMenuItem3,
  NavigationMenuLink as NavigationMenuLink3,
  NavigationMenuList as NavigationMenuList3,
  NavigationMenuProvider as NavigationMenuProvider3,
  NavigationMenuSeparator as NavigationMenuSeparator3,
  NavigationMenuTrigger as NavigationMenuTrigger3,
  NavigationMenuViewport as NavigationMenuViewport3,
} from "@/components/ui/navigation-menu"
import {
  Popover as Popover4,
  PopoverContent as PopoverContent4,
  PopoverTrigger as PopoverTrigger4,
} from "@/components/ui/popover"
import {
  Select as Select4,
  SelectContent as SelectContent4,
  SelectItem as SelectItem4,
  SelectSeparator as SelectSeparator3,
  SelectTrigger as SelectTrigger4,
  SelectValue as SelectValue4,
} from "@/components/ui/select"
import {
  Sheet as Sheet4,
  SheetClose as SheetClose4,
  SheetContent as SheetContent4,
  SheetDescription as SheetDescription4,
  SheetFooter as SheetFooter4,
  SheetHeader as SheetHeader4,
  SheetTitle as SheetTitle4,
  SheetTrigger as SheetTrigger4,
} from "@/components/ui/sheet"
import {
  Tabs as Tabs3,
  TabsContent as TabsContent3,
  TabsList as TabsList3,
  TabsTrigger as TabsTrigger3,
} from "@/components/ui/tabs"
import {
  Tooltip as Tooltip3,
  TooltipContent as TooltipContent3,
  TooltipProvider as TooltipProvider3,
  TooltipTrigger as TooltipTrigger3,
} from "@/components/ui/tooltip"
import {
  useFormField as useFormField3,
} from "@/components/ui/form"
import {
  useDialog as useDialog3,
} from "@/components/ui/use-dialog"
import {
  useHoverCard as useHoverCard3,
} from "@/components/ui/use-hover-card"
import {
  useMenu as useMenu3,
} from "@/components/ui/use-menu"
import {
  usePopover as usePopover3,
} from "@/components/ui/use-popover"
import {
  useToast as useToast4,
} from "@/components/ui/use-toast"
import {
  useTransition as useTransition3,
} from "@/components/ui/use-transition"
import {
  AlertDialog as AlertDialog4,
  AlertDialogAction as AlertDialogAction4,
  AlertDialogCancel as AlertDialogCancel4,
  AlertDialogContent as AlertDialogContent4,
  AlertDialogDescription as AlertDialogDescription4,
  AlertDialogFooter as AlertDialogFooter4,
  AlertDialogHeader as AlertDialogHeader4,
  AlertDialogTitle as AlertDialogTitle4,
  AlertDialogTrigger as AlertDialogTrigger4,
} from "@/components/ui/alert-dialog"
import {
  Collapsible as Collapsible4,
  CollapsibleContent as CollapsibleContent3,
  CollapsibleTrigger as CollapsibleTrigger3,
} from "@/components/ui/collapsible"
import {
  ContextMenu as ContextMenu4,
  ContextMenuCheckboxItem as ContextMenuCheckboxItem4,
  ContextMenuContent as ContextMenuContent4,
  ContextMenuGroup as ContextMenuGroup4,
  ContextMenuItem as ContextMenuItem4,
  ContextMenuLabel as ContextMenuLabel4,
  ContextMenuRadioGroup as ContextMenuRadioGroup4,
  ContextMenuSeparator as ContextMenuSeparator4,
  ContextMenuShortcut as ContextMenuShortcut4,
  ContextMenuSub as ContextMenuSub4,
  ContextMenuSubContent as ContextMenuSubContent4,
  ContextMenuSubTrigger as ContextMenuSubTrigger4,
  ContextMenuTrigger as ContextMenuTrigger4,
} from "@/components/ui/context-menu"
import {
  Dialog as Dialog5,
  DialogClose as DialogClose4,
  DialogContent as DialogContent5,
  DialogDescription as DialogDescription5,
  DialogFooter as DialogFooter4,
  DialogHeader as DialogHeader5,
  DialogTitle as DialogTitle5,
  DialogTrigger as DialogTrigger5,
} from "@/components/ui/dialog"
import {
  DropdownMenu as DropdownMenu5,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItem5,
  DropdownMenuContent as DropdownMenuContent5,
  DropdownMenuGroup as DropdownMenuGroup5,
  DropdownMenuItem as DropdownMenuItem5,
  DropdownMenuLabel as DropdownMenuLabel5,
  DropdownMenuRadioGroup as DropdownMenuRadioGroup5,
  DropdownMenuSeparator as DropdownMenuSeparator5,
  DropdownMenuShortcut as DropdownMenuShortcut5,
  DropdownMenuSub as DropdownMenuSub5,
  DropdownMenuSubContent as DropdownMenuSubContent5,
  DropdownMenuSubTrigger as DropdownMenuSubTrigger5,
  DropdownMenuTrigger as DropdownMenuTrigger5,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard as HoverCard5,
  HoverCardContent as HoverCardContent5,
  HoverCardDescription as HoverCardDescription5,
  HoverCardHeader as HoverCardHeader5,
  HoverCardTitle as HoverCardTitle5,
  HoverCardTrigger as HoverCardTrigger5,
} from "@/components/ui/hover-card"
import {
  NavigationMenu as NavigationMenu4,
  NavigationMenuContent as NavigationMenuContent4,
  NavigationMenuItem as NavigationMenuItem4,
  NavigationMenuLink as NavigationMenuLink4,
  NavigationMenuList as NavigationMenuList4,
  NavigationMenuProvider as NavigationMenuProvider4,
  NavigationMenuSeparator as NavigationMenuSeparator4,
  NavigationMenuTrigger as NavigationMenuTrigger4,
  NavigationMenuViewport as NavigationMenuViewport4,
} from "@/components/ui/navigation-menu"
import {
  Popover as Popover5,
  PopoverContent as PopoverContent5,
  PopoverTrigger as PopoverTrigger5,
} from "@/components/ui/popover"
import {
  Select as Select5,
  SelectContent as SelectContent5,
  SelectItem as SelectItem5,
  SelectSeparator as SelectSeparator4,
  SelectTrigger as SelectTrigger5,
  SelectValue as SelectValue5,
} from "@/components/ui/select"
import {
  Sheet as Sheet5,
  SheetClose as SheetClose5,
  SheetContent as SheetContent5,
  SheetDescription as SheetDescription5,
  SheetFooter as SheetFooter5,
  SheetHeader as SheetHeader5,
  SheetTitle as SheetTitle5,
  SheetTrigger as SheetTrigger5,
} from "@/components/ui/sheet"
import {
  Tabs as Tabs4,
  TabsContent as TabsContent4,
  TabsList as TabsList4,
  TabsTrigger as TabsTrigger4,
} from "@/components/ui/tabs"
import {
  Tooltip as Tooltip4,
  TooltipContent as TooltipContent4,
  TooltipProvider as TooltipProvider4,
  TooltipTrigger as TooltipTrigger4,
} from "@/components/ui/tooltip"
import {
  useFormField as useFormField4,
} from "@/components/ui/form"
import {
  useDialog as useDialog4,
} from "@/components/ui/use-dialog"
import {
  useHoverCard as useHoverCard4,
} from "@/components/ui/use-hover-card"
import {
  useMenu as useMenu4,
} from "@/components/ui/use-menu"
import {
  usePopover as usePopover4,
} from "@/components/ui/use-popover"
import {
  useToast as useToast5,
} from "@/components/ui/use-toast"
import {
  useTransition as useTransition4,
} from "@/components/ui/use-transition"
import {
  AlertDialog as AlertDialog5,
  AlertDialogAction as AlertDialogAction5,
  AlertDialogCancel as AlertDialogCancel5,
  AlertDialogContent as AlertDialogContent5,
  AlertDialogDescription as AlertDialogDescription5,
  AlertDialogFooter as AlertDialogFooter5,
  AlertDialogHeader as AlertDialogHeader5,
  AlertDialogTitle as AlertDialogTitle5,
  AlertDialogTrigger as AlertDialogTrigger5,
} from "@/components/ui/alert-dialog"
import {
  Collapsible as Collapsible5,
  CollapsibleContent as CollapsibleContent4,
  CollapsibleTrigger as CollapsibleTrigger4,
} from "@/components/ui/collapsible"
import {
  ContextMenu as ContextMenu5,
  ContextMenuCheckboxItem as ContextMenuCheckboxItem5,
  ContextMenuContent as ContextMenuContent5,
  ContextMenuGroup as ContextMenuGroup5,
  ContextMenuItem as ContextMenuItem5,
  ContextMenuLabel as ContextMenuLabel5,
  ContextMenuRadioGroup as ContextMenuRadioGroup5,
  ContextMenuSeparator as ContextMenuSeparator5,
  ContextMenuShortcut as ContextMenuShortcut5,
  ContextMenuSub as ContextMenuSub5,
  ContextMenuSubContent as ContextMenuSubContent5,
  ContextMenuSubTrigger as ContextMenuSubTrigger5,
  ContextMenuTrigger as ContextMenuTrigger5,
} from "@/components/ui/context-menu"
import {
  Dialog as Dialog6,
  DialogClose as DialogClose5,
  DialogContent as DialogContent6,
  DialogDescription as DialogDescription6,
  DialogFooter as DialogFooter5,
  DialogHeader as DialogHeader6,
  DialogTitle as DialogTitle6,
  DialogTrigger as DialogTrigger6,
} from "@/components/ui/dialog"
import {
  DropdownMenu as DropdownMenu6,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItem6,
  DropdownMenuContent as DropdownMenuContent6,
  DropdownMenuGroup as DropdownMenuGroup6,
  DropdownMenuItem as DropdownMenuItem6,
  DropdownMenuLabel as DropdownMenuLabel6,
  DropdownMenuRadioGroup as DropdownMenuRadioGroup6,
  DropdownMenuSeparator as DropdownMenuSeparator6,
  DropdownMenuShortcut as DropdownMenuShortcut6,
  DropdownMenuSub as DropdownMenuSub6,
  DropdownMenuSubContent as DropdownMenuSubContent6,
  DropdownMenuSubTrigger as DropdownMenuSubTrigger6,
  DropdownMenuTrigger as DropdownMenuTrigger6,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard as HoverCard6,
  HoverCardContent as HoverCardContent6,
  HoverCardDescription as HoverCardDescription6,
  HoverCardHeader as HoverCardHeader6,
  HoverCardTitle as HoverCardTitle6,
  HoverCardTrigger as HoverCardTrigger6,
} from "@/components/ui/hover-card"
import {
  NavigationMenu as NavigationMenu5,
  NavigationMenuContent as NavigationMenuContent5,
  NavigationMenuItem as NavigationMenuItem5,
  NavigationMenuLink as NavigationMenuLink5,
  NavigationMenuList as NavigationMenuList5,
  NavigationMenuProvider as NavigationMenuProvider5,
  NavigationMenuSeparator as NavigationMenuSeparator5,
  NavigationMenuTrigger as NavigationMenuTrigger5,
  NavigationMenuViewport as NavigationMenuViewport5,
} from "@/components/ui/navigation-menu"
import {
  Popover as Popover6,
  PopoverContent as PopoverContent6,
  PopoverTrigger as PopoverTrigger6,
} from "@/components/ui/popover"
import {
  Select as Select6,
  SelectContent as SelectContent6,
  SelectItem as SelectItem6,
  SelectSeparator as SelectSeparator5,
  SelectTrigger as SelectTrigger6,
  SelectValue as SelectValue6,
} from "@/components/ui/select"
import {
  Sheet as Sheet6,
  SheetClose as SheetClose6,
  SheetContent as SheetContent6,
  SheetDescription as SheetDescription6,
  SheetFooter as SheetFooter6,
  SheetHeader as SheetHeader6,
  SheetTitle as SheetTitle6,
  SheetTrigger as SheetTrigger6,
} from "@/components/ui/sheet"
import {
  Tabs as Tabs5,
  TabsContent as TabsContent5,
  TabsList as TabsList5,
  TabsTrigger as TabsTrigger5,
} from "@/components/ui/tabs"
import {
  Tooltip as Tooltip5,
  TooltipContent as TooltipContent5,
  TooltipProvider as TooltipProvider5,
  TooltipTrigger as TooltipTrigger5,
} from "@/components/ui/tooltip"
import {
  useFormField as useFormField5,
} from "@/components/ui/form"
import {
  useDialog as useDialog5,
} from "@/components/ui/use-dialog"
import {
  useHoverCard as useHoverCard5,
} from "@/components/ui/use-hover-card"
import {
  useMenu as useMenu5,
} from "@/components/ui/use-menu"
import {
  usePopover as usePopover5,
} from "@/components/ui/use-popover"
import {
  useToast as useToast6,
} from "@/components/ui/use-toast"
import {
  useTransition as useTransition5,
} from "@/components/ui/use-transition"
import {
  AlertDialog as AlertDialog6,
  AlertDialogAction as AlertDialogAction6,
  AlertDialogCancel as AlertDialogCancel6,
  AlertDialogContent as AlertDialogContent6,
  AlertDialogDescription as AlertDialogDescription6,
  AlertDialogFooter as AlertDialogFooter6,
  AlertDialogHeader as AlertDialogHeader6,
  AlertDialogTitle as AlertDialogTitle6,
  AlertDialogTrigger as AlertDialogTrigger6,
} from "@/components/ui/alert-dialog"
import {
  Collapsible as Collapsible6,
  CollapsibleContent as CollapsibleContent5,
  CollapsibleTrigger as CollapsibleTrigger5,
} from "@/components/ui/collapsible"
import {
  ContextMenu as ContextMenu6,
  ContextMenuCheckboxItem as ContextMenuCheckboxItem6,
  ContextMenuContent as ContextMenuContent6,
  ContextMenuGroup as ContextMenuGroup6,
  ContextMenuItem as ContextMenuItem6,
  ContextMenuLabel as ContextMenuLabel6,
  ContextMenuRadioGroup as ContextMenuRadioGroup6,
  ContextMenuSeparator as ContextMenuSeparator6,
  ContextMenuShortcut as ContextMenuShortcut6,
  ContextMenuSub as ContextMenuSub6,
  ContextMenuSubContent as ContextMenuSubContent6,
  ContextMenuSubTrigger as ContextMenuSubTrigger6,
  ContextMenuTrigger as ContextMenuTrigger6,
} from "@/components/ui/context-menu"
import {
  Dialog as Dialog7,
  DialogClose as DialogClose6,
  DialogContent as DialogContent7,
  DialogDescription as DialogDescription7,
  DialogFooter as DialogFooter6,
  DialogHeader as DialogHeader7,
  DialogTitle as DialogTitle7,
  DialogTrigger as DialogTrigger7,
} from "@/components/ui/dialog"
import {
  DropdownMenu as DropdownMenu7,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItem7,
  DropdownMenuContent as DropdownMenuContent7,
  DropdownMenuGroup as DropdownMenuGroup7,
  DropdownMenuItem as DropdownMenuItem7,
  DropdownMenuLabel as DropdownMenuLabel7,
  DropdownMenuRadioGroup as DropdownMenuRadioGroup7,
  DropdownMenuSeparator as DropdownMenuSeparator7,
  DropdownMenuShortcut as DropdownMenuShortcut7,
  DropdownMenuSub as DropdownMenuSub7,
  DropdownMenuSubContent as DropdownMenuSubContent7,
  DropdownMenuSubTrigger as DropdownMenuSubTrigger7,
  DropdownMenuTrigger as DropdownMenuTrigger7,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard as HoverCard7,
  HoverCardContent as HoverCardContent7,
  HoverCardDescription as HoverCardDescription7,
  HoverCardHeader as HoverCardHeader7,
  HoverCardTitle as HoverCardTitle7,
  HoverCardTrigger as HoverCardTrigger7,
} from "@/components/ui/hover-card"
import {
  NavigationMenu as NavigationMenu6,
  NavigationMenuContent as NavigationMenuContent6,
  NavigationMenuItem as NavigationMenuItem6,
  NavigationMenuLink as NavigationMenuLink6,
  NavigationMenuList as NavigationMenuList6,
  NavigationMenuProvider as NavigationMenuProvider6,
  NavigationMenuSeparator as NavigationMenuSeparator6,
  NavigationMenuTrigger as NavigationMenuTrigger6,
  NavigationMenuViewport as NavigationMenuViewport6,
} from "@/components/ui/navigation-menu"
import {
  Popover as Popover7,
  PopoverContent as PopoverContent7,
  PopoverTrigger as PopoverTrigger7,
} from "@/components/ui/popover"
import {
  Select as Select7,
  SelectContent as SelectContent7,
  SelectItem as SelectItem7,
  SelectSeparator as SelectSeparator6,
  SelectTrigger as SelectTrigger7,
  SelectValue as SelectValue7,
} from "@/components/ui/select"
import {
  Sheet as Sheet7,
  SheetClose as SheetClose7,
  SheetContent as SheetContent7,
  SheetDescription as SheetDescription7,
  SheetFooter as SheetFooter7,
  SheetHeader as SheetHeader7,
  SheetTitle as SheetTitle7,
  SheetTrigger as SheetTrigger7,
} from "@/components/ui/sheet"
import {
  Tabs as Tabs6,
  TabsContent as TabsContent6,
  TabsList as TabsList6,
  TabsTrigger as TabsTrigger6,
} from "@/components/ui/tabs"
import {
  Tooltip as Tooltip6,
  TooltipContent as TooltipContent6,
  TooltipProvider as TooltipProvider6,
  TooltipTrigger as TooltipTrigger6,
} from "@/components/ui/tooltip"
import {
  useFormField as useFormField6,
} from "@/components/ui/form"
import {
  useDialog as useDialog6,
} from "@/components/ui/use-dialog"
import {
  useHoverCard as useHoverCard6,
} from "@/components/ui/use-hover-card"
import {
  useMenu as useMenu6,
} from "@/components/ui/use-menu"
import {
  usePopover as usePopover6,
} from "@/components/ui/use-popover"
import {
  useToast as useToast7,
} from "@/components/ui/use-toast"
import {
  useTransition as useTransition6,
} from "@/components/ui/use-transition"
import {
  AlertDialog as AlertDialog7,
  AlertDialogAction as AlertDialogAction7,
  AlertDialogCancel as AlertDialogCancel7,
  AlertDialogContent as AlertDialogContent7,
  AlertDialogDescription as AlertDialogDescription7,
  AlertDialogFooter as AlertDialog
