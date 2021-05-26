/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

// Import the Spotfire module
import { Spotfire } from "./api";
// Import needed types

// Starting point for every mod
Spotfire.initialize(async api => {
    // Used later to inform Spotfire that the render is complete
    const context = api.getRenderContext();

    let cardContainer = document.getElementById("card-container");
    if (cardContainer === null) {
        cardContainer = document.createElement("div");
        cardContainer.id = "card-container";
        cardContainer.classList.add("card-container");
        document.body.appendChild(cardContainer);
    }

    // Create a reader object that reacts only data and window size changes
    let reader = api.createReader(
        api.visualization.data(),
        api.visualization.axis("Key")
    );

    reader.subscribe(render);

    async function render(dataView: Spotfire.DataView, keyAxis: Spotfire.Axis) {
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Data view contains errors
            api.controls.errorOverlay.show(errors, "DataView");
            if (cardContainer != null) {
                cardContainer.innerHTML = "";
            }
            return;
        }

        let isOk = checkInputs(keyAxis);
        if(!isOk){
            return;
        }

        api.controls.errorOverlay.hide("DataView");
        let rows = await dataView.allRows();
        if (rows == null) {
            // Return and wait for next call to render when reading data was aborted.
            // Last rendered data view is still valid from a users perspective since
            // a document modification was made during a progress indication.
            return;
        }

        if (cardContainer != null) {
            cardContainer.innerHTML = "";
        }

        rows.forEach((row) => {
            let card = document.createElement("div");
            card.classList.add("card");

            let title = document.createElement("div");
            title.classList.add("card-title");
            title.innerHTML = row.categorical("Key").formattedValue();

            card.appendChild(title);

            let value = document.createElement("div");
            value.classList.add("card-value");
            value.innerHTML = row.continuous("Value").value() ?? "";

            card.appendChild(value);

            cardContainer?.appendChild(card);
        });

        // Inform Spotfire that the render is complete (needed for export)
        context.signalRenderComplete();
    }

    /**
     * Checks input :
     * Sets '(Column Names)' on the 'Keys' axis
     * @param  {Spotfire.Axis} keyAxis 
     */
    async function checkInputs(keyAxis: Spotfire.Axis) {
        if (keyAxis.expression !== "<[Axis.Default.Names]>") {
            keyAxis.setExpression("<[Axis.Default.Names]>");
            return false;
        }
        return true;
    }

});
