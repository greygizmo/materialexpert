// app.js

let materials = [];
let unitsData = {};
let headerMapping = {}; // Cleaned key -> original header
let techColorMapping = {};

// Global info texts for each chart type.
const infoTexts = {
  "scatter": `<strong>Scatter Plot</strong>
    <ul>
      <li>Select properties for the X- and Y-axes.</li>
      <li>Filter by Technology.</li>
      <li>Toggle "Show Materials" to display or hide material names.</li>
      <li>Optionally display a linear trendline.</li>
    </ul>`,
  "parallel": `<strong>Parallel Coordinates Plot</strong>
    <ul>
      <li>Displays all numeric properties for a percentage of materials filtered by Technology.</li>
      <li>Hover over a line to view details.</li>
    </ul>`,
  "radar": `<strong>Radar Chart</strong>
    <ul>
      <li>Compare key material properties (normalized 0–1) for materials in the selected Category.</li>
      <li>Toggle material buttons (Ctrl‑click for multiple) to select up to 5 materials.</li>
      <li>The "Show Average" trace displays the average of all materials in the current Category filter.</li>
    </ul>`,
  "barchart": `<strong>Top Bar Chart</strong>
    <ul>
      <li>Ranks materials by a selected property and analysis mode.</li>
      <li>Filter by Technology.</li>
      <li>Below the chart, a brief explanation of the property is provided.</li>
    </ul>`,
  "correlation": `<strong>Correlation Heatmap</strong>
    <ul>
      <li>Displays Pearson correlation coefficients between numeric properties (for materials in the selected Technology).</li>
      <li>No individual numeric annotations appear; instead, an analytical report is provided below.</li>
    </ul>`
};

// Sample property explanations.
const propertyExplanations = {
  "TensileStrength": "Tensile Strength (MPa) is the maximum stress a material can withstand while being stretched before necking.",
  "YoungsModulus": "Young's Modulus (MPa) measures the stiffness of a material; higher values mean stiffer materials.",
  "ElongationatBreak": "Elongation at Break (%) indicates the ductility, or how much a material can stretch before breaking.",
  "FlexuralStrength": "Flexural Strength (MPa) measures the ability of a material to resist deformation under load in bending."
};

// Update the Info Area based on selected chart.
function updateInfoArea(sectionId) {
  const infoArea = document.getElementById('infoContent');
  infoArea.innerHTML = infoTexts[sectionId] || "";
  if (sectionId === "barchart") {
    const prop = document.getElementById('barSelect').value;
    document.getElementById('propertyInfo').innerText = propertyExplanations[prop] || "No description available for this property.";
  } else {
    document.getElementById('propertyInfo') && (document.getElementById('propertyInfo').innerText = "");
  }
}

// Load Units CSV.
Papa.parse('Material Units.csv', {
  download: true,
  header: false,
  skipEmptyLines: true,
  complete: function(results) {
    results.data.forEach(row => {
      if (row[0] && row[1]) {
        const cleanedKey = row[0].replace(/\(.*?\)/g, '').replace(/\s+/g, '').trim();
        unitsData[cleanedKey] = row[1].trim();
      }
    });
    console.log('Units Data:', unitsData);
    loadMaterials();
  }
});

// Load Material Properties CSV.
function loadMaterials() {
  Papa.parse('Material Properties.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function(results) {
      console.log('Raw CSV Results:', results);
      const rawFields = results.meta.fields.slice();
      headerMapping = {};
      results.meta.fields = results.meta.fields.map(f => {
        let original = f.trim();
        let cleaned = original.replace(/\(.*?\)/g, '').replace(/\s+/g, '');
        headerMapping[cleaned] = original;
        return cleaned;
      });
      const cleanedData = results.data.map(row => {
        const cleanedRow = {};
        Object.keys(row).forEach(key => {
          const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '');
          cleanedRow[cleanKey] = row[key];
        });
        return cleanedRow;
      });
      materials = cleanedData.filter(m => m.MaterialName && m.MaterialName.trim() !== '');
      console.log('Processed Materials:', materials);
      if (materials.length === 0) {
        console.error('No materials processed! Check CSV format');
        return;
      }
      buildTechnologyColors();
      populateTechFilter();
      populateParallelTechFilter();
      populateBarTechFilter();
      populateRadarCategoryFilter();
      populateCorrTechFilter();
      buildRadarButtons();
      initDashboard();
    }
  });
}

