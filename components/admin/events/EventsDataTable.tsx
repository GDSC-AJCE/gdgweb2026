"use client";

import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  RiCalendarEventLine,
  RiDeleteBin6Line,
  RiDownload2Line,
  RiEditLine,
  RiExternalLinkLine,
  RiMapPinLine,
  RiMore2Fill,
  RiSearchLine,
  RiUserFollowLine,
  RiTimeLine,
  RiAwardLine,
  RiMailSendLine,
} from "@remixicon/react";
import Link from "next/link";
import { Focusable } from "react-aria-components";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Chip } from "@/components/base/badges/chip";
import { StatusDot } from "@/components/base/badges/status-dot";
import { IconButton } from "@/components/base/buttons/icon-button";
import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/base/dropdown/dropdown";
import { Pagination } from "@/components/base/pagination/pagination";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/base/segmented-control/segmented-control";
import { Select, SelectItem } from "@/components/base/select/select";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  type TableSize,
} from "@/components/base/table/table";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { ChevronSortDown } from "@/components/foundations/icons/chevrons";
import CreativeEventPoster from "@/components/programs/CreativeEventPoster";
import { cx } from "@/utils/cx";
import * as XLSX from "xlsx";

export interface EventRowData {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  maxAttendees?: number;
  status: "upcoming" | "past" | "active";
  slug?: string;
  posterUrl?: string;
  rawEvent: any;
}

interface EventsDataTableProps {
  events: any[];
  onOpenEditModal: (event: any) => void;
  onDeleteEvent: (id: string) => void;
  onExportAttendees: (event: any) => void;
  onNavigateTab?: (tab: any) => void;
  theme?: "light" | "dark";
  pageSize?: number;
}

function SortChevron({ dir }: { dir: false | "asc" | "desc" }) {
  return (
    <ChevronSortDown
      className={cx(
        "size-4 shrink-0 transition-[transform,color] duration-150",
        dir === "asc" && "rotate-180",
        dir ? "text-text-secondary" : "text-text-tertiary",
      )}
    />
  );
}

function ActionIconButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof RiEditLine;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <TooltipTrigger delay={200}>
      <Focusable>
        <IconButton
          icon={icon}
          size="small"
          aria-label={label}
          onClick={onClick}
          className={danger ? "hover:text-red-600 hover:border-red-200" : undefined}
        />
      </Focusable>
      <Tooltip size="md">{label}</Tooltip>
    </TooltipTrigger>
  );
}

