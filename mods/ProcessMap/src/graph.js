
class FilteredGraph {

    constructor(filteredInElements, filteredOutElements) {
        // 1st clone the inputs to avoid modifying original elements
        filteredInElements = JSON.parse(JSON.stringify(filteredInElements));
        filteredOutElements = JSON.parse(JSON.stringify(filteredOutElements));

        // Remove from filteredOutElements nodes that exist in filteredInElements
        let filteredOutNodes = new Map();
        let filteredOutEdges = new Set();
        for(let i = 0, len = filteredOutElements.length; i < len; i++){
            let ele = filteredOutElements[i];
            if("nodes" === ele.group){
                filteredOutNodes.set(ele.data.id, ele);
            } else {
                filteredOutEdges.add(ele);
            }
        }

        for (let i = 0, len = filteredInElements.length; i < len; i++) {
            let ele = filteredInElements[i];
            if (ele.group === "nodes") {
                ele.data.isValid = true;

                // If exists in filteredOutNodes, remove to avoid duplicates when we create the graph
                filteredOutNodes.delete(ele.data.id);
            }
        }
        // add valid nodes to filtered out elements and construct a cy graph
        this.cy = cytoscape({ headless: true, container: null, elements: [...filteredOutNodes.values(), ...filteredOutEdges, ...filteredInElements] });
    }

    /**
     * Find valid sources for node id
     * @param {cytoscape.EdgeDefinition} edgeDef
     * @returns {cytoscape.EdgeDefinition[]}
     */
    findValidSources(edgeDef) {
        const traversedNodes = new Set();
        let edges = this.cy.$('edge[source = "' + edgeDef.data.source + '"]' + '[target = "' + edgeDef.data.target + '"]');
        let validEdges = [];
        edges.forEach(edge => {
            validEdges.push(...this.findValidSource(edge, traversedNodes));
        });
        return validEdges;
    }

    /**
     * Find valid sources for edge
     * @param {cytoscape.EdgeSingular} edge
     * @param {Set<string>} traversedNodes
     * @returns {cytoscape.EdgeDefinition[]} json representation of edges
     */
    findValidSource(edge, traversedNodes) {
        if (this.isNodeValid(edge.source())) {
            return [JSON.parse(JSON.stringify(edge.json()))];
        }

        //let incomers = edge.source().incomers('edge:simple[source !="' + initialNodeId + '"]'); // Selecting outgoing edges whose target is not initial node to avoid loops
        let incomers = edge.source().incomers( function(ele){
            return ele.isEdge() && ele.isSimple() && !traversedNodes.has(ele.data("source"));
        });

        if (incomers.length === 0) {
            return [];
        }

        let multipleOutgoers = edge.source().outgoers("edge:simple").length > 1;
        let validEdges = [];
        // For each incoming edge
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
                traversedNodes.add(edge.source().id());
                let sources = this.findValidSource(incomers[i], traversedNodes);
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
        const traversedNodes = new Set();
        let edges = this.cy.$('edge[source = "' + edgeDef.data.source + '"]' + '[target = "' + edgeDef.data.target + '"]');
        let validEdges = [];
        edges.forEach(edge => {
            validEdges.push(...this.findValidTarget(edge, traversedNodes));//edgeDef.data.source));
        });
        return validEdges;
    }

    /**
     * Find valid targets for edge
     * @param {cytoscape.EdgeSingular} edge
     * @param {Set<string>} traversedNodes
     * @returns {cytoscape.EdgeDefinition[]} json representation of edges
     */
    findValidTarget(edge, traversedNodes) {
        if (this.isNodeValid(edge.target())) {
            return [JSON.parse(JSON.stringify(edge.json()))];
        }

        // Selecting outgoing edges whose target is not initial node to avoid loops (:simple matches edges with different source as target)
        // outgoers selects edges coming out of a node
        //let outgoers = edge.target().outgoers('edge:simple[target !="' + initialNodeId + '"]');
        let outgoers = edge.target().outgoers( function(ele){
            return ele.isEdge() && ele.isSimple() && !traversedNodes.has(ele.data("target"));
        });

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
                traversedNodes.add(edge.target().id());
                let targets = this.findValidTarget(outgoers[i], traversedNodes);
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