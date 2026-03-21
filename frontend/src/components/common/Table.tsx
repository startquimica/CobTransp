import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function Table<T>({ columns, data, loading, emptyMessage = 'Nenhum dado encontrado.', onRowClick }: TableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, idx) => (
                            <th
                                key={idx}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, rowIdx) => (
                        <tr 
                            key={rowIdx} 
                            onClick={() => onRowClick?.(item)}
                            className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
                        >
                            {columns.map((column, colIdx) => (
                                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {(() => {
                                        try {
                                            return typeof column.accessor === 'function' 
                                                ? column.accessor(item) 
                                                : (item[column.accessor] as unknown as React.ReactNode);
                                        } catch (e) {
                                            console.error(`Erro ao renderizar coluna ${column.header}:`, e);
                                            return <span className="text-red-500">Erro</span>;
                                        }
                                    })()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
