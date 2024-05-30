import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { triggerAllBolKaufland } from './src/js/static/kaufland-booster.js';
import { triggerAllBlokkerBooster } from './src/js/static/blokker-booster.js';
import { triggerBolBooster, triggerAllBolBooster } from './src/js/static/bol-booster.js';
import { downloadProxies } from './src/helpers/boosterSteps.js';
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 3000; // Use the specified port or default to 3000
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('src'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getRequestTriggerBooster = async (req, res) => {
    const { product, currentMP, currentVM, thread } = req.body;

    if (product && currentMP === 'bol') {
        const productJsonFile = await dynamicallyImportJsonFile((currentVM || 'VM-1') + '.json', currentMP);
        const vmJsonFile = await dynamicallyImportJsonFile('vms.json', 'system');
        const selectedProduct = productJsonFile.products.find(item => item.id === product);
        const vm = vmJsonFile.vms.find(item => item.key === currentVM);

        if (selectedProduct) {
            triggerBolBooster(thread, selectedProduct, vm?.steps);
        }
    } else {
        const vmJsonFile = await dynamicallyImportJsonFile('vms.json', 'system');
        const vm = vmJsonFile.vms.find(item => item.key === currentVM);
        
        if (currentMP === 'bol') {
            triggerAllBolBooster(thread, currentVM, vm);
        } else if (currentMP === 'kaufland') {
            triggerAllBolKaufland(thread, currentVM, vm);
        }else if (currentMP === 'blokker') {
            triggerAllBlokkerBooster(thread, currentVM, vm);
        }
    }

    return res.status(200).json({ message: 'POST request successful', data: req.body });
};

const getTriggerDownloadProxies = async (req, res) => {
    await downloadProxies();

    return res.status(200).json({ message: 'Proxies refresh complete!' });
}

const dynamicallyImportJsonFile = async (file, folder)  => {
    const { default: jsonObject } = await import(`./src/assets/json/${folder}/${file}`, {
        assert: {
          type: 'json'
        }
    });

    return jsonObject
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/get-system-info', async (req, res) => {
    const marketPlace = await dynamicallyImportJsonFile('marketplace.json', 'system');
    const vms = await dynamicallyImportJsonFile('vms.json', 'system');    
    return res.status(200).json({
        systemInfo: { ...marketPlace, ...vms }
    });
});

app.post('/get-products', async (req, res) => {
    const currentMP = req.body.currentMP; 
    const currentVM = req.body.currentVM; 
    
    const productJsonFile = await dynamicallyImportJsonFile((currentVM ? currentVM  : 'VM-1') + '.json', currentMP)
    return  res.status(200).json(productJsonFile);
});

app.post('/run-function', await getRequestTriggerBooster);
app.post('/refresh-proxies', await getTriggerDownloadProxies);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});