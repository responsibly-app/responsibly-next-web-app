"use client";

import { type Toolkit } from "@assistant-ui/react";
import { DataTable } from "@/components/tool-ui/data-table";
import { safeParseSerializableDataTable } from "@/components/tool-ui/data-table/schema";

export const showDataTableTool: Toolkit["show_data_table"] = {
  type: "backend",
  render: ({ result }) => {
    const parsed = safeParseSerializableDataTable(result);
    if (!parsed) return null;
    return <DataTable {...parsed} />;
  },
};
