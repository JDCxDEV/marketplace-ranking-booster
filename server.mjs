import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { triggerKauflandBooster, triggerAllBolKaufland } from './src/js/static/kaufland-booster.js';
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

    if(req.body.product) {
        if(req.body.currentMP == 'bol') {
            const currentMP = req.body.currentMP; 
            const currentVM = req.body.currentVM; 
            
            const productJsonFile = await dynamicallyImportJsonFile((currentVM ? currentVM  : 'VM-1') + '.json', currentMP)
            const product = productJsonFile.products.filter( item => item.id == req.body.product)[0];
            triggerBolBooster(req.body.thread, product);
        }
    }else {
        if(req.body.currentMP == 'bol') {
            triggerAllBolBooster(req.body.thread, req.body.currentVM);
        }else if(req.body.currentMP == 'kaufland'){
            triggerAllBolKaufland(req.body.thread, req.body.currentVM);
        }
    }

  
    return res.status(200).json({ message: 'POST request successful', data: req.body });
}

const getTriggerDownloadProxies = async (req, res) => {
    await downloadProxies();

    return res.status(200).json({ message: 'Proxies refresh complete!' });
}

const dynamicallyImportJsonFile = async (file, marketplace)  => {
    const { default: jsonObject } = await import(`./src/assets/json/${marketplace}/${file}`, {
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