/**
 * Utilidades para exportar datos a CSV
 */

/**
 * Convierte un array de objetos a formato CSV
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) {
    return headers.map((h) => h.label).join(",");
  }

  // Crear la fila de encabezados
  const headerRow = headers.map((h) => escapeCSVValue(h.label)).join(",");

  // Crear las filas de datos
  const dataRows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header.key];
        return escapeCSVValue(formatCSVValue(value));
      })
      .join(",");
  });

  // Combinar todo
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Escapa valores para CSV (maneja comas, comillas y saltos de línea)
 */
function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Si contiene comas, comillas o saltos de línea, envolver en comillas
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escapar comillas dobles duplicándolas
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Formatea valores para CSV
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  // Si es una fecha
  if (value instanceof Date) {
    return value.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Si es un objeto con fecha
  if (typeof value === "object" && "toLocaleDateString" in value) {
    return new Date(value).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Si es un objeto, convertirlo a string
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Descarga un archivo CSV
 */
export function downloadCSV(
  csvContent: string,
  filename: string
): void {
  // Agregar BOM para Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Crear URL temporal
  const url = URL.createObjectURL(blob);

  // Crear elemento de descarga
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = "none";

  // Agregar al DOM, hacer clic y remover
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar URL
  URL.revokeObjectURL(url);
}

/**
 * Exporta datos a CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string
): void {
  const csvContent = convertToCSV(data, headers);
  downloadCSV(csvContent, filename);
}

