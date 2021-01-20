///// Dr. Kumar and J, thank you for great mentoring and guidance                                          
//// To complete this project, I have gone through several tutorials.
//// There would be tons of names to mention but it was hard to keep track of all                           
//// Few to definitely mention: Mr. Matt Dionis, 
//// Mr. Bill Morris’s(tutorial of Choropleth Map-https://bl.ocks.org/wboykinm/dbbe50d1023f90d4e241712395c27fb3),
/// Mr. Curran Kelleher(Using Geojson and Topojson files-https://www.youtube.com/watch?v=c0a02WHjgEs).
/// Websites used- Observablehq.com, Github.com, Google and Youtube.
/// Used CENSUS data from data.census.gov and COVID-19 from USAFACTS.org


var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 710 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

///////////////  Global Variables /////////////////
var Covid_graph_data, covid_dataset, counties, states, income_dataset, race_dataset, Jdataset,  countyInfo, val, xScale, yScale, xValue, yValue, xAxis, yAxis, g_width = 600;
var colorValue_I=[], colorValue_R=[], incomebyid = {}, racebyid = {}, covidbyid ={}, r_date={};
var IminVal, ImaxVal, RminVal, RmaxVal, Income_scale, Race_scale;

var color_I, color_R, I_lowColor = '#f7fcf5', I_highColor = '#00441b', R_lowColor = '#ffc6c4', R_highColor = '#672044';

var w = 20, h = 150, featuresWithCases;
var radiusScale, radiusValue, centered, current_cases;
var month=1, current_Date, render_date=0, FalgI, FlagR;

///////////////// Appending SVG's to the Body/////////////////
var svgA = d3.select('.container_A').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
var svgA_g = svgA.append('g')
    .attr('class', 'g_A')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var svgB = d3.select('.container_B').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

var svgB_g = svgB.append('g')
    .attr('class', 'g_B')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var covidSvgA = d3.select(".container_E").append("svg").attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

var covidSvgA_g = covidSvgA.append('g').attr('transform', 'translate(40,0)');

var covidSvgB = d3.select(".container_F").append("svg").attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

var covidSvgB_g = covidSvgB.append('g').attr('transform', 'translate(40,0)');

var xAxisG_I = covidSvgA_g.append("g").attr('class', "x-axis").attr('transform', 'translate(0,' + height + ')');
var yAxisG_I = covidSvgA_g.append("g").attr('class', "y-axis");

var xAxisG_R = covidSvgB_g.append("g").attr('class', "x-axis").attr('transform', 'translate(0,' + height + ')');
var yAxisG_R = covidSvgB_g.append("g").attr('class', "y-axis");

///////////////////// Defining Scales, Path, Projection for Topojson file to load map////////////

radiusScale = d3.scaleSqrt();
var projection = d3.geoAlbersUsa().translate([width/2, height/2]).scale(750)
var path = d3.geoPath().projection(projection)

///// Loaing Income Legend //////////////
var legend_I = svgA.append("defs").attr("class", "legend_I").append("svg:linearGradient").attr("id", "gradient1").attr("x1", "100%")
			.attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");
legend_I.append("stop").attr("offset", "0%").attr("stop-color", I_highColor).attr("stop-opacity", 1);	
legend_I.append("stop").attr("offset", "100%").attr("stop-color", I_lowColor).attr("stop-opacity", 1);
svgA.append("rect").attr("width", w).attr("height", h).attr('class', 'legendI').attr("transform", "translate(670,150)").style("fill", "url(#gradient1)");

///// Lodaing Race Legend ///////////////
var legend_R = svgB.append("defs").attr("class", "legend_R").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%")
			.attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");
legend_R.append("stop").attr("offset", "0%").attr("stop-color", R_highColor).attr("stop-opacity", 1);	
legend_R.append("stop").attr("offset", "100%").attr("stop-color",R_lowColor).attr("stop-opacity", 1);
svgB.append("rect").attr("width", w).attr("height", h).attr('class', 'legendR').attr("transform", "translate(670,150)").style("fill", "url(#gradient)");

Load_Graph()

