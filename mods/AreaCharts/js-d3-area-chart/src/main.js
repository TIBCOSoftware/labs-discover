/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

//@ts-check - Get type warnings from the TypeScript language server. Remove if not wanted.

/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async mod => {
    /**
     * Create the read function
     */
    const reader = mod.createReader(
        mod.visualization.data(),
        mod.windowSize()
    );

    reader.subscribe(render);

    /**
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} windowSize
     */
    // @ts-ignore
    async function render(dataView, windowSize) {
        // @ts-ignore
        var parseDate = d3.timeParse("%Y-%m-%d");
        /**
         * Get rows from dataView
         */
        const rows = await dataView.allRows();
        let data = rows.map(row => {
            let x = row.categorical("X");
            // @ts-ignore
            let date = x.value().reduce((acc,value) => {
                let sep = acc.length > 0 ? "-" : "";
                return(acc + sep + value.key);
            }, "");
            return ({ x: parseDate(date), y: row.continuous("Y").value() });
        });

        renderChart(data, windowSize);
    }

    // @ts-ignore
    function renderChart(data, windowSize) {

        document.getElementById("mod-container").innerHTML = "";
        // @ts-ignore
        var svg = d3.select("#mod-container").append("svg").attr("width", windowSize.width).attr("height", windowSize.height),
            margin = { top: 20, right: 20, bottom: 110, left: 40 },
            margin2 = { top: windowSize.height - 70, right: 20, bottom: 30, left: 40 },
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            height2 = +svg.attr("height") - margin2.top - margin2.bottom;

        // @ts-ignore
        // var parseDate = d3.timeParse("%Y-%M-%d");

        // @ts-ignore
        var x = d3.scaleTime().range([0, width]),
            // @ts-ignore
            x2 = d3.scaleTime().range([0, width]),
            // @ts-ignore
            y = d3.scaleLinear().range([height, 0]),
            // @ts-ignore
            y2 = d3.scaleLinear().range([height2, 0]);

        // @ts-ignore
        var xAxis = d3.axisBottom(x),
            // @ts-ignore
            xAxis2 = d3.axisBottom(x2),
            // @ts-ignore
            yAxis = d3.axisLeft(y);

        // @ts-ignore
        var brush = d3.brushX()
            .extent([[0, 0], [width, height2]])
            // @ts-ignore
            .on("brush end", brushed);

        // @ts-ignore
        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            // @ts-ignore
            .on("zoom", zoomed);

        // @ts-ignore
        var area = d3.area()
            // @ts-ignore
            .curve(d3.curveMonotoneX)
            .x(function (d) { return x(d.x); })
            .y0(height)
            .y1(function (d) { return y(d.y); });

        // @ts-ignore
        var area2 = d3.area()
            // @ts-ignore
            .curve(d3.curveMonotoneX)
            .x(function (d) { return x2(d.x); })
            .y0(height2)
            .y1(function (d) { return y2(d.y); });

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // @ts-ignore
        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // @ts-ignore
        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        // @ts-ignore
        x.domain(d3.extent(data, function (d) { return d.x; }));
        // @ts-ignore
        y.domain([0, d3.max(data, function (d) { return d.y; })]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        focus.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        context.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area2);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);

            function brushed() {
                // @ts-ignore
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                // @ts-ignore
                var s = d3.event.selection || x2.range();
                // @ts-ignore
                x.domain(s.map(x2.invert, x2));
                // @ts-ignore
                focus.select(".area").attr("d", area);
                // @ts-ignore
                focus.select(".axis--x").call(xAxis);
                // @ts-ignore
                svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                    // @ts-ignore
                    .scale(width / (s[1] - s[0]))
                    .translate(-s[0], 0));
              }
              
              function zoomed() {
                // @ts-ignore
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
                // @ts-ignore
                var t = d3.event.transform;
                // @ts-ignore
                x.domain(t.rescaleX(x2).domain());
                // @ts-ignore
                focus.select(".area").attr("d", area);
                // @ts-ignore
                focus.select(".axis--x").call(xAxis);
                // @ts-ignore
                context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
              }
    }

    
});
