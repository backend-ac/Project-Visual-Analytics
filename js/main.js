d3.csv("./data/AIU-All-Women-Dataset-csv.csv", d => {
	// console.log(d);

	return {
		geo: d.region.replace(/\s/g, ''),
		category: d.region,
		value: +d.allpreg_abortion,
		safe_abortions: +d.safe_abortions,
		lesssafe_abortions: +d.lesssafe_abortions,
		leastsafe_abortions: +d.leastsafe_abortions,
	}
}).then(rawData => { // Log the data to the console to check if it is correctly populated
	// Group the data by region and sum the values of allpreg_abortion
	const groupData = d3.rollup(rawData,
		v => d3.sum(v, d => d.value),
		d => d.category
	);
	const width = 1300;
	const height = 500;
	const radius = Math.min(width, height) / 2;

	console.log(rawData);
	console.log(groupData); // Log the groupData to the console to check if it is correctly calculated

	var barData = {};

	for( item in rawData ){
		console.log('item');
		console.log(rawData[item]);
		console.log(rawData[item].geo);
		// barData[rawData[item].geo].leastsafe_abortions += rawData[item].leastsafe_abortions;
		// barData[rawData[item].geo].lesssafe_abortions += rawData[item].lesssafe_abortions;
		// barData[rawData[item].geo].safe_abortions += rawData[item].safe_abortions;
		// barData[rawData[item].geo].value += rawData[item].value;;

		let key = rawData[item].geo;

		barData[key] = {
			leastsafe_abortions: barData[key].leastsafe_abortions ? barData[key].leastsafe_abortions : 0  += rawData[item].leastsafe_abortions,
			lesssafe_abortions: barData[key].lesssafe_abortions ? barData[key].lesssafe_abortions : 0  += rawData[item].lesssafe_abortions,
			safe_abortions: barData[key].safe_abortions ? barData[key].safe_abortions : 0  += rawData[item].safe_abortions,
			value: barData[key].value ? barData[key].value : 0  += rawData[item].value,
		};

	}

	console.log('barData');
	console.log(barData);


	// Create a pie layout
	const pie = d3.pie()
		.sort(null)
		.value(d => d[1])
		.padAngle(0.03);

	// Set the radius scale
	const r = d3.scaleLinear()
		.range([0, radius])
		.domain([0, d3.max(groupData, d => d[1])]);

	// Set the arc generator function
	const arc = d3.arc()
		.innerRadius(0)
		.outerRadius(150);

	var outerArc = d3.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9)

	// Set the color scale
	const color = d3.scaleOrdinal()
		.domain(groupData.keys())
		.range(['#F1892D', '#0EAC51', '#0077C0', '#7E349D', '#DA3C78', '#E74C3C'])

	// Append the SVG element
	const svg = d3.select('#pie')
		.append('svg')
		// .attr('width', width)
		// .attr('height', height)
		.attr("viewBox", [0, 0, width, height])
		.append('g')
		.attr('transform', `translate(${width / 2}, ${height / 2})`);

	// Add the pie chart
	const paths = svg.selectAll('.arc')
		.data(pie(groupData))
		.enter()
		.append('path')
		.attr('class', d => d.data[0].replace(/\s/g, ''))
		.attr('d', arc)
		.attr('fill', (d, i) => color(i))
		.style('opacity', 0.8);

	// Add the mouseover event listener
	paths.on("mouseover", function(d) {
		d3.select(this).style("fill", "orange");
	});

	// Add the mouseout event listener
	paths.on("mouseout", function(d) {
		d3.select(this).style("fill", d.groupData);
	});

	const labels = svg.selectAll('.label')
		.data(pie(groupData))
		.enter()
		.append('text')
		.attr('class', 'label')
		.attr('transform', d => `translate(${arc.centroid(d)})`)
		.attr('dy', -20)  // move the labels downward
		.text(d => d.data[0])
		.style('text-anchor', 'middle')
		.style('font-size', '14px');

	// const barChart = d3.select('#bar')
	// 	.append("svg")
 //    	.attr("viewBox", [0, 0, width, height]);

	// const xScale = d3.scaleBand()
	// 	.domain(rawData.map(d => d.region))
	// 	.range([margins.left, width - margins.right])
	// 	.padding(0.2);

	// const yScale = d3.scaleLinear()
	// 	.domain([0, d3.max(rawData, d => d.value)])
	// 	.range([height - margins.bottom, margins.top]);

});