// Build a mapping of each unique Technology to a neon color.
function buildTechnologyColors() {
  const techs = [...new Set(materials.map(m => m.Technology))];
  const neonColors = ["#00ff99", "#ff00cc", "#ff66cc", "#66ffcc", "#cc00ff", "#00ccff"];
  techs.forEach((tech, i) => {
    techColorMapping[tech] = neonColors[i % neonColors.length];
  });
  console.log("Technology Colors:", techColorMapping);
}

// Populate the Technology Filter dropdown in the scatter section.
function populateTechFilter() {
  const techFilterSelect = document.getElementById('techFilter');
  techFilterSelect.innerHTML = "";
  let allOption = document.createElement('option');
  allOption.value = "All";
  allOption.text = "All";
  techFilterSelect.appendChild(allOption);
  const techs = [...new Set(materials.map(m => m.Technology))];
  techs.forEach(tech => {
    let opt = document.createElement('option');
    opt.value = tech;
    opt.text = tech;
    techFilterSelect.appendChild(opt);
  });
}

// Populate the Technology Filter for the Parallel Coordinates Plot.
function populateParallelTechFilter() {
  const parTech = document.getElementById('parallelTechFilter');
  parTech.innerHTML = "";
  let allOption = document.createElement('option');
  allOption.value = "All";
  allOption.text = "All";
  parTech.appendChild(allOption);
  const techs = [...new Set(materials.map(m => m.Technology))];
  techs.forEach(tech => {
    let opt = document.createElement('option');
    opt.value = tech;
    opt.text = tech;
    parTech.appendChild(opt);
  });
}

// Populate the Technology Filter for the Top Bar Chart.
function populateBarTechFilter() {
  const barTechFilter = document.getElementById('barTechFilter');
  barTechFilter.innerHTML = "";
  let allOption = document.createElement('option');
  allOption.value = "All";
  allOption.text = "All";
  barTechFilter.appendChild(allOption);
  const techs = [...new Set(materials.map(m => m.Technology))];
  techs.forEach(tech => {
    let opt = document.createElement('option');
    opt.value = tech;
    opt.text = tech;
    barTechFilter.appendChild(opt);
  });
}

// Populate the Category Filter for the Radar Chart.
function populateRadarCategoryFilter() {
  const radarCatFilter = document.getElementById('radarCategoryFilter');
  radarCatFilter.innerHTML = "";
  let allOption = document.createElement('option');
  allOption.value = "All";
  allOption.text = "All";
  radarCatFilter.appendChild(allOption);
  const cats = [...new Set(materials.map(m => m.Category))];
  cats.forEach(cat => {
    let opt = document.createElement('option');
    opt.value = cat;
    opt.text = cat;
    radarCatFilter.appendChild(opt);
  });
}

// Populate the Technology Filter for the Correlation Heatmap.
function populateCorrTechFilter() {
  const corrTechFilter = document.getElementById('corrTechFilter');
  if(corrTechFilter) {
    corrTechFilter.innerHTML = "";
    let allOption = document.createElement('option');
    allOption.value = "All";
    allOption.text = "All";
    corrTechFilter.appendChild(allOption);
    const techs = [...new Set(materials.map(m => m.Technology))];
    techs.forEach(tech => {
      let opt = document.createElement('option');
      opt.value = tech;
      opt.text = tech;
      corrTechFilter.appendChild(opt);
    });
  }
}

