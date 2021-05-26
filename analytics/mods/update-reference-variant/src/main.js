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
Spotfire.initialize(async (mod) => {

    const docPropName = "updateReference";
    let variantIds = "";
    initButtons();

    /**
     * Create the read function.
     */
    const reader = mod.createReader(mod.visualization.data(),  mod.visualization.axis("Variant IDs"));

    /**
     * Store the context.
     */
    const context = mod.getRenderContext();

    /**
     * Initiate the read loop
     */
    reader.subscribe(render);

    /**
     * @param {Spotfire.DataView} dataView
     */
    async function render(dataView, valueAxis) {
        /**
         * Check the data view for errors
         */
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            // Showing an error overlay will hide the mod iframe.
            // Clear the mod content here to avoid flickering effect of
            // an old configuration when next valid data view is received.
            mod.controls.errorOverlay.show(errors);
            return;
        }

        if(!checkInputs(valueAxis)){
            return;
        }

        mod.controls.errorOverlay.hide();

        /**
         * Get rows from dataView
         */
        const rows = await dataView.allRows();
        if (rows == null || rows.length == 0) {
            // User interaction caused the data view to expire.
            // Don't clear the mod content here to avoid flickering.
            return;
        }

        if(rows.length > 1 ){
            console.warn("DataView contains more than one row.");
        }

        variantIds = rows[0].continuous("Variant IDs").value();

        /**
         * Signal that the mod is ready for export.
         */
        context.signalRenderComplete();
    }

    /**
     * @param {Spotfire.Axis} valueAxis
     */
    function checkInputs(valueAxis) {
        let isOk = true;

        if(valueAxis.expression != "UniqueConcatenate([variant_id])"){
            console.warn("\"Variant IDs\" axis not properly set. It should be set with \"UniqueConcatenate([variant_id])\"");
            isOk = false;
        }

        return(isOk);
    }

    function initButtons(){
        let addBtn = document.getElementById("addBtn");
        let removeBtn = document.getElementById("removeBtn");

        // TODO :
        addBtn.addEventListener('click', () => { updateReference(true); });
        removeBtn.addEventListener('click', () => { updateReference(false); });
    }

    async function updateReference(add){
        if(!variantIds){
            return;
        }

        let docProp = await mod.document.property(docPropName).catch(() => undefined);
        if(docProp){
            let updateArgs;
            if(add){
                updateArgs = "1:" + variantIds;
            }else{
                updateArgs = "0:" + variantIds;
            }
            docProp.set(updateArgs);
        }else{
            console.warn("Document property \"" + docPropName + "\" does not exist. Doing nothing.");
        }
    }
});
