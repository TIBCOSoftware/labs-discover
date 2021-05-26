/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

// Import the Spotfire module
import { Spotfire } from "./api";
// Import needed types
import {
    DataView,
    Size,
    Axis, ModProperty
} from "spotfire-api"

// Starting point for every mod
Spotfire.initialize(async mod => {

    // Used later to inform Spotfire that the render is complete
    let context = mod.getRenderContext();

    // Create a reader object that reacts only data and window size changes
    let reader = mod.createReader(mod.visualization.data(),
        mod.visualization.axis("Keys"),
        mod.property("config"),
        mod.windowSize()
    );

    reader.subscribe(onChange);
    async function onChange(dataView: DataView, keysAxis: Axis, configProp: ModProperty<string>, size: Size) {

        let isOk = checkInputs(keysAxis);
        if (isOk) {
            await renderCore(dataView, configProp);
        }

        // Inform Spotfire that the render is complete (needed for export)
        context.signalRenderComplete();
    }

    /**
     * Checks input :
     * Sets '(Column Names)' on the 'Keys' axis
     * @param  {Axis} axis 
     */
    function checkInputs(axis: Axis) {
        if (axis.expression !== "<[Axis.Default.Names]>") {
            axis.setExpression("<[Axis.Default.Names]>");
            return false;
        }
        return true;
    }

    /**
     * Prepares data and renders kpis
     * 
     * @param {DataView} dataView
     * @param {ModProperty<string>} configProp 
     */
    async function renderCore(dataView: DataView, configProp: ModProperty<string>) {
        // Get all the dataview rows
        let rows = await dataView.allRows();
        if(rows == null){
            return;
        }

        let config = configProp.value();
        let mapping: Array<{ name: string, icon: string }> = config ? JSON.parse(config).mapping : [];

        // Transform the rows to the google visualization format.
        let data: { name: string, value: string, icon: string }[] = rows.map(row => {
            let key: string = row.categorical("Keys").value()[0].formattedValue();
            let value: string = row.continuous("Values").formattedValue();
            let iconFound = mapping.find(ele => ele.name === key);
            let icon = iconFound ? iconFound.icon : "fas fa-box-open";
            return { name: key, value: value, icon: icon };
        });

        let chart = document.querySelector('kpi-chart');
        if (chart != null) {
            /** @ts-ignore */
            chart.data = data;
            chart.addEventListener('configSaved', event => {
                /** @ts-ignore */
                configProp.set(JSON.stringify(event.detail));
            });
        }

    }
});
