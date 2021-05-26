/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

// Import the Spotfire module
import { Spotfire } from "./api";

// Import needed types
import { DatasetRecords, FilterController } from "./filterController";

// Starting point for every mod
Spotfire.initialize(async mod => {
    // Used later to inform Spotfire that the render is complete
    let context = mod.getRenderContext();
    let filterController = new FilterController(mod);

    // Create a reader object that reacts only data and window size changes
    let reader = mod.createReader(
        mod.visualization.data(), 
        mod.visualization.axis("Values"),
        mod.visualization.axis("Datasets"),
        mod.windowSize());

    reader.subscribe(render);
        
    /**
     * Render
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Axis} valueAxis
     * @param {Spotfire.Axis} datasetAxis
     */
    async function render(dataView: Spotfire.DataView, valueAxis: Spotfire.Axis, datasetAxis: Spotfire.Axis) {
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Data view contains errors. Display these and clear the chart to avoid
            // getting a flickering effect with an old chart configuration later.
            mod.controls.errorOverlay.show(errors, "DataView");
            return;
        }
        
        let isOk = checkInputs(valueAxis, datasetAxis);
        if(!isOk){
            return;
        }

        let hasDataset = await dataView.categoricalAxis("Datasets") != null;
        let hasValue = await dataView.continuousAxis("Values") != null;
        if(!hasDataset || !hasValue){
            mod.controls.errorOverlay.show("Datasets and Values axes must be set.", "DataView");
            return;
        }


        mod.controls.errorOverlay.hide("DataView");
        let rows = await dataView.allRows();
        if (rows == null) {
            // Return and wait for next call to render when reading data was aborted.
            // Last rendered data view is still valid from a users perspective since
            // a document modification was made during a progress indication.
            return;
        }
        
        
        let exprName = valueAxis.parts[0].displayName;

        let data: DatasetRecords = {};
        for(let i=0, len = rows.length; i < len; i++){
            let datasetName = rows[i].categorical("Datasets").value()[0].key!;
            let value = rows[i].continuous("Values").formattedValue()!;

            if (!data[datasetName]) {
                data[datasetName] = { values: [], rows: []};
            }
            data[datasetName].values.push(value + " " + exprName);
            data[datasetName].rows.push(rows[i]);
        }

        filterController.updateRecords(data);

        //

        // Inform Spotfire that the render is complete (needed for export)
        context.signalRenderComplete();
    }

    /**
     * @param {Spotfire.Axis} valueAxis
     * @param {Spotfire.Axis} datasetAxis
     */
    function checkInputs(valueAxis: Spotfire.Axis, datasetAxis: Spotfire.Axis){

        if(datasetAxis.expression != "<[Axis.Subsets.Names]>"){
            mod.transaction( () => {
                datasetAxis.setExpression("<[Axis.Subsets.Names]>");
            });

            return false;
        }

        return true;
    }
});
