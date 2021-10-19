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
  d3.csv("data/common/runs.csv")
    .then(function(data) {
      console.log(data.runs)
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

  d3.select('#canvas_barrel').selectAll('polygon')
    .style('stroke', '#777')
  d3.select('#canvas_barrelZPhi').selectAll('polygon')
    .style('fill', 'white')
  d3.select('#canvas_endcapPlus').selectAll('polygon')
    .style('fill', 'white')
  d3.select('#canvas_endcapMinus').selectAll('polygon')
    .style('fill', 'white')

  d3.csv('data/csv/'+pfx+'/SummaryAnalyzeEfficiency_'+runNumber+'_Express2021.csv')
    .then(function(effData) {
      d3.select('#input_var').attr('value', effData.Fiducial_Cut_Efficiency)
      d3.select('#canvas_barrel').selectAll('polygon')
        .style('fill', x => eff2color(x, effData));
      d3.select('#canvas_barrelZPhi').selectAll('polygon')
        .style('fill', x => eff2color(x, effData));
      d3.select('#canvas_endcapPlus').selectAll('polygon')
        .style('fill', x => eff2color(x, effData));
      d3.select('#canvas_endcapMinus').selectAll('polygon')
        .style('fill', x => eff2color(x, effData));

      var FCEHistChart = new dc.BarChart("#chart-hist-FCE");
      var effDataCF = crossfilter(effData),
      FCEDim = effDataCF.dimension(function(d) {return Math.floor(d.Fiducial_Cut_Efficiency/10);}),
      //nameDim = effDataCF.dimension(function(d) {return d.Chamber_Name;}),
      FCEHist = FCEDim.group().reduceCount();
    
      FCEHistChart
        .dimension(FCEDim)
        .group(FCEHist)
        .x(d3.scaleLinear().domain([0,10]))
        .elasticY(true)
        .controlsUseVisibility(true);
  
      FCEHistChart.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
      FCEHistChart.yAxis().ticks(20);
      dc.renderAll();
    });

  
}

