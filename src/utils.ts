import fs from 'fs';

// Function to save the data to a JSON file
const saveToJsonFile = (data: any, filename: string) => {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
};

export { saveToJsonFile };