///////////////////// Importing Datasets for the visualization /////////////
//////////////////// Computing necessary Data Fields for rendering the graph ////////
function Load_Graph()
{
    Promise.all([d3.csv('https://usafactsstatic.blob.core.windows.net/public/data/covid-19/covid_confirmed_usafacts.csv'), 
    d3.csv('Poverty.csv'),d3.csv('Hispanic.csv'),d3.json('us.json')])
    .then(([covid_dataset, income_dataset, race_dataset, Jdataset]) => { 
    covid_dataset.forEach(d => {covidbyid[d['countyFIPS']] = d;})
    income_dataset.forEach(d => {incomebyid[d.FIPS] = d;})
    race_dataset.forEach(d => {racebyid[d.FIPS] = d;})
    Covid_graph_data =covid_dataset;
    counties = topojson.feature(Jdataset, Jdataset.objects.counties).features
    states = topojson.feature(Jdataset, Jdataset.objects.states).features
    counties.forEach(d => { Object.assign(d.properties, racebyid[+d.id]);});
    counties.forEach(d => { Object.assign(d.properties, incomebyid[+d.id]);});
    counties.forEach(d => { Object.assign(d.properties, covidbyid[+d.id]);});
    Load_svgA(income_dataset, counties, states)
    Load_svgB(race_dataset,counties, states)
 
    })
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////   Loaidng slider  ////////////////////////////////////

d3.select("#slider_I").on("input", render_casesI);
d3.select("#slider_R").on("input", render_casesR);

///////////////////////////////////////////////////////////////
function render_casesI()
{
var date = new Date("Jan 21,2020");
var slider_val =parseInt(d3.select("#slider_I").property("value"));
dat =new Date(date.setDate(date.getDate()));
dat2 =new Date(dat.setDate(date.getDate()+slider_val));
var day = dat2.getDate();
var month = dat2.getMonth()+1;
var year = dat2.getYear();
render_date = month +"/" +day+"/"+(year-100)
svgA_g.selectAll(".country-circle").remove()
document.getElementById('date_I').innerHTML =  render_date
render_circles(render_date)
}

function render_casesR()
{
var date = new Date("Jan 21,2020");
var sliderR_val =parseInt(d3.select("#slider_R").property("value"));
dat =new Date(date.setDate(date.getDate()));
dat2 =new Date(dat.setDate(date.getDate()+sliderR_val));
var day = dat2.getDate();
var month = dat2.getMonth()+1;
var year = dat2.getYear();
render_date = month +"/" +day+"/"+(year-100)
svgB_g.selectAll(".country-circle").remove()
document.getElementById('date_R').innerHTML =render_date
render_circles(render_date)
}

/////////////////////////////////////////////////////////////////

function render_circles(current_Date)
{
    var modeI = document.getElementsByName("Covid_19_I");
    var modeR = document.getElementsByName("Covid_19_R");

if(modeR[0].checked)
{
    if(current_Date == 1 && FalgR==1)
        {

            var date_now = new Date();
            var dy = date_now.getDate()-2;
            var mnth = date_now.getMonth()+1;
            var yr = date_now.getYear();
            var vari = mnth +"/" +dy+"/"+(yr-100)
            current_Date = vari;
            document.getElementById('date_R').innerHTML = current_Date
        }
        
        counties.forEach(d => {
            d.properties.projected = projection(d3.geoCentroid(d));
        });
    
        featuresWithCases = counties
        .filter(d => d.properties[current_Date])
        .map(d => {
          d.properties[current_Date] = +d.properties[current_Date];
          return d;
        });
        radiusValue= d => d.properties[current_Date]
        current_cases =radiusValue;
        radiusScale.domain([0, d3.max(counties, radiusValue)])
        .range([0, 20]);

svgB_g.selectAll('circle')
      .data(featuresWithCases)
      .enter()
      .append('circle')
      .attr('class', 'country-circle')
      .attr('cx', d => d.properties.projected[0])
      .attr('cy', d => d.properties.projected[1])
      .attr('r', d => radiusScale(radiusValue(d)))
      .on('click', d => Generate_CovidGraph_R(d.properties.NAME, d.properties.FIPS, current_Date,))
      .on('mouseover', function(d)
{
    d3.select(this).classed("selected", true)
    countyInfo = d3.select(".container_B").append("div").attr("class", "circle_content").style("opacity", 0); 
    d3.select(this).style("stroke-width", 1).transition().duration(500);
    countyInfo.style("opacity", 1.1);
    countyInfo.html("Date :"+ current_Date +"<br/>"+"Number of cases : "+radiusValue(d)+ "<br/>"+d.properties.County+ "<br/>" +"State : "+d.properties.State)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 88) + "px");
})
.on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100);
countyInfo.remove();})
}
else if(modeR[1].checked){
    d3.select("#slider_R").property("value",0)
    svgB_g.selectAll(".country-circle").remove()
    covidSvgB.selectAll(".line_R").remove()
    covidSvgB_g.selectAll(".C_titleR").remove()
    xAxisG_R.selectAll(".x-axis").remove()
    yAxisG_R.selectAll(".y-axis").remove()
}

