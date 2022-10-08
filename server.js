const superagent = require('superagent');
var Airtable = require('airtable');
const Sentry = require('@sentry/node');

//Sentry Initialization
Sentry.init({ dsn: '{INSERT SENTRY URL HERE}' });

//Meraki Dashboard Variables
var merakiApiKey = '{INSERT MERAKI API KEY HERE}' // Remove this API key if this goes into a public repository

//AirTable Variables and Configurations
var cameraBase = new Airtable({
    apiKey: '{INSERT AIRTABLE API KEY HERE}'
}).base('{INSERT AIRTABLE BASE ID HERE}');

var phoneBase = new Airtable({
    apiKey: '{INSERT AIRTABLE API KEY HERE}'
}).base('{INSERT AIRTABLE BASE ID HERE}');

var printerBase = new Airtable({
    apiKey: '{INSERT AIRTABLE API KEY HERE}'
}).base('{INSERT AIRTABLE BASE ID HERE}');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: '{INSERT AIRTABLE API KEY HERE}'
});

//Application Data Related Variables
var districtSwitches = {}
var totalNumberOfSwitches



// Camera Related Variables
var cameras = {}
var cameraVlans = [2100, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110] // All Camera VLANS must go on this line
var cameraMacs = []
var existingCameraMacAddresses = []

var axisModels = {
    axisP3215VMacs: ['ac:cc:8e:2b', 'ac:cc:8e:47', 'ac:cc:8e:48', 'ac:cc:8e:4e', 'ac:cc:8e:4d', 'ac:cc:8e:52', 'ac:cc:8e:51', 'ac:cc:8e:3c', 'ac:cc:8e:31', 'ac:cc:8e:42', 'ac:cc:8e:52'],
    axisQ3505Macs: ['ac:cc:8e:26'],
    axisP3367Macs: ['ac:cc:8e:96', 'ac:cc:8e:97', 'ac:cc:8e:55', 'ac:cc:8e:50', 'ac:cc:8e:e3'],
    axisQ3505MkIIMacs: ['ac:cc:8e:68'],
    axisP3225VMkIIMacs: ['ac:cc:8e:c7'],
    axisP3225LVEMkIIMacs: ['ac:cc:8e:a7'],
    axisP7701Macs: ['ac:cc:8e:56', 'ac:cc:8e:24'],
}

var arecontModels = {
    arecont8185DNMacs: ['00:1a:07:'],
}

var hanwhaModels = {
    hanwhaXND6080RVMacs: ['e4:30:22:'],
    hanwhaPNM9020VMacs: ['00:09:18:'],
}

var pelcoModels = {
    pelcoIMP11101EMacs: ['00:04:7d:14', '00:04:7d:15'],
    pelcoIM10DN101VMacs: ['00:04:7d:0d', '00:04:7d:0c'],
    pelcoIEE20DNMacs: ['00:04:7d:0c'],
}

const compileManufacturerMacs = async () => {
    var cameraManufacturers = [axisModels, arecontModels, hanwhaModels, pelcoModels] // Add Any New Manufacturers In Here
    var manufacturerMacs = []

    cameraManufacturers.forEach(array => {
        for (item in array) {
            manufacturerMacs.push(array[item])
        }
    })

    manufacturerMacs.forEach(item => {
        for (macs in item) {
            cameraMacs.push(item[macs])
        }
    })
}


compileManufacturerMacs()

// Phone Related Variables
var existingExtensions = []
var phones = {}

// Printer Related Variables
var printers = {}
var printerMacs = []
var printerVlans = [2037, 2036, 2022, 2023, 2024, 2025, 2026, 2027, 2029, 2028, 2030, 2031, 2032, 2033, 2034, 2035, 2021, 2020, 2038, 2039, 2043, 2042] // All Printer VLANS must go on this line !!!THIS IS FOR FUTURE USE!!!
var existingPrinterMacAddresses = []

//Copiers
var canonModels = {
    canonImageRunnerAdvance6255Macs: ['2c:9e:fc:1c'],
}
var lanierModels = {
    lanierLc635cMacs: ['00:26:73:1d'],
}
var ricohModels = {
    ricohMpC3503Macs: ['00:26:73:7c'],
    ricohMp3554Macs: ['00:26:73:8d'],
}
var samsungModels = {
    samsungScx6545Macs: ['30:cd:a7:17'],
}

