/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

// Import the Spotfire module
import { Spotfire } from "./api";
// Import needed types

// Starting point for every mod
Spotfire.initialize(async mod => {

    const docPropName = "StartStopActivities";
    let startActivities = new Set<string>();
    let stopActivities = new Set<string>();
    let markedActivities = new Set<string>();

    initButtons();

    // Used later to inform Spotfire that the render is complete
    let context = mod.getRenderContext();

    // Initialize Config
    let configProp = await mod.document.property<string>(docPropName).catch(() => undefined);   
    if(configProp){ // document property exists
        // initialize config
        let propReader = mod.createReader(mod.document.property(docPropName));
        propReader.subscribe(async function configChange(newConfigProp) {
            let newConfigJson = newConfigProp.value<string>();
            let config : {startActivities : string[], stopActivities: string[]} = JSON.parse(newConfigJson!);
            config.startActivities.forEach(activity => startActivities.add(activity));
            config.stopActivities.forEach(activity => stopActivities.add(activity));
        });
    }else{
        console.warn("Document property \"" + docPropName + "\" does not exist or is empty.");
    }

    // Create a reader object that reacts only data and window size changes
    let reader = mod.createReader(mod.visualization.data()/*, mod.visualization.axis("Datasets")*/);

    reader.subscribe(async function render(dataView/*, datasetAxis*/) {
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Data view contains errors. Display these and clear the chart to avoid
            // getting a flickering effect with an old chart configuration later.
            mod.controls.errorOverlay.show(errors, "DataView");
            return;
        }

        // if(!checkInputs(datasetAxis)){
        //     return;
        // }

        mod.controls.errorOverlay.hide("DataView");
        let rows = await dataView.allRows();
        if (rows == null) {
            // Return and wait for next call to render when reading data was aborted.
            // Last rendered data view is still valid from a users perspective since
            // a document modification was made during a progress indication.
            return;
        }

        // // Check for empty axis expression before.
        // let hasActivity = await dataView.categoricalAxis("Activity") != null;


        // if(!hasActivity){
        //     return;
        // }


        // TODO: check that config doesn't contain activities not present in data (could be the case if the document properties is set from another dataset)
        markedActivities.clear();
        rows.forEach((row, index) => {

            let activityName = row.categorical("Activity").formattedValue();
            markedActivities.add(activityName);
            //let datasetName = row.categorical("Datasets").formattedValue();
        });

        // Inform Spotfire that the render is complete (needed for export)
        context.signalRenderComplete();
    });

    
    // /**
    //  * @param {Spotfire.Axis} datasetAxis
    //  */
    //  function checkInputs(datasetAxis: Spotfire.Axis){
    //      let isOk = true;
    //     mod.transaction( () => {
    //         if(datasetAxis.expression != "<[Axis.Subsets.Names]>"){
    //             isOk = false;
    //             datasetAxis.setExpression("<[Axis.Subsets.Names]>");
    //         }
    //     });

    //     return(isOk);
    // }

    function initButtons(){
        let startBtn = <HTMLElement>document.getElementById("addToStartBtn");
        let stopBtn = <HTMLElement>document.getElementById("addToStopBtn");
        let removeStartBtn = <HTMLElement>document.getElementById("removeStartBtn");
        let removeStopBtn = <HTMLElement>document.getElementById("removeStopBtn");

        // add event listeners
        startBtn.addEventListener('click', () => { addToStart(); });
        stopBtn.addEventListener('click', () => { addToStop(); });
        removeStartBtn.addEventListener('click', () => { removeFromStart(); });
        removeStopBtn.addEventListener('click', () => { removeFromStop(); });
    }

    function addToStart() {
        markedActivities.forEach(activity => {
            startActivities.add(activity);
        });
        updateConfig();

        
    }

    function addToStop() {
        markedActivities.forEach(activity => {
            stopActivities.add(activity);
        });
        updateConfig();
    }

    function removeFromStart(){
        markedActivities.forEach(activity => {
            startActivities.delete(activity);
        });
        updateConfig();
    }

    function removeFromStop(){
        markedActivities.forEach(activity => {
            stopActivities.delete(activity);
        });
        updateConfig();
    }

    async function updateConfig() {
        let config = {startActivities: Array.from(startActivities), stopActivities: Array.from(stopActivities)};

        let docProp = await mod.document.property<string>(docPropName).catch(() => undefined);
        if(docProp){
            docProp.set(JSON.stringify(config));
        }else{
            console.warn("Document property \"" + docPropName + "\" does not exist. Config will not be saved.");
        }
    }


});
