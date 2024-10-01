// Initialize the Leaflet map
var map = L.map('map').setView([37.8, -96], 4); // Center the map on the USA

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load the CSV data for average home prices
let priceData = {};
const years = [2000, 2005, 2010, 2015, 2019, 2020, 2021, 2022, 2023, 2024]; // Declare years here

fetch('data/real_estate_data.csv') // Update this path to your CSV file
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split('\n');
        const headers = rows[0].split(','); // Assuming the first row contains headers

        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(',');
            const state = cells[1]; // Use the correct index for State
            const prices = {};

            // Map each year to its average price
            for (let j = 2; j < headers.length; j++) { // Start from index 2 for year prices
                prices[headers[j]] = parseFloat(cells[j]); // Convert price to a float
            }
            priceData[state] = prices; // Store prices under the state key
        }
        console.log(priceData); // Debug point
    })
    .then(() => {
        // Load the GeoJSON data
        return fetch('data/gz_2010_us_040_00_5m.json'); // Path to geojson for USA state boundaries
    })
    .then(response => response.json())
    .then(geoJsonData => {
        
        // JENKS NATURAL BREAKS FORMULA FOR DYNAMIC PRICE RANGES (6 intervals) (VERY LONG)
        function jenks(data, numClasses) {
            data.sort((a, b) => a - b); // Sort data ascending

            // Initialize matrices
            const lowerClassLimits = Array.from({ length: data.length + 1 }, () =>
                Array(numClasses + 1).fill(0)
            );
            const varianceCombinations = Array.from({ length: data.length + 1 }, () =>
                Array(numClasses + 1).fill(Infinity)
            );

            for (let i = 1; i <= numClasses; i++) {
                lowerClassLimits[1][i] = 1;
                varianceCombinations[1][i] = 0;
            }

            for (let l = 2; l <= data.length; l++) {
                let sum = 0;
                let sumSquares = 0;
                let w = 0;

                for (let m = 1; m <= l; m++) {
                    const lower = l - m + 1;
                    const val = data[lower - 1];
                    w++;
                    sum += val;
                    sumSquares += val * val;
                    const variance = sumSquares - (sum * sum) / w; // Correctly scoped 'variance'

                    if (lower !== 1) {
                        for (let j = 2; j <= numClasses; j++) {
                            if (varianceCombinations[l][j] >= variance + varianceCombinations[lower - 1][j - 1]) {
                                lowerClassLimits[l][j] = lower;
                                varianceCombinations[l][j] = variance + varianceCombinations[lower - 1][j - 1];
                            }
                        }
                    }
                }

                lowerClassLimits[l][1] = 1;
                varianceCombinations[l][1] = sumSquares - (sum * sum) / w; // Use correct variance calculation
            }

            let breaks = Array(numClasses).fill(0);
            let k = data.length;

            for (let j = numClasses; j >= 1; j--) {
                breaks[j - 1] = data[lowerClassLimits[k][j] - 1];
                k = lowerClassLimits[k][j] - 1;
            }

            return breaks;
        }

        // Function to calculate dynamic price ranges using Jenks natural breaks
        function calculatePriceRangesForYear(year) {
            const pricesForYear = [];

            // Collect all state prices for the selected year
            for (let state in priceData) {
                const price = priceData[state]?.[year];
                if (price) {
                    pricesForYear.push(price);
                }
            }

            // Calculate Jenks natural breaks with 6 intervals
            const breaks = jenks(pricesForYear, 6);

            // Create the price ranges with colors
            return [
                { min: breaks[0], max: breaks[1], color: '#ffffcc' },
                { min: breaks[1], max: breaks[2], color: '#ffcc00' },
                { min: breaks[2], max: breaks[3], color: '#ff9900' },
                { min: breaks[3], max: breaks[4], color: '#ff6600' },
                { min: breaks[4], max: breaks[5], color: '#ff3300' },
                { min: breaks[5], max: Infinity, color: '#cc0000' }
            ];
        }

        // Function to get color based on price and year
        function getColor(price, year) {
            const priceRanges = calculatePriceRangesForYear(year);

            for (let range of priceRanges) {
                if (price >= range.min && price <= range.max) {
                    return range.color;
                }
            }
            return '#ffffff'; // Default color if no range matches
        }

        // Create a container div to hold the year label and the slider
        const controlContainer = document.createElement('div');
        controlContainer.style.position = 'absolute';
        controlContainer.style.bottom = '20px'; // Adjust vertical position
        controlContainer.style.left = '50%'; // Horizontally center the container
        controlContainer.style.transform = 'translateX(-50%)'; // Correct for centering offset
        controlContainer.style.display = 'flex'; // Display label and slider inline
        controlContainer.style.alignItems = 'center'; // Center items vertically

        // Create a label to display the current year
        const yearLabel = document.createElement('label');
        yearLabel.innerText = "Year: " + years[0]; // Default year label for first year
        yearLabel.style.marginRight = '10px'; // Add some space between the label and slider

        // Create the slider input
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0; // Set min to 0 for array indexing
        slider.max = 9; // Number of years - 1 (from 2000 to 2024) (will have to change this if/once i add more years
        slider.value = 0; // Default to the first year

        // Append the label and slider to the container
        controlContainer.appendChild(yearLabel);
        controlContainer.appendChild(slider);

        // Append the container to the document body
        document.body.appendChild(controlContainer);
        // Create Previous and Next buttons (assigment requirement)
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.style.marginRight = '10px';

        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.style.marginLeft = '10px';

        // Add functionality to the Previous button
        prevButton.addEventListener('click', function () {
            if (slider.value > slider.min) {
                slider.value--; // Decrement slider value
                updateMap(); // Update the map and legend
            }
        });

        // Add functionality to the Next button
        nextButton.addEventListener('click', function () {
            if (slider.value < slider.max) {
                slider.value++; // Increment slider value
                updateMap(); // Update the map and legend
            }
        });

        // Append the buttons to the control container (next to the slider)
        controlContainer.insertBefore(prevButton, slider);
        controlContainer.appendChild(nextButton);

        // Define the style for the GeoJSON features
        function style(feature) {
            const state = feature.properties.NAME; // Assuming NAME is the property for the state name
            const price = priceData[state]?.[years[slider.value]]; // Get price for the selected year
            return {
                fillColor: getColor(price, years[slider.value]), // Get dynamic color based on Jenks breaks
                weight: 1,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        // Add the GeoJSON layer to the map
        L.geoJSON(geoJsonData, {
            style: style,
            onEachFeature: function(feature, layer) {
                const state = feature.properties.NAME;
                const price = priceData[state]?.[years[slider.value]]; // Get price for the selected year
                layer.bindPopup(`${state}: $${price ? price.toLocaleString() : "Data not available"}`); // Display state name and price
            }
        }).addTo(map);

        // Create a legend control and position it in the bottom-right corner
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = ''; // Clear the legend content
            return div;
        };

        legend.addTo(map);

        // Function to update the legend based on the current price ranges
        function updateLegend(priceRanges) {
            const div = document.querySelector('.legend');
            div.innerHTML = '<strong>Price Ranges</strong><br>'; // Title for legend

            // Add price ranges to the legend
            for (let i = 0; i < priceRanges.length; i++) {
                const range = priceRanges[i];
                const minPrice = range.min.toLocaleString(); // Format price with commas
                const maxPrice = (range.max === Infinity) ? '∞' : range.max.toLocaleString(); // Display infinity symbol
                // Add a colored square and the price range to the legend
                div.innerHTML += `
                    <i style="background:${range.color}; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i>
                    ${minPrice} - ${maxPrice} <br>
                `;
            }
            div.style.padding = '10px'; // Add a small 10px padding to the legend
            div.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Transparent white background
            div.style.borderRadius = '5px'; // Rounded corners for the legend
            div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'; // Subtle shadow for better visibility and a more "3D" look
        }

        // Function to update everything when the slider changes
        function updateMap() {
            yearLabel.innerText = "Year: " + years[slider.value]; // Update year label when slider changes

            const priceRanges = calculatePriceRangesForYear(years[slider.value]); // Get dynamic price ranges

            // Update the legend with the new price ranges
            updateLegend(priceRanges);

            // Update the map layers
            map.eachLayer(function(layer) {
                if (layer instanceof L.GeoJSON) {
                    map.removeLayer(layer);
                }
            });

            L.geoJSON(geoJsonData, {
                style: style,
                onEachFeature: function(feature, layer) {
                    const state = feature.properties.NAME;
                    const price = priceData[state]?.[years[slider.value]]; // Get price for the selected year
                    layer.bindPopup(`${state}: $${price ? price.toLocaleString() : "Data not available"}`); // Display state name and price
                }
            }).addTo(map);
        }

        // Initialize map and legend with default values
        updateMap();

        // Update the map and legend when the slider changes
        slider.addEventListener('input', updateMap);
    });
