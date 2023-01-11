/* Set the time format
  Ref: https://github.com/d3/d3-time-format */
  const parseTime = d3.timeParse("%Y");
  console.log(parseTime("2020"));
  
  d3.csv("../data/AIU-All-Women-Dataset-csv.csv", d => {
    return {
      'country': d.country,
      'region': d.region,
      'allpreg': d.allpreg,
      'allpreg_abortion': d.allpreg_abortion,
      'safe_abortions': d.safe_abortions,
      'lesssafe_abortions': d.lesssafe_abortions,
      'leastsafe_abortions': d.leastsafe_abortions,
    }
  }).then(data => {
    // Print out the data on the console
    console.log(data);
  
    // [NEW] Move the color scale here to share with both charts
    const region = data.map(d => d.region);
  
    const color = d3.scaleOrdinal()
      .domain(region)
      .range(d3.schemeTableau10);
      
    
    // Plot the bar chart

    createBarChart(data, color);   // [NEW] Parse the color to the chart function

  })
  
  const createBarChart = (data, color) => {

    /* Set the dimensions and margins of the graph
      Ref: https://observablehq.com/@d3/margin-convention */
    const width = 900, height = 500;
    const margins = {top: 50, right: 40, bottom: 150, left: 40};
  
    /* Create the SVG container */
    const svg = d3.select("#bar")
      .append("svg")
        //.attr("width", width)
        //.attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
  
    /* Define x-axis, y-axis, and color scales
      Ref: https://observablehq.com/@d3/introduction-to-d3s-scales */
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.region))
      .range([margins.left, width-margins.right])
      .paddingInner(0.2);
  
    console.log(xScale("France"));
    console.log(xScale("Austria"));
    console.log(xScale.bandwidth());
    console.log(xScale.step());
  
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.allpreg_abortion)])
      .range([height-margins.bottom, margins.top])
  
    console.log("Here!")
    console.log(yScale(0));
    console.log(yScale(20));
  
    /* Working with Color: https://observablehq.com/@d3/working-with-color
      Color schemes: https://observablehq.com/@d3/color-schemes 
      d3-scale-chromatic: https://github.com/d3/d3-scale-chromatic */
    /*const countries = data.map(d => d.country);
  
    const color = d3.scaleOrdinal()
      .domain(countries)
      .range(d3.schemeTableau10);
  
    console.log(color("France"));*/
  
    /* Create the bar elements and append to the SVG group
      Ref: https://observablehq.com/@d3/bar-chart */
    
     
      
    const bar = svg.append("g")
      .attr("class", "bars")
      .selectAll("rect")
      .data(data)
      .join("rect")
        .attr("x", d => xScale(d.region))
        .attr("y", d => yScale(d.allpreg_abortion))
        .attr("width", xScale.bandwidth())
        .attr("height", d => yScale(0) - yScale(d.allpreg_abortion))
        .attr("fill", d => color(d.region));
  
    /* Add the tooltip when hover on the bar */
    bar.append("title").text(d => d.region);
    
    /* Create the x and y axes and append them to the chart
      Ref: https://www.d3indepth.com/axes/ and https://github.com/d3/d3-axis */
    const xAxis = d3.axisBottom(xScale);
  
    const xGroup = svg.append("g")
        .attr("transform", `translate(0, ${height-margins.bottom})`)
      .call(xAxis);
  
    xGroup.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
  
    const yAxis = d3.axisLeft(yScale);
  
    svg.append("g")
        .attr("transform", `translate(${margins.left}, 0)`)
      .call(yAxis);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height/2.5))
      .attr("y", 10)
      .style("text-anchor", "middle")
      .text("Number of abortions");

    svg.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height-50) + ")")
      .style("text-anchor", "middle")
      .text("Regions");
  
  }


  



  