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
Spotfire.initialize(async mod => {

    const context = mod.getRenderContext();
    const { tooltip, popout } = mod.controls;
    const section = popout.section;
    const { radioButton, checkbox } = popout.components;

    let previousElements = null;
    /** @type {{cy: cytoscape.Core, layout: cytoscape.Layouts}} */
    let previousCy = null;

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
     * Create the read function - its behavior is similar to native requestAnimationFrame, except
     * it's triggered when one of the listened to values changes. We will be listening for data,
     * properties and window size changes.
     */
    const configChangeReader = readerWithChangeChecker(
        mod.createReader(
            mod.property("labelConfig"),
            mod.property("layout"),
            mod.property("nodeShape")
        )
    );

    const dataChangereader = readerWithChangeChecker(
        mod.createReader(
            mod.visualization.data(),
            mod.visualization.axis("Source"),
            mod.visualization.axis("Target"),
            mod.visualization.axis("Color"),
            mod.visualization.axis("Tooltip"),
            mod.visualization.axis("Column Names"),
            mod.visualization.axis("Datasets")
        )
    );

    const windowSizeReader = mod.createReader(mod.windowSize());

    /**
     * Initiate the read loop
     */
    windowSizeReader.subscribe(onWindowChange);
    configChangeReader.subscribe(onConfigChange);
    dataChangereader.subscribe(onDataChange);


    /**
     * 
     * @param {Spotfire.Size} windowSize 
     */
    function onWindowChange(windowSize) {
        if (previousCy) {
            previousCy.cy.resize();
            previousCy.cy.fit();
        }
    }

    /**
     * On Config change
     * @param {Spotfire.ModProperty<string>} labelConfig
     * @param {Spotfire.ModProperty<string>} selectedLayout
     * @param {Spotfire.ModProperty<string>} nodeShape
     */
    function onConfigChange(labelConfig, selectedLayout, nodeShape) {
        if (!previousCy) {
            return;
        }
        if (configChangeReader.hasValueChanged(labelConfig)) {
            updateLabels(labelConfig.value().split(";"));
        }
        if (configChangeReader.hasValueChanged(selectedLayout)) {
            let layout = previousCy.cy.layout(getCytoscapeLayout(selectedLayout.value()));
            layout.run();

        }
        if (configChangeReader.hasValueChanged(nodeShape)) {
            /** @ts-ignore */
            previousCy.cy.style(getCytoscapeStyle(nodeShape.value()));
        }
    }

    /**
     * On Change
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Axis} srcAxis
     * @param {Spotfire.Axis} tgtAxis
     * @param {Spotfire.Axis} colorAxis
     * @param {Spotfire.Axis} colNamesAxis
     * @param {Spotfire.Axis} subsetsAxis
     * @param {Spotfire.Axis} tooltipAxis
     */
    async function onDataChange(dataView, srcAxis, tgtAxis, colorAxis, tooltipAxis, colNamesAxis, subsetsAxis) {
            try {
                // Check if any error
                let errors = await dataView.getErrors();
                if (errors && errors.length > 0) {
                    onError(errors);
                    return;
                }

                let isAxisConfigOK = checkInputs(srcAxis, tgtAxis, colorAxis, tooltipAxis, colNamesAxis, subsetsAxis);
                if (isAxisConfigOK) {
                    await renderCore(dataView);
                }

                mod.controls.errorOverlay.hide("DataView");

            } catch (error) {
                //mod.controls.errorOverlay.show(["Graph rendering failed.", error.message || error], "DataView");
                console.error(error);
            }



        context.signalRenderComplete();
    }


    /**
     * Error handler triggered when the read call fails, or configuration is invalid.
     * @param {string[]} errorMessages
     */
    function onError(errorMessages) {
        console.warn("Rendering visualization failed : " + errorMessages.toString());

        // Empty visualization 
        document.getElementById("visualization").innerHTML = "";
        previousCy = null;
        previousElements = null;

        // If error is relevant to subsets or Column Names, then fix axis expression 
        // TODO : should i call checkInputs directly instead?
        let resetSubsets = false;
        let resetColNames = false;
        errorMessages.forEach(errorMessage => {
            if (errorMessage.includes("(Subsets) must be selected on a categorical axis.")) {
                resetSubsets = true;
            } else if (errorMessage.includes("'(Column Names)' must be used on a categorical axis")) {
                resetColNames = true;
            }
        });

        if (resetSubsets || resetColNames) {
            mod.transaction(() => {
                if (resetSubsets) {
                    console.log("Resetting Datasets axis.");
                    // Setting "(Subsets)" on the Datasets axis
                    const subsetsAxis = mod.visualization.axis("Datasets");
                    subsetsAxis.setExpression("<[Axis.Subsets.Names]>");
                }
                if (resetColNames) {
                    console.log("Resetting Column Names axis.");
                    // Setting "(Column Names)" on the Column Names axis
                    const colNamesAxis = mod.visualization.axis("Column Names");
                    colNamesAxis.setExpression("<[Axis.Default.Names]>");
                }
            });
        } else {
            mod.controls.errorOverlay.show(errorMessages, "DataView");
        }
    }

    /**
     * Checks input :
     * Sets '(Subsets)' on the 'Datasets' axis
     * Sets '(Column Names)' on the 'Column Names' axis
     * Removes '(Subsets)' or '(Column Names)' from other axes.
     * @param  {...Spotfire.Axis} axes 
     */
    function checkInputs(...axes) {
        let resetSubsetsAxis = false;
        let resetColNamesAxis = false;

        /** @type {Spotfire.Axis[]} */
        let axesToModify = [];
        axes.forEach(axis => {
            switch (axis.name) {
                case "Column Names": //TODO: use variable for axis names?
                    if (axis.expression !== "<[Axis.Default.Names]>") {
                        resetColNamesAxis = true;
                    }
                    break;
                case "Datasets":
                    if (axis.expression !== "<[Axis.Subsets.Names]>") {
                        resetSubsetsAxis = true;
                    }
                    break;
                default:
                    // Find axes that contain "[Axis.Default.Names]" or "[Axis.Subsets.Names]"
                    if (axis.expression.includes("[Axis.Default.Names]")
                        || axis.expression.includes("[Axis.Subsets.Names]")) {
                        axesToModify.push(axis);
                    }
            }
        });

        // Modify axes expressions outside of the loop
        mod.transaction(() => {
            if (resetSubsetsAxis) {
                console.warn("Resetting Datasets axis.");
                let subsetsAxis = axes.find(axis => axis.name === "Datasets");
                subsetsAxis.setExpression("<[Axis.Subsets.Names]>");
            }
            if (resetColNamesAxis) {
                console.warn("Resetting Column Names axis.");
                let colNamesAxis = axes.find(axis => axis.name === "Column Names");
                colNamesAxis.setExpression("<[Axis.Default.Names]>");
            }
            axesToModify.forEach(axis => {
                console.warn("Axis " + axis.name + " contains either (Subsets) or (Column Names). Resetting it.");
                let expression = axis.expression;
                expression = expression.replace("[Axis.Default.Names]", "");
                expression = expression.replace("[Axis.Subsets.Names]", "");
                expression = expression.replace("< NEST ", "<");
                expression = expression.replace(" NEST >", ">");

                axis.setExpression(expression);
            });
        });

        if (resetSubsetsAxis || resetColNamesAxis || axesToModify.length > 0) {
            return false;
        }

        return true;

        // TODO: Check number of columns in Source & Target Axes ?
        // TODO: Check for empty axis? 
    }

    /**
     * Prepares data and renders different types of graphs depending on data : 
     * - simple graph if only one subset, 
     * - simple graph if 'Cases' subset is existing,
     * - comparison of multiple subsets otherwise.
     * 
     * @param {Spotfire.DataView} dataView 

     */
    async function renderCore(dataView) {

        let tooltipAxis = await mod.visualization.axis("Tooltip");
        /** @type string */
        let labelConfig = (await mod.property("labelConfig")).value();
        /** @type string */
        let selectedLayout = (await mod.property("layout")).value();
        /** @type string */
        let nodeShape = (await mod.property("nodeShape")).value();


        // Get nodes & edges from rows
        let allElements = await getElements(dataView, labelConfig.split(";"));

        let subsets = Object.keys(allElements);
        let elements;
        if (allElements["Cases"]) {
            elements = allElements["Cases"]
        } else if (allElements["Resources"]) {
            if (subsets.length > 1) {
                //TODO : we do not support more than 2 subsets. Warn if more? 
                let allResources = subsets[1 - subsets.indexOf("Resources")];
                //let allResources = "Current Filtering";
                elements = filterResources(allElements[allResources], allElements["Resources"]);
            } else {
                elements = allElements["Resources"];
            }
        } else if (allElements["Compliance"]) {
            elements = allElements["Compliance"];
        } else {
            if(subsets.includes("Current Filtering")){
                elements = allElements["Current Filtering"];
            }else{
                elements = allElements[subsets[0]];
            }
        }

        if (!Array.isArray(elements) || elements.length == 0) {
            // Empty visualization
            document.getElementById("visualization").innerHTML = "";
            previousElements = elements;
            return;
        }

        let refCy = null;
        // Compare elements with previous ones
        // to avoid re-rendering the graph if not necessary and preserve the zoom
        // for the compliance graph we have to consider both the reference model and the uncomliant variants
        let newElements = null;
        if (subsets.length > 1 && subsets.includes("Compliance") && !subsets.includes("Cases") && !subsets.includes("Resources")) {
            newElements = elements.concat(allElements[subsets[1 - subsets.indexOf("Compliance")]]);
        } else {
            newElements = elements;
        }

        if (sameGraph(newElements, previousElements) && previousCy) {
            // Try to update current graph 
            if(updateGraph(previousCy.cy, elements, dataView, selectedLayout, nodeShape)){
                refCy = previousCy;
            }else{
                refCy = renderGraph(elements, dataView, tooltipAxis, labelConfig, selectedLayout, nodeShape, allElements["Not in Current Filtering"]);
            }
            
        } else {
            // recreate graph
            refCy = renderGraph(elements, dataView, tooltipAxis, labelConfig, selectedLayout, nodeShape, allElements["Not in Current Filtering"]);
        }

        previousCy = refCy;
        previousElements = newElements;

        if (subsets.length > 1 && subsets.includes("Compliance") && !subsets.includes("Cases") && !subsets.includes("Resources")) {
            if (subsets.length > 2) {
                console.warn("Using more than 2 subsets is not supported.");
            }

            let uncompliantVariants = subsets[1 - subsets.indexOf("Compliance")];
            // If subsets has multiple elements but does not contains "cases" then check compliance
            // TODO : handle cases where more than 2 subsets are defined? 
            checkCompliance(refCy.cy, refCy.layout, allElements[uncompliantVariants], selectedLayout);
        }

    }

    /**
     * Update edge labels
     * @param {string[]} selectedLabels
     */
    function updateLabels(selectedLabels) {
        if (!previousCy) {
            return;
        }

        previousCy.cy.edges().forEach(edge => {
            let tooltip = edge.data("tooltip");
            let rows = tooltip.split("\n");
            let label = "";
            for (let j = 0, nbTokens = rows.length; j < nbTokens; j++) {
                let index = rows[j].indexOf(":");
                if (index === -1) {
                    continue;
                }
                let key = rows[j].substring(0, index);
                if (selectedLabels.includes(key.trim())) {
                    let value = rows[j].substring(index + 1).trim();
                    label = "" ? label = value : label += "\n" + value;
                }
            }

            if (label.length > 0) {
                edge.data("label", label);
            }
        });
    }

    /**
     * @param {cytoscape.Core} cy
     * @param {any[]} elements
     * @param {Spotfire.DataView} dataView
     * @param {string} selectedLayout
     * @param {string} nodeShape
     */
    function updateGraph(cy, elements, dataView, selectedLayout, nodeShape) {
        elements.forEach(ele => {
            if (ele && ele.group && ele.data) {
                if (ele.group === "nodes") {
                    let node = cy.nodes('[id = "' + ele.data.id + '"]')[0];
                    if(!node){ // node not found
                        return false; // Update aborted
                    }
                    node.data(ele.data);
                    node.scratch("_spotfire", ele.scratch._spotfire);
                } else {
                    let edge = cy.edges('[source = "' + ele.data.source + '"][target = "' + ele.data.target + '"]')[0];
                    if(!edge){ // edge not found
                        return false; // Update aborted
                    }
                    edge.data(ele.data);
                    edge.scratch("_spotfire", ele.scratch._spotfire);
                }
            }
        });
        cy.scratch("_spotfire", { clearMarking: dataView.clearMarking });
        return true; // Update finished
    }

    /**
     * @param {any[]} elements
     * @param {any} previousElements
     * @returns {boolean}
     */
    function sameGraph(elements, previousElements) {
        if (!previousElements || !elements) {
            return false;
        }

        let previousEdges = previousElements.reduce((acc, ele) => {
            if (ele.group === "edges") {
                let edge = ele.data.source + ">" + ele.data.target;
                acc.push(edge);
            }
            return acc;
        }, []);

        let edges = elements.reduce((acc, ele) => {
            if (ele.group === "edges") {
                let edge = ele.data.source + ">" + ele.data.target;
                acc.push(edge);
            }
            return acc;
        }, []);

        // same sizes? 
        if (edges.length !== previousEdges.length) {
            return false;
        }

        for (let i = 0, len = edges.length; i < len; i++) {
            let index = previousEdges.indexOf(edges[i]);
            if (index === -1) {
                return false;
            }
            previousEdges.splice(index, 1);
        }

        return true;
    }

    /**
     * @param {any[]} allResources
     * @param {any[]} wantedResources
     */
    function filterResources(allResources, wantedResources) {

        let ids = new Set();
        wantedResources.forEach(ele => {
            if (ele.group === "nodes") {
                ids.add(ele.data.id);
            }
        });

        let validEdges = allResources.filter(ele => ((ele.group === "edges") && ((ids.has(ele.data.source)) || (ids.has(ele.data.target)))));

        ids.clear();

        validEdges.forEach(ele => {
            ids.add(ele.data.source);
            ids.add(ele.data.target)
        });

        let validNodes = allResources.filter(ele => ids.has(ele.data.id));

        return validNodes.concat(validEdges);
    }

    /**
     * Renders a simple graph 
     * 
     * @param {any[]} elements
     * @param {Spotfire.DataView} dataView 
     * @param {Spotfire.Axis} tooltipAxis
     * @param {string} labelConfig
     * @param {string} selectedLayout
     * @param {string} nodeShape
     * @param {any[]} filteredElements
     * @returns {{cy: cytoscape.Core, layout: cytoscape.Layouts}}
     */
    function renderGraph(elements, dataView, tooltipAxis, labelConfig, selectedLayout, nodeShape, filteredElements = null) {

        elements = filterValidElements(elements, filteredElements);
        normalizeSizeBy(elements);

        let cyConfig = {
            container: document.getElementById('visualization'),
            elements: elements,
            style: getCytoscapeStyle(nodeShape),
            headless: false
        };

        //@ts-ignore
        let cy = cytoscape(cyConfig);
        cy.scratch("_spotfire", { clearMarking: dataView.clearMarking });

        let layoutConfig = getCytoscapeLayout(selectedLayout);
        let layout = cy.layout(layoutConfig);
        layout.run();

        let panzoomConfig = {
            zoomFactor: 0.05, // zoom factor per zoom tick
            zoomDelay: 45, // how many ms between zoom ticks
            minZoom: 0.1, // min zoom level
            maxZoom: 10, // max zoom level
            fitPadding: 50, // padding when fitting
            panSpeed: 10, // how many ms in between pan ticks
            panDistance: 10, // max pan distance per tick
            panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
            panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
            panInactiveArea: 8, // radius of inactive area in pan drag box
            panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
            zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
            fitSelector: undefined, // selector of elements to fit
            animateOnFit: function () { // whether to animate on fit
                return false;
            },
            fitAnimationDuration: 1000, // duration of animation on fit

            // icon class names
            sliderHandleIcon: 'fa fa-minus',
            zoomInIcon: 'fa fa-plus',
            zoomOutIcon: 'fa fa-minus',
            resetIcon: 'fa fa-expand'
        };

        // add the panzoom control
        /** @ts-ignore */
        cy.panzoom(panzoomConfig);


        // Init drag and drop 
        // const options = {
        //     grabbedNode: node => true, // filter function to specify which nodes are valid to grab and drop into other nodes
        //     dropTarget: node => true, // filter function to specify which parent nodes are valid drop targets
        //     dropSibling: node => true, // filter function to specify which orphan nodes are valid drop siblings
        //     newParentNode: (grabbedNode, dropSibling) => ({}), // specifies element json for parent nodes added by dropping an orphan node on another orphan (a drop sibling)
        //     overThreshold: 10, // make dragging over a drop target easier by expanding the hit area by this amount on all sides
        //     outThreshold: 10 // make dragging out of a drop target a bit harder by expanding the hit area by this amount on all sides
        //   };

        // // @ts-ignore
        // const cdnd = cy.compoundDragAndDrop(options);

        // var isParentOfOneChild = function(node){
        //     return node.isParent() && node.children().length === 1;
        //   };
  
        //   var removeParent = function(parent){
        //     parent.children().move({ parent: null });
        //     parent.remove();
        //   };

        // cy.on('cdndout', function(event, dropTarget){
        //     if( isParentOfOneChild(dropTarget) ){
        //       removeParent(dropTarget);
        //     }
        // });

        /******** Event Handlers ********/
        // Selection or de-selection of elements in the graph
        cy.on('select unselect', function (evt) {
            // elements selected
            let eles = cy.elements(':selected');
            if (eles.length > 0) {
                mod.transaction(() => {
                    eles.forEach(element => {
                        let scratch = element.scratch("_spotfire");
                        if(scratch && scratch.row){
                            scratch.row.mark();
                        }
                    });
                });
            }

        });

        // Clear marking & hide tooltip when background is clicked
        cy.on('tap', function (evt) {
            if (evt.target === cy) {
                // clicked on background
                // dataView.clearMarking();
                cy.scratch("_spotfire").clearMarking();
                tooltip.hide(); // TODO : This was added because tooltips were sometimes not hidden just with mouseout 
            }
        });

        // Display tooltip when mouseover an element
        cy.on('mouseover', 'node, edge', function (evt) {
            let ele = evt.target;
            tooltip.show(ele.data("tooltip"));
        });

        // Hide tooltip when mouseover an element
        cy.on('mouseout', 'node, edge', function () {
            tooltip.hide();
        });

        cy.on('cxttapstart taphold', function (e) {
            popout.show(
                {
                    x: e.renderedPosition.x,
                    y: e.renderedPosition.y,
                    autoClose: false,
                    alignment: "Bottom",
                    onChange: popoutChangeHandler,
                    onClosed: onPopoutClose
                },
                popoutContent
            );
        });

        const popoutContent = () => {
            let content = [];
            /** Label content */
            content.push(section({
                heading: "Label content",
                children: tooltipAxis.parts.map(part => {
                    return (checkbox({
                        name: "labelConfig-" + part.displayName,
                        text: part.displayName,
                        checked: newSettings.labelConfig.has(part.displayName),
                        enabled: true
                    }));
                })
            }));

            /** Layout */
            content.push(section({
                heading: "Layout",
                children: [
                    radioButton({
                        name: "selectedLayout",
                        text: "cose",
                        checked: newSettings.selectedLayout === "cose",
                        value: "cose"
                    }),
                    radioButton({
                        name: "selectedLayout",
                        text: "dagre",
                        checked: newSettings.selectedLayout === "dagre",
                        value: "dagre"
                    }),
                    radioButton({
                        name: "selectedLayout",
                        text: "breadthfirst",
                        checked: newSettings.selectedLayout === "breadthfirst",
                        value: "breadthfirst"
                    }),
                    radioButton({
                        name: "selectedLayout",
                        text: "elk",
                        checked: newSettings.selectedLayout === "elk",
                        value: "elk"
                    }),
                    radioButton({
                        name: "selectedLayout",
                        text: "concentric",
                        checked: newSettings.selectedLayout === "concentric",
                        value: "concentric"
                    })
                ]
            }));

            content.push(section({
                heading: "Node shape",
                children: [
                    radioButton({
                        name: "nodeShape",
                        text: "rectangle",
                        checked: newSettings.nodeShape === "round-rectangle",
                        value: "round-rectangle"
                    }),
                    radioButton({
                        name: "nodeShape",
                        text: "ellipse",
                        checked: newSettings.nodeShape === "ellipse",
                        value: "ellipse"
                    })
                ]
            }));

            return content;
        };

        let selectedLabels = new Set(labelConfig.split(";"));
        // remove unused columns from labelConfig
        let validValues = tooltipAxis.parts.map(part => part.displayName);
        selectedLabels.forEach(label => {
            if (!validValues.includes(label)) {
                selectedLabels.delete(label);
            }
        });

        let newSettings = {
            labelConfig: selectedLabels,
            selectedLayout: selectedLayout,
            nodeShape: nodeShape
        };

        function popoutChangeHandler({ name, value }) {
            if (name.startsWith("labelConfig-")) {
                let label = name.substring(12); // removes "labelConfig-" from name
                if (value) {
                    newSettings.labelConfig.add(label);
                } else {
                    newSettings.labelConfig.delete(label);
                }
            } else {
                newSettings[name] = value;
            }
        }

        function onPopoutClose() {
            mod.transaction(() => {
                mod.property("labelConfig").set(Array.from(newSettings.labelConfig).join(";"));
                mod.property("layout").set(newSettings.selectedLayout);
                mod.property("nodeShape").set(newSettings.nodeShape);
            });
        }

        /******** End Event Handlers ********/

        return { cy, layout };
    }

    /**
     * Concatenates values on an axis 
     *
     * @param {Spotfire.DataViewContinuousValue | Spotfire.DataViewCategoricalValue} value
     * @param {Spotfire.Axis} axis
     * @param {boolean=} withTitle
     */
    function concatColValues(value, axis, withTitle = true) {
        let content = "";
        for (let i = 0, len = axis.parts.length; i < len; i++) {
            if (axis.isCategorical) {
                content += (withTitle ? axis.parts[i].displayName + ": " : "") + value.value()[i];
            } else {
                content += (withTitle ? axis.parts[i].displayName + ": " : "") + value.formattedValue();
            }

            if (i < len - 1) {
                content += "\n";
            }
        }
        return content;
    }

    // Removes nodes with no edges
    // Removes edges which source or target is inexistent
    /**
     * @param {any[]} elements
     * @param {any[]} filteredElements
     */
    function filterValidElements(elements, filteredElements = null) {
        // Check if start & stop nodes are filtered out, if so, add them back 
        if(filteredElements){
            for(let i = filteredElements.length - 1; i >= 0; i -= 1) {
                let ele = filteredElements[i];
                if (ele.group === "nodes"){
                    if((ele.data.id === "START") || (ele.data.id === "STOP")){
                        elements.push(ele);
                        filteredElements.splice(i, 1); // Remove node from filteredElements
                    }
                }else{
                    if((ele.data.source === "START") || (ele.data.target === "STOP")){
                        elements.push(ele);
                        filteredElements.splice(i, 1); // Remove node from filteredElements
                    }
                }
            }
        }

        // define a set of ids of all the nodes in elements
        let nodeIds = new Set();
        let parentIds = new Set();
        elements.forEach(ele => {
            if (ele.group === "nodes") {
                nodeIds.add(ele.data.id);
                if(ele.data.parent){
                    parentIds.add(ele.data.parent);
                }
            }
        });

        let validEdges = [];
        if(filteredElements){

            let graph = new FilteredGraph(elements, filteredElements);
            for(let i = 0, len = elements.length; i < len; i++){
                let ele = elements[i];
                if(ele.group === "edges"){
                    if(!nodeIds.has(ele.data.target)){
                        let targetEdges = graph.findValidTargets(ele);
                        validEdges.push(...targetEdges);
                    } else if(!nodeIds.has(ele.data.source)){
                        let sourceEdges = graph.findValidSources(ele.data.source);
                        for(let i = 0, len = sourceEdges.length ; i < len ; i++){
                            let newEdge = sourceEdges[i];
                            //let newEdge = JSON.parse(JSON.stringify(ele))
                            newEdge.data.target = ele.data.target;
                            //newEdge.data.source = sourceEdges[i];
                            // @ts-ignore
                            newEdge.classes = ["virtual"];
                            validEdges.push(newEdge);
                        }
                    } else {
                        validEdges.push(ele);
                    }
                }
            }
        }else{
            validEdges = elements.filter(ele => ((ele.group === "edges") && (nodeIds.has(ele.data.source)) && (nodeIds.has(ele.data.target))));
        }
        nodeIds.clear();

        validEdges.forEach(ele => {
            nodeIds.add(ele.data.source);
            nodeIds.add(ele.data.target);
        });

        nodeIds = new Set([...nodeIds, ...parentIds]);
        let validNodes = elements.filter(ele => nodeIds.has(ele.data.id));

        return validNodes.concat(validEdges);
    }

    /**
     * Normalizes the SizeBy attribute of nodes and edges
     *
     * @param {{data: {sizeBy: number}}[]} elements
     */
    function normalizeSizeBy(elements) {
        // Normalize SizeBy axis
        let values = [];
        elements.forEach(element => {
            if (element.data.sizeBy) {
                values.push(element.data.sizeBy);
            }
        });
        let min = Math.min(...values);
        let max = Math.max(...values);

        elements.forEach(element => {
            if (element.data.sizeBy) {
                element.data.sizeBy = normalizeNumber(element.data.sizeBy, min, max);
            }
        });
    }

    // TODO : check how to define type of return object
    /**
     * Aggregates incoming data and renders the graph
     *
     * @param {Spotfire.DataView} dataView
     * @param {string[]} selectedLabels
     * @returns {Promise} - object with one property per subset. eg : {subsetA : [{group: 'nodes', data: {id: 'a'}}, {group: 'nodes', data: {id: 'b'}}], subsetB: []}
     */
    async function getElements(dataView, selectedLabels) {

        let allElements = {};
        const isColorCategorical = await dataView.categoricalAxis("Color") ? true : false;
        const rows = await dataView.allRows();

        const hasParent = await dataView.continuousAxis("Parent") != null;

        rows.forEach( row => {

            // TODO use a variable instead of hardcoded axis name
            let subset = row.categorical("Datasets").value()[0].key;
            let colName = row.categorical("Column Names").formattedValue("");
            let source = row.categorical("Source").value()[0].key;
            let target = row.categorical("Target").value()[0].key;

            if(!source){
                console.warn("Null values are not supported on Source axis.");
            }

            let parent = hasParent ? row.continuous("Parent").value() : null;

            if (!allElements[subset]) {
                allElements[subset] = new Map();
            }
            /** @type {Map<string, any>} */
            let elements = allElements[subset];

            let nodeLabel = source;
            // If Color axis is categorical, we create one graph per category
            if (isColorCategorical) {
                let category = row.categorical("Color").formattedValue("");
                source = source + "_" + category;
                if (target) {
                    target = target + "_" + category;
                }

                // TODO: make sure that source and target nodes exist in the category.
                // (e.g. color by year, but a case lasted more than a year, will lead to missing nodes).
            }

            if (!target) { // An empty value means the row corresponds to a node, not an edge
                let id = source;
                let node = elements.get(id); // if multiple measures are set on a continous axis, data for a single node may take multiple rows in the dataview
                if (typeof node === "undefined") {
                    node = {
                        group: 'nodes',
                        data: {
                            id: id,
                            parent: parent != null ? "" + parent : null,
                            label: nodeLabel,
                            tooltip: "",
                            color: row.color().hexCode,
                            category: isColorCategorical ? row.categorical("Color").formattedValue("") : ""
                        },
                        selected: row.isMarked(),
                        // TODO : replace selector in spotfire-cytoscape-style.js to "Node which id equals to START or STOP"
                        classes: id.startsWith("START") ? ["start"] : (id.startsWith("STOP") ? ["stop"] : []),
                        scratch: { _spotfire: { row: row } }
                    };
                    elements.set(id, node);
                }

                /** @type {Spotfire.DataViewContinuousValue} */
                let tooltip = row.continuous("Tooltip");
                node.data.tooltip += colName + ": " + tooltip.formattedValue() + "\n";
                // TODO : review code
                if(parent){
                    elements.set("" + parent, {data: {id: "" + parent, isParent: true}});
                    if(!node.data.parent){
                        node.data.parent = "" + parent;
                    } 
                }

            } else {
                // Edge
                let id = source + "->" + target;
                let edge = elements.get(id);
                if (typeof edge === "undefined") {
                    edge = {
                        group: 'edges',
                        data: {
                            source: source,
                            target: target,
                            color: row.color().hexCode,
                            category: isColorCategorical ? row.categorical("Color").formattedValue("") : "",
                            sizeBy: row.continuous("Size by").value(),
                            tooltip: "",
                            label: ""
                        },
                        selected: row.isMarked(),
                        scratch: { _spotfire: { row: row } }
                    };
                    elements.set(id, edge);
                }

                let tooltip = row.continuous("Tooltip");
                edge.data.tooltip += colName + ": " + tooltip.formattedValue() + "\n";

                if (selectedLabels.includes(colName)) {
                    let value = tooltip.formattedValue();
                    /** @ts-ignore */
                    if (!isNaN(value)) {
                        value = (Math.round((Number.parseFloat(value) + Number.EPSILON) * 100) / 100).toString();
                    }

                    edge.data.label === "" ? edge.data.label = value : edge.data.label += "\n" + value;
                }
            }
        });

        // Convert Map properties to arrays
        /** @type {{ [x: string]: object[]; }} */
        for (const subset in allElements) {
            allElements[subset] = Array.from(allElements[subset].values());

            // Normalize SizeBy axis
            // let values = allElements[subset].reduce((acc, ele) => {
            //     if (ele.data.sizeBy) {
            //         acc.push(ele.data.sizeBy);
            //     }
            //     return acc;
            // }, []);
            // let min = Math.min(...values);
            // let max = Math.max(...values);

            // allElements[subset].forEach(element => {
            //     if (element.data.sizeBy) {
            //         element.data.sizeBy = normalizeNumber(element.data.sizeBy, min, max);
            //     }
            // });


        }

        return allElements;
    }


    /**
     * Compares graphs 
     * 
     * @param {cytoscape.Core} cy - the reference 
     * @param {cytoscape.Layouts} layout 
     * @param {cytoscape.ElementDefinition} elements - uncompliant cases
     * @param {string} selectedLayout
     */
    function checkCompliance(cy, layout, elements, selectedLayout) {

        // TODO :review code
        // looks like cytoscape diff compares edges on their id, not source & target

        let cyConfig = {
            headless: true,
            elements: elements
            //style: getCytoscapeStyle()
        };

        /** @ts-ignore */
        let uncompliantGraph = cytoscape(cyConfig);
        let diff = cy.elements().diff(uncompliantGraph.elements());

        // Left only = in reference
        if (diff.left.length > 0) {
            // add class
            diff.left.addClass("left");
        }

        if (diff.both.length > 0) {
            // add class
            diff.both.addClass("both");
        }

        // right = in selected (uncompliant) variant only
        if (diff.right.length > 0) {
            // First create nodes
            diff.right.forEach(function (ele) {
                if (ele.isEdge()) {
                    let source = ele.data("source");
                    let target = ele.data("target");

                    let existingEdges = cy.edges('[source = "' + source + '"][target = "' + target + '"]');
                    if (existingEdges.length === 0) {
                        /** @ts-ignore */
                        cy.add({ group: "edges", data: { source: source, target: target }, classes: ["right"] });
                    } else {
                        existingEdges.addClass("both");
                    }

                } else {
                    let newEle = cy.add(ele);
                    newEle.addClass("right");
                }

            });
        }

        // Then create edges
        // diff.right.forEach(function (ele) {
        //     if(ele.isNode()){
        //         let node = uncompliantGraph.getElementById(ele.id());
        //         let newEdges = node.connectedEdges();
        //         newEdges.forEach(function (e) {
        //             let srcNode = e.source().id();
        //             let tgtNode = e.target().id();
        //             // TODO : check if edge exists first
        //             let existingEdges = cy.edges('[source = "' + srcNode + '"][target = "' + tgtNode + '"]');
        //             if (existingEdges.length == 0) {
        //                 /** @ts-ignore */
        //                 cy.add({ group: "edges", data: { source: srcNode, target: tgtNode }, classes: ["right"] });
        //             }

        //         });
        //     }
        // });

        // TODO : centralized calls to layout
        //TODO : check if really needed to rerun layout?
        uncompliantGraph.destroy();
        layout.stop();
        let layoutConfig = getCytoscapeLayout(selectedLayout);
        layout = cy.layout(layoutConfig);
        layout.run();
    }
});
