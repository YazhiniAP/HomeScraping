import express, { Request, Response } from 'express';
import {searchQueryFn} from './bingScrape';
import {scrapeHome} from './homeChildScrape';
import {scrapeAll} from './allListingsScrape';

const app = express();
const port = 3001;

app.use(express.json());

app.post('/scrape-listings', async (req: Request, res: Response): Promise<Response> => {
    const { searchQuery, city } = req.body;

    if (!searchQuery || !city) {
        return res.status(400).send({ error: 'Both searchQuery and city are required' });
    }
  
    try {
      
       const searchResults = await searchQueryFn(searchQuery);
       console.log(searchResults);
       const combinedSearchQuery = `${searchResults} ${city}`;
        
        const listings = await scrapeHome(combinedSearchQuery);
        // console.log(listings);
        return res.json({ listings });
        
      
    } catch (error) {
        return res.status(500).send({ error: 'An error occurred while scraping listings' });
    }
});

app.post('/all-listings', async (req: Request, res: Response): Promise<Response> => {
    const { searchQuery, city } = req.body;

    if (!searchQuery || !city) {
        return res.status(400).send({ error: 'Both searchQuery and city are required' });
    }
  
    try {
      
       const searchResults = await searchQueryFn(searchQuery);
       console.log(searchResults);
       const combinedSearchQuery = `${searchResults} ${city}`;
        
        const listings = await scrapeAll(combinedSearchQuery);
        // console.log(listings);
        return res.json({ listings });
        
      
    } catch (error) {
        return res.status(500).send({ error: 'An error occurred while scraping listings' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
