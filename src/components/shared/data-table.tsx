"use client";

import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

export function DataTable<T>({ data, columns, searchPlaceholder = "بحث...", emptyText = "لا توجد بيانات" }: { data: T[]; columns: ColumnDef<T>[]; searchPlaceholder?: string; emptyText?: string }) {
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  // TanStack Table exposes stateful callbacks that React Compiler intentionally does not memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, state: { globalFilter: filter, sorting }, onGlobalFilterChange: setFilter, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 8 } } });
  return <div className="card table-card">
    <div className="table-tools"><div style={{position:"relative",flex:1}}><Search size={15} style={{position:"absolute",insetInlineStart:10,top:10,color:"#8b9aa3"}}/><input className="table-search" style={{paddingInlineStart:34}} value={filter} onChange={(event)=>setFilter(event.target.value)} placeholder={searchPlaceholder}/></div><span className="badge">{table.getFilteredRowModel().rows.length}</span></div>
    <div className="table-scroll"><table><thead>{table.getHeaderGroups().map(group=><tr key={group.id}>{group.headers.map(header=><th key={header.id} onClick={header.column.getToggleSortingHandler()}>{header.isPlaceholder?null:flexRender(header.column.columnDef.header,header.getContext())}{header.column.getIsSorted()==="asc"?" ↑":header.column.getIsSorted()==="desc"?" ↓":""}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.length?table.getRowModel().rows.map(row=><tr key={row.id}>{row.getVisibleCells().map(cell=><td key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>):<tr><td colSpan={columns.length} style={{textAlign:"center",padding:40,color:"#71838d"}}>{emptyText}</td></tr>}</tbody></table></div>
    <div className="table-foot"><span>{table.getState().pagination.pageIndex+1} / {table.getPageCount()||1}</span><div className="actions"><button aria-label="السابق" className="icon-button" onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronRight size={16}/></button><button aria-label="التالي" className="icon-button" onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}><ChevronLeft size={16}/></button></div></div>
  </div>;
}
