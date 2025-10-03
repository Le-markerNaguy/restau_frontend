interface Table {
  id: number
  number: number
  qrData: string
}

interface TableSelectorProps {
  tables: Table[]
  selectedTable: number | null
  setSelectedTable: (id: number) => void
  setSelectedTableNumber: (num: number) => void
  tableFromUrl: string | null
}

export default function TableSelector({
  tables,
  selectedTable,
  setSelectedTable,
  setSelectedTableNumber,
  tableFromUrl,
}: TableSelectorProps) {
  return (
    <select
      value={selectedTable || ""}
      onChange={e => {
        const tableId = Number(e.target.value)
        const table = tables.find(t => t.id === tableId)
        if (table) {
          setSelectedTable(table.id)
          setSelectedTableNumber(table.number)
        }
      }}
      className="w-full mb-2 border rounded px-2 py-1"
      disabled={!!tableFromUrl}
    >
      <option value="" disabled>Choisir une table</option>
      {tables.map(t => (
        <option key={t.id} value={t.id}>
          Table {t.number}
        </option>
      ))}
    </select>
  )
}