if(modeI[0].checked)
    {
    if(current_Date == 1 && FalgI==1)
        {
            var date_now = new Date();
            var dy = date_now.getDate()-2;
            var mnth = date_now.getMonth()+1;
            var yr = date_now.getYear();
            var vari = mnth +"/" +dy+"/"+(yr-100)
            current_Date = vari;
            document.getElementById('date_I').innerHTML = current_Date
        }
        console.log(counties);
        counties.forEach(d => {
            d.properties.projected = projection(d3.geoCentroid(d));
        });
    
        featuresWithCases = counties
        .filter(d => d.properties[current_Date])
        .map(d => {
          d.properties[current_Date] = +d.properties[current_Date];
          return d;
        });
        console.log(featuresWithCases);
        radiusValue= d => d.properties[current_Date]
        current_cases =radiusValue;
        radiusScale.domain([0, d3.max(counties, radiusValue)])
        .range([0, 20]);

    svgA_g.selectAll('circle')
          .data(featuresWithCases)
          .enter()
          .append('circle')
          .attr('class', 'country-circle')
          .attr('cx', d => d.properties.projected[0])
          .attr('cy', d => d.properties.projected[1])
          .attr('r', d => radiusScale(radiusValue(d)))
          .on('click', d => Generate_CovidGraph_I(d.properties.FIPS, current_Date, d.properties.NAME))
          .on('mouseover', function(d)
            {  
            d3.select(this).classed("selected", true)
            d3.select(this).style("stroke-width", 1).transition().duration(500);
            countyInfo = d3.select(".container_A").append("tipDiv").attr("class", "circle_content").style("opacity", 0); 
            countyInfo = d3.select(".container_A").append("div").attr("class", "circle_content").style("opacity", 0); 
            countyInfo.style("opacity", 1.1);
            countyInfo.html("Date :"+ current_Date +"<br/>"+"Number of cases : "+radiusValue(d)+ "<br/>"+d.properties.County+ "<br/>" +"State : "+d.properties.State)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 88) + "px");
            })
        .on('mouseout', 
    function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
    countyInfo.remove();});
    }
    else if(modeI[1].checked)
    {
        d3.select("#slider_I").property("value",0)
        svgA_g.selectAll(".country-circle").remove()
        covidSvgA.selectAll(".line_I").remove()
        covidSvgA_g.selectAll(".C_titleI").remove()
        xAxisG_I.selectAll(".x-axis").remove()
        yAxisG_I.selectAll(".y-axis").remove()
    }
}
/////////////////////////////////////////////////////////////

function Generate_CovidGraph_R(R_name, dataid,graph_date)
{
    var databyid=[], data_id ={}, count=0, d, m, y, check_date, date_c, vl;
    for(let i=0; i<Covid_graph_data.length; i++)
    {
        if(Covid_graph_data[i].countyFIPS== dataid)
            {            
        do{
            date_c = new Date("Jan 22,2020");
            d = new Date(date_c.setDate(date_c.getDate()));
            dd = new Date(d.setDate(date_c.getDate()+count));
            d = dd.getDate();
            m = dd.getMonth()+1;
            y = dd.getYear();
            check_date = m+"/" + d +"/"+(y-100)
            data_id ={id: Covid_graph_data[i].countyFIPS, cases : Covid_graph_data[i][check_date], date :check_date}
            vl =Covid_graph_data[i][graph_date]
            databyid.push(data_id)
            count=count+1;
            if(vl== Covid_graph_data[i][check_date])
            {
                break;
            }
        } while(vl == Covid_graph_data[i][graph_date])
        }
    }
    lineGraph_R(databyid, R_name)
}

