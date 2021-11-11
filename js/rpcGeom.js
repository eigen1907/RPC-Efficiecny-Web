function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}


function regularizeAngle(angle, sector) {
  var res = angle;
  if ( res < 0 && sector != 1 ) res += 2*Math.PI;
  return res;
}

// Use clickOn, clickOff Class
function onclickBarrel(barrelName) {
  d3.selectAll(".clickOn").attr('stroke-width', 0.6).attr('stroke', '#777').attr('class', 'clickOff')
  barrelName = barrelName.replaceAll("+", "p").replaceAll("-", "m")
  d3.select('#input_rollName').attr('value', barrelName)
  barrelId = '#roll_' + barrelName;
  barrelZphiId = '#rollZPhi_' + barrelName;
  d3.select(barrelId).attr('stroke-width', 2.5).attr('stroke', 'black').attr('class', 'clickOn');
  d3.select(barrelZphiId).attr('stroke-width', 2.5).attr('stroke', 'black').attr('class', 'clickOn');
}


function onclickEndcap(endcapName) {
  d3.selectAll(".clickOn").attr('stroke-width', 0.6).attr('stroke', '#777').attr('class', 'clickOff')
  endcapName = endcapName.replaceAll("+", "p").replaceAll("-", "m")
  d3.select('#input_rollName').attr('value', endcapName)
  endcapId = '#roll_' + endcapName;
  d3.select(endcapId).attr('stroke-width', 2.5).attr('stroke', 'black').attr('class', 'clickOn');
}


