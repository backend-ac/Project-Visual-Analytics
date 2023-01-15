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


	const pctColor = d3.scaleOrdinal()
		.domain(['#F1894D', '#1EAC51', '#2077C0'])
		.range(['#F1894D', '#1EAC51', '#2077C0'])

	const groupBarChart = d3.select('#groupBar')
		.append("svg")
    	.attr("viewBox", [0, 0, width, height]);

	const gxScale = d3.scaleBand()
		.domain(pctData.map(d => d.region))
		.range([margins.left, width - margins.right])
		.padding(0.1);

	const gxzScale = d3.scaleBand()
		.domain(pctData.map(d => d.column))
		.range([80, 200])
		.padding(0.1);

	const gyScale = d3.scaleLinear()
		.domain([0, d3.max(pctData, d => d.value)])
		.range([height - margins.bottom, margins.top]);

	let gbar = groupBarChart.append("g")
		.selectAll("rect")
		.data(pctData)
		.join("rect")
			.attr('class', d => d.region)
			.attr("x", d => gxScale(d.region) + gxzScale(d.column))
			.attr("y", d => gyScale(d.value))
			.attr("height", d => gyScale(0) - gyScale(d.value))
			.attr("width", 30)
			.attr('fill', (d, i) => pctColor(i));
			// .attr("fill", d => colors(d.label));

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
		.attr("dx", "10")
		.attr("dy", "10");
});




/*------------ Map ----------*/

let mapCountries = {};
let countrymesh = {};
let hale = {};
let world = {};

let cointriesLoaded = false;
let countrymeshLoaded = false;
let haleLoaded = false;
let worldLoaded = false;

d3.json("./data/countries.json", d => {
	console.log(d);
}).then(data => {
	// console.log('data countries');
	// console.log(data);
	mapCountries = data;
	cointriesLoaded = true;
});

d3.json("./data/countrymesh.json", d => {
	console.log(d);
}).then(data => {
	// console.log(data);
	countrymesh = data;
	countrymeshLoaded = true;
});

d3.json("./data/hale.json", d => {
	console.log(d);
}).then(data => {
	// console.log(data);
	hale = data;
	haleLoaded = true;
});

d3.json("./data/world.json", d => {
	console.log(d);
}).then(data => {
	// console.log(data);
	world = data;
	worldLoaded = true;
});


getAllData();

