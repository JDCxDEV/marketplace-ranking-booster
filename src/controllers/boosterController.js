import { triggerAllBolKaufland } from '../js/static/kaufland-booster.js';
import { triggerAllBlokkerBooster } from '../js/static/blokker-booster.js';
import { triggerAllBolBooster } from '../js/static/bol-dynamic-booster-with-fingerprint.js';
import { triggerAllMediaMarktBooster } from '../js/static/mediamarkt-dynamic-booster.js';
import { downloadProxies } from '../helpers/boosterSteps.js';

// Dynamically import JSON files
const dynamicallyImportJsonFile = async (file, folder) => {
    const { default: jsonObject } = await import(`../assets/json/${folder}/${file}`, {
        assert: {
            type: 'json'
        }
    });
    return jsonObject;
};

// Trigger Booster Handler
export const getRequestTriggerBooster = async (req, res) => {
    const { currentMP, currentVM, thread } = req.body;

    const vmJsonFile = await dynamicallyImportJsonFile('vms.json', 'system');
    const vm = vmJsonFile.vms.find(item => item.key === currentVM);

    const triggerMap = {
        'bol': triggerAllBolBooster,
        'kaufland': triggerAllBolKaufland,
        'blokker': triggerAllBlokkerBooster,
        'mediamarkt': triggerAllMediaMarktBooster
    };

    const triggerFunction = triggerMap[currentMP];
    if (triggerFunction) {
        await triggerFunction(thread, currentVM, vm);
    }

    return res.status(200).json({ message: 'POST request successful', data: req.body });
};


// Download Proxies Handler
export const 

getTriggerDownloadProxies = async (req, res) => {
    await downloadProxies();
    return res.status(200).json({ message: 'Proxies refresh complete!' });
};

// System Info Handler
export const getSystemInfo = async (req, res) => {
    const marketPlace = await dynamicallyImportJsonFile('marketplace.json', 'system');
    const vms = await dynamicallyImportJsonFile('vms.json', 'system');    
    return res.status(200).json({
        systemInfo: { ...marketPlace, ...vms }
    });
};

// Products Handler
export const getProducts = async (req, res) => {
    const currentMP = req.body.currentMP; 
    const currentVM = req.body.currentVM; 

    const productJsonFile = await dynamicallyImportJsonFile((currentVM ? currentVM : 'VM-1') + '.json', currentMP);
    return res.status(200).json(productJsonFile);
};