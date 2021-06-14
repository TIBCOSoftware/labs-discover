
class FilteredGraph {

    constructor(filteredInElements, filtedOutElements) {
        // 1st extract valid nodes
        // let validNodes = [];
        for (let i = 0, len = filteredInElements.length; i < len; i++) {
            let ele = filteredInElements[i];
            if (ele.group === "nodes") {
                // ele = Object.assign({}, ele);
                ele.data.isValid = true;
                // validNodes.push(ele);
            }
        }
        // add valid nodes to filtered out elements and construct a cy graph
        // filtedOutElements.push(...validNodes);
        filtedOutElements.push(...filteredInElements);
        this.cy = cytoscape({ headless: true, elements: filtedOutElements });
    }

    /**
     * Find valid sources for node id
     * @param {cytoscape.EdgeDefinition} edgeDef
     * @returns {cytoscape.EdgeDefinition[]}
     */
    findValidSources(edgeDef) {
        let edges = this.cy.$('edge[source = "' + edgeDef.data.source + '"]' + '[target = "' + edgeDef.data.target + '"]');
        let validEdges = [];
        edges.forEach(edge => {
            validEdges.push(...this.findValidSource(edge, edgeDef.data.target));
        });
        return validEdges;
    }

    /**
     * Find valid sources for edge
     * @param {cytoscape.EdgeSingular} edge
     * @param {string} initialNodeId
     * @returns {cytoscape.EdgeDefinition[]} json representation of edges
     */
    findValidSource(edge, initialNodeId) {
        if (this.isNodeValid(edge.source())) {
            return [JSON.parse(JSON.stringify(edge.json()))];
        }

        let incomers = edge.source().incomers('edge:simple[source !="' + initialNodeId + '"]'); // Selecting outgoing edges whose target is not initial node to avoid loops
        if (incomers.length === 0) {
            return [];
        }

        let multipleOutgoers = edge.source().outgoers("edge:simple").length > 1;
        let validEdges = [];
        // For each edge going out of target
        for (let i = 0, len = incomers.length; i < len; i++) {
            if (this.isNodeValid(incomers[i].source())) {
                // target node is valid
                let validEdge;
                if (multipleOutgoers) {
                    validEdge = JSON.parse(JSON.stringify(edge.json()));
                    validEdge.data.source = incomers[i].data("source");
                } else {
                    validEdge = JSON.parse(JSON.stringify(incomers[i].json()));
                    validEdge.data.target = edge.data("target");
                }
                validEdge.data.id = undefined;
                validEdge.classes = ["virtual"];
                validEdges.push(validEdge);
            } else {
                // continue traversing graph
                let sources = this.findValidSource(incomers[i], initialNodeId);
                for (let j = 0, lenJ = sources.length; j < lenJ; j++) {
                    let validEdge;
                    if (multipleOutgoers) {
                        validEdge = JSON.parse(JSON.stringify(edge.json()));
                        validEdge.data.source = incomers[i].data("source");
                    } else {
                        validEdge = JSON.parse(JSON.stringify(incomers[i].json()));
                        validEdge.data.target = edge.data("target");
                    }
                    validEdge.data.id = undefined;
                    validEdge.classes = ["virtual"];
                    validEdges.push(validEdge);
                }
            }
        }

        return validEdges;
    }

    isNodeValid(node) {
        if (node.data("isValid")) {
            return true;
        }
        return false;
    }

    /**
     * Find valid targets for node id
     * @param {cytoscape.EdgeDefinition} edgeDef
     * @returns {cytoscape.EdgeDefinition[]}
     */
    findValidTargets(edgeDef) {
        let edges = this.cy.$('edge[source = "' + edgeDef.data.source + '"]' + '[target = "' + edgeDef.data.target + '"]');
        let validEdges = [];
        edges.forEach(edge => {
            validEdges.push(...this.findValidTarget(edge, edgeDef.data.source));
        });
        return validEdges;
    }

    /**
     * Find valid targets for edge
     * @param {cytoscape.EdgeSingular} edge
     * @param {string} initialNodeId
     * @returns {cytoscape.EdgeDefinition[]} json representation of edges
     */
    findValidTarget(edge, initialNodeId) {
        if (this.isNodeValid(edge.target())) {
            return [JSON.parse(JSON.stringify(edge.json()))];
        }

        let outgoers = edge.target().outgoers('edge:simple[target !="' + initialNodeId + '"]'); // Selecting outgoing edges whose target is not initial node to avoid loops
        if (outgoers.length === 0) {
            return [];
        }

        let multipleIncomers = edge.target().incomers("edge:simple").length > 1;
        let validEdges = [];
        // For each edge going out of target
        for (let i = 0, len = outgoers.length; i < len; i++) {
            if (this.isNodeValid(outgoers[i].target())) {
                // target node is valid
                let validEdge;
                if (multipleIncomers) {
                    validEdge = JSON.parse(JSON.stringify(edge.json()));
                    validEdge.data.target = outgoers[i].data("target");
                } else {
                    validEdge = JSON.parse(JSON.stringify(outgoers[i].json()));
                    validEdge.data.source = edge.data("source");
                }
                validEdge.data.id = undefined;
                validEdge.classes = ["virtual"];
                validEdges.push(validEdge);
            } else {
                // continue traversing graph
                let targets = this.findValidTarget(outgoers[i], initialNodeId);
                for (let j = 0, lenJ = targets.length; j < lenJ; j++) {
                    let validEdge;
                    if (multipleIncomers) {
                        validEdge = JSON.parse(JSON.stringify(edge.json()));
                        validEdge.data.target = targets[j].data.target;
                    } else {
                        validEdge = targets[j];
                        validEdge.data.source = edge.data("source");
                    }
                    validEdge.data.id = undefined;
                    validEdge.classes = ["virtual"];
                    validEdges.push(validEdge);
                }
            }
        }

        return validEdges;
    }

}