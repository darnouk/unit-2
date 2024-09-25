document.addEventListener('DOMContentLoaded', function () { // Wait for the DOM to load before running the script
    // Create the map and setting the center to be the USA and at an appropriate zoom scale as well
    var map = L.map('map').setView([37.1, -95.7], 4);

    // Esri World Topo Layer. Something with Easily distinguishable state borders works best for this project.
    var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom: 16
    }).addTo(map);

    // State center coordinates... For conciseness later on, can just pull this data from the csv instead of manually listing it out here
    const stateCenters = {
        AL: [32.806671, -86.791397],
        AK: [61.370716, -152.404419],
        AZ: [33.729759, -111.431221],
        AR: [34.969704, -92.373123],
        CA: [36.116203, -119.681564],
        CO: [39.059811, -105.311104],
        CT: [41.597782, -72.755371],
        DE: [39.318523, -75.507141],
        DC: [38.89511, -77.03637],
        FL: [27.766279, -81.686785],
        GA: [33.040619, -83.643074],
        HI: [21.094318, -157.498337],
        ID: [44.240459, -114.478828],
        IL: [40.349457, -88.998828],
        IN: [39.849426, -86.258278],
        IA: [42.011539, -93.210526],
        KS: [39.063946, -98.326917],
        KY: [37.668140, -84.670067],
        LA: [31.169546, -91.867805],
        ME: [44.693947, -69.381927],
        MD: [39.063946, -76.802101],
        MA: [42.230171, -71.530106],
        MI: [43.326618, -84.536095],
        MN: [46.392507, -94.636230],
        MS: [32.741646, -89.678696],
        MO: [38.456085, -92.288368],
        MT: [46.921925, -110.454353],
        NE: [41.492537, -99.901813],
        NV: [38.502003, -116.042633],
        NH: [43.193852, -71.572395],
        NJ: [40.298904, -74.521011],
        NM: [34.840515, -106.248482],
        NY: [42.165726, -74.948051],
        NC: [35.630066, -79.806419],
        ND: [47.528912, -99.784012],
        OH: [40.388783, -82.764915],
        OK: [35.565342, -96.928917],
        OR: [43.933, -120.558],
        PA: [40.590752, -77.209755],
        RI: [41.680893, -71.511780],
        SC: [33.856892, -80.945007],
        SD: [44.299782, -99.438828],
        TN: [35.747845, -86.692345],
        TX: [31.169448, -99.387207],
        UT: [40.299, -111.683],
        VT: [44.045876, -72.710686],
        VA: [37.769337, -78.169968],
        WA: [47.400902, -121.490494],
        WV: [38.491226, -80.954270],
        WI: [44.268543, -89.616508],
        WY: [42.755966, -107.302490]
    };

    // Used Fetch API to load CSV data...
    fetch('data/real_estate_data.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => { // Parse the CSV data
            const rows = text.split('\n').map(row => row.split(',')); // Split the rows and columns
            const header = rows[0]; // Get header row
            const data = rows.slice(1).map(row => { // Get data rows
                return header.reduce((acc, key, i) => { // Reduce the data to an object
                    acc[key] = row[i]; // Assign the value to the key
                    return acc; // Return the accumulator
                }, {});
            });
            addStateMarkers(data); // Call function to add markers
        })
        .catch(error => { // Catch any errors
            console.error('Error loading CSV:', error); // Log the error
        });

    // Function to add markers to the map
    function addStateMarkers(data) { // Takes in the data as an argument
        for (const [state, coords] of Object.entries(stateCenters)) { // Loop through the state centers
            const marker = L.marker(coords).addTo(map)
                .bindPopup(`<b>${state}</b><br/>Click for data`)
                .on('click', function () {
                    const stateData = data.find(row => row.State === state);
                    if (stateData) { // If data is available for the state
                        let popupContent = `<b>${state}</b><br/>`; // Start the popup content with the state name
                        // List years based on the available data
                        const years = [2000, 2005, 2010, 2015, 2019, 2020, 2021, 2022, 2023, 2024];
                        years.forEach(year => {
                            const value = parseFloat(stateData[year]);
                            if (!isNaN(value)) { // if not NaN (double negative, yes, then list year with home value)
                                popupContent += `${year}: $${value.toLocaleString()}<br/>`;
                            } else {
                                popupContent += `${year}: No data available<br/>`; // else no data available for current year, then say this
                            }
                        });

                        // Calculating the percent increase in real estate prices from 2000 to 2024 and then also 2020-2024
                        const value2000 = parseFloat(stateData[2000]);
                        const value2020 = parseFloat(stateData[2020]);
                        const value2024 = parseFloat(stateData[2024]);
                        if (!isNaN(value2000) && !isNaN(value2024)) {
                            const percentIncrease = ((value2024 - value2000) / value2000) * 100;
                            popupContent += `Percent Change from 2000 to 2024: ${percentIncrease.toFixed(2)}%<br/>`;
                        } else {
                            popupContent += `Percent Change from 2000 to 2024: Data unavailable<br/>`;
                        }
                        // 2020-2024 percent change. same formula
                        if (!isNaN(value2020) && !isNaN(value2024)) {
                            const percentIncrease = ((value2024 - value2020) / value2020) * 100;
                            popupContent += `Percent Change from 2020 to 2024: ${percentIncrease.toFixed(2)}%<br/>`;
                        } else {
                            popupContent += `Percent Change from 2020 to 2024: Data unavailable<br/>`;
                        }

                        this.setPopupContent(popupContent);
                        this.openPopup();
                    } else {
                        this.setPopupContent(`No data available for ${state}`);
                        this.openPopup();
                    }
                });
        }
    }
});
