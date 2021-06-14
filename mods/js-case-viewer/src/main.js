/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

//@ts-check
Spotfire.initialize(async function (mod) {

    // Get the render context
    const context = mod.getRenderContext();


    // Format tooltip text
    function formatTooltipText(text) {
        return text.replace("<", "").replace(">", "").replace("[", "").replace("]", "");
    }

    // Calculate the delay be
    function calcDelay(sched, est) {
        if (est == null || sched == null) return null;
        return est.getTime() - sched.getTime();
    }

    // Format a delay
    function formatDelay(sched, est) {
        var one_minute = 60 * 1000;
        var delay = calcDelay(sched, est);

        if (delay == null) return '';

        var delay = Math.round(delay / one_minute);
        if (isNaN(delay))
            return '';
        else if (delay >= 0)
            return '  +' + delay;
        else if (delay < 0)
            return '  ' + delay;
    }

    // Sets a delay class based on scheduled and estimated times
    function setDelayClass(sched, est, div) {
        // remove all existing delay classes
        div.classList.remove('early');
        div.classList.remove('ontime');
        div.classList.remove('late');

        var one_minute = 60 * 1000;
        var delay = calcDelay(sched, est);

        if (delay > 0 && Math.abs(delay) > one_minute)
            div.classList.add('late');
        else if (delay < 0 && Math.abs(delay) > one_minute)
            div.classList.add('early');
        else
            div.classList.add('ontime');
    }

    // Get the timezone offset in minutes for a given date and timezone
    function getTimezoneOffset(d, tz) {
        let a = d.toLocaleString("ja", { timeZone: tz }).split(/[\/\s:]/);
        a[1]--;
        let t1 = Date.UTC.apply(null, a);
        let t2 = new Date(d).setMilliseconds(0);
        return (t2 - t1) / 60 / 1000;
    }

    // Formats a date to HH:mm:ss
    function formatDateToTime(date) {
        if (date == null) return '';

        let h = new String(date.getHours());
        let m = new String(date.getMinutes());
        let s = new String(date.getSeconds());

        return (h.length == 1 ? '0' : '') + h + ":" +
            (m.length == 1 ? '0' : '') + m + ":" +
            (s.length == 1 ? '0' : '') + s;
    }

    // Convert a timestamp to local timezone
    function timestampToDate(timestamp, tz) {
        if (timestamp == null || timestamp == 0) return null;

        // Calculate timezone offset, server time minus configured time
        let tz_offset = 0;
        if (tz != null) {
            let d = new Date(timestamp);
            tz_offset = d.getTimezoneOffset() - getTimezoneOffset(d, tz);
            tz_offset = tz_offset * 60 * 1000;
        }

        return new Date(timestamp + tz_offset);
    }

    /**
     * Prepares data and call drawViz
     * 
     * @param {Spotfire.DataView} dataView
     * 
     */
    async function renderCore(dataView) {
        const vizElem = document.querySelector(".content"); // Visualization target
        vizElem.innerHTML = '';

        let rows = await dataView.allRows();
        if (rows === null || rows.length === 0){
            drawNoData();
            return;
        }

        // Reset arrays
        let allData = new Map();

        // Iterate over rows and push into arrays
        rows.forEach(function (row) {
            let compareBy = row.categorical("Compare by").formattedValue("");
            let activity = {
                rowId: Number(row.categorical("Order by").formattedValue("")),
                name: row.categorical("Name").formattedValue(""),
                start: row.categorical("Start").formattedValue(""),
                end: row.categorical("End").formattedValue(""),
                color: row.color().hexCode,
                resource: row.categorical("Resource").formattedValue("")
            }
            let data = allData.get(compareBy);
            if(typeof data === "undefined") {
                data = [];
                allData.set(compareBy, data);
            }
            data.push(activity);
        });

        allData.forEach( (data, key) => {
            data.sort(function (a, b) { return a["rowId"] - b["rowId"] });
            drawViz(data, key);
        });
        
    }

    /**
     * Renders viz
     * 
     * @param {{rowId:number, name: string, start: any, end: any, color: any, resource: string}[]} data
     * 
     */
    function drawViz(data, title) {

        // Get the visualization element
        const container = document.querySelector(".content"); // Visualization target
        let vizElem = document.createElement("div");
        vizElem.classList.add("visualization");
        vizElem.classList.add("trip-stops-list");
        container.appendChild(vizElem);

        let titleElem = document.createElement("div");
        titleElem.appendChild(document.createTextNode(title));
        titleElem.classList.add("title");
        vizElem.appendChild(titleElem);


        // If there is no data then display no data message
        if (data.length == 0) {
            drawNoData();
            return;
        }

        // Iterate over the data list
        for (let idx = 0; idx < data.length; idx++) {
            let stop = data[idx];

            // Draw the stop
            drawStop(vizElem, stop, idx < (data.length - 1));
        }



    }

    // Draw no data message
    function drawNoData() {
        // Get the visualization element
        const vizElem = document.querySelector(".content"); // Visualization target
        vizElem.innerHTML = '';

        let noDataElem = document.createElement("div");
        noDataElem.classList.add("no-data");
        noDataElem.appendChild(document.createTextNode("No data found"));
        vizElem.appendChild(noDataElem);
    }


    /**
     * Draw UI for a single stop
     *
     * @param {{ rowId: number, name: string, start: any, end: any, color: any, resource: string }} activity
     * @param {boolean} isNotLast
     */
    function drawStop(vizElem, activity, isNotLast) {
        let stopElem = document.createElement("div");
        stopElem.classList.add("trip-stop");
        vizElem.appendChild(stopElem);

        // Stop graphics
        let stopGraphicContainer = document.createElement("div");
        stopGraphicContainer.classList.add("trip-stop-graphic-container");

        stopElem.appendChild(stopGraphicContainer);
        stopGraphicContainer.innerHTML =
            '<svg>' +
            ( isNotLast ? '<rect x="16" y="26" width="8" height="60" fill="'+activity.color+'"></rect>' : '') +
            '<circle cx="20" cy="15" r="10" stroke-width="4" stroke="'+activity.color+'" fill="none" />' +
            '</svg>';

        // Stop details
        let stopDetailContainer = document.createElement("div");
        stopDetailContainer.classList.add("trip-stop-detail-container");
        stopElem.appendChild(stopDetailContainer);

        // Stop name
        let stopDetailStop = document.createElement("div");
        stopDetailStop.classList.add("trip-stop-detail-stop");
        stopDetailStop.appendChild(document.createTextNode(activity.name));
        stopDetailContainer.appendChild(stopDetailStop);

        // Stop scheduled
        let stopDetailSchedule = document.createElement("div");
        stopDetailSchedule.classList.add("trip-stop-detail-schedule");
        stopDetailContainer.appendChild(stopDetailSchedule);

        // Stop scheduled arr
        let stopDetailScheduleArr = document.createElement("div");
        stopDetailScheduleArr.classList.add("arr");
        stopDetailScheduleArr.appendChild(document.createTextNode(activity.start));
        stopDetailSchedule.appendChild(stopDetailScheduleArr);

        // Stop scheduled dep
        let stopDetailScheduleDep = document.createElement("div");
        stopDetailScheduleDep.classList.add("dep");
        stopDetailScheduleDep.appendChild(document.createTextNode(activity.end));
        stopDetailSchedule.appendChild(stopDetailScheduleDep);

        // Stop estimated
        let stopDetailEstimated = document.createElement("div");
        stopDetailEstimated.classList.add("trip-stop-detail-realtime");
        stopDetailContainer.appendChild(stopDetailEstimated);

        // Stop estimated arr
        let stopDetailEstimatedArr = document.createElement("div");
        stopDetailEstimatedArr.classList.add("arr");
        stopDetailEstimatedArr.appendChild(document.createTextNode(activity.resource));
        stopDetailEstimated.appendChild(stopDetailEstimatedArr);
    }


    // --------------------------------------------------------------------------------
    // DATA EVENT HANDLER

    // Create a read function for data changes
    const reader =  mod.createReader(
        mod.visualization.data(),
        mod.visualization.axis("Order by"),
        mod.visualization.axis("Name"),
        mod.visualization.axis("Start"),
        mod.visualization.axis("End"),
        mod.windowSize()
    );

    // Call the read function to schedule an onChange callback (one time)
    reader.subscribe(onChange);

    /**
     * onChange handler
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Axis} orderByAxis
     * @param {Spotfire.Axis} nameAxis
     * @param {Spotfire.Axis} startAxis
     * @param {Spotfire.Axis} endAxis
     */
    async function onChange(dataView, orderByAxis, nameAxis, startAxis, endAxis) {
        // Check if any error
        let errors = await dataView.getErrors();
        if(errors && errors.length > 0){
            onError(errors);
        }

        // Draw viz
        renderCore(dataView);

        context.signalRenderComplete();
    }
    /**
     * Error handler triggered when the read call fails, or configuration is invalid.
     * @param {string[]} errorMessages
     */
    function onError(errorMessages) {
        console.log(errorMessages.toString());
    }

}); // end Spotfire

