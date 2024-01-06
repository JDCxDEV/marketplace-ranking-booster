window.onload = function() {
    sendPostRequest();
};

function getProducts() {
    const getProductsButton = document.getElementById("getProducts");
    const originalButtonText = getProductsButton.innerHTML;

    getProductsButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    const url = "/get-products";

    axios.post(url)
    .then(response => {
        console.log("POST request for products successful:", response.data);
        createTable(response.data.products);
    })
    .catch(error => {
        console.error("POST request for products failed:", error);
    })
    .finally(() => {
        getProductsButton.innerHTML = originalButtonText;
    });
}

function runBoosterFunction(product = null, initAllBooster = false) {
    const startAllBoosterButton = document.getElementById("main-booster-button");
    let productButton = null;

    if(!initAllBooster) {
        productButton = document.getElementById(`productBtn${product}`);
    }

  const threadValue = threadInput.value;

  if (!isNaN(threadValue) && threadValue >= 1 && threadValue <= 500) {
      validationMessage.textContent = "";

      const url = "/run-function";

      let mpSelector = document.getElementById("mpSelector");
      let currentMP = mpSelector.options[mpSelector.selectedIndex].value;

      let vmSelector = null;
      let currentVM = null;

      if(currentMP == 'bol') {
        vmSelector = document.getElementById("vmSelectorBol");
        currentVM = vmSelector.options[vmSelector.selectedIndex].value;
      }else if(currentMP == 'kaufland'){
        vmSelector = document.getElementById("vmSelectorKaufland");
        currentVM = vmSelector.options[vmSelector.selectedIndex].value;
      }
      
      const data = {
        currentMP: currentMP,
        product: product,
        thread: threadValue,
        currentVM: currentVM,
      };

        axios.post(url, data)
        .then(response => {

            if(!initAllBooster) {
                productButton.disabled = true;
                productButton.innerHTML = '<i class="fas fa-cog fa-spin"></i> Booster running!';
            }else {
                startAllBoosterButton.disabled = true;
                startAllBoosterButton.innerHTML = '<i class="fas fa-cog fa-spin"></i> Booster running!';
            }

            console.log("POST request successful:", response.data);
        }).catch(error => {
            console.log("POST request failed:", error);
        });

  } else {
    validationMessage.textContent = "Thread value must be a number between 1 and 500.";
  }
}

function showMarketPlace() {
    var mpSelector = document.getElementById("mpSelector");
    var vmSelectorBol = document.getElementById("vmSelectorBol");
    var vmSelectorKaufland = document.getElementById("vmSelectorKaufland");

    if (mpSelector.value === "bol") {
        vmSelectorBol.classList.remove("hidden");
        vmSelectorKaufland.classList.add("hidden");
    } else if (mpSelector.value === "kaufland") {
        vmSelectorBol.classList.add("hidden");
        vmSelectorKaufland.classList.remove("hidden");
    }

    sendPostRequest(false);
}

async function sendPostRequest(initialize = true) {

    if (initialize) {
        await getSystemInfo();
    }

    const url = "/get-products";

    let mpSelector = document.getElementById("mpSelector");
    let currentMP = mpSelector.options[mpSelector.selectedIndex].value;

    let vmSelector = null;
    let currentVM = null;

    if (currentMP == 'bol') {
        vmSelector = document.getElementById("vmSelectorBol");
        currentVM = vmSelector.options[vmSelector.selectedIndex].value;
    }else if(currentMP == 'kaufland'){
        vmSelector = document.getElementById("vmSelectorKaufland");
        currentVM = vmSelector.options[vmSelector.selectedIndex].value;
    }

    const data = {
        currentMP: currentMP,
        currentVM: currentVM,
    };

    axios.post(url, data)
    .then(response => {
        console.log("POST request for products successful:", response.data);
        createTable(response.data.products);
    })
    .catch(error => {
        console.error("POST request for products failed:", error);
    });
}

function createTable(products) {
    const productTableBody = document.getElementById("productTableBody");

    if (products.length === 0) {
        productTableBody.innerHTML = '<tr><td colspan="4" class="p-2 text-center">No products available.</td></tr>';
        return;
    }

    productTableBody.innerHTML = '';

    let index = 0;
    
    products.forEach(product => {
        index = index + 1
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="p-2">${ index }.</td>
            <td class="p-2">${ product.marketplace }</td>
            <td class="p-2">${ product.product }</td>
            <td class="p-2">
                ${ product.keywords.map(keyword => `<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mb-2 mr-2">${keyword}</span>`).join('')}
            </td>
            <td class="p-2">
                <button class="text-white py-2 px-3 text-sm  rounded-md  whitespace-nowrap ${product.isOutOfStock ? 'cursor-not-allowed bg-gray-300' : 'bg-blue-500 hover:bg-blue-700' }" ${product.isOutOfStock ? 'disabled' : '' } id="productBtn${product.id}" onclick="runBoosterFunction('${product.id}', null)"><i class="fas fa-cog"></i> Run Booster</button>
            </td>
            <td class="p-2">
                <button class="bg-gray-500 text-white py-2 px-3 text-sm rounded-md hover:bg-red-700 whitespace-nowrap" disabled id="stopBtn${product.id}" onclick="stopBooster('${product.id}')"><i class="fas fa-stop"></i> Stop</button>
            </td>
            `;
        productTableBody.appendChild(row);
    });
}

function refreshProxies() {
    const url = "/refresh-proxies";

    axios.post(url)
    .then(response => {
        console.log("POST request for refreshing proxies successful:", response.data);
    })
    .catch(error => {
        console.error("POST request for refreshing proxies failed:", error);
    });
}

async function getSystemInfo() {
    const url = "/get-system-info";
    await axios.post(url)
        .then(async (response) => {
            // Set Market Place
            const marketList = response.data.systemInfo.marketplaces;
            const mpSelector = document.getElementById('mpSelector');
            await marketList.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.key;
                optionElement.text = option.name;
                mpSelector.appendChild(optionElement);
            });

            // Set VMS
            const bolVms = response.data.systemInfo.vms.filter((i => i.marketplace == "Bol.com"));
            const vmSelectorBol = document.getElementById('vmSelectorBol');
            await bolVms.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.key;
                optionElement.text = option.name;
                vmSelectorBol.appendChild(optionElement);
            });

            const kauflandVms = response.data.systemInfo.vms.filter((i => i.marketplace == "Kaufland"));
            const vmSelectorKaufland = document.getElementById('vmSelectorKaufland');
            await kauflandVms.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.key;
                optionElement.text = option.name;
                vmSelectorKaufland.appendChild(optionElement);
            });            
        });
}

const threadInput = document.getElementById("threadInput");
const runBoosterButton = document.getElementById("runBooster");
const getProductsButton = document.getElementById("getProducts");
const validationMessage = document.getElementById("validationMessage");