const express = require('express');
const multer = require('multer');
const { Firestore } = require('@google-cloud/firestore');
const pdfParse = require('pdf-parse');
const { BigQuery } = require('@google-cloud/bigquery');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const firestore = new Firestore();
const bigquery = new BigQuery();

app.use(express.static('public'));
app.use(express.json());

async function insertIntoBigQuery(data) {
    const datasetId = 'CreditTracking';
    const tableId = 'Vehicles';
    const rows = [data].map(({ manufacturingCoordinates, ...rest }) => rest);

    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    try {
        await table.insert(rows);
        console.log(`Inserted data into BigQuery: ${JSON.stringify(rows)}`);
    } catch (error) {
        console.error('Error inserting data into BigQuery:', error);
        if (error.name === 'PartialFailureError') {
            console.error('PartialFailureError details:', error.errors);
        }
    }
}

async function extractDetailsFromPDF(text) {
    let extractedData = {
        manufacturer: '',
        model: '',
        vin: '',
        countryOfOrigin: '',
        price: 0.0,
        eligibility: '',
        manufacturingCoordinates: { latitude: null, longitude: null }
    };

    const lines = text.split('\n');
    lines.forEach(line => {
        let parts = line.split(':');
        if (parts.length === 2) {
            let key = parts[0].trim();
            let value = parts[1].trim().replace(/[\$,]/g, '');
            switch (key) {
                case 'Make':
                    extractedData.manufacturer = value;
                    break;
                case 'Model':
                    extractedData.model = value;
                    break;
                case 'VIN':
                    extractedData.vin = value;
                    break;
                case 'Country of Origin':
                    extractedData.countryOfOrigin = value;
                    break;
                case 'Price':
                    extractedData.price = parseFloat(value);
                    break;
                case 'Latitude':
                    extractedData.manufacturingCoordinates.latitude = parseFloat(value.replace(/[^\d.-]/g, ''));
                    break;
                case 'Longitude':
                    extractedData.manufacturingCoordinates.longitude = parseFloat(value.replace(/[^\d.-]/g, ''));
                    break;
            }
        }
    });

    extractedData.eligibility = evaluateEligibility(extractedData);

    let firestoreData = { ...extractedData };
    let bigQueryData = { ...extractedData };
    delete bigQueryData.manufacturingCoordinates;

    return { firestoreData, bigQueryData };
}

function evaluateEligibility(details) {
    const compliantRegions = ['United States', 'Canada', 'Mexico'];
    return compliantRegions.includes(details.countryOfOrigin) ? 'Eligible for $7,500 tax credit' : 'Not eligible';
}

async function insertIntoFirestore(data, collectionName) {
    try {
        const documentRef = firestore.collection(collectionName).doc();
        await documentRef.set(data);
        console.log(`Data insertion to Firestore in collection '${collectionName}' was successful`);
    } catch (error) {
        console.error(`Error inserting data into Firestore in collection '${collectionName}':`, error);
        throw error;
    }
}

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const data = await pdfParse(req.file.buffer);
        if (!data || !data.text) {
            return res.status(500).send('Failed to parse PDF.');
        }

        const { firestoreData, bigQueryData } = await extractDetailsFromPDF(data.text);

        await insertIntoFirestore(firestoreData, 'default');
        await insertIntoBigQuery(bigQueryData);

        res.redirect('/summary.html');
    } catch (error) {
        console.error('Error processing the file:', error);
        res.status(500).send('An error occurred while processing the file.');
    }
});

// Function to insert user details into BigQuery
async function insertUserDetailsIntoBigQuery(userData) {
    const datasetId = 'userdetails';
    const tableId = 'userdetails';
    const rows = [userData];

    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    try {
        await table.insert(rows);
        console.log(`Inserted user details into BigQuery: ${JSON.stringify(rows)}`);
    } catch (error) {
        console.error('Error inserting user details into BigQuery:', error);
        if (error.name === 'PartialFailureError') {
            console.error('PartialFailureError details:', error.errors);
        }
        throw error; // Rethrow the error to handle it in the route
    }
}

app.post('/submit-summary', async (req, res) => {
    const userData = req.body;
    try {
        // Insert user details into Firestore database
        await insertIntoFirestore(userData, 'userdetails');
        // Insert user details into BigQuery database
        await insertUserDetailsIntoBigQuery(userData);

        res.status(200).json({ message: 'User details submitted successfully' });
    } catch (error) {
        console.error('Error on submitting user details:', error);
        res.status(500).json({ message: 'An error occurred while submitting user details' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080, () => {
    console.log('Server started on port 8080');
});