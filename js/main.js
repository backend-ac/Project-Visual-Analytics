d3.csv("./data/AIU-All-Women-Dataset-csv.csv", d => {
	// console.log(d);

	return {
		geo: d.region.replace(/\s/g, ''),
		category: d.region,
		value: +d.allpreg_abortion,
		safe_abortions: +d.safe_abortions,
		lesssafe_abortions: +d.lesssafe_abortions,
		leastsafe_abortions: +d.leastsafe_abortions,

		pct_matdeaths_abortions: +d.pct_matdeaths_abortions,
		pct_matdeaths_safeabs: +d.pct_matdeaths_safeabs,
		pct_matdeaths_unsafeabs: +d.pct_matdeaths_unsafeabs,
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
	const margins = {top: 10, right: 30, bottom: 80, left: 20};

	console.log(rawData);
	console.log(groupData); // Log the groupData to the console to check if it is correctly calculated

	var barData = {};
	for( item in rawData ){
		if( item != 'columns' ){
			let key = rawData[item].geo;
			if( barData.hasOwnProperty(key) ){
				barData[key] = {
					geo: key,
					country: rawData[item].category,
					leastsafe_abortions: barData[key].leastsafe_abortions += rawData[item].leastsafe_abortions,
					lesssafe_abortions: barData[key].lesssafe_abortions += rawData[item].lesssafe_abortions,
					safe_abortions: barData[key].safe_abortions += rawData[item].safe_abortions,
					value: barData[key].value += rawData[item].value,

					pct_matdeaths_abortions: barData[key].pct_matdeaths_abortions += rawData[item].pct_matdeaths_abortions,
					pct_matdeaths_safeabs: barData[key].pct_matdeaths_safeabs += rawData[item].pct_matdeaths_safeabs,
					pct_matdeaths_unsafeabs: barData[key].pct_matdeaths_unsafeabs += rawData[item].pct_matdeaths_unsafeabs,
				};
			} else{
				barData[key] = {
					geo: key,
					country: rawData[item].category,
					leastsafe_abortions: rawData[item].leastsafe_abortions,
					lesssafe_abortions: rawData[item].lesssafe_abortions,
					safe_abortions: rawData[item].safe_abortions,
					value: rawData[item].value,

					pct_matdeaths_abortions: rawData[item].pct_matdeaths_abortions,
					pct_matdeaths_safeabs: rawData[item].pct_matdeaths_safeabs,
					pct_matdeaths_unsafeabs: rawData[item].pct_matdeaths_unsafeabs,
				};
			}
		}
	}

	console.log('barData keys');
	console.log(barData);

	let mainData = barData;

	barData = Object.values(barData);

	console.log('barData');
	console.log(barData);

	let w_cols = ['leastsafe_abortions', 'lesssafe_abortions', 'safe_abortions'];
	let w_cols_labels = ['Leastsafe Abortions', 'Lesssafe Abortions', 'Safe Abortions'];

	let worldData = [];
	

	for( key in w_cols ){
		let total_value = 0;
		for( item in barData ){
			total_value += barData[item][w_cols[key]];
		}
		worldData[key] = {
			label: w_cols_labels[key],
			value: total_value,
			col: w_cols[key]
		}
	}

	console.log('worldData')
	console.log(worldData)



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
		.attr('data-item', d => d.data[0].replace(/\s/g, ''))
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



	paths.on("click", function(d) {
		let cur_item = d3.select(this).attr("data-item");

		d3.selectAll('#pie .active')
			.classed('active', false)
			.style('stroke-width', 0);

		d3.select(this).style("stroke", "#333")
    		.style("stroke-width", 2);
    	d3.select(this).classed('active', true);

    	console.log(mainData);
    	console.log(mainData[cur_item]);

    	console.log('worldData before')
    	console.log(worldData)

    	for( item in worldData ){
    		if( worldData[item].col == 'leastsafe_abortions' ){
    			worldData[item].value = mainData[cur_item].leastsafe_abortions;
    			console.log('update leastsafe_abortions')
    		}
    		if( worldData[item].col == 'lesssafe_abortions' ){
    			worldData[item].value = mainData[cur_item].lesssafe_abortions;
    			console.log('update lesssafe_abortions')
    		}
    		if( worldData[item].col == 'safe_abortions' ){
    			worldData[item].value = mainData[cur_item].safe_abortions;
    			console.log('update safe_abortions')
    		}
    	}

    	console.log('worldData after')
    	console.log(worldData)

    	const xScale = d3.scaleBand()
	    	.domain(worldData.map(d => d.label))
	    	.range([margins.left, width - margins.right])
	    	.padding(0.2);

    	const yScale = d3.scaleLinear()
	    	.domain([0, d3.max(worldData, d => d.value)])
	    	.range([height - margins.bottom, margins.top]);

    	const t = d3.transition().duration(1000);

    	bar = bar
	    	.data(worldData, d => d.geo)
	    	.join(
	    		enter => enter.append('rect')
	    		.attr("class", 'bar_item')
				.attr("x", d => xScale(d.label))
				.attr("y", d => yScale(d.value))
				.attr("height", 0)
				.attr("width", xScale.bandwidth())
				.attr("fill", d => colors(d.label))
	    		// .on("mouseover", mouseover)
	    		// .on("mouseout", mouseout)
	    		.call(enter => enter.transition(t)
	    		.attr("height", d => yScale(0) - yScale(d.value))),
	    		update => update.transition(t)
	    		.attr("x", d => xScale(d.label))
				.attr("y", d => yScale(d.value))
	    		.attr("height", d => yScale(0) - yScale(d.value))
	    		.attr("width", xScale.bandwidth()),
	    		exit => exit.transition(t)
	    		.attr("y", yScale(0))
	    		.attr("height", 0)
	    		.remove()
	    	);

    	const xAxis = d3.axisBottom(xScale)
    	const yAxis = d3.axisLeft(yScale)

    	xGroup.transition(t)
	    	.call(xAxis)
	    	.call(g => g.selectAll(".tick"));

    	yGroup.transition(t)
	    	.call(yAxis)
	    	.selection()
	    	.call(g => g.select(".domain").remove());
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





	const countries = Array.from(new Set(worldData.map(d => d.label))).sort();
	const colors = d3.scaleOrdinal()
		.domain(countries)
		.range(d3.quantize(d3.interpolateRainbow, countries.length+1));

	const barChart = d3.select('#bar')
		.append("svg")
    	.attr("viewBox", [0, 0, width, height]);

	const xScale = d3.scaleBand()
		.domain(worldData.map(d => d.label))
		.range([margins.left, width - margins.right])
		.padding(0.2);

	const yScale = d3.scaleLinear()
		.domain([0, d3.max(worldData, d => d.value)])
		.range([height - margins.bottom, margins.top]);

	let bar = barChart.append("g")
		.selectAll("rect")
		// TODO: Add geo as id to refer to the data point
		.data(worldData, d => d.geo)
		.join("rect")
		// TODO: Add geo as the class
		// .attr("class", d => d.geo)
		.attr("class", 'bar_item')
		.attr("x", d => xScale(d.label))
		.attr("y", d => yScale(d.value))
		.attr("height", d => yScale(0) - yScale(d.value))
		.attr("width", xScale.bandwidth())
		.attr("fill", d => colors(d.label));

	// Add the tooltip when hover on the bar
	bar.append('title').text(d => d.label);

	// Create the x and y axes and append them to the chart
	const yAxis = d3.axisLeft(yScale);

	const yGroup = barChart.append("g")
		.attr("transform", `translate(45,0)`)
		.call(yAxis)
		.call(g => g.select(".domain").remove());

	const xAxis = d3.axisBottom(xScale);

	const xGroup = barChart.append("g")
		.attr("transform", `translate(${margins.left},${height - margins.bottom})`)
		.call(xAxis);

	xGroup.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "30")
		.attr("dy", "10");
		// .attr("transform", "rotate(-65)");



	/*-------------- Group Bar Chart ---------------*/

	let pct_cols = ['pct_matdeaths_abortions', 'pct_matdeaths_safeabs', 'pct_matdeaths_unsafeabs'];
	let pctData = [];

	for( item in barData ){
		for( key in pct_cols ){
			let pctItem = {
				region: barData[item].geo,
				column: pct_cols[key],
				value: barData[item][pct_cols[key]],
			};

			pctData.push(pctItem);
		}
	}

	console.log('pctData')
	console.log(pctData)



	const groupBarChart = d3.select('#groupBar')
		.append("svg")
    	.attr("viewBox", [0, 0, width, height]);

	const gxScale = d3.scaleBand()
		.domain(pctData.map(d => d.region))
		.range([margins.left, width - margins.right])
		.padding(0.2);

	const gxzScale = d3.scaleBand()
		.domain(pctData.map(d => d.column))
		.range([margins.left, width - margins.right])
		.padding(0.2);

	const gyScale = d3.scaleLinear()
		.domain([0, d3.max(pctData, d => d.value)])
		.range([height - margins.bottom, margins.top]);

	let gbar = groupBarChart.append("g")
		.selectAll("rect")
		.data(pctData)
		.join("rect")
			.attr('class', d.data.region)
			.attr("x", d => gxScale(d.region) + gxzScale(d.column))
			.attr("y", d => gyScale(d.value))
			.attr("height", d => gyScale(0) - gyScale(d.value))
			.attr("width", gxScale.bandwidth())
			.attr("fill", d => colors(d.label));

	gbar.append('title').text(d => d.label);

	const gyAxis = d3.axisLeft(gyScale);

	const gyGroup = groupBarChart.append("g")
		.attr("transform", `translate(45,0)`)
		.call(gyAxis)
		.call(g => g.select(".domain").remove());

	const gxAxis = d3.axisBottom(gxScale);

	const gxGroup = groupBarChart.append("g")
		.attr("transform", `translate(${margins.left},${height - margins.bottom})`)
		.call(gxAxis);

	gxGroup.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "30")
		.attr("dy", "10");

});