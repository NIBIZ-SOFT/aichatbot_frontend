/**
 * Universal High-Fidelity Tax Invoice & Document Printing Engine
 *
 * Implements an isolated iframe print context to guarantee:
 * 1. Only the clean document/invoice is printed (excluding sidebar, modals, headers, background apps).
 * 2. Exact preservation of high-DPI logos, corporate colors, and digital stamps via print-color-adjust.
 * 3. Pre-loading of images before opening the native print/PDF dialog.
 * 4. Document title matches the invoice number for seamless "Save as PDF" naming.
 */
export function printInvoiceElement(
  elementId: string,
  invoiceNumber?: string,
  platformName?: string
) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    window.print();
    return;
  }

  // Remove any previous temporary print frames
  const existingFrame = document.getElementById("jobab-invoice-print-frame");
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  // Create an invisible, isolated iframe
  const iframe = document.createElement("iframe");
  iframe.id = "jobab-invoice-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Extract all active styles and links from the parent document
  const stylesheets = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((el) => el.outerHTML)
    .join("\n");

  const docTitle = `${invoiceNumber || "Tax-Invoice"} - ${platformName || "Enterprise Platform"}`;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${docTitle}</title>
        ${stylesheets}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 14mm 14mm 14mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
            width: 100% !important;
          }
          .no-print,
          button,
          [role="button"] {
            display: none !important;
          }
          #printable-tax-invoice {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr, .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .overflow-x-auto {
            overflow: visible !important;
          }
        </style>
      </head>
      <body>
        <div id="printable-tax-invoice" class="space-y-6 bg-white">
          ${targetElement.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  let hasExecuted = false;
  const executePrint = () => {
    if (hasExecuted) return;
    hasExecuted = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn("Iframe print fallback to window.print:", err);
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 60000);
    }
  };

  // Ensure all images (such as brand logos and icons) are loaded before calling print
  const images = Array.from(doc.images);
  if (images.length === 0) {
    setTimeout(executePrint, 250);
  } else {
    let loadedCount = 0;
    const totalImages = images.length;
    const checkIfReady = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setTimeout(executePrint, 150);
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkIfReady();
      } else {
        img.addEventListener("load", checkIfReady);
        img.addEventListener("error", checkIfReady);
      }
    });

    // Safety fallback timeout if any image is slow or cached
    setTimeout(executePrint, 800);
  }
}
