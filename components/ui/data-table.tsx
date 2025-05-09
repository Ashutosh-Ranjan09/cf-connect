'use client';

import { useState ,useEffect} from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<TData> {
  columns: any[];
  data: TData[];
  pageSize?: number;
}

export function DataTable<TData>({
     columns,
     data,
     pageSize = 10,
   }: DataTableProps<TData>) {
    const [pagination, setPagination] = useState({
       pageIndex: 0,
       pageSize,
     });
     const [visibleColumns, setVisibleColumns] = useState(columns);
     
     // Handle responsive columns
    useEffect(() => {
       const handleResize = () => {        if (window.innerWidth < 640) { // sm breakpoint
         setVisibleColumns(columns.filter(col => !col.meta?.hiddenOnMobile));
    } else {
           setVisibleColumns(columns);
         }
       };
       
       handleResize();
      window.addEventListener('resize', handleResize);
       return () => window.removeEventListener('resize', handleResize);
     }, [columns]);
    
   const table = useReactTable({
     data,
       columns: visibleColumns,
       getCoreRowModel: getCoreRowModel(),
       getPaginationRowModel: getPaginationRowModel(),
       onPaginationChange: setPagination,
       state: {
         pagination,
       },
     });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
   <div className="text-xs sm:text-sm text-muted-foreground">
     Showing {pagination.pageIndex * pagination.pageSize + 1}-
     {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of{" "}
     {data.length} entries
   </div>
   <div className="flex items-center space-x-2">
     <Button
       variant="outline"
       size="sm"
       onClick={() => table.previousPage()}
       disabled={!table.getCanPreviousPage()}
     >
     </Button>
       <ChevronLeft className="h-4 w-4" />
     <Button
       variant="outline"
       size="sm"
     onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
     >
       <ChevronRight className="h-4 w-4" />
     </Button>
   </div>
    </div>
    </div>
  );
}