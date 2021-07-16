const cheerio = require("cheerio");
const fs = require('fs');
const puppeteer = require("puppeteer");
const baseUrl = 'https://boliviaverifica.bo/category';

async function scrap(category, pageInit, pageEnd) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'es'
  });
  await page.setDefaultNavigationTimeout(50000);
  let result = [];
  for (let i = pageInit; i < pageEnd; i+=1) {
    const url = `${baseUrl}/${category}/page/${i}/`;
    await page.goto(url);
    const bodyHTML = await page.content();
    
    const selector = cheerio.load(bodyHTML);
    const body = selector("body");
    const primary = body.find('#main');
    
    const archives = primary.find('.archive-post');
    const converted = archives.get().map((archive) => {
      const enlace = selector(archive).find('.entry-content').find('a').attr('href').trim();
      const titulo = selector(archive).find('.entry-title').find('a').text().trim();
      const fecha = selector(archive).find('.posted-on').text().trim();
      return {
        enlace,
        titulo,
        fecha,
      };
    });
    result = result.concat(converted);
  }
  await page.close();
  await browser.close();
  return result;
}

(async function() {
   const category = 'enganoso'; // enganoso | verdad | falso
   const initPage = 1;
   const endPage = 10;
   const result = await scrap(category, initPage, endPage);
   const json = JSON.stringify(result);
   fs.writeFile(`${category}.json`, json, 'utf8', function (err) {
      if (err) throw err;
      console.log('success!!!');
   });
})();