function initGeom(width, height) {
  // Clean up elements (if exists)
  d3.select('#canvas_barrel').selectAll('polygon').remove()
  d3.select('#canvas_barrelZPhi').selectAll('polygon').remove()
  d3.select('#canvas_endcapPlus').selectAll('polygon').remove()
  d3.select('#canvas_endcapMinus').selectAll('polygon').remove()

  // Start building empty canvases
  for ( var w of [-2, 0, 2, -1, 1] ) {
    var name = 'canvas_W';
    if ( w >= 0 ) name += w;
    else name += 'm'+Math.abs(w);

    d3.select('#canvas_barrel')
      .append('svg')
      .attr('id', name).attr('class', 'canvas')
      .append('circle')
      .attr('cx', width/2).attr('cy', height/2).attr('r',2)
      .attr('fill','#777');
    d3.select('#'+name)
      .append('text').text('W'+w)
      .attr('x', width/2).attr('y', height/2-7)
      .attr('font-family', 'sans-serif').attr('font-size', '9pt')
      .attr('text-anchor', 'middle');
  }

  for ( var stla of ['RB1in', 'RB2in', 'RB3', 'RB1out', 'RB2out', 'RB4'] ) {
    var name = 'canvas_'+stla;

    d3.select('#canvas_barrelZPhi')
      .append('svg')
      .attr('id', name).attr('class', 'canvas')
      .attr('width', 200)
    d3.select('#'+name)
      .append('text').text(stla)
      .attr('x', 0).attr('y', +10)
      .attr('font-family', 'sans-serif').attr('font-size', '9pt')
      .attr('text-anchor', 'left');
  }
  for ( var d of [-4, -2, -3, -1] ) {
    var name = 'canvas_Dm'+Math.abs(d);
    d3.select('#canvas_endcapMinus')
      .append('svg')
      .attr('id', name).attr('class', 'canvas')
      .append('circle')
      .attr('cx', width/2).attr('cy', height/2).attr('r',2)
      .attr('fill','#777');
    d3.select('#'+name)
      .append('text').text('RE'+d)
      .attr('x', width/2).attr('y', height/2-7)
      .attr('font-family', 'sans-serif').attr('font-size', '9pt')
      .attr('text-anchor', 'middle');
  }
  for ( var d of [2, 4, 1, 3] ) {
    var name = 'canvas_D'+d;
    d3.select('#canvas_endcapPlus')
      .append('svg')
      .attr('id', name).attr('class', 'canvas')
      .append('circle')
      .attr('cx', width/2).attr('cy', height/2).attr('r',2)
      .attr('fill','#777');
    d3.select('#'+name)
      .append('text').text('RE'+d)
      .attr('x', width/2).attr('y', height/2-7)
      .attr('font-family', 'sans-serif').attr('font-size', '9pt')
      .attr('text-anchor', 'middle');
  }

  var scaleX = d3.scaleLinear().domain([-800, 800]).range([0, width]);
  var scaleY = d3.scaleLinear().domain([-800, 800]).range([height, 0]);
  var scaleZ = d3.scaleLinear().domain([-700, 700]).range([0, width]);
  var scalePhi = d3.scaleLinear().domain([-0.3, 3.15*2]).range([height-5, 10]);
  var scaleBarrelX = d3.scaleLinear().domain([0.15, 0.85]).range([0, width]);
  var scaleBarrelY = d3.scaleLinear().domain([0.15, 0.85]).range([height, 0]);

  // Continue to load detector geometry
  d3.json('data/common/rpcGeom.json')
    .then(function(data) {
      // this data structure is:
      //   {
      //     structure:{
      //       Barrel: { 'W-2':['W+0_RB1in_S01_Backward', ...], 'W-1':[], ... }
      //       Endcap: { 'RE-4':[], .... }
      //     }
      //     properties: {
      //       'RollName(Barrel)':{region:0, wheel:0, sector:0, station:0, layer:1}
      //       'RollName(Endcap)':{region:0, disk:0, sector:0, ring:0}
      //     }
      //     geometry: {
      //        'RE+1_R2_CH01_A': [ [1,1], [2,2], [3,3], [4,4] ],
      //        ...
      //        'W+2_RB3+_S06_Backward': [ [5,5], [6,6], [7,7], [8,8] ],
      //     }
      //   }

      for ( var key in data.structure.Barrel ) {
        var w = parseInt(key.substr(1), 10);
        var name = 'W';
        if ( w >= 0 ) name += w;
        else name += 'm'+Math.abs(w);

        var rollNames = data.structure.Barrel[key];
        d3.select('#canvas_'+name).selectAll('polygon')
          .data(rollNames).enter().append('polygon')
          .attr('points', function(d) {
                            dd = data.geomForInitBarrel[d];
                            dd = dd.map(x => [scaleBarrelX(x[0]), scaleBarrelY(x[1])]);
                            return dd.map(x => x.join(',')).join(' ');
                          })
          .attr('id', x => ('roll_'+x).replaceAll("+", "p").replaceAll("-", "m")).attr('class', 'clickOff')
          .attr('stroke-width', 0.6).attr('stroke', '#777')
          .attr('fill', 'white')
          .on('click', function(y, x) {onclickBarrel(x)});
      }

      for ( var key in data.structure.Endcap ) {
        var d = parseInt(key.substr(2), 10);
        var name = 'D';
        if ( d >= 0 ) name += d;
        else name += 'm'+Math.abs(d);

        var rollNames = data.structure.Endcap[key];
        d3.select('#canvas_'+name).selectAll('polygon')
          .data(rollNames).enter().append('polygon')
          .attr('points', function(d) {
                            dd = data.geometry[d];
                            dd = dd.map(x => [scaleX(x[0]), scaleY(x[1])]);
                            return dd.map(x => x.join(',')).join(' ');
                          })
          .attr('id', x => ('roll_'+x).replaceAll("+", "p").replaceAll("-", "m")).attr('class', 'clickOff')
          .attr('stroke-width', 0.6).attr('stroke', '#777')
          .attr('fill', 'white')
          .on('click', function(y, x) {onclickEndcap(x)});
      }

      for ( var key in data.structure.BarrelLayer ) {
        var name = key;

        var rollNames = data.structure.BarrelLayer[key];
        d3.select('#canvas_'+name).selectAll('polygon')
          .data(rollNames).enter().append('polygon')
          .attr('points', function(d) {
                            var sector = parseInt(d.split('_')[2].substr(1), 10);
                            dd = data.geometry[d];
                            dd = dd.map(x => [scaleZ(x[2]), scalePhi(regularizeAngle(Math.atan2(x[1], x[0]), sector))]);
                            return dd.map(x => x.join(',')).join(' ');
                          })
          .attr('id', x => ('rollZPhi_'+x).replaceAll("+", "p").replaceAll("-", "m")).attr('class', 'clickOff')
          .attr('stroke-width', 0.6).attr('stroke', '#777')
          .attr('fill', 'white')
          .on('click', function(y, x) {onclickBarrel(x)});
      }
    });

    
}
