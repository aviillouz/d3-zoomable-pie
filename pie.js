//svg dimensions
var width = 1200;
var height = 600;

//pie radius
var radius = Math.min(width, height) / 2;
var innerRadius = 0;

//colors range
var color = d3.scale.category20c();

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
var partition = d3.layout.partition().value(value)

//pie layout handels one layer of the data tree
var pie = d3.layout.pie().value(value)

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

  //DEBUG
  console.log(children);

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
    return d.data.name + ' : ' + d.data.size;
  })
}
