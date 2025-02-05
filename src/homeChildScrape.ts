import puppeteer from 'puppeteer';
import { saveToJsonFile } from './utils'; 
interface Listing {
    price: number | null;
    address: string | null;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
    link: string | null;
}

interface HomeTypeDetails {
    [key: string]: string[];
}

const scrapeHome = async (city: string) => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 1000,
        });
        const page = await browser.newPage();
        await page.goto(city);
        const title = await page.title();
        console.log('Page Title:', title);

        const listings: Listing[] = await page.evaluate(() => {
            const listingElements = document.querySelectorAll('.placard-container article.search-placard'); 
            
            return Array.from(listingElements).map(listing => {
                const price = listing.querySelector('.price-container')?.textContent?.trim().replace(/\$|,/g, '') ?? null;
                const address = listing.querySelector('.property-name')?.textContent?.trim() ?? null;
                const bedBathSqft = listing.querySelector('.detailed-info-container')?.textContent?.trim().split('\n').map(li => li.trim()) ?? []; 
                const beds = bedBathSqft.find(item => item.includes('Bed'))?.replace('Beds', '').trim() ?? null;
                const baths = bedBathSqft.find(item => item.includes('Bath'))?.replace('Baths', '').trim() ?? null;
                const sqft = bedBathSqft.find(item => item.includes('Sq Ft'))?.replace('Sq Ft', '').trim() ?? null;
                const link = (listing.querySelector('a[target="_blank"]') as HTMLAnchorElement)?.href ?? null; 
                
                return {
                    price: price ? parseInt(price, 10) : null, 
                    address,
                    beds: beds ? parseInt(beds, 10) : null, 
                    baths: baths ? parseInt(baths, 10) : null, 
                    sqft: sqft ? parseInt(sqft, 10) : null, 
                    link,
                };
            });
        });

        const listingsWithDetails: (Listing & { details: HomeTypeDetails | null })[] = [];

        for (const listing of listings) {
            if (listing.link) {
                try {
                    const response = await page.goto(listing.link, { waitUntil: 'networkidle2' });
                    if (!response?.ok()) {
                        console.error(`Failed to fetch details for ${listing.link}`);
                        listingsWithDetails.push({ ...listing, details: null });
                        continue;
                    }

                    const details: HomeTypeDetails = await page.evaluate(() => {
                        const homeTypeDetails: HomeTypeDetails = {};
                        const propertyDetailsContainer = document.querySelector('.feature-category.feature-0');

                        if (propertyDetailsContainer) {
                            const subcategoryContainers = propertyDetailsContainer.querySelectorAll('.subcategory-container');

                            subcategoryContainers.forEach(subcategoryContainer => {
                                const categoryName = subcategoryContainer.querySelector('.amenity-name')?.textContent?.trim();
                                if (categoryName === 'Home Type') {
                                    const amenitiesList = subcategoryContainer.querySelectorAll('.amenities-detail');
                                    if (amenitiesList.length > 0) {
                                        const amenities = Array.from(amenitiesList).map(amenity => amenity.textContent?.trim() ?? '');
                                        homeTypeDetails['Home Type'] = amenities;
                                    }
                                }
                            });
                        }
                        return homeTypeDetails;
                    });

                    listingsWithDetails.push({ ...listing, details });
                } catch (childPageError) {
                    console.error(`Error scraping details for ${listing.link}:`, childPageError);
                    listingsWithDetails.push({ ...listing, details: null });
                }
            } else {
                listingsWithDetails.push({ ...listing, details: null });
            }
        }

        await browser.close();

       
        saveToJsonFile(listingsWithDetails, './listings.json');
         
        return listingsWithDetails;
      
    } catch (error) {
        console.error('Error during scraping:', error);
    }
};


export { scrapeHome };
