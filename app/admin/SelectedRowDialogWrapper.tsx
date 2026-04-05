"use client";
import SelectedRowDialog from "./SelectedRowDialog";

export default function SelectedRowDialogWrapper({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return <SelectedRowDialog data={data} />;
}
