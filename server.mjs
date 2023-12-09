import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { triggerKauflandBooster } from './static/kaufland-booster.js';
import { triggerBolBooster } from './static/bol-booster.js';
import { downloadProxies } from './static/helpers/boosterSteps.js';
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
    
    if (product.marketplace == "Bol" || product.marketplace == "Bol.com" )  {
        triggerBolBooster(req.body.thread, product);
    }else {
        triggerKauflandBooster(req.body.thread, product);
    }
  
    return res.status(200).json({ message: 'POST request successful', data: req.body });
}

const getTriggerDownloadProxies = async (req, res) => {
    await downloadProxies();

    return res.status(200).json({ message: 'Proxies refresh complete!' });
}

const dynamicallyImportJsonFile = async (file)  => {
    const { default: jsonObject } = await import(`./json/bol/${file}`, {
        assert: {
          type: 'json'
        }
    });

    return jsonObject
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/get-products', async (req, res) => {
    const productJsonFile = await dynamicallyImportJsonFile('products.json')
    return  res.status(200).json(productJsonFile);
});

app.post('/run-function', await getRequestTriggerBooster);


app.post('/refresh-proxies', await getTriggerDownloadProxies);


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});