////////////////////////////////////////////////////////////
function Generate_CovidGraph_I(dataid,graph_date, C_name)
{
var databyid=[], data_id ={}, count=0, d, m, y, check_date, date_c, vl;
for(let i=0; i<Covid_graph_data.length; i++)
{
    if(Covid_graph_data[i].countyFIPS== dataid)
        {            
    do{
        date_c = new Date("Jan 22,2020");
        d = new Date(date_c.setDate(date_c.getDate()));
        dd = new Date(d.setDate(date_c.getDate()+count));
        d = dd.getDate();
        m = dd.getMonth()+1;
        y = dd.getYear();
        check_date = m+"/" + d +"/"+(y-100)
        data_id ={id: Covid_graph_data[i].countyFIPS, cases : Covid_graph_data[i][check_date], date :check_date, County : Covid_graph_data[i].CountyName}
        vl =Covid_graph_data[i][graph_date]
        databyid.push(data_id)
        count=count+1;
        if(vl== Covid_graph_data[i][check_date])
        {
            break;
        }
    } while(vl == Covid_graph_data[i][graph_date])
    }
}
lineGraph_I(databyid, C_name)
}
/////////////////////////////////////////////////////////////////////
function lineGraph_I(data,C_name)
{
covidSvgA_g.selectAll(".line_I").remove()
covidSvgA_g.selectAll(".C_titleI").remove()
var parseTime = d3.timeParse("%m/%d/%y")
var yAxisLable='Cases', xAxisLabel = 'Timeline', title='Cumulative incidence'

var XScale = d3.scaleTime()
.range([0,width-40])
.domain(d3.extent(data, function(d){ return parseTime(d.date);})); 

var YScale = d3.scaleLinear()
.domain([0, d3.max(data, function(d){ return parseInt(d.cases)})]).nice()
.range([height, 40])

var line_fun = d3.line()
.x(function(d){return XScale(parseTime(d.date));})
.y(function(d){return YScale(parseInt(d.cases))})

var xAxis = d3.axisBottom(XScale)//.tickSize(-height).tickPadding(15).ticks(8);
var yAxis = d3.axisLeft(YScale)//.tickSize(-width).tickPadding(10).ticks(8);

xAxisG_I.selectAll(".x-axis").remove()
yAxisG_I.selectAll(".y-axis").remove()

xAxisG_I.call(xAxis);
yAxisG_I.call(yAxis);
yAxisG_I.append('text').attr('class', 'axis-label').attr('y', -30).attr('x', -height / 1.8)
      .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text(yAxisLable);

xAxisG_I.append('text').attr('class', 'axis-label').attr('y', 20).attr('x', width / 2.5).attr('fill', 'black').text(xAxisLabel);

covidSvgA_g.append("path").data(data).attr("class", "line_I")
.style("stroke", "red").attr("fill", "none")
.style("stroke-width", 1)
.attr("d", line_fun(data));
covidSvgA_g.append('text').attr('class', 'title').attr('y', 28).text(title);
covidSvgA_g.append('text').attr('class', 'C_titleI').attr('y', 58).text(C_name);
}
///////////////////////////////////////////////////////////////

function lineGraph_R(data,R_name)
{
covidSvgB_g.selectAll(".line_R").remove()
covidSvgB_g.selectAll(".C_titleR").remove()
var parseTime = d3.timeParse("%m/%d/%y")
var yAxisLable='Cases', xAxisLabel = 'Timeline', title='Cumulative incidence'

var XScale = d3.scaleTime()
.range([0,width-40])
.domain(d3.extent(data, function(d){ return parseTime(d.date);})); 

var YScale = d3.scaleLinear()
.domain([0, d3.max(data, function(d){ return parseInt(d.cases)})]).nice()
.range([height, 40])

var line_fun = d3.line()
.x(function(d){return XScale(parseTime(d.date));})
.y(function(d){return YScale(parseInt(d.cases))})

var xAxis = d3.axisBottom(XScale)//.tickSize(-height).tickPadding(15).ticks(8);
var yAxis = d3.axisLeft(YScale)//.tickSize(-width).tickPadding(10).ticks(8);

xAxisG_R.selectAll(".x-axis").remove()
yAxisG_R.selectAll(".y-axis").remove()

xAxisG_R.call(xAxis);
yAxisG_R.call(yAxis);
yAxisG_R.append('text').attr('class', 'axis-label').attr('y', -30).attr('x', -height / 1.8)
      .attr('fill', 'black').attr('transform', `rotate(-90)`).attr('text-anchor', 'middle').text(yAxisLable);

xAxisG_R.append('text').attr('class', 'axis-label').attr('y', 21).attr('x', width / 2.5).attr('fill', 'black').text(xAxisLabel);

covidSvgB_g.append("path").data(data).attr("class", "line_R")
.style("stroke", "red").attr("fill", "none")
.style("stroke-width", 1)
.attr("d", line_fun(data));
covidSvgB_g.append('text').attr('class', 'title').attr('y', 28).text(title);
covidSvgB_g.append('text').attr('class', 'C_titleR').attr('y', 58).text(R_name);
}

