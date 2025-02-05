import puppeteer from 'puppeteer';
import { saveToJsonFile } from './utils'; 

interface Listing {
    link: string | null;
}

const scrapeAll = async (city: string) => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 1000,
        });

        const page = await browser.newPage();
        await page.goto(city);
        const title = await page.title();
        console.log('Page Title:', title);

        let allLinks: string[] = []; 

     
        let hasNextPage = true;
        while (hasNextPage) {
    
            const links: string[] = await page.evaluate(() => {
                const listingElements = document.querySelectorAll('.placard-container article.search-placard');

                return Array.from(listingElements).map(listing => {
                    const link = (listing.querySelector('a[target="_blank"]') as HTMLAnchorElement)?.href ?? null;
                    return link;
                }).filter(link => link !== null) as string[];
            });

            allLinks = allLinks.concat(links); 

            
            hasNextPage = await page.evaluate(() => {
                const nextButton = document.querySelector('.next'); 
                return nextButton ? !nextButton.classList.contains('disabled') : false;
            });

            if (hasNextPage) {
               
                const nextButton = await page.$('.next');
                if (nextButton) {
                    await nextButton.click();
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                }
            }
        }

        
        await browser.close();

        saveToJsonFile(allLinks, './listings-links.json');
        console.log(`Scraped ${allLinks.length} links.`);

        return allLinks;
    } catch (error) {
        console.error('Error during scraping:', error);
    }
};

export { scrapeAll };
