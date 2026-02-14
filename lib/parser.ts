import * as cheerio from 'cheerio';

export const parseHTML = (html: string) => {
  return cheerio.load(html);
};
