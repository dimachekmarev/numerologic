import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import bytes from "dejavu-fonts-ttf/ttf/DejaVuSans.ttf";
export async function pdf(content) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(bytes, { subset: true });
  doc.setTitle("Numerologic · личный материал");
  doc.setCreator("Numerologic");
  let page, y;
  const add = () => {
    page = doc.addPage([595, 842]);
    y = 788;
    page.drawText("NUMEROLOGIC", {
      x: 48,
      y,
      size: 14,
      font,
      color: rgb(0.21, 0.16, 0.34),
    });
    y -= 36;
  };
  add();
  for (const paragraph of content.split("\n")) {
    let line = "";
    const draw = () => {
      if (y < 55) add();
      page.drawText(line, {
        x: 48,
        y,
        size: 10,
        font,
        color: rgb(0.18, 0.18, 0.21),
      });
      y -= 16;
    };
    for (const word of paragraph.split(" ")) {
      const next = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(next, 10) > 499 && line) {
        draw();
        line = "";
      }
      if (font.widthOfTextAtSize(word, 10) > 499) {
        for (const char of word) {
          if (font.widthOfTextAtSize(line + char, 10) > 499) {
            draw();
            line = "";
          }
          line += char;
        }
      } else line = line ? line + " " + word : word;
    }
    draw();
    if (!paragraph) y -= 5;
  }
  return doc.save();
}
