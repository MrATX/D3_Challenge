//Setup Initial Chart Params -----------------------------------------------------------------
//Define SVG Object
var svgWidth = 1000;
var svgHeight = 600;
var margin = {
  top:20,
  right:40,
  bottom:80,
  left:100,
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
//Create SVG Wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width",svgWidth)
  .attr("height",svgHeight);
//Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform",`translate(${margin.left},${margin.top})`);
//Initial Axis Categories
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
//--------------------------------------------------------------------------------------------

//Update Functions --------------------------------------------------------------------------
//Update x-scale
function xScale(popData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(popData, d => d[chosenXAxis]) * 0.8,
      d3.max(popData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);
  return xLinearScale;
}
//Update x Axis
function renderXAxis(xLinearScale, xAxis) {
  var bottomAxis = d3.axisBottom(xLinearScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
//Update Y Scale
function yScale(popData,chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.max(popData, d => d[chosenYAxis]) * 1.1,
    d3.min(popData, d => d[chosenYAxis]) * 0.6
  ])
  .range([0, height]);
return yLinearScale;
}
//Update Y Axis
function renderYAxis(yLinearScale, yAxis) {
  var leftAxis = d3.axisLeft(yLinearScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}
//Update Circles with Transition
function renderCircles(circlesGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis) {
  circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]));
return circlesGroup;
}
//Update State Labels
function updateCirclelabels(circleLabels,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis){
  circleLabels.transition()
    .duration(1000)
    .attr("x",d=>xLinearScale(d[chosenXAxis]) + margin.left)
    .attr("y",d=>yLinearScale(d[chosenYAxis]) + margin.top)
    .text(d=>d.abbr);
  return circleLabels;
}
//Update Circle Labels with Tooltip
function updateToolTip(chosenXAxis,chosenYAxis,circleLabels) {
  var labelx;
  var prex;
  var postx;
  if(chosenXAxis === "poverty") {
    labelx = "Poverty"
    prex = ""
    postx = "%";
  }
  else if(chosenXAxis === "age") {
    labelx = "Age (Median)"
    prex = ""
    postx = "";
  }
  else{
    labelx = "Income (Median)"
    prex = "$"
    postx = "";
  }
  var labely;
  var prey;
  var posty;
  if(chosenYAxis === "healthcare") {
    labely = "Lacks Healthcare"
    prey = ""
    posty = "%";
  }
  else if(chosenYAxis === "smokes") {
    labely = "Smokes"
    prey = ""
    posty = "%";
  }
  else{
    labely = "Obesity"
    prey = ""
    posty = "%";
  }
  var toolTip = d3.tip()
    .attr("class","tooltip")
    .offset([80,-60])
    .html(d => `${d.state}<br>${labelx}: ${prex}${d[chosenXAxis]}${postx}
                <br>${labely}: ${prey}${d[chosenYAxis]}${posty}`);
  circleLabels.call(toolTip);
  circleLabels.on("mouseover",function(data) {
    toolTip.show(data);
    })
    .on("mouseout",function(data) {
      toolTip.hide(data);
    });
  return circleLabels;
}
//-------------------------------------------------------------------------------------------

//Open Data Retrieval -----------------------------------------------------------------------
//Initial Object Generation -----------------------------------------------------------------
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
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
  //Append Circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(popData)
    .join("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "maroon")
    .attr("opacity", 0.6)
    .attr("stroke", "black");
  //Append Abbr Labels for Circles
  var circleLabels = svg.append("g")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(popData)
    .join("text")
    .attr("id", "abbr")
    .attr("dy", "0.35em")
    .attr("x", d =>  xLinearScale(d[chosenXAxis]) + margin.left)
    .attr("y", d => yLinearScale(d[chosenYAxis]) + margin.top)
    .attr("font-size", "15px")
    .attr("fill", "gold")
    .text(d => d.abbr);
  //Create group for multiple x Axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");
  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");
  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");
  //Create group for multiple Y Axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .attr("value","healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");
  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .attr("value","smokes")
    .classed("inactive", true)
    .text("Smokes (%)");
  var obsesityLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .attr("value","obesity")
    .classed("inactive", true)
    .text("Obesity (%)");
//Create ToolTip on Abbr Labels
var circleLabels = updateToolTip(chosenXAxis,chosenYAxis,circleLabels);
//-------------------------------------------------------------------------------------------

//Event Listeners ---------------------------------------------------------------------------
//X Axis labels event listener
xlabelsGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      chosenXAxis = value;
      xLinearScale = xScale(popData, chosenXAxis);
      xAxis = renderXAxis(xLinearScale, xAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      circleLabels = updateCirclelabels(circleLabels,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
      circleLabels = updateToolTip(chosenXAxis,chosenYAxis,circleLabels);
      if (chosenXAxis==="poverty"){
        povertyLabel
          .classed("active",true)
          .classed("inactive",false);
        ageLabel
          .classed("active",false)
          .classed("inactive",true);
        incomeLabel
          .classed("active",false)
          .classed("inactive",true);
      }
      else if (chosenXAxis==="age"){
        povertyLabel
          .classed("active",false)
          .classed("inactive",true);
        ageLabel
          .classed("active",true)
          .classed("inactive",false);
        incomeLabel
          .classed("active",false)
          .classed("inactive",true);
      }
      else if (chosenXAxis==="income"){
        povertyLabel
          .classed("active",false)
          .classed("inactive",true);
        ageLabel
          .classed("active",false)
          .classed("inactive",true);
        incomeLabel
          .classed("active",true)
          .classed("inactive",false);
      }
    }
  })
//Y Axis labels event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
  var value = d3.select(this).attr("value");
  if (value !== chosenYAxis) {
    chosenYAxis = value;
    yLinearScale = yScale(popData, chosenYAxis);
    yAxis = renderYAxis(yLinearScale, yAxis);
    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    circleLabels = updateCirclelabels(circleLabels,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
    circleLabels = updateToolTip(chosenXAxis,chosenYAxis,circleLabels);
    if (chosenYAxis==="healthcare"){
      healthcareLabel
        .classed("active",true)
        .classed("inactive",false);
      smokesLabel
        .classed("active",false)
        .classed("inactive",true);
      obsesityLabel
        .classed("active",false)
        .classed("inactive",true);
    }
    else if (chosenYAxis==="smokes"){
      healthcareLabel
        .classed("active",false)
        .classed("inactive",true);
        smokesLabel
        .classed("active",true)
        .classed("inactive",false);
        obsesityLabel
        .classed("active",false)
        .classed("inactive",true);
    }
    else if (chosenYAxis==="obesity"){
      healthcareLabel
        .classed("active",false)
        .classed("inactive",true);
        smokesLabel
        .classed("active",false)
        .classed("inactive",true);
        obsesityLabel
        .classed("active",true)
        .classed("inactive",false);
    }
  }
})
//--------------------------------------------------------------------------------------------
  
//Close Data Retrieval -----------------------------------------------------------------------
//CYA -_-
}).catch(error => console.log(error));