// Build radar chart buttons.
function buildRadarButtons() {
  const container = document.getElementById('radarButtonContainer');
  container.innerHTML = "";
  const catFilter = document.getElementById('radarCategoryFilter').value;
  let filtered = (catFilter === "All") ? materials : materials.filter(m => m.Category === catFilter);
  filtered.forEach((mat) => {
    const btn = document.createElement('button');
    btn.textContent = mat.MaterialName;
    btn.dataset.index = materials.indexOf(mat);
    btn.addEventListener('click', function(e) {
      if (e.ctrlKey || e.metaKey) {
        this.classList.toggle('selected');
      } else {
        Array.from(container.children).forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
      }
      updateRadar();
    });
    container.appendChild(btn);
  });
  document.getElementById('radarCategoryFilter').addEventListener('change', buildRadarButtons);
}

// Initialize Dashboard.
function initDashboard() {
  setupNavigation();
  createScatterPlot();
  createParallelCoordinatesPlot();
  createRadarChartStandard();
  createTopPropertiesBarChart();
  createCorrelationHeatmap();
  window.addEventListener('resize', updateAllCharts);
}

// Navigation: show selected section and update Info Area.
function setupNavigation() {
  const navLinks = document.querySelectorAll('#sidebar nav ul li a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
      });
      document.getElementById(section).style.display = 'block';
      updateInfoArea(section);
      updateAllCharts();
    });
  });
  updateInfoArea("scatter");
}

/* ===================== Standard Visuals ===================== */

/* 1. Interactive Scatter Plot */
function createScatterPlot() {
  const xSelect = document.getElementById('xSelect');
  const ySelect = document.getElementById('ySelect');
  const techFilter = document.getElementById('techFilter');
  const trendlineCheck = document.getElementById('trendlineCheck');
  const showNamesCheck = document.getElementById('showNames');

  let numericProps = [];
  for (let key in materials[0]) {
    if (typeof materials[0][key] === 'number') {
      numericProps.push(key);
    }
  }
  numericProps.forEach(prop => {
    let displayName = headerMapping[prop] || prop;
    let optionText = displayName + (unitsData[prop] ? ` (${unitsData[prop]})` : '');
    let optX = document.createElement('option');
    optX.value = prop;
    optX.text = optionText;
    xSelect.appendChild(optX);
    let optY = document.createElement('option');
    optY.value = prop;
    optY.text = optionText;
    ySelect.appendChild(optY);
  });
  if (numericProps.length > 0) {
    xSelect.value = numericProps[0];
    ySelect.value = numericProps[1] || numericProps[0];
  }

  function updateScatter() {
    const xProp = xSelect.value;
    const yProp = ySelect.value;
    const techValue = techFilter.value;
    let filteredMaterials = (techValue === "All") ? materials : materials.filter(m => m.Technology === techValue);
    
    const xValues = filteredMaterials.map(m => m[xProp]);
    const yValues = filteredMaterials.map(m => m[yProp]);
    const textValues = showNamesCheck.checked ? filteredMaterials.map(m => m.MaterialName) : [];
    const colors = filteredMaterials.map(m => techColorMapping[m.Technology] || "#00ff99");

    const traces = [{
      x: xValues,
      y: yValues,
      mode: showNamesCheck.checked ? 'markers+text' : 'markers',
      type: 'scatter',
      text: textValues,
      textposition: 'top center',
      marker: { size: 12, color: colors }
    }];

    if (trendlineCheck.checked && xValues.length > 1) {
      let lr = linearRegression(xValues, yValues);
      let xRange = [Math.min(...xValues), Math.max(...xValues)];
      let trendX = xRange;
      let trendY = trendX.map(x => lr.slope * x + lr.intercept);
      traces.push({
        x: trendX,
        y: trendY,
        mode: 'lines',
        type: 'scatter',
        name: 'Trendline',
        line: { dash: 'dash', width: 2, color: '#ff00cc' }
      });
    }

    const layout = {
      title: `Scatter Plot: ${headerMapping[xProp] || xProp} vs ${headerMapping[yProp] || yProp}`,
      xaxis: { 
        title: headerMapping[xProp] || xProp,
        gridcolor: "#444",
        zerolinecolor: "#444"
      },
      yaxis: { 
        title: headerMapping[yProp] || yProp,
        gridcolor: "#444",
        zerolinecolor: "#444"
      },
      paper_bgcolor: "#222",
      plot_bgcolor: "#333",
      font: { family: "Courier New, Courier, monospace", color: "#00ff99" },
      margin: { t: 60, b: 60 }
    };

    Plotly.newPlot('scatterPlotStandard', traces, layout, {responsive: true});
  }

  xSelect.addEventListener('change', updateScatter);
  ySelect.addEventListener('change', updateScatter);
  techFilter.addEventListener('change', updateScatter);
  trendlineCheck.addEventListener('change', updateScatter);
  showNamesCheck.addEventListener('change', updateScatter);
  updateScatter();
}