///////////////////////////////////////////////////////////

function Load_svgA(income_dataset, counties, states)
{
var mode_I = document.getElementsByName("modeI");

if(mode_I[0].checked)
    {
        income_dataset.forEach(d => {
        colorValue_I.push(parseFloat(d.lt100))})
        IminVal = d3.min(colorValue_I)
        ImaxVal = d3.max(colorValue_I)
        Income_scale = d3.scaleLinear().domain([IminVal,ImaxVal]).range([I_lowColor,I_highColor])
        var y_I = d3.scaleLinear().range([h, 0]).domain([IminVal, ImaxVal]);
        var yAxis_I = d3.axisLeft(y_I);
        svgA.selectAll(".y_axis").remove()
        svgA.append("g").attr("class", "y_axis").attr("transform", "translate(669,150)").call(yAxis_I)
        svgA_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county").attr("d", path)
        .attr('fill', d => Income_scale(d.properties.lt100))
        .attr('cursor', 'pointer')
        .on('click', function (d) { stateZoomI(d) })
        .on('mouseover', function(d)
        {
            d3.select(this).classed("selected", true)
            countyInfo = d3.select(".container_A").append("div").attr("class", "county_content").style("opacity", 0); 
            d3.select(this).style("stroke-width", 1).transition().duration(500);
            countyInfo.style("opacity", 1.1);
            countyInfo.html("State: "+d.properties.State+"<br/>"+"County: "+d.properties.County+"<br/>"+"Percent population: "+d.properties.lt100)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 98) + "px");
        })
        .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100)
        
        countyInfo.remove();})

        svgA_g.selectAll(".state").data(states).enter().append("path").attr("class", "state").attr("d", path)
    }
    else if(mode_I[1].checked)
    {
        income_dataset.forEach(d => {
            colorValue_I.push(parseFloat(d.bt1_200))})
            IminVal = d3.min(colorValue_I)
            ImaxVal = d3.max(colorValue_I)
            Income_scale = d3.scaleLinear().domain([IminVal,ImaxVal]).range([I_lowColor,I_highColor])
            var y_I = d3.scaleLinear().range([h, 0]).domain([IminVal, ImaxVal]);
            var yAxis_I = d3.axisLeft(y_I);
            svgA.selectAll(".y_axis").remove()
            svgA.append("g").attr("class", "y_axis").attr("transform", "translate(669,150)").call(yAxis_I)
        svgA_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county").attr("d", path)
        .attr('fill', d => Income_scale(d.properties.bt1_200))
        .attr('cursor', 'pointer')
        .on('click', function (d) { stateZoomI(d) })
        .on('mouseover', function(d)
        {
            d3.select(this).classed("selected", true)
            countyInfo = d3.select(".container_A").append("div").attr("class", "county_content").style("opacity", 0); 
            d3.select(this).style("stroke-width", 1).transition().duration(500);
            countyInfo.style("opacity", 1.1);
            countyInfo.html("State: "+d.properties.State+"<br/>"+"County: "+d.properties.County+"<br/>"+"Percent population: "+d.properties.bt1_200)
          
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 108) + "px");
        })
        .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100);
        countyInfo.remove();})

        svgA_g.selectAll(".state").data(states).enter().append("path").attr("class", "state").attr("d", path)
    }
    else if(mode_I[2].checked)
    {
        income_dataset.forEach(d => {
            colorValue_I.push(parseFloat(d.gt200))})
            IminVal = d3.min(colorValue_I)
            ImaxVal = d3.max(colorValue_I)
            Income_scale = d3.scaleLinear().domain([IminVal,ImaxVal]).range([I_lowColor,I_highColor])
            var y_I = d3.scaleLinear().range([h, 0]).domain([IminVal, ImaxVal]);
            var yAxis_I = d3.axisLeft(y_I);
            svgA.selectAll(".y_axis").remove()
            svgA.append("g").attr("class", "y_axis").attr("transform", "translate(669,150)").call(yAxis_I)
        svgA_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county").attr("d", path)
           .attr('fill', d => Income_scale(d.properties.gt200))
        .attr('cursor', 'pointer')
        .on('click', function (d) { stateZoomI(d) })
        .on('mouseover', function(d)
        {
            d3.select(this).classed("selected", true)
            countyInfo = d3.select(".container_A").append("div").attr("class", "county_content").style("opacity", 0); 
            d3.select(this).style("stroke-width", 1).transition().duration(500);
            countyInfo.style("opacity", 1.1);
            countyInfo.html("State: "+d.properties.State+"<br/>"+"County: "+d.properties.County+"<br/>"+"Percent population: "+d.properties.gt200)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 108) + "px");
        })
        .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width", '0.2px').transition().duration(100);
        countyInfo.remove();})

        svgA_g.selectAll(".state").data(states).enter().append("path").attr("class", "state").attr("d", path)
    }
    
