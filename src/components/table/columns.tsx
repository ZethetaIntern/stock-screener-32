import { ColumnDef } from "@tanstack/react-table";
import { Stock } from "@/types/stock";
import PriceCell from "./PriceCell";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const columns: ColumnDef<Stock>[] = [
  { accessorKey: "symbol", header: "Symbol", size: 110 },
  { accessorKey: "name", header: "Name", size: 170 },
  { accessorKey: "sector", header: "Sector", size: 130 },
  {
    accessorKey: "price",
    header: "Price",
    size: 110,
    cell: (c) => <PriceCell value={c.getValue<number>()} />,
  },
  {
    accessorKey: "changePct",
    header: "Change %",
    size: 110,
    cell: (c) => {
      const v = c.getValue<number>();
      return (
        <span className={v >= 0 ? "text-green-400" : "text-red-400"}>
          {v >= 0 ? "+" : ""}
          {v.toFixed(2)}%
        </span>
      );
    },
  },
  {
    accessorKey: "volume",
    header: "Volume",
    size: 120,
    cell: (c) => compact.format(c.getValue<number>()),
  },
  {
    accessorKey: "marketCap",
    header: "Mkt Cap",
    size: 120,
    cell: (c) => compact.format(c.getValue<number>()),
  },
  {
    accessorKey: "pe",
    header: "P/E",
    size: 80,
    cell: (c) => c.getValue<number>().toFixed(1),
  },
];