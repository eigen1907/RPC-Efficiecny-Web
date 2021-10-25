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

  //d3.select('#input_subdir').selectAll('option').remove();
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

  //d3.select('#canvas_barrel').selectAll('polygon')
  //  .style('fill', 'white')
  //d3.select('#canvas_barrelZPhi').selectAll('polygon')
  //  .style('fill', 'white')
  //d3.select('#canvas_endcapPlus').selectAll('polygon')
  //  .style('fill', 'white')
  //d3.select('#canvas_endcapMinus').selectAll('polygon')
  //  .style('fill', 'white')

  
  d3.tsv('data/tsv/'+pfx+'/SummaryAnalyzeEfficiency_'+runNumber+'_Express2021.tsv')
  .then(function(effData) {
    d3.select("#canvas_histFCE")
      .text("Histogram")
      .append("svg").attr("width", "1200px").attr("height", "30px")
      .attr("id", "histogram");

    var FCEHistChart = new dc.BarChart("#canvas_histFCE");
    var effDataCF = crossfilter(effData),
    FCEDim = effDataCF.dimension(function(d) {return Math.floor(d.Fiducial_Cut_Efficiency/5);}),
    FCEHist = FCEDim.group().reduceCount();
    
    FCEHistChart
    .dimension(FCEDim)
    .group(FCEHist)
    .x(d3.scaleLinear().domain([0,20]))
    .elasticY(true)
    .controlsUseVisibility(true);
    
    FCEHistChart.xAxis().tickFormat(function(d) {return d*5}); // convert back to base unit
    FCEHistChart.yAxis().ticks(20);
    dc.renderAll();

    d3.select('#input_var').attr('value', "Fiducial Cut Efficiency")
    d3.select('#canvas_barrel').selectAll('polygon')
    .style('fill', x => eff2color(x, effData));
    d3.select('#canvas_barrelZPhi').selectAll('polygon')
    .style('fill', x => eff2color(x, effData));
    d3.select('#canvas_endcapPlus').selectAll('polygon')
    .style('fill', x => eff2color(x, effData));
    d3.select('#canvas_endcapMinus').selectAll('polygon')
    .style('fill', x => eff2color(x, effData));
  });
  
  d3.select("#canvas_legend")
    .text("Legend")
    .append("svg").attr("width", "1200px").attr("height", "30px")
    .attr("id", "legend");
  
  var colorList = ["#2B0", "#6C0", "#8B0", "#DC0", "#D80", "#800", "white"];
  var labelList = ["100", "95 ~ 99", "90 ~ 94", "89 ~ 80", "60 ~ 79", "0 ~ 60", "Null"];
  var svg = d3.select("#legend");
  for (i=0; i<colorList.length; i++) {
    svg.append("rect").attr("width", "40px").attr("height", "16px")
       .attr("x", String(70*i + 360) + "px").attr("y", "10px").style("fill", colorList[i]).style("stroke", "#777");
    svg.append("text").attr("x", String(70*i + 380)+"px").attr("y", "18px").text(labelList[i])
       .style("font-size", "10px").attr("alignment-baseline", "middle").attr("text-anchor", "middle");
  };
  
}

