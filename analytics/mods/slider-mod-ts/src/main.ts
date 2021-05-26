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
    // Used later to inform Spotfire that the render is complete
    let context = mod.getRenderContext();

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

        mod.controls.errorOverlay.hide("DataView");
        let rows = await dataView.allRows();
        if (rows == null) {
            // Return and wait for next call to render when reading data was aborted.
            // Last rendered data view is still valid from a users perspective since
            // a document modification was made during a progress indication.
            console.warn("No data.");
            return;
        }

        // If more than one row, data is inconsistent
        if (rows.length > 1) {
            console.warn("Inconsistent number of rows. There should be only one row.");
            return;
        }

        let min = rows[0].continuous<number>("min").value();
        let max = rows[0].continuous<number>("max").value();
        let step = rows[0].continuous<number>("step").value();
        let orientation = rows[0].continuous<string>("orientation").value();
        let docPropName = rows[0].continuous<string>("document property").value();

        // TODO  : check values are not null
        let container = document.getElementById("slider-container");
        if (!container) {
            console.warn("Could not find element '#slider-container'")
            return;
        }
        container.innerHTML = "";

        let rangeSlider = document.createElement("range-slider");
        /** @ts-ignore */
        rangeSlider.setAttribute("min", min);
        /** @ts-ignore */
        rangeSlider.setAttribute("max", max);
        /** @ts-ignore */
        rangeSlider.setAttribute("step", step);
        /** @ts-ignore */
        rangeSlider.setAttribute("orientation", orientation);

        if (docPropName != null) {
            let docProp = await mod.document.property<number>(docPropName).catch(() => undefined);

            if (docProp) {
                let value = docProp.value();
                if (value) {
                    if (value > max!) {
                        value = max;
                        docProp!.set(value);
                    } else if (value < min!) {
                        value = min;
                        docProp!.set(value);
                    }
                } else {
                    value = max;
                    docProp!.set(value);
                }

                /** @ts-ignore */
                rangeSlider.setAttribute("value", value);

                rangeSlider.addEventListener('sliderUpdate', ((event: CustomEvent<{ value: number }>) => {
                    event.stopPropagation();
                    docProp!.set(event.detail.value);
                }) as EventListener);
            }
        }

        container.appendChild(rangeSlider);

        // Inform Spotfire that the render is complete (needed for export)
        context.signalRenderComplete();
    });
});
