# HomeScraping
To Scrape the data from homes.com website


1.Download the repository

2.Navigate to the project folder in your terminal and run the following command to install the necessary dependencies npm install

3.Run the Server npm start The server is now running in port 3001 This will launch the server, which will be available at http://localhost:3001.

There are 2 api end points http://localhost:3001/all-listings -> Listings in various pages. http://localhost:3001/scrape-listings -> Navigating to a child page
Choose any one of the endpoints and In the postman set the request method as post and the response body is { "searchQuery": "top home listing home.com websites", "city": "chicago-il" }
