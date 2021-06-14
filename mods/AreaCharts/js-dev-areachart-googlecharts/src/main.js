/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

//@ts-check - Get type warnings from the TypeScript language server. Remove if not wanted.
const START_DATE_PROP_NAME = "startDateFilterString";
const END_DATE_PROP_NAME = "endDateFilterString";


/**
 * Wrap a reader with an additional method called `hasChanged`.
 * It allows you to check whether a value is new or unchanged since the last time the subscribe loop was called.
 * @function
 * @template A
 * @param {A} reader
 * @returns {A & {hasValueChanged(value: any):boolean}}
 */
function readerWithChangeChecker(reader) {
    let previousValues = [];
    let currentValues = [];
    function compareWithPreviousValues(cb) {
        return function compareWithPreviousValues(...values) {
            previousValues = currentValues;
            currentValues = values;
            return cb(...values);
        };
    }

    return {
        ...reader,
        subscribe(cb) {
            // @ts-ignore
            reader.subscribe(compareWithPreviousValues(cb));
        },
        hasValueChanged(value) {
            return previousValues.indexOf(value) == -1;
        }
    };
}

/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async mod => {

    const context = mod.getRenderContext();

    /**
    * Load google charts library
    */
    // @ts-ignore
    await google.charts.load("current", { packages: ['corechart', 'controls'] });

    /**
     * Create the read function - its behavior is similar to native requestAnimationFrame, except
     * it's triggered when one of the listened to values changes. We will be listening for data,
     * properties and window size changes.
     */
    const reader = readerWithChangeChecker(mod.createReader(
        mod.visualization.data(),
        mod.visualization.axis("X"),
        mod.windowSize()
    ));
    reader.subscribe(render);

    /**
     * Aggregates incoming data and renders the chart
     *
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Axis} xAxis
     */
    async function render(dataView, xAxis) {
        /**
         * Check for any errors. 
         */
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Showing an error overlay will hide the mod iframe.
            // Clear the mod content here to avoid flickering effect of
            // an old configuration when next valid data view is received.
            mod.controls.errorOverlay.show(errors);
            document.getElementById("chart-container").innerHTML = "";
            document.getElementById("control-container").innerHTML = "";

            return;
        }

        let hasX = await dataView.categoricalAxis("X") != null;
        let hasY = await dataView.continuousAxis("Y") != null;
        if (!hasX || !hasY) {
            mod.controls.errorOverlay.show(["X and Y axis must both have an expression to have any data."]);
            return;
        }

        mod.controls.errorOverlay.hide();

        /**
         * Get the x hierarchy.
         */
        const xHierarchy = await dataView.hierarchy("X", true);

        //let isDate = (xAxis.expression.match(/BinByDateTime.*Year\.(Quarter|Month)/) !== null) || (xHierarchy.levels.length === 1 && xHierarchy.levels[0].dataType.isDate());
        let isDate = false;
        if(xHierarchy.levels.length > 1){
            isDate = xHierarchy.levels[0].name.includes("Year");
        } else {
            isDate = xHierarchy.levels[0].dataType.isDate();
        }

        //let xAxis = await mod.visualization.axis("X");
        let isDatetime = isDate || xAxis.expression.match(/BinByDateTime/) !== null;
        
        /**
         * Get rows from dataView
         */
        // let hasExpired = await dataView.hasExpired();
        // console.log("has expired : "+hasExpired);
        const rows = await dataView.allRows();
        if (rows == null || rows.length === 0) {
            // User interaction caused the data view to expire.
            // Don't clear the mod content here to avoid flickering.
            return;
        }

        let min = null;
        let max = null; // determine range to check doc props
        let data = rows.map(row => {
            let x = row.categorical("X");
            // let valDate = x.value().reduce((acc, value) => {
            //     let sep = acc.length > 0 ? "-" : "";
            //     return (acc + sep + value.key);
            // }, "");
            //let date = new Date(valDate);

            let date = formatValue(x, isDatetime, xHierarchy);
            // Determining range to check doc props on 1st render
            if (!min || date < min) {
                min = date;
            }
            if (!max || date > max) {
                max = date;
            }
            return ([date, row.continuous("Y").value()]);
        });
        data.unshift(["X", "Y"]);

        // @ts-ignore
        data = google.visualization.arrayToDataTable(data);

        /**
         * Extract styling from mod render context
         */
        const styling = context.styling;
        const textStyle = {
            fontSize: styling.scales.font.fontSize,
            fontName: styling.scales.font.fontFamily,
            color: styling.scales.font.color
        };

        const baselineColor = styling.scales.line.stroke;
        const gridlines = { color: "transparent" };

        let format;
        if(!isDate && (xHierarchy.levels[0].dataType.name !== "DateTime")){ // avoids auto-generated labels
            format = ' ';
        }

        /**
         * Prepare options object taking into account the spotfire theme and mod properties
         */
        const chartOptions = {
            backgroundColor: { fill: "transparent" },
            legend: { position: "none" },
            colors: ['#bed2e6'],
            chartArea: { width: '90%' },
            hAxis: {
                textStyle,
                baselineColor,
                slantedText: true,
                slantedTextAngle: 60,
                format:format,
                //showTextEvery: 2,
                gridlines
            },
            vAxis: {
                textStyle,
                baselineColor,
                gridlines//,
                //minValue: 0
            }
        };

        const controlOptions = {
            filterColumnIndex: 0,
            enableInteractivity: true,
            ui: {
                chartType: 'AreaChart',
                snapToData: true,
                chartOptions: {
                    colors: ['#bed2e6'],
                    chartArea: { width: '90%', height: 30 },
                    hAxis: {
                        slantedText: true,
                        slantedTextAngle: 60,
                        gridlines,
                        //showTextEvery: 5,
                        //format: 'MMM/yy'
                        format: ' '
                    },
                    vAxis: {
                        textPosition: 'none'
                    }
                }
            }
        };


        let docProps = await mod.document.properties();
        let minDate, maxDate;
        docProps.forEach(docProp => {
            if (docProp.name === START_DATE_PROP_NAME) {
                minDate = docProp.value();
            } else if (docProp.name === END_DATE_PROP_NAME) {
                maxDate = docProp.value();
            }
        });

        let initState;
        if (isDate && min && max && minDate && maxDate) {
            initState = { range: { start: min, end: max } };

            // Calc min and max for rangefilter
            minDate = parseDate(minDate);
            let resetStart = false;
            let resetStop = false;
            if (min < minDate && minDate < max) {
                // @ts-ignore
                initState.range.start = minDate;
            } else {
                resetStart = true;
            }

            maxDate = parseDate(maxDate);
            if (min < maxDate && maxDate < max) {
                // @ts-ignore
                initState.range.end = maxDate;
            } else {
                resetStop = true;
            }

            if (resetStart || resetStop) {
                mod.transaction(() => {
                    if (resetStart) {
                        mod.document.property(START_DATE_PROP_NAME).set(formatDate(min));
                    }
                    if (resetStop) {
                        mod.document.property(END_DATE_PROP_NAME).set(formatDate(max));
                    }
                });
            }
        }

        //Create a dashboard.
        // @ts-ignore
        const dashboard = new google.visualization.Dashboard(
            document.getElementById('dashboard-div'));

        // Create a  chart, passing some options
        // @ts-ignore
        const chart = new google.visualization.ChartWrapper({
            'chartType': 'AreaChart',
            'containerId': 'chart-container',
            'options': chartOptions
        });

        // @ts-ignore
        const controlRangeFilter = new google.visualization.ControlWrapper({
            controlType: 'ChartRangeFilter',
            containerId: 'control-container',
            options: controlOptions,
            state: initState
        });

        /**
         * Draw the chart using data and options
         */
        dashboard.bind(controlRangeFilter, chart);
        dashboard.draw(data);


        if (isDate && minDate && maxDate) {
            // @ts-ignore
            google.visualization.events.addListener(controlRangeFilter, 'statechange', function () {
                UpdatePropsRange();
            });
        }

        // @ts-ignore
        google.visualization.events.addListener(chart, "select", selectHandler_chart);

        /**
        * Add click events for background and both axes
        */
        // @ts-ignore
        google.visualization.events.addListener(chart, "click", ({ targetID, x, y }) => {
            if (targetID == "chartarea") {
                dataView.clearMarking();
                return;
            }
        });

        /**
         * Trigger render complete when chart is ready
         */
        // @ts-ignore
        google.visualization.events.addListener(chart, "ready", async () => {
            context.signalRenderComplete();
        });

        // @ts-ignore
        google.visualization.events.addListener(chart, 'error', function (error) {
            // @ts-ignore
            google.visualization.errors.removeError(error.id);
            console.error(error.message);
        });

        // @ts-ignore
        google.visualization.events.addListener(controlRangeFilter, 'error', function (error) {
            // @ts-ignore
            google.visualization.errors.removeError(error.id);
            console.error(error.message);
        });





        function UpdatePropsRange() {
            let state = controlRangeFilter.getState();
            let start = formatDate(state.range.start);
            let end = formatDate(state.range.end);
            // console.log(_start, _end);
            mod.transaction(() => {
                mod.document.property(START_DATE_PROP_NAME).set(start);
                mod.document.property(END_DATE_PROP_NAME).set(end);
            });
        }

        /**
         * Add event listener for row selection
         */
        function selectHandler_chart() {
            var selection = chart.getChart().getSelection()[0];

            if (!selection) return;
            const { row } = selection;
            const xIndex = row;
            //const colorIndex = (column - 1) / 2;
            selectRow(xIndex);
        };

        /**
         * Select a row by `x`.
         */
        function selectRow(xIndex) {
            rows.forEach(row => {
                // @ts-ignore
                //var rowColorIndex = !colorHierarchy.isEmpty ? row.get("Color").leafIndex : 0;
                var rowXIndex = !xHierarchy.isEmpty ? row.categorical("X").leafIndex : 0;
                if (rowXIndex == xIndex) {
                    row.mark();
                }
            });
        }
    }

    function formateDateTime(currentdate) {
        //Format time parts to 2 digits
        let currentHours = currentdate.getHours();
        currentHours = ("0" + currentHours).slice(-2);
        let currentMinutes = currentdate.getMinutes();
        currentMinutes = ("0" + currentMinutes).slice(-2);
        let currentSeconds = currentdate.getSeconds();
        currentSeconds = ("0" + currentSeconds).slice(-2);
        //Create final date time format
        var datetime = (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + "/"
            + currentdate.getFullYear() + " "
            + currentHours + ":"
            + currentMinutes + ":"
            + currentSeconds;
        return datetime;
    }

    function formatDate(currentdate) {
        //Create final date time format
        var datetime = (currentdate.getFullYear()) + "-"
            + (currentdate.getMonth() + 1) + "-"
            + currentdate.getDate();
        return datetime;
    }

    function parseDate(strDate){
        let parts = strDate.split("-");
        return new Date(parts[0], parts[1]-1, parts[2]);
    }

    function formatValue(value, isDate, hierarchy) {
        let result;
        if (isDate) {
            if (hierarchy.levels.length > 1) {
                if (hierarchy.levels[0].name === "Hour") {
                    // we expect only 3 levels : Hour > Minute > Second
                    result = value.value().map(val => { val.value() }); // "timeofday" type in googlecharts 
                } else {
                    // Should begin with Year
                    result = new Date("1970-01-01");
                    let pathEls = value.value();
                    for (let i = 0, len = pathEls.length; i < len; i++) {
                        switch (hierarchy.levels[i].name) {
                            case "Year":
                            case "FiscalYear":
                                result.setFullYear(pathEls[i].value());
                                break;
                            case "Quarter":
                            case "FiscalQuarter":
                                if (i + 1 === len) { 
                                    result.setMonth(pathEls[i].value() - 1); //TODO : should we use last month of quarter instead (x3)
                                }
                                break;
                            case "Month":
                            case "FiscalMonth" :
                                result.setMonth(pathEls[i].value() - 1);
                                break;
                            case "DayOfMonth":
                                result.setDate(pathEls[i].value());
                                break;
                        }
                    }
                }
            } else {
                result = value.value()[0].value();
            }
        } else {
            if (hierarchy.levels.length > 1) {
                value.leafIndex;
            } else {
                if (hierarchy.levels[0].dataType.name === "DateTime") {
                    result = new Date(parseInt(value.value()[0].key));
                } else {
                    result = value.leafIndex;
                }
            }
        }
        return (result);
    }
});
