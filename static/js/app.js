//Define SVG Object
var svgWidth = 500;
var svgHeight = 500;
var margin = {
  top:20,
  right:20,
  bottom:20,
  left:20,
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create SVG Wrapper
// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width",svgWidth)
  .attr("height",svgHeight);

//Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform",`translate(${margin.left},${margin.top})`);

//Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "nohealthcare";

//Update x-scale
function xScale(popData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(popData, d => d[chosenXAxis]) * 1,
      d3.max(popData, d => d[chosenXAxis]) * 1
    ])
    .range([0, width]);
  return xLinearScale;
}

//Update x Axis
function renderxAxes(newXscale, xAxis) {
  var bottomAxis = d3.axisBottom(newXscale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

//Update Y Scale
function yScale(popData,chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(popData, d => d[chosenYAxis]) * 1,
    d3.max(popData, d => d[chosenYAxis]) * 1
  ])
  .range([0, height]);
return yLinearScale;
}

//Update Y Axis *************************************

//Update Circles with Transition
function renderCircles(circlesGroup,newXScale,chosenXAxis) {
  circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => newXScale(d[chosenXAxis]));
return circlesGroup;
}

//Update Circles with Tooltip
function updateToolTip(chosenXAxis,circlesGroup) {
  var label;
  if(chosenXAxis === "poverty") {
    label = "In Poverty (%)";
  }
  if(chosenXAxis === "age") {
    label = "Age (median)";
  }
  else{
    label = "Household Income (median)";
  }
  var Tooltip = d3.tip()
    .attr("class","tooltip")
    .offset([80,-60])
    .html(d => `${d.state}<br>${label}${chosenXAxis}`);
  circlesGroup.call(Tooltip);
  circlesGroup.on("mouseover",function(data) {
      Tooltip.show(data);
    })
    //onmouseout event
    .on("mouseout",function(data) {
      Tooltip.hide(data);
    });
  return circlesGroup;
}

//Retrieve Data
d3.csv("data/data.csv").then(popData => {
  console.log(popData)
  //Parse Data
  popData.forEach(data => {
    data.abbr = data.abbr;
    data.state = data.state;
    data.age = +data.age;
    data.income = +data.income;
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });
  //Set x Scale
  var xLinearScale = xScale(popData,chosenXAxis);
  //Set y Scale
  var yLinearScale = yScale(popData,chosenYAxis);
  //Initial Axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  //Append x Axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  //Append y Axis
  chartGroup.append("g")
    .call(leftAxis);
  //Append Circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(popData)
    .join("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", 0.5)
    .attr("stroke", "black");
  //Create group for multiple x Axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty")
    .classed("inactive", true)
    .text("In Poverty (%)")
  //Create group for multiple Y Axis labels
  //TEMP FUNCTION
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)")

//Update ToolTip
var circlesGroup = updateToolTip(chosenXAxis,circlesGroup)

//X Axis labels event listener
labelsGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      chosenXAxis = value;
      xLinearScale = xScale(popData, chosenXAxis);
      xAxis = renderxAxes(xLinearScale, xAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    }
  })
  


//End Data Retrieval
}).catch(error => console.log(error));