svgA_g.call(d3.zoom().on('zoom', () => { d3.selectAll('.g_A').attr('transform', d3.event.transform);}));
render_circles()
}

//////////////////////////////////////////////////////////////////////////////////

function Load_svgB(race_dataset, counties, states)
{
var mode_R = document.getElementsByName("modeR");
if(mode_R[0].checked)
{
    race_dataset.forEach(d =>{
        colorValue_R.push(parseFloat(d.NHW));})
    RminVal = d3.min(colorValue_R)
    RmaxVal = d3.max(colorValue_R)
    Race_scale = d3.scaleLinear().domain([RminVal,RmaxVal]).range([R_lowColor,R_highColor])
    
    var y_R = d3.scaleLinear().range([h, 0]).domain([RminVal, RmaxVal]);
    var yAxis_R = d3.axisLeft(y_R);
    svgB.selectAll(".y_axis").remove()
    svgB.append("g").attr("class", "y_axis").attr("transform", "translate(669,150)").call(yAxis_R)
    svgB_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county")
    .attr("d", path)
    .attr('fill', d => Race_scale(d.properties.NHW))
    .attr('cursor', 'pointer')
    .on('click', function (d) { stateZoomR(d) })
    .on('mouseover', function(d)
    {
        d3.select(this).classed("selected", true)
        countyInfo = d3.select(".container_B").append("div").attr("class", "county_content").style("opacity", 0); 
        d3.select(this).style("stroke-width", 1).transition().duration(500);
        countyInfo.style("opacity", 1.1);
        countyInfo.html("State: "+d.properties.State+"<br/>"+"County : "+d.properties.County+"<br/>"+"Non-Hispanic White (%) : "+d.properties.NHW)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 108) + "px");
    })
    .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width",'0.2px').transition().duration(100);
    countyInfo.remove();})
    
    svgB_g.selectAll(".state").data(states).enter().append("path").attr("class", "state")
    .attr("d", path)
}
else if(mode_R[1].checked)
{
    race_dataset.forEach(d =>{
        colorValue_R.push(parseFloat(d.NHB));})
    RminVal = d3.min(colorValue_R)
    RmaxVal = d3.max(colorValue_R)
    Race_scale = d3.scaleLinear().domain([RminVal,RmaxVal]).range([R_lowColor,R_highColor])
    
    var y_R = d3.scaleLinear().range([h, 0]).domain([RminVal, RmaxVal]);
    var yAxis_R = d3.axisLeft(y_R);
    svgB.selectAll(".y_axis").remove()
    svgB.append("g").attr("class", "y_axis").attr("transform", "translate(669,150)").call(yAxis_R)
    svgB_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county")
    .attr("d", path)
    .attr('fill', d => Race_scale(d.properties.NHB))
    .attr('cursor', 'pointer')
    .on('click', function (d) { stateZoomR(d) })
    .on('mouseover', function(d)
    {
        d3.select(this).classed("selected", true)
        countyInfo = d3.select(".container_B").append("div").attr("class", "county_content").style("opacity", 0); 
        d3.select(this).style("stroke-width", 1).transition().duration(500);
        countyInfo.style("opacity", 1.1);
        countyInfo.html("State: "+d.properties.State+"<br/>"+"County : "+d.properties.County+"<br/>"+"Non-Hispanic Black (%) : "+d.properties.NHB)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 108) + "px");
    })
    .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width",'0.2px').transition().duration(100);
    countyInfo.remove();})
    
    svgB_g.selectAll(".state").data(states).enter().append("path").attr("class", "state")
    .attr("d", path)
}
else if(mode_R[2].checked)
{
    race_dataset.forEach(d =>{
        colorValue_R.push(parseFloat(d.Hisp));})
    RminVal = d3.min(colorValue_R)
    RmaxVal = d3.max(colorValue_R)
    Race_scale = d3.scaleLinear().domain([RminVal,RmaxVal]).range([R_lowColor,R_highColor])
    
    var y_R = d3.scaleLinear().range([h, 0]).domain([RminVal, RmaxVal]);
    var yAxis_R = d3.axisLeft(y_R);
    svgB.selectAll(".y_axis").remove()
    svgB.append("g").attr("class", "y_axis").attr("transform", "translate(669,150)").call(yAxis_R)
    svgB_g.selectAll(".county").data(counties).enter().append("path").attr("class", "county")
    .attr("d", path)
    .attr('fill', d => Race_scale(d.properties.Hisp))
    .attr('cursor', 'pointer')
    .on('click', function (d) { stateZoomR(d) })
    .on('mouseover', function(d)
    {
        d3.select(this).classed("selected", true)
        countyInfo = d3.select(".container_B").append("div").attr("class", "county_content").style("opacity", 0); 
        d3.select(this).style("stroke-width", 1).transition().duration(500);
        countyInfo.style("opacity", 1.1);
        countyInfo.html("State: "+d.properties.State+"<br/>"+"County : "+d.properties.County+"<br/>"+"Hispanic (%) : "+d.properties.Hisp)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 108) + "px");
    })
    .on('mouseout', function(d){d3.select(this).classed("selected", false).style("stroke-width",'0.2px').transition().duration(100)
    countyInfo.remove();})

    svgB_g.selectAll(".state").data(states).enter().append("path").attr("class", "state")
    .attr("d", path)
    function usZoom() {
        var t = d3.transition().duration(800);
    }
}

