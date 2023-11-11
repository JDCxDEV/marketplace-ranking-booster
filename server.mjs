import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { triggerBooster } from './static/kaufland-testing.js';
import { download } from './static/helpers/server.js';
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 3000; // Use the specified port or default to 3000
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getRequestTriggerBooster = async (req, res) => {
    const productJsonFile = await dynamicallyImportJsonFile('products.json')

    const product = productJsonFile.products.filter(item => item.id == req.body.product)[0]
    const requestData = req.data;
    
    triggerBooster(req.body.thread, product)
    return  res.status(200).json({ message: 'POST request successful', data: req.body });
}

const dynamicallyImportJsonFile = async (file)  => {
    const { default: jsonObject } = await import(`./json/${file}`, {
        assert: {
          type: 'json'
        }
    });

    return jsonObject
}


// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/get-products', async (req, res) => {
    const productJsonFile = await dynamicallyImportJsonFile('products.json')
    return  res.status(200).json(productJsonFile);
});

app.post('/run-function', await getRequestTriggerBooster);


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});