function linearRegression(x, y) {
  let n = x.length;
  let sum_x = x.reduce((a, b) => a + b, 0);
  let sum_y = y.reduce((a, b) => a + b, 0);
  let sum_xy = x.reduce((acc, val, i) => acc + val * y[i], 0);
  let sum_x2 = x.reduce((acc, val) => acc + val * val, 0);
  let slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
  let intercept = (sum_y - slope * sum_x) / n;
  return { slope, intercept };
}

/* 2. Parallel Coordinates Plot */
function createParallelCoordinatesPlot() {
  const techFilterValue = document.getElementById('parallelTechFilter').value;
  let filtered = (techFilterValue === "All") ? materials : materials.filter(m => m.Technology === techFilterValue);
  const percent = parseInt(document.getElementById('parallelFilter').value);
  const count = Math.max(1, Math.floor(filtered.length * (percent / 100)));
  let displayMaterials = filtered.slice(0, count);
  
  let dims = [];
  for (let key in displayMaterials[0]) {
    if (typeof displayMaterials[0][key] === 'number') {
      const values = displayMaterials.map(m => m[key]);
      dims.push({
        label: headerMapping[key] || key,
        values: values,
        range: [Math.min(...values), Math.max(...values)]
      });
    }
  }
  // Set hover info if enabled.
  const showHover = document.getElementById('showParallelNames').checked;
  let trace = {
    type: 'parcoords',
    dimensions: dims,
    line: {
      color: displayMaterials.map((m, i) => i),
      width: 3,
      colorscale: 'Jet'
    }
  };
  if (showHover) {
    trace.hoverinfo = "text";
    trace.text = displayMaterials.map(m => m.MaterialName);
  } else {
    trace.hoverinfo = "none";
  }
  const data = [trace];

  let container = document.getElementById('parallelPlot');
  let layout = {
    title: 'Parallel Coordinates Plot',
    width: container.clientWidth,
    height: container.clientHeight,
    margin: { t: 80, b: 60 },
    paper_bgcolor: "#222",
    plot_bgcolor: "#333",
    font: { family: "Courier New, Courier, monospace", color: "#00ff99" }
  };

  Plotly.newPlot('parallelPlot', data, layout, {responsive: true});
}

document.getElementById('parallelFilter').addEventListener('input', function() {
  document.getElementById('parallelFilterValue').innerText = this.value + "%";
  createParallelCoordinatesPlot();
});
document.getElementById('parallelTechFilter').addEventListener('change', createParallelCoordinatesPlot);

