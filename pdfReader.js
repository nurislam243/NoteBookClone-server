const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractPagesFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  const pages = [];

  if (data.formImage && data.formImage.Pages) {
    data.formImage.Pages.forEach((page, index) => {
      let pageText = '';

      page.Texts.forEach(textItem => {
        textItem.R.forEach(r => {
          pageText += decodeURIComponent(r.T) + ' ';
        });
      });

      pages.push({ page: index + 1, text: pageText.trim() });
    });
  } else {
    const splitPages = data.text.split(/\f/);
    splitPages.forEach((pageText, index) => {
      pages.push({ page: index + 1, text: pageText.trim() });
    });
  }

  return pages;
}

module.exports = { extractPagesFromPDF };