export default function EventsDataTable({
  events,
  onOpenEditModal,
  onDeleteEvent,
  onExportAttendees,
  onNavigateTab,
  theme = "light",
  pageSize = 8,
}: EventsDataTableProps) {
  const isDark = theme === "dark";
  const [size, setSize] = useState<TableSize>("md");
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Transform events to structured rows
  const data: EventRowData[] = useMemo(() => {
    return events.map((event) => {
      const attendees = event.attendees || event.rsvps || [];
      const eventDate = event.date ? new Date(event.date) : null;
      const isPast = eventDate ? eventDate < new Date() : false;
      const status: "upcoming" | "past" | "active" = isPast
        ? "past"
        : event.isLive
        ? "active"
        : "upcoming";

      return {
        id: event.id || event.slug || Math.random().toString(36).slice(2),
        title: event.title || "Untitled Event",
        category: event.category || "Workshop",
        date: event.date || "",
        time: event.time || "10:00 AM",
        location: event.location || "Amal Jyothi Campus",
        attendeesCount: attendees.length,
        maxAttendees: event.maxAttendees || event.capacity,
        status,
        slug: event.slug,
        posterUrl: event.posterUrl,
        rawEvent: event,
      };
    });
  }, [events]);

  // Client-side filtering before TanStack Table
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [data, search, categoryFilter, statusFilter]);

  // Unique categories for the dropdown filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [events]);

  // Table Column Definitions
  const columns = useMemo<ColumnDef<EventRowData>[]>(
    () => [
      {
        id: "select",
        size: 40,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            size="sm"
            aria-label="Select all events"
            isSelected={table.getIsAllPageRowsSelected()}
            isIndeterminate={table.getIsSomePageRowsSelected()}
            onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            size="sm"
            aria-label={`Select ${row.original.title}`}
            isSelected={row.getIsSelected()}
            onChange={(checked) => row.toggleSelected(checked)}
          />
        ),
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold hover:text-text-primary transition cursor-pointer select-none"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Event & Poster</span>
            <SortChevron dir={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[220px] max-w-[320px]">
              <div className="size-11 rounded-xl overflow-hidden shrink-0 border border-border-table bg-slate-100 dark:bg-zinc-800">
                <CreativeEventPoster
                  posterUrl={item.posterUrl}
                  title={item.title}
                  category={item.category}
                  isClosed={item.status === "past"}
                  seed={item.slug || item.title}
                  showBadges={false}
                  aspectRatio="auto"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-text-primary truncate" title={item.title}>
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary mt-0.5 truncate">
                  <RiMapPinLine className="size-3.5 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const cat = row.original.category;
          return (
            <Chip color="neutral" variant="caption" className="font-mono text-[11px] font-semibold">
              {cat}
            </Chip>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold hover:text-text-primary transition cursor-pointer select-none"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Status</span>
            <SortChevron dir={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === "active") {
            return (
              <Chip color="lime" variant="caption" className="font-mono text-[11px] font-semibold">
                <StatusDot color="green" />
                Active Now
              </Chip>
            );
          }
          if (status === "upcoming") {
            return (
              <Chip color="cyan" variant="caption" className="font-mono text-[11px] font-semibold">
                <StatusDot color="indigo" />
                Upcoming
              </Chip>
            );
          }
          return (
            <Chip color="neutral" variant="caption" className="font-mono text-[11px] font-medium opacity-75">
              <span className="inline-flex size-3 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              </span>
              Concluded
            </Chip>
          );
        },
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold hover:text-text-primary transition cursor-pointer select-none"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Schedule</span>
            <SortChevron dir={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const formattedDate = item.date
            ? new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "TBA";
          return (
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-text-primary whitespace-nowrap">
                {formattedDate}
              </span>
              <span className="text-[11px] text-text-tertiary flex items-center gap-1 mt-0.5">
                <RiTimeLine className="size-3" />
                {item.time}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "attendeesCount",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold hover:text-text-primary transition cursor-pointer select-none"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Attendees</span>
            <SortChevron dir={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const count = row.original.attendeesCount;
          const max = row.original.maxAttendees;
          const percent = max ? Math.min(100, Math.round((count / max) * 100)) : null;

          return (
            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-text-primary">{count}</span>
                {max && <span className="text-text-tertiary text-[11px]">/ {max}</span>}
              </div>
              {percent !== null && (
                <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cx(
                      "h-full rounded-full transition-all",
                      percent >= 90
                        ? "bg-rose-500"
                        : percent >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <ActionIconButton
                icon={RiEditLine}
                label="Edit Event"
                onClick={() => onOpenEditModal(item.rawEvent)}
              />
              <ActionIconButton
                icon={RiDownload2Line}
                label="Export XLSX Roster"
                onClick={() => onExportAttendees(item.rawEvent)}
              />
              {item.slug && (
                <TooltipTrigger delay={200}>
                  <Focusable>
                    <Link
                      href={`/programs/${item.slug}`}
                      target="_blank"
                      className="size-8 rounded-lg flex items-center justify-center border border-border-button-default hover:bg-background-primary-hover text-foreground-icon-secondary transition shadow-xs"
                      aria-label="View Public Page"
                    >
                      <RiExternalLinkLine className="size-4" />
                    </Link>
                  </Focusable>
                  <Tooltip size="md">View Public Page</Tooltip>
                </TooltipTrigger>
              )}
              {/* More Actions Dropdown */}
              <Dropdown>
                <TooltipTrigger delay={200}>
                  <DropdownTrigger
                    aria-label={`More actions for ${item.title}`}
                    className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-button-default bg-background-primary-default text-foreground-icon-secondary shadow-xs hover:bg-background-primary-hover transition"
                  >
                    <RiMore2Fill className="size-4" />
                  </DropdownTrigger>
                  <Tooltip size="md">More actions</Tooltip>
                </TooltipTrigger>
                <DropdownPopover aria-label="Event actions" placement="bottom end" className="w-48 p-1.5">
                  <DropdownGroup>
                    <DropdownItem
                      onSelect={() => onNavigateTab?.("certificates")}
                      className="px-2 py-1.5 text-xs flex items-center gap-2"
                    >
                      <RiAwardLine className="size-4 text-amber-500" />
                      <span>Issue Certificates</span>
                    </DropdownItem>
                    <DropdownItem
                      onSelect={() => onNavigateTab?.("mailer")}
                      className="px-2 py-1.5 text-xs flex items-center gap-2"
                    >
                      <RiMailSendLine className="size-4 text-blue-500" />
                      <span>Send Mail to Attendees</span>
                    </DropdownItem>
                    <DropdownItem
                      onSelect={() => onDeleteEvent(item.id)}
                      className="px-2 py-1.5 text-xs flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <RiDeleteBin6Line className="size-4 text-red-500" />
                      <span>Delete Event</span>
                    </DropdownItem>
                  </DropdownGroup>
                </DropdownPopover>
              </Dropdown>
            </div>
          );
        },
      },
    ],
    [onOpenEditModal, onExportAttendees, onDeleteEvent, onNavigateTab],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;
  const totalPages = table.getPageCount();

  // Export selected events' attendees into combined XLSX
  const exportSelectedAttendees = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const wb = XLSX.utils.book_new();
    selectedRows.forEach((row) => {
      const event = row.original.rawEvent;
      const attendees = event.attendees || event.rsvps || [];
      const sheetData = attendees.map((a: any, i: number) => ({
        "No.": i + 1,
        Name: a.name || a.displayName || "Unknown",
        Email: a.email || "N/A",
        Department: a.department || a.dept || "N/A",
        AdmissionNo: a.admissionNo || a.rollNo || "N/A",
        RegisteredAt: a.registeredAt || "N/A",
      }));
      const ws = XLSX.utils.json_to_sheet(sheetData);
      const sheetName = (event.title || "Event").slice(0, 28).replace(/[/\\?*[\]]/g, "_");
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `GDG_Events_Selected_Attendees_${Date.now()}.xlsx`);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* BoardUI Data Table Container */}
      <section
        className={cx(
          "flex w-full flex-col rounded-3xl border border-border-table bg-white dark:bg-[#141416] p-4 shadow-sm",
          isDark && "border-zinc-800",
        )}
      >
        {/* Top Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-separator-border">
          {/* Left: Search & Result Counter */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-64">
              <RiSearchLine className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  table.setPageIndex(0);
                }}
                placeholder="Search events, categories..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border-input bg-background-primary-default text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <p className="text-xs text-text-secondary whitespace-nowrap">
              <strong className="text-text-primary">{filteredData.length}</strong> events found
            </p>
          </div>

          {/* Right: Filters & Density & Bulk Actions */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* Category Filter */}
            <Select
              aria-label="Filter category"
              selectedKey={categoryFilter}
              onSelectionChange={(k) => {
                setCategoryFilter(String(k));
                table.setPageIndex(0);
              }}
              size="sm"
              className="w-36"
            >
              <SelectItem id="all" textValue="All Categories">
                All Categories
              </SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} id={c} textValue={c}>
                  {c}
                </SelectItem>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              aria-label="Filter status"
              selectedKey={statusFilter}
              onSelectionChange={(k) => {
                setStatusFilter(String(k));
                table.setPageIndex(0);
              }}
              size="sm"
              className="w-32"
            >
              <SelectItem id="all" textValue="All Status">
                All Status
              </SelectItem>
              <SelectItem id="upcoming" textValue="Upcoming">
                Upcoming
              </SelectItem>
              <SelectItem id="active" textValue="Active">
                Active
              </SelectItem>
              <SelectItem id="past" textValue="Past">
                Concluded
              </SelectItem>
            </Select>

            {/* Density Segmented Control */}
            <SegmentedControl
              aria-label="Density"
              selectedKeys={new Set([size])}
              onSelectionChange={(keys) => {
                const next = [...keys][0] as TableSize | undefined;
                if (next) setSize(next);
              }}
            >
              <SegmentedControlItem id="md">Normal</SegmentedControlItem>
              <SegmentedControlItem id="sm">Compact</SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>

        {/* Selected Rows Banner */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl my-2 text-xs">
            <span className="text-blue-700 dark:text-blue-300 font-semibold">
              {selectedCount} event{selectedCount > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportSelectedAttendees}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer shadow-xs text-xs"
              >
                <RiDownload2Line className="size-3.5" />
                <span>Export Selected Attendees</span>
              </button>
              <button
                type="button"
                onClick={() => setRowSelection({})}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Data Table Core */}
        <div className="w-full overflow-hidden rounded-2xl border border-separator-border mt-2">
          <Table size={size} aria-label="GDG Events Table">
            <TableHeader>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableColumn key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow id="empty">
                  <TableCell colSpan={columns.length} className="py-12 text-center text-xs text-text-tertiary">
                    No events match your current search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    id={row.id}
                    className={cx(
                      "hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition",
                      row.getIsSelected() && "bg-blue-50/50 dark:bg-blue-950/20",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-separator-border px-3 pt-3 mt-2">
            <p className="text-xs text-text-tertiary">
              Page {pagination.pageIndex + 1} of {totalPages}
            </p>
            <Pagination
              page={pagination.pageIndex + 1}
              totalPages={totalPages}
              onChange={(p) => table.setPageIndex(p - 1)}
            />
          </div>
        )}
      </section>
    </div>
  );
}
