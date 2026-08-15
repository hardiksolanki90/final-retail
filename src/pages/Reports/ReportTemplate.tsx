interface ReportTemplateProps {
  title: string;
  subtitle?: string;
  columns: string[];
  data?: any[];
}

export function ReportTemplate({ title, subtitle, columns, data = [] }: ReportTemplateProps) {
  return (
    <div className="min-h-full">
      {/* Report Header */}
      <div className="text-center py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Retail Chain</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h1>
        {subtitle && (
          <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black text-white">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {Object.values(row).map((value: any, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
