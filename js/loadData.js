function eff2color(x, data) {
  i = Object.keys(data).find(key => data[key].Chamber_Name === x);
  if ( i < 0 ) console.log(i, x);
  if ( i < 0 ) return 'white';
  var v = data[i].Fiducial_Cut_Efficiency;
  if      ( v >= 100 ) return '#2B0';
  else if ( v >   95 ) return '#6C0';
  else if ( v >   90 ) return '#8B0';
  else if ( v >   80 ) return '#DC0';
  else if ( v >   60 ) return '#D80';
  else if ( v >    0 ) return '#800';
  return 'white';
}


function loadRunNumber() {
  var runNumber = '0';
  for ( var ss of new URL(document.URL).search.split('&') ) {
    if ( ss.startsWith('?') ) ss = ss.substr(1);
    if ( !ss.startsWith('run=') ) continue;
    runNumber = ss.substr(4);
  }

  d3.select('#input_runs').selectAll('option').remove();
  d3.tsv("data/common/runs.tsv")
    .then(function(data) {
      d3.select('#input_runs').selectAll('option')
        .data(data).enter().append('option')
        .attr('value', x => x.runs).text(x => x.runs);
      d3.select('#input_runs').selectAll('option')
        .filter(x => (x.runs === runNumber))
        .attr('selected', 'selected');
    });
}


function loadData() {
  var sel = document.getElementById('input_runs');
  var runNumber = sel.options[sel.selectedIndex].value;
  var pfx = '';
  if ( runNumber != '0' ) pfx = runNumber.substr(0,3);

  
  d3.tsv('data/tsv/'+pfx+'/SummaryAnalyzeEfficiency_'+runNumber+'_Express2021.tsv').then(function(effData) {
    // Legend Section
    d3.select("#canvas_legend")
      .text("Legend")
      .append("svg")
      .attr("width", "1200px")
      .attr("height", "30px")
      .attr("id", "legend");
    
    var colorList = ["#2B0", "#6C0", "#8B0", "#DC0", "#D80", "#800", "white"];
    var labelList = ["100", "95 ~ 99", "90 ~ 94", "89 ~ 80", "60 ~ 79", "0 ~ 60", "Null"];
    var legendSvg = d3.select("#legend");
    for (i=0; i<colorList.length; i++) {
      legendSvg.append("rect")
               .attr("width", "40px")
               .attr("height", "16px")
               .attr("x", String(70*i + 360) + "px")
               .attr("y", "10px").style("fill", colorList[i])
               .style("stroke", "#777");
      legendSvg.append("text")
               .attr("x", String(70*i + 380)+"px")
               .attr("y", "18px")
               .text(labelList[i])
               .style("font-size", "10px")
               .attr("alignment-baseline", "middle")
               .attr("text-anchor", "middle");
    };
    
    
    // Histogram Section
    d3.select("#canvas_histFCE")
      .text("Histogram")
      .append("svg")
      .attr("width", "1200px")
      .attr("height", "30px")
      .attr("id", "histogram");
  
    var margin = {top: 10, right: 30, bottom: 30, left: 40}
    var width = 460 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    const histSvg = d3.select("#canvas_histFCE")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
                .domain([0, d3.max(effData, function(d) { return +d.Fiducial_Cut_Efficiency})])
                .range([0, width]);
    
    histSvg.append("g")
           .attr("transform", `translate(0, ${height})`)
           .call(d3.axisBottom(x));

    const histogram = d3.histogram()
                        .value(function(d) { return d.Fiducial_Cut_Efficiency; })
                        .domain(x.domain())
                        .thresholds(x.ticks(50));
 
    const bins = histogram(effData);
    const y = d3.scaleLinear()
                .range([height, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);
    histSvg.append("g").call(d3.axisLeft(y));

    histSvg.selectAll("rect")
           .data(bins)
           .join("rect")
           .attr("x", 1)
           .attr("transform", function(d) { return `translate(${x(d.x0)}, ${y(d.length)})`})
           .attr("width", function(d) { return x(d.x1) - x(d.x0)})
           .attr("height", function(d) { return height - y(d.length); })
           .attr("stroke", "#777")
           .style("fill", function(d){
              if (d.x0 >= 100)   { return colorList[0] } 
              else if (d.x0 > 95) { return colorList[1] }
              else if (d.x0 > 90) { return colorList[2] }
              else if (d.x0 > 80) { return colorList[3] }
              else if (d.x0 > 60) { return colorList[4] }
              else if (d.x0 > 0)  { return colorList[5] }
              else { return "white" }
    })

    // Geometry Section
    d3.select('#input_var')
      .attr('value', "Fiducial Cut Efficiency")
    d3.select('#canvas_barrel').selectAll('polygon')
      .style('fill', x => eff2color(x, effData));
    d3.select('#canvas_barrelZPhi').selectAll('polygon')
      .style('fill', x => eff2color(x, effData));
    d3.select('#canvas_endcapPlus').selectAll('polygon')
      .style('fill', x => eff2color(x, effData));
    d3.select('#canvas_endcapMinus').selectAll('polygon')
      .style('fill', x => eff2color(x, effData));
  });
}

