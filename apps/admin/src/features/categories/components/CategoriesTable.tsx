import { Edit2, Trash2 } from "lucide-react";
import { resolveAssetUrl } from "@/utils/assets";
import type { ProductItem } from "../types";

type Props = {
  rows: ProductItem[];
};

export function CategoriesTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-[#f7f7f8] text-slate-700">
              <th className="px-5 py-4 text-left font-semibold">No.</th>
              <th className="px-5 py-4 text-left font-semibold">Product</th>
              <th className="px-5 py-4 text-left font-semibold">Created Date</th>
              <th className="px-5 py-4 text-left font-semibold">Order</th>
              <th className="px-5 py-4 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="bg-white">
                <td className="border-b border-slate-100 px-5 py-4 text-slate-700">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span>{index + 1}</span>
                  </div>
                </td>

                <td className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveAssetUrl(row.image)}
                      alt={row.name}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <span className="font-medium text-slate-800">{row.name}</span>
                  </div>
                </td>

                <td className="border-b border-slate-100 px-5 py-4 text-slate-600">
                  {row.createdDate}
                </td>

                <td className="border-b border-slate-100 px-5 py-4 text-slate-600">
                  {row.order}
                </td>

                <td className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <button type="button" className="hover:text-slate-800">
                      <Edit2 size={17} />
                    </button>
                    <button type="button" className="hover:text-red-600">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
