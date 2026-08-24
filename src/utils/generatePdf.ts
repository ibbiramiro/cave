import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfGenerateOptions {
  filename?: string;
  scale?: number;
}

/**
 * Generate an A4 PDF from a DOM element using html2canvas + jsPDF.
 *
 * Strategy: Clone the target element into a temporary off-screen container
 * at position (0, 0) — the most reliable approach for html2canvas capture
 * regardless of where the original element lives in the DOM.
 */
export async function generateBorrowingPdf(
  elementId: string,
  options: PdfGenerateOptions = {}
): Promise<void> {
  const { filename = 'BorrowingForm.pdf', scale = 3 } = options;

  const original = document.getElementById(elementId);
  if (!original) throw new Error(`Element #${elementId} not found`);

  // ── 1. Clone element into a clean temp container ──────────────────
  const clone = original.cloneNode(true) as HTMLElement;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 794px',
    'background: #ffffff',
    'z-index: 99999',
    // Make it almost invisible (but NOT display:none — html2canvas needs it rendered)
    'opacity: 0.001',
    'pointer-events: none',
  ].join(';');

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // ── 2. Capture ────────────────────────────────────────────────────
    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      windowWidth: 794,
      // Capture from the element's own top-left corner
      x: 0,
      y: 0,
    });

    // ── 3. Build PDF ──────────────────────────────────────────────────
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const PAGE_W_MM = 210;
    const PAGE_H_MM = 297;

    const imgWidthPx  = canvas.width;
    const imgHeightPx = canvas.height;

    // Pixels → mm  (794 device-pixels × scale / 210mm)
    const pxPerMm  = imgWidthPx / PAGE_W_MM;
    const imgH_mm  = imgHeightPx / pxPerMm;

    if (imgH_mm <= PAGE_H_MM) {
      // ── Single page ────────────────────────────────────────────────
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.98),
        'JPEG',
        0, 0,
        PAGE_W_MM, imgH_mm
      );
    } else {
      // ── Multi-page: slice the canvas row-by-row ────────────────────
      const pageH_px = Math.floor(PAGE_H_MM * pxPerMm);
      let yOffset = 0;

      while (yOffset < imgHeightPx) {
        if (yOffset > 0) pdf.addPage();

        const sliceH = Math.min(pageH_px, imgHeightPx - yOffset);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width  = imgWidthPx;
        sliceCanvas.height = sliceH;

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, yOffset, imgWidthPx, sliceH,   // source rect
            0, 0,        imgWidthPx, sliceH    // dest rect
          );

          pdf.addImage(
            sliceCanvas.toDataURL('image/jpeg', 0.98),
            'JPEG',
            0, 0,
            PAGE_W_MM,
            sliceH / pxPerMm
          );
        }

        yOffset += pageH_px;
      }
    }

    pdf.save(filename);
  } finally {
    // ── 4. Always clean up the temp container ─────────────────────────
    document.body.removeChild(wrapper);
  }
}