/* 3. Radar Chart Comparison */
function createRadarChartStandard() {
  updateRadar();
}
function updateRadar() {
  const container = document.getElementById('radarButtonContainer');
  const catFilter = document.getElementById('radarCategoryFilter').value;
  let filtered = (catFilter === "All") ? materials : materials.filter(m => m.Category === catFilter);
  const buttons = Array.from(container.children);
  if (buttons.length === 0) {
    container.innerHTML = "";
    filtered.forEach((mat) => {
      const btn = document.createElement('button');
      btn.textContent = mat.MaterialName;
      btn.dataset.index = materials.indexOf(mat);
      btn.addEventListener('click', function(e) {
        if (e.ctrlKey || e.metaKey) {
          this.classList.toggle('selected');
        } else {
          Array.from(container.children).forEach(b => b.classList.remove('selected'));
          this.classList.add('selected');
        }
        updateRadar();
      });
      container.appendChild(btn);
    });
  } else {
    Array.from(container.children).forEach(btn => {
      let idx = parseInt(btn.dataset.index);
      let mat = materials[idx];
      btn.style.display = (catFilter === "All" || mat.Category === catFilter) ? "inline-block" : "none";
    });
  }
  const selectedButtons = Array.from(container.children).filter(b => b.classList.contains('selected'));
  const selectedIndices = selectedButtons.map(b => parseInt(b.dataset.index)).slice(0, 5);
  const keyProps = ["TensileStrength", "YoungsModulus", "ElongationatBreak", "FlexuralStrength"];
  
  let traces = [];
  selectedIndices.forEach(i => {
    let mat = materials[i];
    let theta = [];
    let r = [];
    keyProps.forEach(prop => {
      let arr = materials.filter(m => m[prop] !== undefined && !isNaN(m[prop])).map(m => m[prop]);
      let minVal = Math.min(...arr), maxVal = Math.max(...arr);
      let norm = (maxVal !== minVal) ? (mat[prop] - minVal) / (maxVal - minVal) : 0.5;
      theta.push(headerMapping[prop] || prop);
      r.push(norm);
    });
    if (theta.length > 0) { theta.push(theta[0]); r.push(r[0]); }
    traces.push({
      type: 'scatterpolar',
      r: r,
      theta: theta,
      fill: 'toself',
      name: mat.MaterialName
    });
  });
  // Compute average from all materials in the current Category filter.
  if (filtered.length > 0 && document.getElementById('showAverage').checked) {
    let rAvg = [];
    keyProps.forEach(prop => {
      let arr = filtered.filter(m => m[prop] !== undefined && !isNaN(m[prop])).map(m => m[prop]);
      let minVal = Math.min(...arr), maxVal = Math.max(...arr);
      let avgVal = arr.reduce((a, b) => a + b, 0) / arr.length;
      let norm = (maxVal !== minVal) ? (avgVal - minVal) / (maxVal - minVal) : 0.5;
      rAvg.push(norm);
    });
    if (rAvg.length > 0) { rAvg.push(rAvg[0]); }
    traces.push({
      type: 'scatterpolar',
      r: rAvg,
      theta: keyProps.map(prop => headerMapping[prop] || prop).concat([headerMapping[keyProps[0]] || keyProps[0]]),
      fill: 'toself',
      name: 'Average (Category)',
      marker: { color: "#00ff99" }
    });
  }
  const layout = {
    polar: { radialaxis: { visible: true, range: [0, 1] } },
    title: `Radar Chart (Normalized)`,
    margin: { t: 60, b: 60, l: 60, r: 60 },
    paper_bgcolor: "#222",
    font: { family: "Courier New, Courier, monospace", color: "#00ff99" }
  };
  Plotly.newPlot('radarPlotStandard', traces, layout, {responsive: true});
}

