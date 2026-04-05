import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DesktopFrame from "@/app/_components/DesktopFrame";
import SelectedRowDialogWrapper from "./SelectedRowDialogWrapper";

type TableGroup = {
  title: string;
  tables: Array<{
    key: string;
    label: string;
  }>;
};

type TableResult = {
  rows: Array<Record<string, unknown>>;
  error: string | null;
};

const TABLE_GROUPS: TableGroup[] = [
  {
    title: "Tables",
    tables: [
      { key: "categories", label: "Categories" },
      { key: "cat_types", label: "Category Types" },
      { key: "archetype_personas", label: "Archetype Personas" },
      { key: "archetype_components", label: "Archetype Components" },
    ],
  },
  {
    title: "Assessment",
    tables: [
      { key: "users", label: "Users" },
      { key: "questions", label: "Questions" },
      { key: "examinees", label: "Examinees" },
      { key: "answers", label: "Answers" },
    ],
  },
];

const ALL_TABLES = TABLE_GROUPS.flatMap((group) => group.tables);
const ALL_TABLE_KEYS = ALL_TABLES.map((table) => table.key);

function toHumanHeader(header: string) {
  return header
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFilteredRows(rows: Array<Record<string, unknown>>, query: string) {
  return rows.filter((row) => {
    if (!query) return true;
    const searchable = Object.values(row)
      .map((value) => String(value ?? "").toLowerCase())
      .join(" ");
    return searchable.includes(query.toLowerCase());
  });
}

function getSelectedRowData(
  rows: Array<Record<string, unknown>>,
  query: string,
  selectedRow: string | null
) {
  if (!selectedRow) return null;

  const filteredRows = getFilteredRows(rows, query);
  if (!filteredRows.length) return null;

  const headers = Object.keys(filteredRows[0]);
  const rowIdKey = headers.find((header) => header.endsWith("_id"));

  return (
    filteredRows.find((row, index) => {
      const fallbackId = String(index + 1);
      const rowId = rowIdKey ? String(row[rowIdKey] ?? fallbackId) : fallbackId;
      return rowId === selectedRow;
    }) ?? null
  );
}

function renderTable(
  tableName: string,
  rows: Array<Record<string, unknown>>,
  query: string,
  selectedRow: string | null,
  isEmbedded: boolean
) {
  if (!rows.length) {
    return <p style={{ margin: 0 }}>No records yet.</p>;
  }

  const filteredRows = getFilteredRows(rows, query);

  if (!filteredRows.length) {
    return <p style={{ margin: 0 }}>No rows matched your search.</p>;
  }

  const headers = Object.keys(filteredRows[0]);
  const rowIdKey = headers.find((header) => header.endsWith("_id"));
  const visibleHeaders = headers.filter(
    (header) => !header.endsWith("_id") && header !== "created_at"
  );

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #000",
                  padding: "0.3rem",
                }}
              >
                #
              </th>
              {visibleHeaders.map((header) => (
                <th
                  key={`${tableName}-${header}`}
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #000",
                    padding: "0.3rem",
                  }}
                >
                  {toHumanHeader(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => {
              const fallbackId = String(index + 1);
              const rowId = rowIdKey ? String(row[rowIdKey] ?? fallbackId) : fallbackId;
              const isSelected = selectedRow === rowId;

              return (
                <tr key={`${tableName}-row-${index}`}>
                  <td style={{ padding: "0.3rem", verticalAlign: "top" }}>
                    <a
                      href={`/admin?table=${tableName}${query ? `&q=${encodeURIComponent(query)}` : ""}&row=${encodeURIComponent(rowId)}${isEmbedded ? "&embed=1" : ""}`}
                      style={{
                        color: "#000",
                        fontWeight: isSelected ? "bold" : "normal",
                        textDecoration: isSelected ? "underline" : "none",
                      }}
                    >
                      {index + 1}
                    </a>
                  </td>
                  {visibleHeaders.map((header) => (
                    <td key={`${tableName}-${index}-${header}`} style={{ padding: "0.3rem", verticalAlign: "top" }}>
                      {String(row[header] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function fetchTableData(
  activeTableKey: string,
  supabase: any
): Promise<TableResult> {
  if (activeTableKey !== "archetype_components") {
    const { data, error } = await supabase.from(activeTableKey).select("*").limit(200);
    return {
      rows: data ?? [],
      error: error?.message ?? null,
    };
  }

  const [{ data: components, error: componentsError }, { data: catTypes, error: catTypesError }, { data: personas, error: personasError }] =
    await Promise.all([
      supabase
        .from("archetype_components")
        .select("archetype_component_id, cat_type_id, archetype_persona_id, created_at")
        .limit(200),
      supabase.from("cat_types").select("cat_type_id, cat_type_name"),
      supabase.from("archetype_personas").select("archetype_persona_id, archetype_name"),
    ]);

  const firstError = componentsError ?? catTypesError ?? personasError;
  if (firstError) {
    return {
      rows: [],
      error: firstError.message,
    };
  }

  const catTypeMap = new Map<number, string>();
  const personaMap = new Map<number, string>();

  const catTypeRows = (catTypes ?? []) as Array<{ cat_type_id: number; cat_type_name: string }>;
  const personaRows = (personas ?? []) as Array<{ archetype_persona_id: number; archetype_name: string }>;
  const componentRows = (components ?? []) as Array<{
    archetype_component_id: number;
    cat_type_id: number;
    archetype_persona_id: number;
    created_at: string;
  }>;

  catTypeRows.forEach((row) => {
    catTypeMap.set(Number(row.cat_type_id), String(row.cat_type_name));
  });

  personaRows.forEach((row) => {
    personaMap.set(Number(row.archetype_persona_id), String(row.archetype_name));
  });

  const grouped = new Map<
    string,
    {
      archetype_component_id: number;
      cat_type_name: string;
      associated_archetypes: string[];
      created_at: string;
    }
  >();

  componentRows.forEach((row) => {
    const catTypeName = catTypeMap.get(Number(row.cat_type_id)) ?? "";
    const archetypeName = personaMap.get(Number(row.archetype_persona_id)) ?? "";
    const existing = grouped.get(catTypeName);

    if (!existing) {
      grouped.set(catTypeName, {
        archetype_component_id: row.archetype_component_id,
        cat_type_name: catTypeName,
        associated_archetypes: archetypeName ? [archetypeName] : [],
        created_at: row.created_at,
      });
      return;
    }

    if (archetypeName && !existing.associated_archetypes.includes(archetypeName)) {
      existing.associated_archetypes.push(archetypeName);
    }
  });

  const enrichedRows = Array.from(grouped.values()).map((row) => ({
    archetype_component_id: row.archetype_component_id,
    cat_type_name: row.cat_type_name,
    associated_archetypes: row.associated_archetypes.join(" | "),
    archetype_count: row.associated_archetypes.length,
    created_at: row.created_at,
  }));

  return {
    rows: enrichedRows,
    error: null,
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; q?: string; row?: string; embed?: string }>;
}) {
  const params = await searchParams;
  const isEmbedded = params.embed === "1";

  if (!isEmbedded) {
    redirect("/quiz");
  }

  const cookieStore = await cookies();
  const adminUser = cookieStore.get("fd_admin")?.value;

  if (!adminUser) {
    redirect(isEmbedded ? "/admin/login?embed=1" : "/admin/login");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env vars are missing.");
  }

  const requestedTable = params.table;
  const query = params.q?.trim() ?? "";
  const selectedRow = params.row?.trim() ?? null;
  const activeTableKey =
    requestedTable && ALL_TABLE_KEYS.includes(requestedTable)
      ? requestedTable
      : ALL_TABLE_KEYS[0];
  const activeTableMeta = ALL_TABLES.find((table) => table.key === activeTableKey) ?? ALL_TABLES[0];

  const supabase = createClient(supabaseUrl, supabaseKey);
  const activeResult = await fetchTableData(activeTableKey, supabase);
  const selectedRowData = getSelectedRowData(activeResult.rows, query, selectedRow);

  const dashboardContent = (
    <>
      <style>
        {`
          .admin-tab {
            transition: background-color 120ms ease, color 120ms ease;
          }

          .admin-tab:hover {
            background: #222;
            color: #fff;
          }

          .admin-tab-active {
            background: #000;
            color: #fff;
            border-radius: 4px;
          }

          .admin-layout,
          .admin-layout * {
            font-family: inherit;
          }
        `}
      </style>

      <section
        className="admin-layout"
        style={{
          width: "100%",
          minWidth: "880px",
          display: "grid",
          gridTemplateColumns: "360px minmax(0, 1fr)",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <aside
          className="admin-sidebar"
          style={{
            position: "sticky",
            top: 0,
            alignSelf: "start",
            width: "360px",
            paddingRight: "24px",
            boxSizing: "border-box",
          }}
        >
          {isEmbedded ? (
            <div className="standard-dialog" style={{ width: "100%", boxSizing: "border-box", margin: 0, padding: "0.75rem", display: "grid", gap: "0.75rem" }}>
              <section style={{ padding: 0, display: "grid", gap: "0.5rem" }}>
                <p style={{ margin: 0 }}>
                  Hello! <strong>{adminUser}</strong>
                </p>
                <section style={{ display: "grid", gap: "0.5rem", padding: "0 0.5rem" }}>
                  <a
                    className="btn"
                    href={isEmbedded ? "/admin/logout?embed=1" : "/admin/logout"}
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", margin: 0, boxSizing: "border-box" }}
                  >
                    Log out
                  </a>
                </section>
              </section>

              {TABLE_GROUPS.map((group) => (
                <div key={group.title} style={{ display: "grid", gap: "0.4rem", padding: "0 0.5rem" }}>
                  <h3 className="dialog-text" style={{ margin: 0 }}>
                    {group.title}
                  </h3>

                  {group.tables.map((table) => {
                    const isActive = table.key === activeTableKey;
                    return (
                      <a
                        key={table.key}
                        href={`/admin?table=${table.key}${isEmbedded ? "&embed=1" : ""}`}
                        className={`btn admin-tab ${isActive ? "admin-tab-active" : ""}`}
                        style={{
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          margin: 0,
                          boxSizing: "border-box",
                          minWidth: "0",
                          height: "28px",
                          minHeight: "28px",
                          maxHeight: "28px",
                          lineHeight: "20px",
                          padding: "0 0.5rem",
                          textAlign: "center",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {table.label}
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="window" style={{ width: "100%", boxSizing: "border-box", margin: 0 }}>
              <div className="title-bar">
                <button aria-label="Close" className="close" />
                <h2 className="title">Admin Dashboard</h2>
                <button aria-label="Resize" className="resize" />
              </div>
              <div className="separator" />
              <div className="window-pane" style={{ display: "grid", gap: "0.75rem" }}>
                <section style={{ padding: 0, display: "grid", gap: "0.5rem" }}>
                  <p style={{ margin: 0 }}>
                    Hello! <strong>{adminUser}</strong>
                  </p>
                  <section style={{ display: "grid", gap: "0.5rem", padding: "0 0.5rem" }}>
                    <a
                      className="btn"
                      href={isEmbedded ? "/admin/logout?embed=1" : "/admin/logout"}
                      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", margin: 0, boxSizing: "border-box" }}
                    >
                      Log out
                    </a>
                  </section>
                </section>

                {TABLE_GROUPS.map((group) => (
                  <div key={group.title} style={{ display: "grid", gap: "0.4rem", padding: "0 0.5rem" }}>
                    <h3 className="dialog-text" style={{ margin: 0 }}>
                      {group.title}
                    </h3>

                    {group.tables.map((table) => {
                      const isActive = table.key === activeTableKey;
                      return (
                        <a
                          key={table.key}
                          href={`/admin?table=${table.key}${isEmbedded ? "&embed=1" : ""}`}
                          className={`btn admin-tab ${isActive ? "admin-tab-active" : ""}`}
                          style={{
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            boxSizing: "border-box",
                            minWidth: "0",
                            height: "28px",
                            minHeight: "28px",
                            maxHeight: "28px",
                            lineHeight: "20px",
                            padding: "0 0.5rem",
                            margin: 0,
                            textAlign: "center",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {table.label}
                        </a>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <article className="standard-dialog admin-content" style={{ display: "grid", gap: "0.75rem", padding: "0.75rem", minWidth: 0, margin: 0 }}>
          <div className="title-bar" style={{ marginBottom: "0.5rem" }}>
            <h1 className="title">{activeTableMeta.label}</h1>
          </div>


          <form method="GET" className="field-row" style={{ justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: selectedRowData ? 0 : '1rem' }}>
            <input type="hidden" name="table" value={activeTableKey} />
            {isEmbedded ? <input type="hidden" name="embed" value="1" /> : null}
            <label htmlFor="table-search">Search:</label>
            <input
              id="table-search"
              name="q"
              type="text"
              defaultValue={query}
              placeholder="Type to filter rows"
              style={{ flex: 1 }}
            />
            <button
              className="btn"
              type="submit"
              style={{
                width: "84px",
                height: "28px",
                minHeight: "28px",
                maxHeight: "28px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                textAlign: "center",
                padding: 0,
              }}
            >
              Find
            </button>
            <a
              className="btn"
              href={`/admin?table=${activeTableKey}${isEmbedded ? "&embed=1" : ""}`}
              style={{
                textDecoration: "none",
                width: "84px",
                height: "28px",
                minHeight: "28px",
                maxHeight: "28px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                textAlign: "center",
                padding: 0,
              }}
            >
              Clear
            </a>
          </form>

          <div style={{ display: selectedRowData ? 'block' : 'none', marginBottom: selectedRowData ? '1rem' : 0 }}>
            <SelectedRowDialogWrapper data={selectedRowData} />
          </div>

          {activeTableKey === "archetype_components" ? (
            <p style={{ margin: 0 }}>
              Showing one unique <strong>cat_type_name</strong> per row and its <strong>associated_archetypes</strong>.
            </p>
          ) : null}

          {activeResult.error ? <p style={{ margin: 0, color: "#900" }}>Error: {activeResult.error}</p> : null}
          {!activeResult.error ? renderTable(activeTableKey, activeResult.rows, query, selectedRow, isEmbedded) : null}
        </article>
      </section>
    </>
  );

  const dashboardWindow = (
    <div className="window" style={{ width: "min(980px, 100%)", resize: "both", overflow: "auto", minWidth: "760px", minHeight: "440px" }}>
      <div className="title-bar">
        <button aria-label="Close" className="close" />
        <h1 className="title">Admin Dashboard</h1>
        <button aria-label="Resize" className="resize" />
      </div>
      <div className="separator" />

      <div className="window-pane" style={{ padding: "0.75rem" }}>{dashboardContent}</div>
    </div>
  );

  if (isEmbedded) {
    return (
      <main style={{ minHeight: "100%", padding: "0.75rem", overflow: "auto" }}>
        {dashboardContent}
      </main>
    );
  }

  return <DesktopFrame activeTab="admin">{dashboardWindow}</DesktopFrame>;
}
