var modal = document.getElementById("errorModal");
var closeBtn = document.getElementById("closeErrorModal");
var fileUploadDialog = document.getElementById("drag-n-drop-file-input");
var fileSelected = false;

window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
    }
    // file dialog event on clicking anywhere on screen
    if(!fileSelected){
        fileUploadDialog.click();
    }
}

closeBtn.onclick = () => {
	modal.style.display = "none";
}

// handle files using file dialog function
fileUploadDialog.addEventListener("change", handleFiles, false);
function handleFiles() {
    const f = this.files[0]; /* now you can work with the file list */
    document.getElementById("drag-n-drop-section").style.display = "none";
    loadVisualization(f.path);
    fileSelected = true;
  }

document.addEventListener('drop', (event) => {
	event.preventDefault();
	event.stopPropagation();

	for (const f of event.dataTransfer.files) {
		// Using the path attribute to get absolute file path 
		console.log(f);
		if (f.type == "text/csv") {
			document.getElementById("drag-n-drop-section").style.display = "none";
            loadVisualization(f.path);
            fileSelected = true;
		} else {
            // if not csv file display modal
			document.getElementById("modal-header-text").innerHTML = "Invalid file type";
			document.getElementById("modal-body-text").innerHTML = "<p>Please select a .csv file</p>";
            modal.style.display = "block";
            fileSelected = false;
		}
	}
});

document.addEventListener('dragover', (e) => {
	e.preventDefault();
	e.stopPropagation();
});

document.addEventListener('dragenter', (event) => {
	// console.log('File is in the Drop Space');
});

document.addEventListener('dragleave', (event) => {
	// console.log('File has left the Drop Space');
});

function loadVisualization(filePath) {
	var margin = {
		top: 140,
		right: 80,
		bottom: 100,
		left: 80
	};
	var width = window.innerWidth - margin.left - margin.right; // Use the window's width 
	var height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

    var axisText = {
        x: "x-axis",
        y: "y-axis"
    }

	d3.csv(filePath, function (data) {
		data.forEach(function (d) {
			d.iteration = +d.iteration;
			d.value = +d.value;
		});
		var dataset = data;

		// 5. X scale will be iteration count
		var xScale = d3.scaleLinear()
			.domain(d3.extent(dataset, d => d.iteration)) // input
			.range([0, width]); // output

		// 6. Y scale will be value
		var yScale = d3.scaleLinear()
			.domain(d3.extent(dataset, d => d.value)) // input 
			.range([height, 0]); // output 

		// 7. d3's line generator
		var line = d3.line()
			.x(function (d, i) {
				return xScale(d.iteration);
			}) // set the x values for the line generator
			.y(function (d) {
				return yScale(d.value);
			}) // set the y values for the line generator 
			.curve(d3.curveMonotoneX) // apply smoothing to the line

		// 1. Add the SVG to the page and employ #2
		var svg = d3.select("#visualizationWindow").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// 3. Call the x axis in a group tag
		svg.append("g")
			.style("font", "14px times")
			.attr("class", "x axis")
			.attr("transform", "translate(1," + height + ")")
			.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

		svg.append("text")
			.attr("transform", "translate(" + (width / 2) + " ," + (height+margin.top/3) + ")")
			.style("text-anchor", "middle")
			.attr("font-size", "16px")
			.text(axisText.x);

		// 4. Call the y axis in a group tag
		svg.append("g")
			.style("font", "14px times")
			.attr("class", "y axis")
			.attr("transform", "translate(1,0)")
			.attr("font-size", "30px")
			.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

		svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left*3/4)
			.attr("x", 0 - ((height) / 2))
			.attr("dy", "1em")
			.attr("font-size", "16px")
			.style("text-anchor", "middle")
			.text(axisText.y);

		// 9. Append the path, bind the data, and call the line generator 
		svg.append("path")
			.attr("font-size", "30px")
			.datum(dataset) // 10. Binds data to the line 
			.attr("class", "line") // Assign a class for styling 
			.attr("d", line); // 11. Calls the line generator 
	});
}