/* 4. Top Properties Bar Chart */
function createTopPropertiesBarChart() {
  const barSelect = document.getElementById('barSelect');
  const barAnalysis = document.getElementById('barAnalysis');
  const barTechFilter = document.getElementById('barTechFilter');
  let numericProps = [];
  for (let key in materials[0]) {
    if (typeof materials[0][key] === 'number') {
      numericProps.push(key);
    }
  }
  numericProps.forEach(prop => {
    let displayName = headerMapping[prop] || prop;
    let optionText = displayName + (unitsData[prop] ? ` (${unitsData[prop]})` : '');
    let opt = document.createElement('option');
    opt.value = prop;
    opt.text = optionText;
    barSelect.appendChild(opt);
  });

  function updateBarChart() {
    const selectedProp = barSelect.value;
    const mode = barAnalysis.value; // "raw", "norm", "zscore"
    const techVal = barTechFilter.value;
    let filtered = (techVal === "All") ? materials : materials.filter(m => m.Technology === techVal);
    let valuesArray = filtered.filter(m => m[selectedProp] !== undefined && !isNaN(m[selectedProp])).map(m => m[selectedProp]);
    
    let transformed;
    if (mode === "raw") {
      transformed = valuesArray;
    } else if (mode === "norm") {
      const minVal = Math.min(...valuesArray);
      const maxVal = Math.max(...valuesArray);
      transformed = valuesArray.map(v => (maxVal !== minVal) ? (v - minVal) / (maxVal - minVal) : 0.5);
    } else if (mode === "zscore") {
      const mean = valuesArray.reduce((a, b) => a + b, 0) / valuesArray.length;
      const sd = Math.sqrt(valuesArray.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / valuesArray.length);
      transformed = valuesArray.map(v => sd ? (v - mean) / sd : 0);
    }
    
    let combined = filtered.filter(m => m[selectedProp] !== undefined && !isNaN(m[selectedProp])).map((m, i) => ({
      name: m.MaterialName,
      value: transformed[i]
    }));
    combined.sort((a, b) => b.value - a.value);
    const top10 = combined.slice(0, 10);
    const names = top10.map(m => m.name);
    const values = top10.map(m => m.value);
    const revNames = names.slice().reverse();
    const revValues = values.slice().reverse();
    
    const data = [{
      type: 'bar',
      x: revValues,
      y: revNames,
      orientation: 'h',
      marker: { color: "#00ff99" },
      text: revValues.map(v => v.toFixed(2)),
      textposition: 'auto'
    }];
    const layout = {
      title: `Top 10 Materials by ${headerMapping[selectedProp] || selectedProp} (${mode} mode)` + (unitsData[selectedProp] ? ` (${unitsData[selectedProp]})` : ''),
      margin: { l: 180, t: 60, b: 60 },
      paper_bgcolor: "#222",
      plot_bgcolor: "#333",
      font: { family: "Courier New, Courier, monospace", color: "#00ff99" }
    };
    Plotly.newPlot('barPlot', data, layout, {responsive: true});
    document.getElementById('propertyInfo').innerText = propertyExplanations[selectedProp] || "No description available for this property.";
  }

  barSelect.addEventListener('change', updateBarChart);
  barAnalysis.addEventListener('change', updateBarChart);
  barTechFilter.addEventListener('change', updateBarChart);
  updateBarChart();
}

