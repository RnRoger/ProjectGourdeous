/*
    This javascript is responsible for creating the sunburst visualisation using the d3 library.
    The sunburst is then placed in the html in the tag <svg> which this script also creates.

    Authors: Rogier and Awan

    Known bugs: [SOLVED] on 06/06 - Can't extract articles from the json file yet.
 */

//This function is called by the sunburst.html and contains all the code in this file since it has to run it all.
! function () {
    var width = 700,
        height = 700,
        radius = (Math.min(width, height) / 2) - 10;

    var formatNumber = d3.format(",d");

    var x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

    var y = d3.scaleLinear()
        .range([0, radius]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var partition = d3.partition();

    var arc = d3.arc()
        .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
        })
        .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
        })
        .innerRadius(function (d) {
            return Math.max(0, y(d.y0));
        })
        .outerRadius(function (d) {
            return Math.max(0, y(d.y1));
        });

// Create the svg element
    var svg = d3.select("#vis").append("svg")
    //.text("rewrwr")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

// Load the json file
    d3.json("static/js/Jason3.json", function (error, root) {

        if (error) throw error;
        root = d3.hierarchy(root);
        root.sum(function (d) {
            return d.size;
        });

        var g = svg.selectAll("path")
            .data(partition(root).descendants())
            .enter().append("g");

        //Add mouse interaction
        var path = g.append("path")
            .attr("d", arc)
            .attr("name",function (name) {return name.data.name})
            .attr("articles", function (name) {return name.data.articles})
            .style("fill", function (d) {
                return color((d.children ? d : d.parent).data.name);
            })
            .on("click", showArticles)
            .on("dblclick", zoom)
        .on("mouseover", highlight)
        .on("mouseout",function () {
              d3.selectAll("path").style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
                .style("stroke", "#000")
              .style("stroke-width","1")
        });

        //Allow for rotating text
        var text = g.append("text")
            .attr("transform", function (d) {
                if (d.depth > 0) {
                    return "translate(" + arc.centroid(d) + ")rotate(" + getAngle(d) + ")";
                } else {
                    return null;
                }
            })
            .attr("text-anchor", "middle")
            .attr("dx", "6")
            .attr("dy", ".35em")
            .style("font-size", "9px")
            .text(function (d) {
                return d.data.name
            })
            .attr("pointer-event", "none");

        // This function is called when a user double clicks on a node. It will make this node the new center of the sunburst
        // by zooming in on it and adjusting the other nodes.
        function zoom(d) {
            text.transition().attr("opacity", 0);
            path.transition()
                .duration(750)
                .tween("scale", function () {
                    var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                    return function (t) {
                        x.domain(xd(t));
                        y.domain(yd(t)).range(yr(t));};})
                 .attrTween("d", function (d) {
                 return function () {return arc(d);};})
        .on("end", function (e, i) {
            if(e.x0 >= d.x0 && e.x0 < (d.x1)){
                var arcText = d3.select(this.parentNode).select("text");
                arcText.transition().duration(750)
                    .attr("opacity", 1)
                    .attr("transform", function(d){return "translate(" + arc.centroid(d) + ")rotate(" + getAngle(d) + ")";})
                    .attr("text-anchor", "middle")
                    .text(function(d){
                        return d.data.name == "root" ? "" : d.data.name});
        }})
}});

d3.select(self.frameElement).style("height", height + "px");

// Shows the acrticles related to a compound.
  function showArticles() {
    var searchName = d3.select(this).attr("name");
    var articleArray = d3.select(this).attr("articles");
    console.log(articleArray);
    //alert(searchName+" - "+articleArray);
    var articles = articleArray.split(",");
    var tableArray = [];
    var index = 0;
    for (var i1=0,i2=1,  tot=articles.length; i1 < tot; i1+=2,i2+=2) {
        //var link = "<a href='"+articles[i2]+"'>"+articles[i1]+"</a>";
        tableArray.push([[articles[i1],articles[i2]]]);
    }
    createTable(tableArray);
}

function createTable(tableData) {
    var table = document.createElement('table');
    var tableBody = document.createElement('tbody');

    tableData.forEach(function(rowData) {

        var row = document.createElement('tr');
        rowData.forEach(function(cellData) {
        var cell = document.createElement('td');
        var p = document.createElement('p');
        p.innerHTML = "<a href="+cellData[1]+" title="+cellData[0]+">"+cellData[0]+"</a>";
        cell.appendChild(p);
        //cell.appendChild(document.createTextNode(cellData));
        row.appendChild(cell);

    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  var afl = document.getElementById("article-field-list");
  afl.removeChild(afl.childNodes[0]);

  afl.appendChild(table);
    //alert(table);
    console.log(table);
    return table;
}



// This function is called when the user hovers the mouse over a node.
// It will highlight this node and all other nodes with the same name.
    function highlight() {
        var name = d3.select(this).attr("name");
        var col = d3.select(this).style("fill");
        d3.selectAll("path")
            .filter(function (d) {
                return d3.select(this).attr("name") === name;
            })
            .style('fill', 'orange')
            .style('stroke', '#ff0d3c')
            .style("stroke-width", "3");
    };
//d3.select(self.frameElement).style("height", height + "px");
// [From template]
// Used to rotate the sunburst text.

    function getAngle(d) {
        //alert("angle");
        // Offset the angle by 90 deg since the '0' degree axis for arc is Y axis, while
        // for text it is the X axis.
        var thetaDeg = (180 / Math.PI * (arc.startAngle()(d) + arc.endAngle()(d)) / 2 - 90);
        // If we are rotating the text by more than 90 deg, then "flip" it.
        // This is why "text-anchor", "middle" is important, otherwise, this "flip" would
        // a little harder.
        return (thetaDeg > 90) ? thetaDeg - 180 : thetaDeg;
    }

    d3.select("#highlightWord").on("input", function () {
        var name = this.value;
        d3.selectAll("path")
            .filter(function (d) {
                return d3.select(this).attr("name") === name;
            })
            .style('fill', 'orange')
            .style('stroke', '#ff0d3c')
            .style("stroke-width", "3");
    });

}();