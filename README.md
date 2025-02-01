# Material Expert

A retro-themed, blockbuster-quality interactive dashboard for exploring the mechanical properties of 3D printed materials. The dashboard presents five different visualizations including a Scatter Plot, Parallel Coordinates Plot, Radar Chart, Top Bar Chart, and Correlation Heatmap. Each chart is designed with interactive filtering, responsive resizing, and detailed analytical reports to help engineers and material scientists explore and analyze material data.

## Features

### Scatter Plot
- **Interactive X- and Y-Axis Selection:** Choose which numeric material properties to display.
- **Technology Filter:** Narrow down data by manufacturing technology.
- **Trendline Option:** Overlay a simple linear regression trendline.
- **Show Materials Toggle:** Option to display or hide material names on the plot.
- **Responsive Design:** Automatically adjusts to the browser window size.

### Parallel Coordinates Plot
- **Technology Filter:** Display only materials from the selected technology.
- **Percentage Slider:** Choose a percentage of the filtered materials to display.
- **Hover Information:** Toggle showing material names on hover to help identify individual lines.
- **Enhanced Styling:** Thicker lines and adjusted margins to ensure clarity.

### Radar Chart
- **Material Comparison:** Compare key properties (Tensile Strength, Young's Modulus, Elongation at Break, and Flexural Strength) normalized on a 0–1 scale.
- **Button Grid:** Toggle up to 5 materials via a grid of buttons (using Ctrl‑click for multi‑selection).
- **Category Filter:** Limit the displayed materials by Category.
- **Average Calculation:** Display an "Average (Category)" trace computed from all materials matching the current category filter.
- **Responsive and Themed:** Designed to fit a retro digital/analog display aesthetic.

### Top Bar Chart
- **Property Ranking:** Rank materials by a selected property.
- **Analysis Mode:** Choose from Raw, Normalized (0–1 scale), or Z‑Score modes.
- **Technology Filter:** Restrict rankings by Technology.
- **Property Explanation:** A dynamic info panel below the chart explains the selected property.

### Correlation Heatmap
- **Correlation Analysis:** Visualize Pearson correlation coefficients between numeric material properties.
- **Technology Filter:** Limit correlations to materials of a selected Technology.
- **Analytical Report:** An automatic report below the heatmap details summary statistics (mean, median, standard deviation) and highlights the strongest positive and negative correlations (excluding self‑correlations).
- **Clean Aesthetic:** No overlapping annotations—the analysis is provided separately for clarity.

### Global Info Area
- An Info Area in the sidebar displays usage instructions and details about the currently selected chart.

## Technologies & Dependencies

- **HTML/CSS/JavaScript:** The dashboard is built using standard web technologies.
- **[Plotly.js](https://plotly.com/javascript/):** Used for creating interactive charts.
- **[PapaParse](https://www.papaparse.com/):** Used for CSV parsing.
- **Responsive Design:** All visualizations are responsive and adjust to window resizing.

## Installation & Usage

1. **Clone or Download the Repository:**

   ```bash
   git clone https://github.com/greygizmo/materialexpert.git