/* 5. Correlation Heatmap with Technology Filter and Analytical Report */
function createCorrelationHeatmap() {
  const corrTechFilter = document.getElementById('corrTechFilter').value;
  let filteredMaterials = (corrTechFilter === "All") ? materials : materials.filter(m => m.Technology === corrTechFilter);
  
  let numericProps = [];
  for (let key in filteredMaterials[0]) {
    if (typeof filteredMaterials[0][key] === 'number') {
      numericProps.push(key);
    }
  }
  const matrix = [];
  numericProps.forEach((propA, i) => {
    let row = [];
    numericProps.forEach((propB, j) => {
      // Skip self correlations in the report.
      if (i === j) {
        row.push(null);
      } else {
        row.push(computeCorrelation(propA, propB));
      }
    });
    matrix.push(row);
  });

  const colorscale = [
    [0, '#ff00cc'],
    [0.25, '#ff66cc'],
    [0.5, '#444444'],
    [0.75, '#66ffcc'],
    [1, '#00ff99']
  ];
  
  const data = [{
    z: matrix,
    x: numericProps.map(p => (headerMapping[p] || p) + (unitsData[p] ? ` (${unitsData[p]})` : '')),
    y: numericProps.map(p => (headerMapping[p] || p) + (unitsData[p] ? ` (${unitsData[p]})` : '')),
    type: 'heatmap',
    colorscale: colorscale,
    reversescale: false,
    colorbar: { title: 'Correlation' },
    hoverinfo: "z"
  }];
  const layout = {
    title: 'Correlation Heatmap',
    margin: { t: 60, b: 150, l: 150, r: 60 },
    paper_bgcolor: "#222",
    plot_bgcolor: "#333",
    font: { family: "Courier New, Courier, monospace", color: "#00ff99" }
  };
  Plotly.newPlot('correlationPlot', data, layout, {responsive: true});
  
  // Analytical Report.
  let flat = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] !== null) flat.push(matrix[i][j]);
    }
  }
  let meanCorr = flat.reduce((a, b) => a + b, 0) / flat.length;
  let medCorr = median(flat);
  let sdCorr = Math.sqrt(flat.reduce((sum, v) => sum + Math.pow(v - meanCorr, 2), 0) / flat.length);
  
  // Find strongest positive and negative correlations (ignoring self).
  let maxPos = { value: -Infinity, pair: [] };
  let maxNeg = { value: Infinity, pair: [] };
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] !== null) {
        let corr = matrix[i][j];
        if (corr > maxPos.value) {
          maxPos.value = corr;
          maxPos.pair = [numericProps[i], numericProps[j]];
        }
        if (corr < maxNeg.value) {
          maxNeg.value = corr;
          maxNeg.pair = [numericProps[i], numericProps[j]];
        }
      }
    }
  }
  
  const report = `
    <strong>Correlation Analysis Report:</strong><br>
    Average Correlation: ${meanCorr.toFixed(2)}<br>
    Median Correlation: ${medCorr.toFixed(2)}<br>
    Standard Deviation: ${sdCorr.toFixed(2)}<br>
    Strongest Positive: ${headerMapping[maxPos.pair[0]] || maxPos.pair[0]} and ${headerMapping[maxPos.pair[1]] || maxPos.pair[1]} (${maxPos.value.toFixed(2)})<br>
    Strongest Negative: ${headerMapping[maxNeg.pair[0]] || maxNeg.pair[0]} and ${headerMapping[maxNeg.pair[1]] || maxNeg.pair[1]} (${maxNeg.value.toFixed(2)})
  `;
  document.getElementById('corrReport').innerHTML = report;
}

function computeCorrelation(propA, propB) {
  const valuesA = materials.map(m => m[propA]);
  const valuesB = materials.map(m => m[propB]);
  const n = valuesA.length;
  const meanA = valuesA.reduce((a, b) => a + b, 0) / n;
  const meanB = valuesB.reduce((a, b) => a + b, 0) / n;
  let numerator = 0, denomA = 0, denomB = 0;
  for (let i = 0; i < n; i++) {
    const diffA = valuesA[i] - meanA;
    const diffB = valuesB[i] - meanB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }
  return numerator / Math.sqrt(denomA * denomB);
}

function median(arr) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function variance(arr) {
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
}

/* Update all charts on window resize or section change */
function updateAllCharts() {
  if (document.getElementById('scatterPlotStandard').offsetParent !== null) {
    createScatterPlot();
  }
  if (document.getElementById('parallelPlot').offsetParent !== null) {
    createParallelCoordinatesPlot();
  }
  if (document.getElementById('radarPlotStandard').offsetParent !== null) {
    updateRadar();
  }
  if (document.getElementById('barPlot').offsetParent !== null) {
    createTopPropertiesBarChart();
  }
  if (document.getElementById('correlationPlot').offsetParent !== null) {
    createCorrelationHeatmap();
  }
}
