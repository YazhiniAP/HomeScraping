import puppeteer from 'puppeteer';

const searchQueryFn = async (query: string): Promise<string | null> => {
    try{
        const browser = await puppeteer.launch( {
            headless:true,
            slowMo: 1000,
        
        });
        const page = await browser.newPage();
       
        
        const encodedQuery = encodeURIComponent('top websites for homes.com listing');
        const bingUrl = `https://www.bing.com/search?q=${encodedQuery}`;
        await page.goto(bingUrl, { waitUntil: 'networkidle2' }); 
    
       
        const links = await page.evaluate(() => {
            const resultLinks = Array.from(document.querySelectorAll('a'));
            return resultLinks
                .map(link => link.href)
                .filter(href => href && href.startsWith('https://www.homes.com'));  
        });
        console.log(links[0]);
        if (links.length === 0) {
            console.error('No  URLs found');
            throw new Error('No URLs found');
        }
        await browser.close();
        return links[0];
    }
    catch (error) {
        console.error('Error during  search:', error);
        throw new Error('An error occurred while searching ');
    }
    }
    export { searchQueryFn };