export function ConsolidatedLoadReport() {
  // Sample data - replace with actual data from API
  const reportData: any[] = [];

  return (
    <div className="min-h-full">
      {/* Report Header */}
      <div className="text-center py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Retail Chain</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Consolidated Load
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">From To</div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black text-white">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                SR NO.
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                ITEM CODE
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                ITEM DESCRIPTION
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                QTY
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                UOM
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                SEC. QTY
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                SEC. UOM
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                FROM LOCATION
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                TO LOCATION
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                FROM LOT SR.
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                TO LOT NO.
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                TO LOT STATUS CODE
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                LOAD DATE
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">
                WAREHOUSE
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {reportData.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              reportData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.srNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.itemCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.itemDescription}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.qty}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.uom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.secQty}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.secUom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.fromLocation}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.toLocation}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.fromLotSr}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.toLotNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.toLotStatusCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.loadDate}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {row.warehouse}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