//Printers
var dellModels = {
    dell2330dnMacs: ['00:21:b7:e0'],
    dell2135cnMacs: ['08:00:37:8f'],
    dell3130cnMacs: ['08:00:37:8e'],
    dell2155cnMacs: ['08:00:37:a5'],
    dell5210nMacs: ['00:04:00:e1'],
    dell2430nMacs: ['00:14:38:8a'],

}
var hpModels = {
    hpLaserjetM553Macs: ['00:68:eb:7f'],
    hpLaserjetEnterprise553Macs: ['c4:65:16:dd'],
    hpLaserjet600M602Macs: ['c4:34:6b:1a'],
    hpLaserjetP3015Macs: ['18:a9:05:fd'],
    hpLaserJet200Macs: ['14:58:d0:3a'],
    hp9000Macs: ['00:30:6e:c8'],
    hp2430nMacs: ['00:14:38:8a'],
    hpP3005Macs: ['00:17:a4:95'],
    hp9040Macs: ['00:21:5a:80'],
    hpCp5525Macs: ['98:4b:e1:39'],
    hpProX476Macs: ['28:80:23:cd'],
    hp4700Macs: ['00:1e:0b:ff'],
    hp8600Macs: ['84:34:97:a2'],
}
var kyoceraModels = {
    kyoceraFs4200DnMacs: ['00:17:c8:11'],
}
var lexmarkModels = {
    lexmarkXm1145Macs: ['00:21:b7:b6'],
}

const compilePrinterManufacturerMacs = async () => {
    var printerManufacturers = [canonModels, lanierModels, ricohModels, samsungModels, dellModels, hpModels, kyoceraModels, lexmarkModels] // Add Any New Manufacturers In Here
    var manufacturerMacs = []
    printerManufacturers.forEach(array => {
        for (item in array) {
            manufacturerMacs.push(array[item])
        }
    })

    manufacturerMacs.forEach(item => {
        for (macs in item) {
            printerMacs.push(item[macs])
        }
    })
}

compilePrinterManufacturerMacs()

//Timeouts
const globalTimeoutCameras = 10000 //The timeout needs to be >= 12000 milliseconds, in my tests it has taken between 12-15 seconds to return a single call this large

const globalTimeoutPhones = 20000 //The timeout needs to be >= 12000 milliseconds, in my tests it has taken between 12-15 seconds to return a single call this large


/* Possibly Needed to Skip Unneeded Networks
var networkExceptions = [
{INSERT NETWORKS TO SKIP HERE}
] 
*/

//Get Airtable Device Records to Be Used as A Comparison

const getAirtableEntries = async () => {
    cameras = {} // Clears cameras Object
    existingCameraMacAddresses = [] // Clears existingMacAddresses Array
    existingExtensions = [] // Clears existingExtensions Array
    existingPrinterMacAddresses = [] // Clears existingPrinterMacAddresses Array
    phones = {} // Clears phones Object
    printers = {} // Clears printers Object

    cameraBase('Cameras').select({
        fields: ["ID", "Manufacturer", "Building", "Switch_Name", "Port_Number", "VLAN", "MAC_Address", "IP_Address", 'Description', 'Model'],
        sort: [{
            field: "ID",
            direction: "asc"
        }]
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
            if (existingCameraMacAddresses.includes(record.get('MAC_Address')) === false) {
                existingCameraMacAddresses.push(record.get('MAC_Address'))

                cameras[record.get('ID')] = {
                    airTableId: record.id,
                    manufacturer: record.get('Manufacturer'),
                    portNumber: record.get('Port_Number'),
                    building: record.get('Building'),
                    switch_name: record.get('Switch_Name'),
                    vlan_number: record.get('VLAN'),
                    ipAddress: record.get('IP_Address'),
                    mac: record.get('MAC_Address'),
                    description: record.get('Description'),
                    model: record.get('Model'),
                }
            }

        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
        //console.log(cameras)
    }, function done(err) {
        if (err) {
            console.error(err);
            return;
        }
    });

    phoneBase('Phones').select({
        fields: ["ID", "Phone_Extension", "Building", "Switch_Name", "Port_Number", "Phone_Model", "MAC_Address", "Full_Phone_Number"],
        sort: [{
            field: "ID",
            direction: "asc"
        }]
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
            if (existingExtensions.includes(record.get('Phone_Extension')) === false) {
                existingExtensions.push(record.get('Phone_Extension'))

                phones[record.get('ID')] = {
                    id: record.id,
                    extension: record.get('Phone_Extension'),
                    building: record.get('Building'),
                    switch: record.get('Switch_Name'),
                    portNumber: record.get('Port_Number'),
                    modelPhone: record.get('Phone_Model'),
                    mac: record.get('MAC_Address'),
                    fullPhone: record.get('Full_Phone_Number')
                }
            }

        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
        //console.log(existingExtensions)
        //console.log(phones)
    }, function done(err) {
        if (err) {
            console.error(err);
            return;
        }
    });

    printerBase('Printers/Copiers').select({
        fields: ["ID", "Manufacturer", "Building", "Switch_Name", "Port_Number", "VLAN", "MAC_Address", "IP_Address", 'Description', 'Model', 'DHCP_Hostname'],
        sort: [{
            field: "ID",
            direction: "asc"
        }]
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
            if (existingPrinterMacAddresses.includes(record.get('MAC_Address')) === false) {
                existingPrinterMacAddresses.push(record.get('MAC_Address'))

                printers[record.get('ID')] = {
                    airTableId: record.id,
                    manufacturer: record.get('Manufacturer'),
                    portNumber: record.get('Port_Number'),
                    building: record.get('Building'),
                    switch_name: record.get('Switch_Name'),
                    vlan_number: record.get('VLAN'),
                    ipAddress: record.get('IP_Address'),
                    mac: record.get('MAC_Address'),
                    description: record.get('Description'),
                    model: record.get('Model'),
                    dhcpHostname: record.get('DHCP_Hostname'),
                }
            }

        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
        //console.log(printers)
    }, function done(err) {
        if (err) {
            console.error(err);
            return;
        }
    });
}