function getAllData(){
	setTimeout(function(){
		console.log('-----------------');
		console.log('timeout');
		// console.log('-----------------');

		if( cointriesLoaded && countrymeshLoaded && haleLoaded &&worldLoaded ){
			console.log('ALL DATA LOADED');

			// console.log('mapCountries');
			// console.log(mapCountries);

			// console.log('countrymesh');
			// console.log(countrymesh);

			// console.log('hale');
			// console.log(hale);

			// console.log('world');
			// console.log(world);

			rename = new Map([
				["Antigua and Barbuda", "Antigua and Barb."],
				["Bolivia (Plurinational State of)", "Bolivia"],
				["Bosnia and Herzegovina", "Bosnia and Herz."],
				["Brunei Darussalam", "Brunei"],
				["Central African Republic", "Central African Rep."],
				["Cook Islands", "Cook Is."],
				["Democratic People's Republic of Korea", "North Korea"],
				["Democratic Republic of the Congo", "Dem. Rep. Congo"],
				["Dominican Republic", "Dominican Rep."],
				["Equatorial Guinea", "Eq. Guinea"],
				["Iran (Islamic Republic of)", "Iran"],
				["Lao People's Democratic Republic", "Laos"],
				["Marshall Islands", "Marshall Is."],
				["Micronesia (Federated States of)", "Micronesia"],
				["Republic of Korea", "South Korea"],
				["Republic of Moldova", "Moldova"],
				["Russian Federation", "Russia"],
				["Saint Kitts and Nevis", "St. Kitts and Nevis"],
				["Saint Vincent and the Grenadines", "St. Vin. and Gren."],
				["Sao Tome and Principe", "São Tomé and Principe"],
				["Solomon Islands", "Solomon Is."],
				["South Sudan", "S. Sudan"],
				["Swaziland", "eSwatini"],
				["Syrian Arab Republic", "Syria"],
				["The former Yugoslav Republic of Macedonia", "Macedonia"],
				["United Republic of Tanzania", "Tanzania"],
				["Venezuela (Bolivarian Republic of)", "Venezuela"],
				["Viet Nam", "Vietnam"]
			])


			chart = Choropleth(hale, {
			  id: d => d.name, // country name, e.g. Zimbabwe
			  value: d => d.hale, // health-adjusted life expectancy
			  range: d3.interpolateYlGnBu,
			  features: mapCountries,
			  featureId: d => d.properties.name, // i.e., not ISO 3166-1 numeric
			  borders: countrymesh,
			  projection: d3.geoEqualEarth(),
			  // width
			})

			function Choropleth(data, {
			  id = d => d.id, // given d in data, returns the feature id
			  value = () => undefined, // given d in data, returns the quantitative value
			  title, // given a feature f and possibly a datum d, returns the hover text
			  format, // optional format specifier for the title
			  scale = d3.scaleSequential, // type of color scale
			  domain, // [min, max] values; input of color scale
			  range = d3.interpolateBlues, // output of color scale
			  width = 640, // outer width, in pixels
			  height, // outer height, in pixels
			  projection, // a D3 projection; null for pre-projected geometry
			  features, // a GeoJSON feature collection
			  featureId = d => d.id, // given a feature, returns its id
			  borders, // a GeoJSON object for stroking borders
			  outline = projection && projection.rotate ? {type: "Sphere"} : null, // a GeoJSON object for the background
			  unknown = "#ccc", // fill color for missing data
			  fill = "white", // fill color for outline
			  stroke = "white", // stroke color for borders
			  strokeLinecap = "round", // stroke line cap for borders
			  strokeLinejoin = "round", // stroke line join for borders
			  strokeWidth, // stroke width for borders
			  strokeOpacity, // stroke opacity for borders
			} = {}) {
			  // Compute values.
			  const N = d3.map(data, id);
			  const V = d3.map(data, value).map(d => d == null ? NaN : +d);
			  const Im = new d3.InternMap(N.map((id, i) => [id, i]));
			  const If = d3.map(features.features, featureId);

			  // Compute default domains.
			  if (domain === undefined) domain = d3.extent(V);

			  // Construct scales.
			  const color = scale(domain, range);
			  if (color.unknown && unknown !== undefined) color.unknown(unknown);

			  // Compute titles.
			  if (title === undefined) {
			    format = color.tickFormat(100, format);
			    title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
			  } else if (title !== null) {
			    const T = title;
			    const O = d3.map(data, d => d);
			    title = (f, i) => T(f, O[i]);
			  }

			  // Compute the default height. If an outline object is specified, scale the projection to fit
			  // the width, and then compute the corresponding height.
			  if (height === undefined) {
			    if (outline === undefined) {
			      height = 400;
			    } else {
			      const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
			      const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
			      projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
			      height = dy;
			    }
			  }

			  // Construct a path generator.
			  const path = d3.geoPath(projection);

			  const svg = d3.create("svg")
			      .attr("width", width)
			      .attr("height", height)
			      .attr("viewBox", [0, 0, width, height])
			      .attr("style", "width: 100%; height: auto; height: intrinsic;");

			  if (outline != null) svg.append("path")
			      .attr("fill", fill)
			      .attr("stroke", "currentColor")
			      .attr("d", path(outline));

			  svg.append("g")
			    .selectAll("path")
			    .data(features.features)
			    .join("path")
			      .attr("fill", (d, i) => color(V[Im.get(If[i])]))
			      .attr("d", path)
			    .append("title")
			      .text((d, i) => title(d, Im.get(If[i])));

			  if (borders != null) svg.append("path")
			      .attr("pointer-events", "none")
			      .attr("fill", "none")
			      .attr("stroke", stroke)
			      .attr("stroke-linecap", strokeLinecap)
			      .attr("stroke-linejoin", strokeLinejoin)
			      .attr("stroke-width", strokeWidth)
			      .attr("stroke-opacity", strokeOpacity)
			      .attr("d", path(borders));

			  return Object.assign(svg.node(), {scales: {color}});
			}

		} else{
			getAllData();
		}

	}, 1000);
}

