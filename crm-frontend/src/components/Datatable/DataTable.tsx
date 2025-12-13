import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/UI/Card";
import { Spinner } from "@/components/UI/Spinner";
import { cn } from "@/lib/cn";

export type DataTableColumn<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

export type DataTableProps<T extends Record<string, unknown>> = {
  title?: string;
  description?: string;
  columns: Array<DataTableColumn<T>>;
  data: Array<T>;
  isLoading?: boolean;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  getRowId?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
};

const alignClassNames = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function DataTable<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
  toolbar,
  footer,
  getRowId,
  onRowClick
}: DataTableProps<T>) {
  const renderCell = (row: T, column: DataTableColumn<T>) => {
    if (column.render) return column.render(row);
    if (column.accessor) {
      const value = row[column.accessor];
      return value == null ? "" : String(value);
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      {(title || description || toolbar) && (
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="space-y-1">
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
            {toolbar && <div className="w-full sm:w-auto">{toolbar}</div>}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500",
                      column.align
                        ? alignClassNames[column.align]
                        : alignClassNames.left,
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-gray-500"
                    colSpan={columns.length}
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Spinner className="h-5 w-5" />
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-gray-500"
                    colSpan={columns.length}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const rowKey = getRowId ? getRowId(row, index) : (index as number);
                  return (
                    <tr
                      key={rowKey}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "hover:bg-gray-50 cursor-pointer",
                        onRowClick && "transition-colors duration-200 cursor-pointer"
                      )}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.header}
                          className={cn(
                            "px-6 py-4 text-sm text-gray-700 whitespace-nowrap",
                            column.align
                              ? alignClassNames[column.align]
                              : alignClassNames.left,
                            column.className
                          )}
                        >
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}

type ToolbarProps = React.HTMLAttributes<HTMLDivElement>;
export const DataTableToolbar: React.FC<ToolbarProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