const getSwitchInformation = () => new Promise((resolve, reject) => {
    districtSwitches = {} // Clears districtSwitches Object

    superagent
        .get('https://api.meraki.com/api/v0/organizations/264065/devices')
        .set('X-Cisco-Meraki-API-Key', merakiApiKey)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .then(response => {
            var devices = response.body
            var i = 0
            for (device in devices) {
                // Filters out all devices that are not Meraki Switches
                if (devices[device].model === 'MS225-48FP' || devices[device].model === 'MS220-8FP' || devices[device].model === 'MS320-48LP' || devices[device].model === 'MS320-24P') {
                    districtSwitches[i] = {
                        deviceName: devices[device].name,
                        deviceSerial: devices[device].serial
                    }
                    i++
                }
            }
            device = 0 //Resets originally used device count to 0 because we used it elsewhere. This could cause indexing issues
            totalNumberOfSwitches = Object.keys(districtSwitches).length
            console.log("There are " + totalNumberOfSwitches + " Total Switches to Process")
            resolve(response)
        }).catch(error => {
            console.log("There was an error:", error)
        }).finally()


})

const getClientInformation = (device) => new Promise((resolve, reject) => {
    superagent
        .get(`https://api.meraki.com/api/v0/devices/${districtSwitches[device].deviceSerial}/clients?timespan=2678400`) // Looks Back 31 Days (2678400 seconds) (multiply the DAYS value by 86400)
        .set('X-Cisco-Meraki-API-Key', merakiApiKey)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .then(response => {
            for (item in response.body) {

                // Camera Inventory Section
                if (cameraVlans.includes(response.body[item].vlan) || cameraMacs.includes(response.body[item].mac)) {
                    /*                      Camera MAC Address Parsing Section
                    This section contains MAC address matching for each of the camera models in district. 
                    Please add new cameras by section or create a new section for a new manufacturer
                    Arrays of MAC addresses have been moved to the top of server.js for cleaner code. Please add new mac addresses to that section.
                    */
                    //Axis
                    if (axisModels['axisP3215VMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Axis', response.body[item].model = "P3215-V"
                    }
                    if (axisModels['axisQ3505Macs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Axis', response.body[item].model = "Q3505"
                    }
                    if (axisModels['axisP3367Macs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Axis', response.body[item].model = "P3367"
                    }
                    if (axisModels['axisQ3505MkIIMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Axis', response.body[item].model = "Q3505 Mk II"
                    }
                    if (axisModels['axisP3225VMkIIMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Axis', response.body[item].model = "P3225-V Mk II"
                    }
                    if (axisModels['axisP3225LVEMkIIMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Axis', response.body[item].model = "P3225-LVE Mk II"
                    }
                    if (axisModels['axisP7701Macs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Axis', response.body[item].model = "P7701"
                    }
                    //Arecont
                    if (arecontModels['arecont8185DNMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Arecont', response.body[item].model = "8185DN"
                    }
                    //Hanwha (Samsung)
                    if (hanwhaModels['hanwhaXND6080RVMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Hanwha', response.body[item].model = "XND-6080RV"
                    }
                    if (hanwhaModels['hanwhaPNM9020VMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Hanwha', response.body[item].model = "PNM-9020V"
                    }
                    //Pelco
                    if (pelcoModels['pelcoIMP11101EMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Pelco', response.body[item].model = "IMP1110-1E"
                    }
                    if (pelcoModels['pelcoIM10DN101VMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Pelco', response.body[item].model = "IM10DN10-1V"
                    }
                    if (pelcoModels['pelcoIEE20DNMacs'].includes(response.body[item].mac)) {
                        response.body[item].manufacturer = 'Pelco', response.body[item].model = "IEE20DN"
                    }


                    //console.log(response.body[item]) // Console Logs All Cameras Returned From Meraki Dashboard API

                    if (cameraVlans.includes(response.body[item].vlan) || cameraMacs.includes(response.body[item].mac)) { //TODO Probably can remove this if statement

                        if (existingCameraMacAddresses.includes(response.body[item].mac)) {
                            for (cam in cameras) {
                                if (cameras[cam].mac === response.body[item].mac) {
                                    if (cameras[cam].portNumber !== response.body[item].switchport || cameras[cam].switch_name !== districtSwitches[device].deviceName ||
                                        cameras[cam].building !== districtSwitches[device].deviceName.slice(4, 7) ||
                                        cameras[cam].vlan_number !== response.body[item].vlan || cameras[cam].ipAddress !== response.body[item].ip ||
                                        cameras[cam].description !== response.body[item].description || cameras[cam].manufacturer === undefined) {
                                        console.log(cameras[cam])

                                        cameraBase('Cameras').update([{
                                            "id": cameras[cam].airTableId,
                                            "fields": {
                                                "ID": response.body[item].id,
                                                "Building": districtSwitches[device].deviceName.slice(4, 7),
                                                "Switch_Name": districtSwitches[device].deviceName,
                                                "Port_Number": response.body[item].switchport,
                                                "Manufacturer": response.body[item].manufacturer,
                                                "MAC_Address": response.body[item].mac,
                                                "VLAN": response.body[item].vlan,
                                                "IP_Address": response.body[item].ip,
                                                "Description": response.body[item].description,
                                                "Model": response.body[item].model,
                                            }
                                        }], function (err, records) {
                                            if (err) {
                                                console.error(err);
                                                return;
                                            }
                                            records.forEach(function (record) {
                                                console.log("Replacing Record " + record.getId());
                                            });
                                        });

                                    }
                                }
                            }


                        } else if (existingCameraMacAddresses.includes(response.body[item].mac) === false) {
                            //This creates new AirTable records per their sites API documentation. 
                            cameraBase('Cameras').create({
                                "ID": response.body[item].id,
                                "Building": districtSwitches[device].deviceName.slice(4, 7),
                                "Switch_Name": districtSwitches[device].deviceName,
                                "Port_Number": response.body[item].switchport,
                                "Manufacturer": response.body[item].manufacturer,
                                "MAC_Address": response.body[item].mac,
                                "VLAN": response.body[item].vlan,
                                "IP_Address": response.body[item].ip,
                                "Description": response.body[item].description,
                                "Model": response.body[item].model,
                            }, function (err, record) {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                console.log("Adding New Record for " + record.getId());
                            })

                        }
                    }
                }

                let printerMacParsed = response.body[item].mac.slice(0, -6) //Variable to make MAC parsing easier

                if (printerMacs.includes(printerMacParsed)) {

                 /*                      Printer/Copier MAC Address Parsing Section
                    This section contains MAC address matching for each of the Printer/Copier models in district. 
                    Please add new Printers/Copiers by section or create a new section for a new manufacturer
                    Arrays of MAC addresses have been moved to the top of server.js for cleaner code. Please add new mac addresses to that section.
                    */
                    //Copiers
                    //Canon
                    if (canonModels['canonImageRunnerAdvance6255Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Canon', response.body[item].model = "ImageRunner Advance 6255"
                    }
                    //Lanier
                    if (lanierModels['lanierLc635cMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Lanier', response.body[item].model = "LC635c"
                    }
                    //Ricoh
                    if (ricohModels['ricohMpC3503Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Ricoh', response.body[item].model = "MP C3503"
                    }
                    if (ricohModels['ricohMp3554Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Ricoh', response.body[item].model = "MP 3554"
                    }
                    //Samsung
                    if (samsungModels['samsungScx6545Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Samsung', response.body[item].model = "SCX-6545"
                    }

                    //Printers
                    //Dell
                    if (dellModels['dell2330dnMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Dell', response.body[item].model = "2330dn"
                    }
                    if (dellModels['dell2135cnMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Dell', response.body[item].model = "2135cn"
                    }
                    if (dellModels['dell3130cnMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Dell', response.body[item].model = "3130cn"
                    }
                    if (dellModels['dell2155cnMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Dell', response.body[item].model = "2155cn"
                    }
                    if (dellModels['dell5210nMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Dell', response.body[item].model = "5210n"
                    }
                    if (dellModels['dell2430nMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Dell', response.body[item].model = "2430n"
                    }
                    //HP
                    if (hpModels['hpLaserjetM553Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "Laserjet M553"
                    }
                    if (hpModels['hpLaserjetEnterprise553Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "Laserjet Enterprise 553"
                    }
                    if (hpModels['hpLaserjet600M602Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "Laserjet 600 M602"
                    }
                    if (hpModels['hpLaserjetP3015Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "Laserjet P3015"
                    }
                    if (hpModels['hpLaserJet200Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "LaserJet 200"
                    }
                    if (hpModels['hp9000Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "9000"
                    }
                    if (hpModels['hp2430nMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "2430n"
                    }
                    if (hpModels['hpP3005Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "P3005"
                    }
                    if (hpModels['hp9040Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "9040"
                    }
                    if (hpModels['hpCp5525Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "CP5525"
                    }
                    if (hpModels['hpProX476Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "Pro X476"
                    }
                    if (hpModels['hp4700Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "4700"
                    }
                    if (hpModels['hp8600Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'HP', response.body[item].model = "8600"
                    }
                    //Kyocera
                    if (kyoceraModels['kyoceraFs4200DnMacs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Kyocera', response.body[item].model = "FS-4200DN"
                    }
                    //Lexmark
                    if (lexmarkModels['lexmarkXm1145Macs'].includes(printerMacParsed)) {
                        response.body[item].manufacturer = 'Lexmark', response.body[item].model = "XM1145"
                    }

                    if (existingPrinterMacAddresses.includes(response.body[item].mac)) {
                        for (printer in printers) {
                            if (printers[printer].mac === response.body[item].mac) {
                                if (printers[printer].portNumber !== response.body[item].switchport || printers[printer].switch_name !== districtSwitches[device].deviceName ||
                                    printers[printer].building !== districtSwitches[device].deviceName.slice(4, 7) ||
                                    printers[printer].vlan_number !== response.body[item].vlan || printers[printer].ipAddress !== response.body[item].ip ||
                                    printers[printer].description !== response.body[item].description || printers[printer].manufacturer === undefined) {
                                    console.log(printers[printer])

                                    printerBase('Printers/Copiers').update([{
                                        "id": printers[printer].airTableId,
                                        "fields": {
                                            "ID": response.body[item].id,
                                            "Building": districtSwitches[device].deviceName.slice(4, 7),
                                            "Switch_Name": districtSwitches[device].deviceName,
                                            "Port_Number": response.body[item].switchport,
                                            "Manufacturer": response.body[item].manufacturer,
                                            "MAC_Address": response.body[item].mac,
                                            "VLAN": response.body[item].vlan,
                                            "IP_Address": response.body[item].ip,
                                            "Description": response.body[item].description,
                                            "Model": response.body[item].model,
                                            "DHCP_Hostname": response[item].dhcpHostname,
                                        }
                                    }], function (err, records) {
                                        if (err) {
                                            console.error(err);
                                            return;
                                        }
                                        records.forEach(function (record) {
                                            console.log("Replacing Record " + record.getId());
                                        });
                                    });

                                }
                            }
                        }
                    } else if (existingPrinterMacAddresses.includes(response.body[item].mac) === false) {
                        //This creates new AirTable records per their sites API documentation. 
                        printerBase('Printers/Copiers').create({
                            "ID": response.body[item].id,
                            "Building": districtSwitches[device].deviceName.slice(4, 7),
                            "Switch_Name": districtSwitches[device].deviceName,
                            "Port_Number": response.body[item].switchport,
                            "Manufacturer": response.body[item].manufacturer,
                            "MAC_Address": response.body[item].mac,
                            "VLAN": response.body[item].vlan,
                            "IP_Address": response.body[item].ip,
                            "Description": response.body[item].description,
                            "Model": response.body[item].model,
                            "DHCP_Hostname": response.body[item].dhcpHostname,
                        }, function (err, record) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.log("Adding New Record for " + record.getId());
                        })

                    }
                }
            }
            resolve(response)
        }).catch(error => {
            console.log("There was an error:", error)
        }).finally()
})

const getSwitchPortStatuses = async (device) => {
    superagent
        .get(`https://api.meraki.com/api/v0/devices/${districtSwitches[device].deviceSerial}/switchPortStatuses`)
        .set('X-Cisco-Meraki-API-Key', merakiApiKey)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .then(response => {
            var switchStatus = response.body
            console.log(response.statusCode)
            if (response.statusCode === 200) {
                for (port in switchStatus) {
                    if (switchStatus[port].hasOwnProperty("cdp") && switchStatus[port].cdp.hasOwnProperty("platform") && switchStatus[port].cdp.platform.split(" ")[0] === 'Mitel') { //Checks for MITEL in CDP data so that we don't get unwanted devices
                        currentPort = switchStatus[port].portId
                        console.log("Port " + currentPort)
                        switchName = districtSwitches[device].deviceName
                        console.log("Switch Name " + switchName)
                        //buildingName = districtSwitches[device].deviceName.split['-'][1]
                        buildingName = districtSwitches[device].deviceName.slice(4, 7)
                        console.log("Building Name is " + buildingName)
                        lldpPlatform = switchStatus[port].lldp.systemName.slice(6,10)   //Grabs 4-digit Mitel Extension from LLDP Datal
                        extension = switchStatus[port].cdp.platform.split(" ")[2]
                        console.log("Extension is " + extension)
                        phoneModel = switchStatus[port].lldp.systemName.split(" ")[2]
                        console.log("Phone Model is " + phoneModel)
                        macAddress = switchStatus[port].lldp.portId
                        console.log("MAC " + macAddress)
                        fullPhoneNumber = `248451${extension}`
                        console.log("Full Phone Number is " + fullPhoneNumber)

                        if (existingExtensions.includes(extension)) {
                            for (let item in phones) {
                                if (phones[item].extension === extension) {
                                    if (phones[item].portNumber !== currentPort || phones[item].switch !== switchName || phones[item].building !== buildingName ||
                                        phones[item].modelPhone !== phoneModel || phones[item].mac !== macAddress || phones[item].fullPhone !== fullPhoneNumber) {
                                        phoneBase('Phones').update([{
                                            "id": phones[item].id,
                                            "fields": {
                                                "Switch_Name": switchName,
                                                "Port_Number": currentPort,
                                                "Phone_Extension": phones[item].extensionfullPhoneNumber,
                                                "MAC_Address": macAddress,
                                                "Phone_Model": phoneModel,
                                                "Building": buildingName,
                                                "Full_Phone_Number": `248451${phones[item].extension}`
                                            }
                                        }], function (err, records) {
                                            if (err) {
                                                console.error(err);
                                                return;
                                            }
                                            records.forEach(function (record) {
                                                console.log("Replacing Record For: " + record.get('Phone_Extension'));
                                            });
                                        });
                                    }
                                }
                            }
                        } else if (existingExtensions.includes(extension) === false) {
                            //This creates new AirTable records per their sites API documentation. 
                            phoneBase('Phones').create({
                                "Building": buildingName,
                                "Switch_Name": switchName,
                                "Port_Number": currentPort,
                                "Phone_Extension": extension,
                                "MAC_Address": macAddress,
                                "Phone_Model": phoneModel,
                                "Full_Phone_Number": fullPhoneNumber
                            }, function (err, record) {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                console.log("Adding New Record for " + record.getId());
                            })
                        }
                    }
                }

            } else if (response.statusCode === 429) {
                "Too Many Requests... Setting Timout to Clear"
                sleep(globalTimeoutPhones)
                console.log("There was an error: ", error)
            }

        }).catch(error => {
            console.log("There was an error: ", error)
        }).finally()

}

//Creates function for async sleep if needed to delay functions
const sleep = ms => new Promise(res => setTimeout(res, ms))
const runProgram = async () => {
    await getAirtableEntries()
    await getSwitchInformation()
    for (device in districtSwitches) {
        console.log(districtSwitches[device])
        console.log("Now Processing Switch " + device + " of " + totalNumberOfSwitches)
        await sleep(globalTimeoutCameras)
        getClientInformation(device) // For Camera and Printer Inventory
        getSwitchPortStatuses(device) // For Phone Inventory Function
    }

    await runProgram() //Runs Program Repeatedly

}

runProgram()