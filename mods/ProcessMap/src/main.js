/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

//@ts-check - Get type warnings from the TypeScript language server. Remove if not wanted.

let previousCy = null;
let previousElements = null;
let markedRows = [];
let markingColor = "#B73EAB";

/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
Spotfire.initialize(async mod => {

    const context = mod.getRenderContext();
    const { tooltip } = mod.controls;


    /** @type {{cy: cytoscape.Core, layout: cytoscape.Layouts}} */


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
            mod.visualization.axis("Labels"),
            mod.visualization.axis("Size by"),
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
     * @param {Spotfire.ModProperty<string>} selectedLayout
     * @param {Spotfire.ModProperty<string>} nodeShape
     */
    function onConfigChange(selectedLayout, nodeShape) {
        if (!previousCy) {
            return;
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
     * @param {Spotfire.Axis} labelsAxis
     * @param {Spotfire.Axis} sizeByAxis
     * @param {Spotfire.Axis} colNamesAxis
     * @param {Spotfire.Axis} subsetsAxis
     */
    async function onDataChange(dataView, srcAxis, tgtAxis, colorAxis, labelsAxis, sizeByAxis, colNamesAxis, subsetsAxis) {
        try {
            // Check if any error
            let errors = await dataView.getErrors();
            if (errors && errors.length > 0) {
                onError(errors);
                checkInputs(srcAxis, tgtAxis, colorAxis, labelsAxis, sizeByAxis, colNamesAxis, subsetsAxis);
                return;
            }

            // Set marking color 
            markingColor = (await dataView.marking()).colorHexCode;

            // if no data, display message
            // let rowCount = await dataView.rowCount();
            // if(rowCount == 0){
            //     onError(["No data is available for the visualization to render."]);
            // }


            let isAxisConfigOK = checkInputs(srcAxis, tgtAxis, colorAxis, labelsAxis, sizeByAxis, colNamesAxis, subsetsAxis);
            if (isAxisConfigOK) {
                await renderCore(dataView);
            }

            mod.controls.errorOverlay.hide("DataView");

        } catch (error) {
            mod.controls.errorOverlay.show(["Graph rendering failed." /*, error.message || error*/], "DataView");
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

        mod.controls.errorOverlay.show(errorMessages, "dataView");

        // If error is relevant to subsets or Column Names, then fix axis expression 
        // let resetSubsets = false;
        // let resetColNames = false;
        // errorMessages.forEach(errorMessage => {
        //     if (errorMessage.includes("(Subsets) must be selected on a categorical axis.")) {
        //         resetSubsets = true;
        //     } else if (errorMessage.includes("'(Column Names)' must be used on a categorical axis")) {
        //         resetColNames = true;
        //     }
        // });

        // if (resetSubsets || resetColNames) {
        //     mod.transaction(() => {
        //         if (resetSubsets) {
        //             console.log("Resetting Datasets axis.");
        //             // Setting "(Subsets)" on the Datasets axis
        //             const subsetsAxis = mod.visualization.axis("Datasets");
        //             subsetsAxis.setExpression("<[Axis.Subsets.Names]>");
        //         }
        //         if (resetColNames) {
        //             console.log("Resetting Column Names axis.");
        //             // Setting "(Column Names)" on the Column Names axis
        //             const colNamesAxis = mod.visualization.axis("Column Names");
        //             colNamesAxis.setExpression("<[Axis.Default.Names]>");
        //         }
        //     });
        // } else {
        //     mod.controls.errorOverlay.show(errorMessages, "DataView");
        // }
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
        let isSetColNames = true;
        let isReqColNames = false;

        /** @type {Spotfire.Axis[]} */
        let axesToModify = [];
        axes.forEach(axis => {
            switch (axis.name) {
                case "Column Names": //TODO: use variable for axis names?
                    if (axis.expression !== "<[Axis.Default.Names]>") {
                        isSetColNames = false;
                    }
                    break;
                case "Datasets":
                    if (axis.expression !== "<[Axis.Subsets.Names]>") {
                        resetSubsetsAxis = true;
                    }
                    break;
                default:
                    if (axis.isCategorical) {
                        // Find axes that contain "[Axis.Default.Names]" or "[Axis.Subsets.Names]"
                        if (axis.expression.includes("[Axis.Default.Names]")
                            || axis.expression.includes("[Axis.Subsets.Names]")) {
                            axesToModify.push(axis);
                        }
                    } else { // Continuous axis
                        if(axis.parts.length > 1){
                            isReqColNames = true;
                        }
                    }

            }
        });


        // Modify axes expressions outside of the loop
        let isAxisConfigOK = true;
        mod.transaction(() => {
            if (resetSubsetsAxis) {
                console.warn("Resetting Datasets axis.");
                mod.visualization.axis("Datasets").setExpression("<[Axis.Subsets.Names]>");
                isAxisConfigOK = false;
            }
            if (isReqColNames && !isSetColNames) {
                console.warn("Resetting Column Names axis.");
                mod.visualization.axis("Column Names").setExpression("<[Axis.Default.Names]>");
                isAxisConfigOK = false;
            } else {
                if(!isReqColNames && isSetColNames){
                    mod.visualization.axis("Column Names").setExpression("<>");
                    isAxisConfigOK = false;
                }
            }

            axesToModify.forEach(axis => {
                console.warn("Axis " + axis.name + " contains either (Subsets) or (Column Names). Resetting it.");
                let expression = axis.expression;
                expression = expression.replace("[Axis.Default.Names]", "");
                expression = expression.replace("[Axis.Subsets.Names]", "");
                expression = expression.replace("< NEST ", "<");
                expression = expression.replace(" NEST >", ">");

                axis.setExpression(expression);
                isAxisConfigOK = false;
            });
        });

        return isAxisConfigOK;

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

        /** @type string */
        let selectedLayout = (await mod.property("layout")).value();
        /** @type string */
        let nodeShape = (await mod.property("nodeShape")).value();


        // Get nodes & edges from rows
        let allElements = await getElements(dataView);

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
            if (subsets.includes("Current Filtering")) {
                elements = allElements["Current Filtering"];
            } else {
                elements = allElements[subsets[0]];
            }
        }

        if (!Array.isArray(elements) || elements.length == 0) {
            // Empty visualization
            document.getElementById("visualization").innerHTML = "";
            previousElements = null;

            resetGraphJson();

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

        // TODO : Check if grouping is same
        // if (sameGraph(newElements, previousElements) && previousCy) {
        //     // Try to update current graph 
        //     if(updateGraph(previousCy.cy, elements, dataView, selectedLayout, nodeShape)){
        //         refCy = previousCy;
        //     }else{
        //         refCy = renderGraph(elements, dataView, tooltipAxis, labelConfig, selectedLayout, nodeShape, allElements["Not in Current Filtering"]);
        //     }

        // } else {
        //     // recreate graph
        //     refCy = renderGraph(elements, dataView, tooltipAxis, labelConfig, selectedLayout, nodeShape, allElements["Not in Current Filtering"]);
        // }

        refCy = renderGraph(elements, dataView, selectedLayout, nodeShape, allElements["Not in Current Filtering"]);

        // TODO : 
        persistGraphJson(refCy.cy);

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

    //TODO
    /**
     * @param {cytoscape.Core} cy
     */
    async function persistGraphJson(cy){
        // @ts-ignore
        let graphJson = JSON.stringify(cy.json(true).elements);
        let graphJsonDocProp = await mod.document.property("GraphJson").catch(() => undefined);
        if(graphJsonDocProp){
            graphJsonDocProp.set(graphJson);
        }
    }

    /**
     * Reset GraphJson document property
     */
     async function resetGraphJson(){
        // @ts-ignore
        let graphJsonDocProp = await mod.document.property("GraphJson").catch(() => undefined);
        if(graphJsonDocProp){
            graphJsonDocProp.set("");
        }
    }

    /**
     * Update edge labels
     * @param {string[]} selectedLabels
     */
    // function updateLabels(selectedLabels) {
    //     if (!previousCy) {
    //         return;
    //     }

    //     previousCy.cy.edges().forEach(edge => {
    //         let tooltip = edge.data("tooltip");
    //         let rows = tooltip.split("\n");
    //         let label = "";
    //         for (let j = 0, nbTokens = rows.length; j < nbTokens; j++) {
    //             let index = rows[j].indexOf(":");
    //             if (index === -1) {
    //                 continue;
    //             }
    //             let key = rows[j].substring(0, index);
    //             if (selectedLabels.includes(key.trim())) {
    //                 let value = rows[j].substring(index + 1).trim();
    //                 label = "" ? label = value : label += "\n" + value;
    //             }
    //         }

    //         if (label.length > 0) {
    //             edge.data("label", label);
    //         }
    //     });
    // }

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
                    if (!node) { // node not found
                        return false; // Update aborted
                    }
                    node.data(ele.data);
                    node.scratch("_spotfire", ele.scratch._spotfire);
                } else {
                    let edge = cy.edges('[source = "' + ele.data.source + '"][target = "' + ele.data.target + '"]')[0];
                    if (!edge) { // edge not found
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
     * @param {string} selectedLayout
     * @param {string} nodeShape
     * @param {any[]} filteredElements
     * @returns {{cy: cytoscape.Core, layout: cytoscape.Layouts}}
     */
    function renderGraph(elements, dataView, selectedLayout, nodeShape, filteredElements = null) {

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

        var options = {
            layoutBy: getCytoscapeLayout(selectedLayout), // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
            // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
            fisheye: true, // whether to perform fisheye view after expand/collapse you can specify a function too
            animate: false, // whether to animate on drawing changes you can specify a function too
            animationDuration: 500, // when animate is true, the duration in milliseconds of the animation
            ready: function () { }, // callback when expand/collapse initialized
            undoable: false, // and if undoRedoExtension exists,

            cueEnabled: false, // Whether cues are enabled
            expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
            expandCollapseCueSize: 12, // size of expand-collapse cue
            expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
            expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
            collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
            expandCollapseCueSensitivity: 1, // sensitivity of expand-collapse cues
            edgeTypeInfo: "edgeType", // the name of the field that has the edge type, retrieved from edge.data(), can be a function, if reading the field returns undefined the collapsed edge type will be "unknown"
            groupEdgesOfSameTypeOnCollapse: true, // if true, the edges to be collapsed will be grouped according to their types, and the created collapsed edges will have same type as their group. if false the collapased edge will have "unknown" type.
            allowNestedEdgeCollapse: true, // when you want to collapse a compound edge (edge which contains other edges) and normal edge, should it collapse without expanding the compound first
            zIndex: 999 // z-index value of the canvas in which cue ımages are drawn
        };
        // @ts-ignore
        var collapseExpandApi = cy.expandCollapse(options)
        collapseExpandApi.collapseAll();
        // collapseExpandApi.collapseAllEdges();

        // Adds the context menu
        // @ts-ignore
        var contextMenu = cy.contextMenus({
            menuItems: [
                {
                    id: 'filtering',
                    content: 'Filtering',
                    tooltipText: 'Apply filters',
                    selector: 'node, edge',
                    coreAsWell: true,
                    show: true,
                    submenu: [
                        {
                            id: 'filter-events',
                            content: 'Filter cases',
                            //tooltipText: 'Filter cases',
                            submenu: [
                                {
                                    id: 'filter-in-events',
                                    content: 'Filter in',
                                    //tooltipText: 'Filter in',
                                    onClickFunction: function (event) {
                                        applyFilter("cases", "in");
                                    }
                                },
                                {
                                    id: 'filter-out-events',
                                    content: 'Filter out',
                                    //tooltipText: 'Filter out',
                                    onClickFunction: function (event) {
                                        applyFilter("cases", "out");
                                    }
                                }
                            ]
                        },
                        {
                            id: 'filter-cases',
                            content: 'Filter events',
                            //tooltipText: 'Filter events',
                            submenu: [
                                {
                                    id: 'filter-in-events',
                                    content: 'Filter in',
                                    //tooltipText: 'Filter in',
                                    onClickFunction: function (event) {
                                        applyFilter("events", "in");
                                    }
                                },
                                {
                                    id: 'filter-out-events',
                                    content: 'Filter out',
                                    //tooltipText: 'Filter out',
                                    onClickFunction: function (event) {
                                        applyFilter("events", "out");
                                    }
                                }
                            ]
                        },
                        {
                            id: 'filter-reset',
                            content: 'Reset filters',
                            //tooltipText: 'Reset filters',
                            onClickFunction: function (event) {
                                previousCy.cy.scratch("_spotfire").clearMarking();
                            }
                        }
                    ]
                },
                {
                    id: 'grouping',
                    content: 'Grouping',
                    tooltipText: 'Expend or collapse groups',
                    selector: 'node, edge',
                    coreAsWell: true,
                    show: true,
                    submenu: [
                        {
                            id: 'expand-all',
                            content: 'Expand all',
                            onClickFunction: function (event) {
                                let api = previousCy.cy.expandCollapse('get');
                                api.expandAllEdges();
                                api.expandAll();
                            }
                        },
                        {
                            id: 'collapse-all',
                            content: 'Collapse all',
                            onClickFunction: function (event) {
                                let api = previousCy.cy.expandCollapse('get');
                                api.collapseAll();
                                api.collapseAllEdges();
                            }
                        }
                    ]
                },
                {
                    id: 'layout',
                    content: 'Layout',
                    tooltipText: 'Select layout',
                    selector: 'node, edge',
                    coreAsWell: true,
                    show: true,
                    submenu: [ // TODO : auto generate based on output of getCytoscapeLayouts() function
                        {
                            id: 'layout-cose',
                            content: 'Cose',
                            tooltipText: 'Cose layout',
                            onClickFunction: function (event) {
                                mod.property("layout").set("cose");
                            }
                        },
                        {
                            id: 'layout-dagre',
                            content: 'Dagre',
                            tooltipText: 'Dagre layout',
                            onClickFunction: function (event) {
                                mod.property("layout").set("dagre");
                            }
                        },
                        {
                            id: 'layout-breadthfirst',
                            content: 'Breadthfirst',
                            tooltipText: 'Breadthfirst layout',
                            onClickFunction: function (event) {
                                mod.property("layout").set("breadthfirst");
                            }
                        },
                        {
                            id: 'layout-elk',
                            content: 'ELK',
                            tooltipText: 'ELK layout',
                            onClickFunction: function (event) {
                                mod.property("layout").set("elk");
                            }
                        },
                        {
                            id: 'layout-concentric',
                            content: 'Concentric',
                            tooltipText: 'Concentric layout',
                            onClickFunction: function (event) {
                                mod.property("layout").set("concentric");
                            }
                        }
                    ]
                },
                {
                    id: 'node-shape',
                    content: 'Node shape',
                    tooltipText: 'Select node shape',
                    selector: 'node, edge',
                    coreAsWell: true,
                    show: true,
                    submenu: [
                        {
                            id: 'shape-rectangle',
                            content: 'Round rectangle',
                            tooltipText: 'Round rectangle',
                            onClickFunction: function (event) {
                                mod.property("nodeShape").set("round-rectangle");
                            }
                        },
                        {
                            id: 'shape-ellipse',
                            content: 'Ellipse',
                            tooltipText: 'Ellipse layout',
                            onClickFunction: function (event) {
                                mod.property("nodeShape").set("ellipse");
                            }
                        }
                    ],
                    hasTrailingDivider: true
                },
                //   {
                //     id: 'export',
                //     content: 'Export',
                //     tooltipText: 'Export graph',
                //     selector: 'node, edge',
                //     coreAsWell: true,
                //     show: true,
                //       submenu: [
                //           {
                //               id: 'json',
                //               content: 'JSON',
                //               tooltipText: 'Round rectangle',
                //               onClickFunction: function (event) {
                //                   mod.property("nodeShape").set("round-rectangle");
                //               }
                //           },
                //           {
                //               id: 'xml',
                //               content: 'XML',
                //               tooltipText: 'Ellipse layout',
                //               onClickFunction: function (event) {
                //                     mod.property("nodeShape").set("ellipse");
                //               }
                //           }
                //       ],
                //       hasTrailingDivider: true
                //   },
                {
                    id: 'spotfire-contextmenu',
                    content: 'Show Spotfire context menu',
                    tooltipText: 'Show Spotfire context menu',
                    selector: 'node, edge',
                    coreAsWell: true,
                    show: true,
                    onClickFunction: function (event) {
                        // @ts-ignore
                        showSpotfireCntxtMenu();
                    }
                }
            ],
            // Indicates that the menu item has a submenu. If not provided default one will be used
            submenuIndicator: { src: 'pl-icon-caret-right.svg', width: 12, height: 12 }
        });

        /******** Event Handlers ********/
        cy.on('click', 'node:parent, node.cy-expand-collapse-collapsed-node', function (evt) {
            let node = evt.target;

            // Check if click is on collapse / expand icon
            let offset = 1; // TODO: check if we can get that from the css of node:parent (background-position-x attribute)
            let iconSize = 12; // TODO: get that from styling 
            let position = node.position();
            let x = position.x - node.outerWidth() / 2 + offset;
            let y = position.y - node.outerHeight() / 2 + offset;

            if ((evt.position.x < x + iconSize) && (evt.position.y < y + iconSize)) {
                // @ts-ignore
                let expandCollapse = cy.expandCollapse('get');

                // Click is on collapse / expand icon
                if (node.hasClass('cy-expand-collapse-collapsed-node')) { // node is collapsed
                    let collapsedEdges = node.connectedEdges(".cy-expand-collapse-collapsed-edge");
                    expandCollapse.expandEdges(collapsedEdges);
                    expandCollapse.expand(node);
                } else {
                    let collaspedNode = expandCollapse.collapse(node);
                    let connectedNodes = collaspedNode.neighbourhood("node");
                    connectedNodes.forEach( nd => {
                        expandCollapse.collapseEdgesBetweenNodes([collaspedNode, nd]);
                    });

                }
            }
        });

        // Display tooltip when mouseover an element
        cy.on('mouseover', 'node, edge', function (evt) {
            let scratch = evt.target.scratch("_spotfire");
            if (scratch && scratch.row) {
                tooltip.show(scratch.row);
            }
        });

        // Hide tooltip when mouseout an element
        cy.on('mouseout', 'node, edge', function () {
            tooltip.hide();
        });

        cy.on('cxttap', '*', function () {
            tooltip.hide();
        });
        // cy.on('mouseover', 'cy', function (evt) {
        //     let ele = evt.target;
        //     tooltip.hide();
        // });

        /******** End Event Handlers ********/

        return { cy, layout };
    }

    /**
     * Saves filter settings and mark data
     * @param {string} filterOn 
     * @param {string} direction
     */
    async function applyFilter(filterOn, direction) {
        let fltrStgsDocProp = await mod.document.property("FilterSettings").catch(() => undefined);
        let inKeepRowProp = await mod.document.property("inKeepRow").catch(() => undefined);
        let outKeepRowProp = await mod.document.property("outKeepRow").catch(() => undefined);

        // TODO : put the code below in the onComplete callback of previous transaction (which clears marking)
        let eles = previousCy.cy.elements(':selected');
        if (eles.length > 0) { // if elements are selected

            if (markedRows.length > 0) {
                mod.transaction(() => {
                    markedRows.forEach(row => {
                        row.mark("Subtract");
                    });
                    markedRows = [];
                });
            }

            mod.transaction(() => {
                previousCy.cy.elements(':selected').forEach(element => {
                    if (element.isNode() && element.isParent()) { // if compound node, mark all descendants
                        let descendants = element.descendants();
                        descendants.forEach(child => {
                            let scratch = child.scratch("_spotfire");
                            if (scratch && scratch.row) {
                                scratch.row.mark();
                                markedRows.push(scratch.row);
                            }
                        });
                    } else {
                        let scratch = element.scratch("_spotfire");
                        if (scratch && scratch.row) {
                            scratch.row.mark();
                            markedRows.push(scratch.row);
                        }
                    }
                });

                if(inKeepRowProp && outKeepRowProp){
                    inKeepRowProp.set(outKeepRowProp.value());
                }

                if (fltrStgsDocProp) {
                    //{"origin": "graph|panel", "filterOn": "cases|events", "direction": "in|out"}
                    fltrStgsDocProp.set('{"origin": "graph", "filterOn": "' + filterOn + '", "direction": "' + direction + '"}');
                }
            });

        }
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
        if (filteredElements) {
            let hasStart = false, hasStop = false;
            for (let i = 0, len = elements.length; i < len; i++) {
                let ele = elements[i];
                if (ele.group === "nodes") {
                    if (elements[i].data.id === "START") {
                        hasStart = true;
                    } else if (elements[i].data.id === "STOP") {
                        hasStop = true;
                    }
                }
            }
            if (!hasStart || !hasStop) {
                for (let i = filteredElements.length - 1; i >= 0; i -= 1) {
                    let ele = filteredElements[i];
                    if (ele.group === "nodes") {
                        if ((!hasStart && (ele.data.id === "START")) || (!hasStop && (ele.data.id === "STOP"))) {
                            elements.push(ele);
                            filteredElements.splice(i, 1); // Remove node from filteredElements
                        }
                    } else {
                        if(!hasStart && (ele.data.source === "START")){
                            elements.push(ele);
                            filteredElements.splice(i, 1);
                        }
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
                if (ele.data.parent) {
                    parentIds.add(ele.data.parent);
                }
            }
        });

        let validEdges = [];
        if (filteredElements) {
            let graph = new FilteredGraph(elements, filteredElements);
            for (let i = 0, len = elements.length; i < len; i++) {
                let ele = elements[i];
                if (ele.group === "edges") {
                    if (!nodeIds.has(ele.data.target)) {
                        let targetEdges = graph.findValidTargets(ele);
                        validEdges.push(...targetEdges);
                    } else if (!nodeIds.has(ele.data.source)) { // source of edge does not exist in elements (has been filtered out)
                        let sourceEdges = graph.findValidSources(ele); // TODO fix error
                        for (let i = 0, len = sourceEdges.length; i < len; i++) {
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
        } else {
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
     * @returns {Promise} - object with one property per subset. eg : {subsetA : [{group: 'nodes', data: {id: 'a'}}, {group: 'nodes', data: {id: 'b'}}], subsetB: []}
     */
    async function getElements(dataView) {

        let allElements = {};
        const isColorCategorical = await dataView.categoricalAxis("Color") ? true : false;
        const rows = await dataView.allRows();

        // TODO : check that axis contains expression for all axis
        const hasParent = await dataView.continuousAxis("Parent") != null;
        // const hasColNames = await dataView.continuousAxis("Column Names") != null;
        const hasLabels = await dataView.continuousAxis("Labels") != null;
        const hasSizeBy = await dataView.continuousAxis("Size by") != null;
        const hasColor = isColorCategorical ? await dataView.categoricalAxis("Color") != null : await dataView.continuousAxis("Color") != null ;
        const hasNimbus = await dataView.continuousAxis("Nimbus") != null;


        /** @type {Map<string, any>} */
        let allParents = new Map();

        rows.forEach(row => {

            // TODO use a variable instead of hardcoded axis name
            let subset = row.categorical("Datasets").value()[0].key;
            // let colName = hasColNames ? row.categorical("Column Names").formattedValue("") : null;
            let source = row.categorical("Source").value()[0].key;
            let target = row.categorical("Target").value()[0].key;
            let parent = hasParent && row.continuous("Parent").value() ? "" + row.continuous("Parent").value() : null;
            let nimbus = hasNimbus && row.continuous("Nimbus").value() ? "" + row.continuous("Nimbus").value() : null;

            if (!source) {
                console.warn("Null values are not supported on Source axis.");
            }

            if (!allElements[subset]) {
                allElements[subset] = new Map();
            }

            /** @type {Map<string, any>} */
            let elements = allElements[subset];

            let nodeLabel = source;
            // If Color axis is categorical, we create one graph per category
            let category = "";
            if (isColorCategorical && hasColor) {
                category = row.categorical("Color").formattedValue("");
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
                if (typeof node === "undefined") { // New node
                    node = {
                        group: 'nodes',
                        data: {
                            id: id,
                            // parent: parent != null && !id.startsWith("START") && !id.startsWith("STOP") ? "" + parent : null,
                            label: nodeLabel,
                            color: id.startsWith("START") || id.startsWith("STOP") ? '#727272' : row.color().hexCode, // setting color for START and STOP nodes, for the Nimbus export
                            category: category,
                            colorByValue: !isColorCategorical && hasColor  ? row.continuous("Color").value() : 0, 
                            tooltip : nimbus ? nimbus : ""
                        },
                        selected: row.isMarked(),
                        // TODO : replace selector in spotfire-cytoscape-style.js to "Node which id equals to START or STOP"
                        classes: id.startsWith("START") ? ["start"] : (id.startsWith("STOP") ? ["stop"] : []),
                        scratch: { _spotfire: { row: row } }
                    };
                    elements.set(id, node);
                }

                // TODO : review code
                if (parent && !id.startsWith("START") && !id.startsWith("STOP")) {
                    let parentNode = allParents.get(subset + parent);
                    if (parentNode) {
                        if (!parentNode.children.includes(node)) {
                            parentNode.children.push(node);
                        }
                    } else {
                        allParents.set(subset + parent, { subset: subset, id: parent, children: [node] });
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
                            sizeBy: hasSizeBy ? row.continuous("Size by").value() : 0,
                            label: "",
                            tooltip : nimbus ? nimbus : ""
                        },
                        selected: row.isMarked(),
                        scratch: { _spotfire: { row: row } }
                    };
                    elements.set(id, edge);
                }

                let label = hasLabels ? row.continuous("Labels").formattedValue() : null;
                if (label) {
                    edge.data.label === "" ? edge.data.label = label : edge.data.label += "\n" + label;
                }
            }
        });

        // Create parent nodes and add them to children 'parent' property
        allParents.forEach((value, key) => {
            // key of type {subset : string, id: string, children: [{}]}
            if (value.children.length > 1) {
                let newNode = {
                    group: 'nodes',
                    data: {
                        id: key,
                        label: value.id
                        // TODO: add color
                    }
                };
                allElements[value.subset].set(key, newNode);

                let parentColor = { value: null, hexColor: null };
                value.children.forEach(node => {
                    node.data.parent = key;

                    if (!parentColor.value) {
                        parentColor.value = node.data.colorByValue
                        parentColor.hexColor = node.data.color;
                    } else {
                        if (parentColor.value < node.data.colorByValue) {
                            parentColor.value = node.data.colorByValue;
                            parentColor.hexColor = node.data.color;
                        }
                    }
                });

                newNode.data.groupColor = parentColor.hexColor;
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