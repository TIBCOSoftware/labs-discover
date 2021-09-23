/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

// Import the Spotfire module
import { Spotfire } from "./api";
import { FilterControls } from "./filterControls";

// Const declarations
const IN_BLOB_HIST_PROP = "outBlobHistory";
const START_TIMESTAMP_PROP = "startDateFilterString";
const END_TIMESTAMP_PROP = "endDateFilterString";


// Starting point for every mod
Spotfire.initialize(async mod => {
    // Used later to inform Spotfire that the render is complete
    const context = mod.getRenderContext();
    let config = (await mod.property<string>("config")).value();
    let filterControls = new FilterControls(mod, config!);

    /******* Readers *******/
    const dataReader = mod.createReader(
        mod.visualization.data(),
        mod.visualization.axis("Values"),
        mod.visualization.axis("Marking Axis"),
        mod.visualization.axis("Datasets"),
        mod.windowSize()
    );
    dataReader.subscribe(onDataChange);

    // const historyReader = mod.createReader(mod.document.property(IN_BLOB_HIST_PROP));
    // historyReader.subscribe(onHistoryChange);

    let startTsDocProp = await mod.document.property<string>(START_TIMESTAMP_PROP).catch(() => undefined);
    let stopTsDocProp = await mod.document.property<string>(END_TIMESTAMP_PROP).catch(() => undefined);

    if(startTsDocProp && stopTsDocProp){
        const timeRangeReader = mod.createReader(mod.document.property(START_TIMESTAMP_PROP), mod.document.property(END_TIMESTAMP_PROP));
        timeRangeReader.subscribe(onTimeRangeChange);
    }
    
    /******* End Readers *******/

    /**
     * On TimeRange History Change
     * @param {Spotfire.AnalysisProperty<string>} startTS
     * @param {Spotfire.AnalysisProperty<string>} endTS
     */
    function onTimeRangeChange(startTS: Spotfire.AnalysisProperty<string>, endTS: Spotfire.AnalysisProperty<string>) {
        let start = startTS.value();
        if (start) {
            filterControls.setStartTimestamp(start);
        }
        let end = endTS.value();
        if (end) {
            filterControls.setEndTimestamp(end);
        }
    }

    /**
     * On Filter History Change
     * @param {Spotfire.AnalysisProperty} blobHistory
     */
    // function onHistoryChange(blobHistory: Spotfire.AnalysisProperty) {
    //     let base64String: string = blobHistory.value() as string;
    //     if (base64String.length === 0) {
    //         return;
    //     }

    //     let binary = atob(base64String);
    //     if (!binary || binary.length === 0) {
    //         return;
    //     }
    //     let df = readRDS(binary)!.value;

    //     if (!df) return;

    //     let arr = df[Object.keys(df)[0]];
    //     if (arr && Array.isArray(arr)) {
    //         let nbFilters = arr.length;
    //         let badge = document.getElementById("nb-filters");
    //         if (badge) {
    //             if (nbFilters > 0) {
    //                 badge.innerText = "" + nbFilters;
    //                 badge.classList.remove("is-hidden");

    //                 filterControls.setTooltip(dfToString(df));

    //             } else {
    //                 filterControls.setTooltip("");
    //                 badge.innerText = "";
    //                 badge.classList.add("is-hidden");
    //             }
    //         }
    //     }
    // }

    /**
     * On Change
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Axis} valueAxis
     * @param {Spotfire.Axis} markingAxis
     * @param {Spotfire.Axis} datasetAxis
     * @param {Spotfire.Size} size
     */
    async function onDataChange(dataView: Spotfire.DataView, valueAxis: Spotfire.Axis, markingAxis: Spotfire.Axis, datasetAxis: Spotfire.Axis, size: Spotfire.Size) {
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Data view contains errors. Display these and clear the chart to avoid
            // getting a flickering effect with an old chart configuration later.
            mod.controls.errorOverlay.show(errors, "DataView");
            return;
        }
        
        if(!checkInputs(valueAxis, markingAxis, datasetAxis)){
            return;
        }

        mod.controls.errorOverlay.hide("DataView");

        //filterControls.setConfig()

        let rows = await dataView.allRows();
        if (rows == null || rows.length === 0) {
            // Return and wait for next call to render when reading data was aborted.
            // Last rendered data view is still valid from a users perspective since
            // a document modification was made during a progress indication.
            return;
        }

        // Check for empty axis expression before.
        //let hasValues = await dataView.continuousAxis("Values") != null;
        let filteredRows = rows.filter(row => row.categorical("Datasets").formattedValue() === "FilteredRows");
        filterControls.setFilteredRows(filteredRows);


        // Inform Spotfire that the render is complete (needed for export)
        context.signalRenderComplete();
    }


    /**
     * @param {Spotfire.Axis} valueAxis
     * @param {Spotfire.Axis} markingAxis
     * @param {Spotfire.Axis} datasetAxis
     * @return {boolean} Returns false if inputs are not valid. 
     */
    function checkInputs(valueAxis: Spotfire.Axis, markingAxis: Spotfire.Axis, datasetAxis: Spotfire.Axis){

        let isOk = true;
        mod.transaction( () => {
            if(datasetAxis.expression != "<[Axis.Subsets.Names]>"){
                datasetAxis.setExpression("<[Axis.Subsets.Names]>");
                isOk = false;
            }
    
            if(markingAxis.expression !== "count()"){
                markingAxis.setExpression("count()");
                isOk = false;
            }
        });

        return(isOk)
    }
});
