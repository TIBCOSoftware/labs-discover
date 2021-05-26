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

    // Used later to inform Spotfire that the render is complete
    let context = mod.getRenderContext();

    let allActivitiesContainer = document.getElementById("all-activities");
    let startActivitiesContainer = document.getElementById("start-activities");
    let stopActivitiesContainer = document.getElementById("stop-activities");

    allActivitiesContainer!.ondragover = onDragOver;
    allActivitiesContainer!.ondrop = onDrop;
    startActivitiesContainer!.ondragover = onDragOver;
    startActivitiesContainer!.ondrop = onDrop;
    stopActivitiesContainer!.ondragover = onDragOver;
    stopActivitiesContainer!.ondrop = onDrop;


    // Create a reader object that reacts only data and window size changes
    let reader = mod.createReader(mod.visualization.data(), mod.windowSize());

    reader.subscribe(async function render(dataView, size) {
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Data view contains errors. Display these and clear the chart to avoid
            // getting a flickering effect with an old chart configuration later.
            mod.controls.errorOverlay.show(errors, "DataView");
            return;
        }

        // Empty viz 
        allActivitiesContainer!.innerHTML = "";
        startActivitiesContainer!.innerHTML = "";
        stopActivitiesContainer!.innerHTML = "";

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

        let cardContainer : HTMLElement;

        let configProp = await mod.document.property<string>(docPropName).catch(() => undefined);
        let config : {startActivities: string[], stopActivities: string[]};
        if(configProp && configProp.value()){
            config = JSON.parse(configProp.value()!);
        }else{
            config = {startActivities: [], stopActivities: []};
        }

        rows.forEach((row, index) => {

            let activityName = row.categorical("Activity").formattedValue();
            if (config.startActivities.includes(activityName)){
                cardContainer = startActivitiesContainer!;
            } else if (config.stopActivities.includes(activityName)){
                cardContainer = stopActivitiesContainer!;
            } else {
                cardContainer = allActivitiesContainer!;
            }

            let card = createCard(activityName);
            card.id = "activity-" + index;

            cardContainer?.appendChild(card);
        });

        // Inform Spotfire that the render is complete (needed for export)
        context.signalRenderComplete();
    });

    function onDragStart(event: DragEvent) {
        const target = event.target as HTMLElement;
    
        //event.dataTransfer!.setData('text/plain', target.textContent!);
        event.dataTransfer!.setData('text/plain', target.id);
        event.dataTransfer!.dropEffect = "copy";
    
    }
    
    function onDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = "copy"
    }
    
    async function onDrop(event: DragEvent) {
    
        event.preventDefault();
        const id = event.dataTransfer?.getData('text');
        if (!id) {
            return;
        }

        const element = document.getElementById(id);
        if (!element) {
            return;
        }

        const activityName = element.textContent;

        const dropZone = event.currentTarget as HTMLElement;

        // if source zone is not "all-activities" then remove source element
        if("all-activities" !== element.parentElement?.id){
            element.parentNode!.removeChild(element);
        }

        // if target zone is not "all-activities" then add element if not present 
        if("all-activities" !== dropZone.id){

            // Check if already exists
           let existingEle = document.evaluate(".//div[text()='"+ activityName +"']", dropZone, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
           if(existingEle){
               return;  
           }
           let newCard = createCard(activityName!);
           newCard.id = dropZone.id + " - " + activityName;
           dropZone.appendChild(newCard);
        }
  
        event.dataTransfer!.clearData();
    
        // Modify doc prop with config
        let startEles = startActivitiesContainer?.querySelectorAll(".card-title");
        let startActivities : string[] = [];
        if(startEles){
            startEles.forEach( ele => {
                startActivities.push(ele.textContent!); // TODO : check textContent?
            });
        }
        let stopEles = stopActivitiesContainer?.querySelectorAll(".card-title");
        let stopActivities : string[] = [];
        if(stopEles){
            stopEles.forEach( ele => {
                stopActivities.push(ele.textContent!); // TODO : check textContent?
            });
        }
        
        let config = { startActivities: startActivities, stopActivities: stopActivities};
        let docProp = await mod.document.property<string>(docPropName).catch(() => undefined);
        if(docProp){
            docProp.set(JSON.stringify(config));
        }else{
            console.warn("Document property \"" + docPropName + "\" does not exist. Config will not be saved.");
        }
    }

    function createCard(activityName : string){
        let card = document.createElement("div");
        card.classList.add("card");
        card.draggable = true;
        card.ondragstart = onDragStart;

        let title = document.createElement("div");
        title.classList.add("card-title");
        title.innerHTML = activityName;

        card.appendChild(title);

        return(card);
    }
});

