/**
 * Generador de facturas en PDF
 * Usa jsPDF para crear facturas profesionales
 */

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  membershipName: string;
  amount: number;
  status: string;
}

/**
 * Genera un PDF de factura usando jsPDF
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  // Importación dinámica de jsPDF
  const { jsPDF } = await import("jspdf");
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Colores
  const primaryColor = [239, 68, 68]; // #ef4444 (rojo)
  const darkColor = [23, 23, 23]; // #171717
  const lightGray = [163, 163, 163]; // #a3a3a3
  const white = [255, 255, 255];

  let yPos = margin;

  // Header con fondo de color
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Logo/Texto del gimnasio
  doc.setTextColor(...white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("GYM PRO", margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestión de Gimnasio", margin, 32);
  doc.text("Factura de Pago", margin, 38);

  // Número de factura en la esquina superior derecha
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`FACTURA #${data.invoiceNumber}`, pageWidth - margin, 25, {
    align: "right",
  });

  yPos = 60;

  // Información de la factura
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const invoiceInfo = [
    ["Fecha:", data.date.toLocaleDateString("es-MX")],
    ["Estado:", data.status === "paid" ? "PAGADO" : data.status.toUpperCase()],
  ];

  invoiceInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 30, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Línea divisoria
  doc.setDrawColor(...lightGray);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Información del cliente
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DEL CLIENTE", margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const clientInfo = [
    ["Nombre:", data.memberName],
    ...(data.memberEmail ? [["Email:", data.memberEmail]] : []),
    ...(data.memberPhone ? [["Teléfono:", data.memberPhone]] : []),
  ];

  clientInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 30, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Línea divisoria
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Detalles del pago
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DEL PAGO", margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Tabla de detalles
  const tableStartY = yPos;
  
  // Encabezado de la tabla
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, tableStartY - 5, contentWidth, 8, "F");
  
  doc.setFont("helvetica", "bold");
  doc.text("Concepto", margin + 5, tableStartY);
  doc.text("Monto", pageWidth - margin - 5, tableStartY, { align: "right" });

  yPos = tableStartY + 10;

  // Fila de datos
  doc.setFont("helvetica", "normal");
  doc.text(data.membershipName, margin + 5, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(
    `$${data.amount.toFixed(2)}`,
    pageWidth - margin - 5,
    yPos,
    { align: "right" }
  );

  yPos += 15;

  // Línea divisoria antes del total
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Total
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", margin, yPos);
  doc.setFontSize(16);
  doc.text(
    `$${data.amount.toFixed(2)}`,
    pageWidth - margin - 5,
    yPos,
    { align: "right" }
  );

  yPos = pageHeight - 40;

  // Línea divisoria final
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Pie de página
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  doc.text("Gracias por ser parte de GYM PRO", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 5;
  doc.text(
    "Este documento es un recibo válido de pago",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 5;
  doc.text(
    `Generado el ${new Date().toLocaleString("es-MX")}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Generar el blob del PDF
  const pdfBlob = doc.output("blob");
  return pdfBlob;
}

/**
 * Descarga el PDF de la factura
 */
export async function downloadInvoicePDF(data: InvoiceData, filename?: string) {
  try {
    const blob = await generateInvoicePDF(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `factura-${data.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error: "Error al generar el PDF",
    };
  }
}