svgB_g.call(d3.zoom().on('zoom', () => { d3.select('.g_B').attr('transform', d3.event.transform);}));
}

 var zoomSettings = {
     duration: 1500,
     ease: d3.easeCubicOut,
     zoomLevel: 4
 };

 function stateZoomI(d) {
    var zoomLevel ,x, y;

    if(d && centered !== d)
    {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        zoomLevel = zoomSettings.zoomLevel;
        centered = d;
    }
    else{
        x = width/2;
        y= height/2;
        zoomLevel=1;
        centered=null;
    }
svgA_g.transition()
.duration(zoomSettings.duration)
.ease(zoomSettings.ease)
.attr('transform','translate(' + width/2 + ',' + height/2 + ')scale('+ zoomLevel + ')translate('+ -x +','+ -y + ')');
}

function stateZoomR(d) {
    var zoomLevel ,x, y;

    if(d && centered !== d)
    {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        zoomLevel = zoomSettings.zoomLevel;
        centered = d;
    }
    else{
        x = width/2;
        y= height/2;
        zoomLevel=1;
        centered=null;
    }
svgB_g.transition()
.duration(zoomSettings.duration)
.ease(zoomSettings.ease)
.attr('transform','translate(' + width/2 + ',' + height/2 + ')scale('+ zoomLevel + ')translate('+ -x +','+ -y + ')');
}

function radioMode_R()
{   
svgB_g.selectAll(".county").remove()
svgB_g.selectAll(".state").remove()
svgB_g.selectAll(".country-circle").remove()
var modeR = document.getElementsByName("Covid_19_R");
modeR[1].checked=true;
d3.select("#slider_R").property("value",0)
document.getElementById('date_R').innerHTML = ''
Load_Graph()
}

function radioMode_I()
{
    svgA_g.selectAll(".county").remove()
    svgA_g.selectAll(".state").remove()
    svgA_g.selectAll(".country-circle").remove()
    var modeI = document.getElementsByName("Covid_19_I");
    modeI[1].checked=true;
    d3.select("#slider_I").property("value",0)
    document.getElementById('date_I').innerHTML =  ''
Load_Graph()
}
function radioCovid_I()
{
    FalgI=1
    current_Date=1;
    render_circles(current_Date)
}


function radioCovid_R()
{
    FalgR=1
    current_Date=1;
    render_circles(current_Date)
}