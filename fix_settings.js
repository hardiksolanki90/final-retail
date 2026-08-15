const fs = require('fs');
const path = require('path');

const providersDir = path.join(__dirname, 'src', 'providers');
const files = fs.readdirSync(providersDir).filter(f => f.endsWith('Provider.tsx'));

const settingsProviders = [
    'TaxProvider.tsx', 'CurrencyProvider.tsx', 'BankProvider.tsx', 
    'CountryProvider.tsx', 'RegionProvider.tsx', 'VanProvider.tsx', 
    'DepotProvider.tsx', 'RouteProvider.tsx', 'ItemGroupProvider.tsx', 
    'ReasonProvider.tsx', 'ZoneProvider.tsx', 'ItemUomProvider.tsx'
];

let changedFiles = 0;

files.forEach(file => {
    if (settingsProviders.includes(file)) {
        const filePath = path.join(providersDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        let modified = false;

        // Replace "const items = responseData?.data ?? [];"
        const oldItemsRegex = /const items = responseData\?\.data \?\? \[\];/;
        const newItemsStr = `const items = Array.isArray(responseData?.data)\n    ? responseData.data\n    : (Array.isArray(responseData?.data?.items) \n       ? responseData.data.items \n       : (Array.isArray(responseData?.data?.data) ? responseData.data.data : []));`;
        
        if (oldItemsRegex.test(content)) {
            content = content.replace(oldItemsRegex, newItemsStr);
            modified = true;
        }

        const oldMetaRegex = /const meta = responseData\?\.meta \?\? \(responseData \? \{ current_page: responseData\.current_page, per_page: responseData\.per_page, total: responseData\.total, last_page: responseData\.last_page \} : null\);/;
        const newMetaStr = `const meta = responseData?.meta ?? responseData?.data ?? (responseData ? { current_page: responseData.current_page, per_page: responseData.per_page, total: responseData.total, last_page: responseData.last_page } : null);`;
        
        if (oldMetaRegex.test(content)) {
            content = content.replace(oldMetaRegex, newMetaStr);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            changedFiles++;
            console.log('Fixed', file);
        }
    }
});

console.log('Total fixed providers:', changedFiles);
