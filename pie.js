//svg dimensions
var width = 1200;
var height = 1000;

//pie radius
var radius = (Math.min(width, height) / 2) * 0.5;
var innerRadius = 0;

//colors range
var color = d3.scale.category20();

//add svg canvas to page
var svg = d3.select('#pie')
.append('svg')
.attr('width', width)
.attr('height', height)
.append('g')
.attr('transform', 'translate(' + (width / 2) +
',' + (height / 2) + ')');

//arc function
var arc = d3.svg.arc()
.innerRadius(innerRadius)
.outerRadius(radius);

//value function, value of node d is it's budget amount
function value(d) {
  return d.amount
}

//partition layout handels the data as tree
//TODO use abstract layout
var partition = d3.layout.partition().value(value).sort(null)
//pie layout handels one layer of the data tree
var pie = d3.layout.pie().value(value).sort(null)
//fetch data and zoom on the root
d3.json('data.json', function (error, data) {
  var tree = partition(data)
  var root = tree[0]
  zoom(root)
});

/**
* display a new pie chart of this nodes children
* @param  d - the node to view its children
*/
function zoom(d) {

  // the children of d, if d is root than he has no data key
  var children = d.data ? d.data.children : d.children;

  //if there aren't any children, don't zoom
  if (! children) { return }

  //remove previous pie
  d3.selectAll('g.arc').remove()

  //make svg g elements as arcs
  var arcs = svg.selectAll('g.arc')
  .data(pie(children))
  .enter()
  .append('g')
  .attr('class','arc')

  //append svg path to plot arcs
  var paths = arcs.append('path')
  .attr('d', arc)
  //map fill color to name
  .attr('fill', function(d) {
    return color(d.data.name)
    //on click recursivly zoom to clicked child
  }).on('click',zoom)

  //add title for native tooltip
  paths.append("title")
  .text(function(d) {
    return d.data.name + ' : ' + d3.format(",d")(d.data.size);
  })

  //ticks
  //TODO display fewer ticks

  //remove previous ticks
  svg.selectAll("line").remove()

  var ticks =
  svg.selectAll("line")
  .data(pie(children))
  .enter()
  .append("line")
  .filter(function (d) { return ratio(d).isMinimal })

  ticks.attr("x1", 0)
  .attr("x2", 0)
  .attr("y1", - radius*1.3)
  .attr("y2", - radius*1.01)
  .attr("stroke", "gray")
  .attr("transform", function(d) {
    return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
  });

  //ticks labels

  //remove previous ticks labels
  //TODO set class ticks-lables
  svg.selectAll("text").remove()

  var labels =
  svg.selectAll("text")
  .data(pie(children)).enter().append("text")

  labels.attr("class", "value")
  .attr("transform", function(d) {
    var dist=radius*1.4;
    var winkel=(d.startAngle+d.endAngle)/2;
    var x=dist*Math.sin(winkel);
    var y=-dist*Math.cos(winkel);
    return "translate(" + x + "," + y + ")";
  })
  .attr("dy", "0.35em")
  .attr("text-anchor", "middle")
  .text(function (d) {
    nodeRatio = ratio(d)
    return ( nodeRatio.isMinimal ? d3.format("%")(nodeRatio.value) +' ' +  d.data.name : '')
  });

}

/**
 * calculate the ratio of this nodes value within its parent node
 * @param   d - the node
 * @return {Boolean,real} whether this ratio is above minimal threshold,
 * and the ratio (between 0 and 1)
 */
function ratio(d){
  var ratio = d.data.value/(d.data.parent ? d.data.parent.size : 1);
  if (ratio < 0.01) { // less than one precent
    return {'isMinimal':false, 'value': ratio};
  }
  return {'isMinimal':true, 'value': ratio};
}
