const YAML = require('yamljs');
const assert = require('assert');
const fs = require('fs');

const allConfig = YAML.load("./group_vars/all.yml");

assert.ok(typeof process.env.DO_API_TOKEN === 'string');
assert.ok(process.env.DO_API_TOKEN.length > 0);

function generateValidator2RegionMap(inputMap) {
    assert.ok(Array.isArray(inputMap));
    return new Promise((resolve, reject) => {
        let validators = {};
        inputMap.forEach(region => {
            region.validators.forEach(v => {
                validators[v] = {
                    name: v,
                    region: region.region,
                    address: null
                }
            });
        });

        let files = fs.readdirSync('./tmp/latest');
        files.forEach(f => {
            if (f.startsWith('validator-')) {
                let key = JSON.parse(fs.readFileSync(`./tmp/latest/${f}`));
                validators[f.slice(0, -5)].address = `0x${key.address}`;
            }
        });

        let outputMap = {};

        Object.keys(validators).forEach(k => {
            let v = validators[k];
            outputMap[v.address] = `${v.region} - ${v.name}`
        });
        console.log(outputMap);
        resolve()
    });
}
(async () => {
    await generateValidator2RegionMap(allConfig.map);
})();
