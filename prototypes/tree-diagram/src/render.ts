// @ts-ignore
import * as d3 from "d3";
import { FontInfo, Size, Tooltip } from "spotfire-api";
import { RenderState } from "./index";
import { Nodes } from "./series";
import { renderInfoBox } from "./infobox";
import { clearAllMarkings, generateDimensions, getAllNodes, reBuildNodes, Dimensions } from "./helper";
import { renderResetPositionButton, renderZoomInButton, renderZoomOutButton, ChartSize } from "./buttons";
// type D3_SELECTION = d3.Selection<SVGGElement, unknown, HTMLElement, any>;
// type D3_HIERARCHY_SELECTION = d3.Selection<SVGGElement | d3.EnterElement, d3.HierarchyPointNode<unknown> | d3.HierarchyPointLink<unknown>, SVGGElement, unknown>;
/**
 * Main svg container
 */
const svg = d3.select("#mod-container").append("svg").attr("xmlns", "http://www.w3.org/2000/svg");
const COLLAPSE = true;
export interface Options {
    /** The height of the nodes */
    nodeHeight: number;
    /** The width of the stroke around each blob */
    strokeWidth: number;
    /** The distance between the axis labels and the axis */
    labelOffset: number;
    /** Minimum size of a box. Defaults to 300 */
    minBoxSize: number;
    /** Duration of transitions in ms */
    duration: number;
    onLabelClick: null | ((x: number, y: number) => void);
}

const defaultConfig: Options = {
    nodeHeight: 21,
    strokeWidth: 1,
    labelOffset: 20,
    minBoxSize: 50,
    duration: 750,
    onLabelClick: null
};

export interface Data {
    clearMarking(): void;
    nodes: Nodes;
}

interface CustomLinkObject {
    source: {
        x: number;
        y: number;
        nodeWidth: number;
    };
    target: {
        x: number;
        y: number;
        nodeWidth: number;
    };
}

/**
 * Renders the chart.
 * @param {RenderState} state
 * @param {Spotfire.DataView} dataView - dataView
 * @param {Spotfire.Size} windowSize - windowSize
 * @param {Partial<Options>} config - config
 * @param {Object} styling - styling
 * @param {Tooltip} tooltip - tooltip
 * @param {Dimensions} dimensions - used to scale the tree.
 */
export async function render(
    state: RenderState,
    data: Data,
    windowSize: Size,
    styling: {
        font: FontInfo;
    },
    tooltip: Tooltip,
    dimensions : Dimensions
) {
    if (state.preventRender) {
        // Early return if the state currently disallows rendering.
        return;
    }

    const onSelection = (dragSelectActive: boolean) => {
        state.preventRender = dragSelectActive;
    };

    /**
     * The constant that contains all the options related to the way the chart is drawn
     */
    const cfg: Options = {
        ...defaultConfig
    };

    let nodesData = data.nodes;

    /**
     * Calculating the position and size of the chart
     */
    const width = Math.max(windowSize.width, cfg.minBoxSize);
    const height = Math.max(windowSize.height, cfg.minBoxSize);
    const padding = 70;
    var i = 0;

    /**
     * Sets the viewBox to match windowSize
     */
    svg.attr("viewBox", `0, 0, ${width}, ${height}`);
    svg.style("width", "100%");
    svg.style("height", "100%");
    svg.selectAll("*").remove();

    const svgChart = svg.append("g").attr("transform", "translate(" + padding + "," + 0 + ")");

    /**
     * Create tree layout
     */

    //let tree = d3.tree().size([height - 2 * padding, width - 2 * padding]);
    
    var tree = d3.tree()
    //.size([height - 2 * padding, width - 2 * padding])
    .nodeSize([5,width/(dimensions.depth*2)])
    .separation(function separation(a : d3.HierarchyPointNode<any>, b : d3.HierarchyPointNode<any>){
        if (a.parent == b.parent) {
            return 8;
        }
        else if (a.data.level == b.data.level) {
            return 12;
        }
        else {
            return 1;
        }
    });
    var diagonal = function link(d: CustomLinkObject) {
        const s = d.source;
        const t = d.target;
        return (
            "M" +
            (s.y + s.nodeWidth / 2) +
            "," +
            s.x +
            "C" +
            (s.y + s.nodeWidth / 2 + t.y) / 2 +
            "," +
            s.x +
            " " +
            (s.y + s.nodeWidth / 2 + t.y) / 2 +
            "," +
            t.x +
            " " +
            t.y +
            "," +
            t.x
        );
    };

    let root: any = d3.hierarchy(nodesData);

    root.x0 = (height - 2 * padding) / 4;
    root.y0 = 0;

    //const input = document.getElementById("search");
    //if (input == null) {
    //    return;
    //}
    //input.addEventListener("change", (e : any) => {
    //    const target = e.target as HTMLInputElement;
    //    console.log(target.value);
    //    if(target.value !== "") {
    //        search(root, target.value);
    //    }
    //})
    //search("Analyse", root);

    /**
     * Update the graph
     */
    update(root, false);

    /**
     * Draw the rectangular selection
     */
    //drawRectangularSelection();

    /**
     * Draws a group.
     * @param source - source node that will be updated
     * @param transition - determines if transitions are active to make markings look better.
     */
    function update(source: any, transition: boolean) {
        /**
         * Compute the new tree layout
         */
        
        //var treeLayout = tree(root);
        var treeLayout = tree(source);
        var links = treeLayout.links();
        var nodes = treeLayout.descendants();

        /**
         * Update links
         */
        const link = svgChart.selectAll(".link").data(links, function (d: any) {
            return d.target.id;
        });

        drawLinks(link.enter(), source, transition);
        exitLinks(link.exit(), source, transition);

        /**
         * Update nodes
         */
        var node = svgChart.selectAll(".node").data(nodes, function (d: any) {
            return d.id || (d.id = ++i);
        });

        drawNode(node.enter(), source, transition);

        /**
         * Initialize zooming
         */
        let zoom = d3.zoom().on("zoom", handleZoom);

        initZoom(zoom);

        /*
        Draw zoom handling buttons
        */
        let chartSize: ChartSize = { width: width - 2 * padding, height: height };
        renderResetPositionButton(svg, zoom, chartSize, tooltip, { X: 10, Y: 50, width: 20, height: 20 });
        renderZoomInButton(svg, zoom, tooltip, { X: 10, Y: 80, width: 20, height: 20 });
        renderZoomOutButton(svg, zoom, tooltip, { X: 10, Y: 110, width: 20, height: 20 });
        updateColumnPicker(root);
        /**
         * Transition nodes to new position
         */
        if (transition) {
            svgChart
                .selectAll(".node")
                .transition()
                .duration(cfg.duration)
                .attr("transform", function (d: any) {
                    return "translate(" + d.y + "," + d.x + ")";
                });
        } else {
            svgChart.selectAll(".node").attr("transform", function (d: any) {
                return "translate(" + d.y + "," + d.x + ")";
            });
        }

        exitNodes(node.exit(), source);

        /**
         * Stash the old positions for transition.
         */
        nodes.forEach(function (d: any) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        const searchInput = document.getElementById("search");
        if (searchInput == null) {
            return;
        }

        searchInput.addEventListener("change", (e: any) => {
            const target = e.target as HTMLInputElement;
            search(root, target.value);
        });

        const columnInput = document.getElementById("column-input");
        if (columnInput == null) {
            return;
        }

        columnInput.addEventListener("change", (e : any) => {
            const target = e.target as HTMLInputElement;
            markLevel(source, Number(target.value))
        })

        //let skip = false;
        //nodes.forEach((node: any) => {
        //    if (node.data.marked && !skip) {
        //        renderInfoBox(node, tooltip);
        //        skip = true;
        //    }
        //});
        //
        ///**
        // * If no nodes are marked remove the infobox that
        // * could have been rendered previously.
        // */
        //if (!skip) {
        //    d3.selectAll(".info-box").remove();
        //}
    }

    /**
     * Draws the links
     * @param  -
     */
    function drawLinks(
        link: d3.Selection<d3.EnterElement, d3.HierarchyPointLink<unknown>, SVGGElement, unknown>,
        source: any,
        transition: boolean
    ) {
        /**
         * Create the branches
         */
        link.append("path")
            .attr("class", "link")
            //.style("stroke", "grey")
            .attr("id", (d: any) => `path-${d.target.data.parentID}-${d.target.data.ID}`) // Allows us to mark this node given a sitepath in infobox.ts
            .attr("d", (d) => {
                return diagonal({
                    source: {
                        x: source.x0,
                        y: source.y0,
                        nodeWidth: source.data.width + 100
                    },
                    target: {
                        x: source.x0 - source.data.width/2,
                        y: source.y0 + source.data.width/2,
                        nodeWidth: source.data.width
                    }
                });
            });

        /**
         * Transition links to new position
         */
        if (transition) {
            svgChart
                .selectAll(".link")
                .transition()
                .duration(cfg.duration)
                .attr("d", (d: any) => {
                    return diagonal({
                        source: {
                            x: d.source.x,
                            y: d.source.y,
                            nodeWidth: d.source.data.width
                        },
                        target: {
                            x: d.target.x,
                            y: d.target.y,
                            nodeWidth: d.target.data.width
                        }
                    });
                });
        } else {
            svgChart.selectAll(".link").attr("d", (d: any) => {
                return diagonal({
                    source: {
                        x: d.source.x,
                        // y : d.source.y
                        y: d.source.y + d.source.data.width/2.5,
                        nodeWidth: d.source.data.width
                    },
                    target: {
                        x: d.target.x,
                        y: d.target.y,
                        nodeWidth: d.target.data.width
                    }
                });
            });
        }
    }

    /**
     * Removes the branches
     * @param  -
     */
    function exitLinks(
        link: d3.Selection<d3.BaseType, d3.HierarchyPointLink<unknown>, SVGGElement, unknown>,
        source: any,
        transition: boolean
    ) {
        // Transition exiting nodes to the parent's new position.
        if (transition) {
            link.transition()
                .duration(cfg.duration)
                .attr("d", () => {
                    return diagonal({
                        source: {
                            x: source.x,
                            y: source.y,
                            nodeWidth: source.data.width
                        },
                        target: {
                            x: source.x,
                            y: source.y + source.data.width / 2,
                            nodeWidth: source.data.width
                        }
                    });
                })
                .remove();
        } else {
            link.attr("d", () => {
                return diagonal({
                    source: {
                        x: source.x,
                        y: source.y,
                        nodeWidth: source.data.width
                    },
                    target: {
                        x: source.x,
                        y: source.y + source.data.width / 2,
                        nodeWidth: source.data.width
                    }
                });
            });
        }
    }

    /**
     * Draws the nodes
     * @param node -
     */
    function drawNode(
        node: d3.Selection<any, d3.HierarchyPointNode<unknown>, SVGGElement, unknown>,
        source: any,
        transition: boolean
    ) {
        let f = styling.font;
        /**
         * Enter new nodes
         */

        let nodeEnter = node
            .append("g")
            .style("z-index", 1)
            .attr("class", (d: any) => "node " + d.data.type + " " + d.data.value.replace(/\s/g, "-"))
            .attr("transform", () => "translate(" + (source.y0 + source.data.width / 2) + "," + (source.x0) + ")")
            .on("click", (d: any) => {
                if (d3.event.ctrlKey) {
                    toggleCollapse(d);
                } else if (d3.event.altKey) {
                    markChildNodes(d)
                } else {
                    d.data.mark(d.data);
                }
            });

        if (transition) {
            nodeEnter
                .append("rect")
                .attr("rx", 10)
                .transition()
                .duration(cfg.duration)
                .attr("y",  -cfg.nodeHeight / 2)
                .attr("class", (d: any) => d.data.value.replace(/\s/g, "-") + " node-rectangle")
                //.attr("id", (d : any) => d.data.value.replace(/\s/g, "-") + "-" + d.data.ID)
                .attr("x", (d: any) => -d.data.width / 20)
                //.attr("width", (d: any) => d.data.width)
                .attr("width", (d: any) => d.data.width)
                .attr("height", cfg.nodeHeight)
                //.style("stroke", (d: any) => (d.data.marked ? "#3050ef" : "grey"))
                .style("stroke", (d: any) => (d.data.marked ? d.data.color : "grey"))
                .style("stroke-dasharray", (d: any) => (d.data.children?.length == 0 ? "2, 3" : "0"))
                //.style("fill", (d: any) => (d.data.marked ? "#ebefff" : "white"))
                .style("fill", (d: any) => (d.data.marked ? d.data.color : "white"));

            nodeEnter
                .append("text")
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .text((d: any) => d.data.value)
                .attr("font-style", f.fontStyle)
                .attr("font-weight", f.fontWeight)
                .attr("font-size", f.fontSize)
                .attr("font-family", f.fontFamily)
                .attr("class", (d: any) => "node-text " + d.data.value.replace(/\s/g, "-") + "-text")
                .attr("id", (d : any) => "rect-" + d.data.ID)
                //.attr("fill", f.color)
                //.attr("fill", (d: any) => (d.data.marked ? "#3050ef" : "grey"))
                .attr("fill", (d: any) => (d.data.marked ? d.data.color : "grey"))
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(cfg.duration)
                .style("fill-opacity", 1);
        } else {
            nodeEnter
                .append("rect")
                .attr("rx", 10)
                .attr("y", -cfg.nodeHeight / 2)
                .attr("class", (d: any) => d.data.value.replace(/\s/g, "-") + " node-rectangle")
                .attr("id", (d : any) => "rect-" + d.data.ID)
                //.attr("x", (d: any) => -d.data.width / 20)
                .attr("x", (d: any) => -d.data.width / 20)
                //.attr("width", (d: any) => d.data.width)
                .attr("width", (d: any) => d.data.width)
                .attr("height", cfg.nodeHeight)
                //.style("stroke", (d: any) => (d.data.marked ? "#3050ef" : "grey"))
                .style("stroke", (d: any) => (d.data.marked ? d.data.color : "grey"))
                .style("stroke-dasharray", (d: any) => {
                    if ((d.data.children == undefined) || (d.data.children.length == 0)){
                        return "2, 3"
                    } else {
                        return "0"
                    }
                })
                //.style("fill", (d: any) => (d.data.marked ? "#ebefff" : "white"))
                .attr("fill", (d: any) => (d.data.marked ? d.data.color : "grey"));

            nodeEnter
                .append("text")
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .text((d: any) => d.data.value)
                .attr("font-style", f.fontStyle)
                .attr("font-weight", f.fontWeight)
                .attr("font-size", f.fontSize)
                .attr("font-family", f.fontFamily)
                .attr("class", (d: any) => "node-text " + d.data.value.replace(/\s/g, "-") + "-text")
                //.attr("fill", f.color)
                //.attr("fill", (d: any) => (d.data.marked ? "#3050ef" : "grey"))
                .attr("fill", (d: any) => (d.data.marked ? d.data.color : "grey"))
                .style("fill-opacity", 1e-6)
                .style("fill-opacity", 1); //.style("stroke", (d : any) => d.data.marked ? "#3050ef" : "grey");
        }

        // Toggle children on click.
        function toggleCollapse(d: Nodes) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(source, true);
        }

        function markChildNodes(d : any) {
            
            if (d3.selectAll(`#rect-${d.data.ID}`).style("stroke") == "red") {
                d3.selectAll(".link").style("stroke", "grey");
                d3.selectAll(".node-rectangle").style("stroke", "grey");
                return;
            }

            d3.selectAll(".link").style("stroke", "grey");
            d3.selectAll(".node-rectangle").style("stroke", "grey");

            let toProcess = [d];

            if (toProcess == null) {
                return;
            }

            while(toProcess.length > 0) {
                if (toProcess[0].children && toProcess[0].children.length > 0) {
                    toProcess[0].children.forEach((child : any) => {
                        let path = d3.select(`#path-${child.data.parentID}-${child.data.ID}`);
                        path.style("stroke", "red");
                    })
                    toProcess = [...toProcess, ...toProcess[0].children]
                }
                d3.selectAll(`#rect-${toProcess[0].data.ID}`).style("stroke", "red");
                toProcess.shift();
            }
        }
    }

    /**
     * Removes the nodes
     * @param node -
     */
    function exitNodes(
        node: d3.Selection<d3.BaseType, d3.HierarchyPointNode<unknown>, SVGGElement, unknown>,
        source: any
    ) {
        /**
         * Exiting nodes move to parents new position
         */
        var nodesExit = node
            .transition()
            .duration(cfg.duration)
            .attr("transform", function (d: any) {
                return "translate(" + (source.y + source.data.width / 2) + "," + source.x + ")";
            })
            .remove();

        /**
         * Exiting nodes shrinks
         */
        nodesExit.select("rect").attr("y", 1e-6).attr("x", 1e-6).attr("width", 1e-6).attr("height", 1e-6);

        /**
         * Exiting nodes text fades
         */
        nodesExit.select("text").style("fill-opacity", 1e-6).style("font-size", 1e-6);
    }

    function markLevel(root : any, level: number) {
        let allNodes = getAllNodes(root);
        let toMark : number[] = []
        allNodes.forEach((node : any) => {
            if (node.depth == level) {
                toMark.push(Number(node.data.ID))
            }
        })

        if (toMark.length > 0) {
            allNodes[0].data.markColumn(toMark);
        }
        //Snupdate(root, false);
    }

    function search(root: any, searchTerm: string) {
        // Todo: not working when clearing the second time
        d3.selectAll(".link").style("stroke", "grey");
        d3.selectAll(".node-rectangle").style("stroke", "grey");
        
        /**
         * Rebuild the original tree
         * before starting a new search.
         */
        reBuildNodes(root);

        if (searchTerm === "") {
            return update(root, true);
        }

        let allNodes = getAllNodes(root);
        let selectorString = "";
        let nodeMap = Object.create(null);

        allNodes.forEach((node: any) => {
            nodeMap[node.data.ID] = { children: [], _children: node.children , data : { children : [], _children : node.data.children}};
            if (node.data.value.substring(0, searchTerm.length).toLowerCase() == searchTerm.toLowerCase()) {
                nodeMap[node.data.ID].children = (node.children?.length == 0) ? [] : node.children;
                selectorString = selectorString.concat(",", `.${node.data.value.replace(/\s/g, "-")}`);

                /**
                 * Mark links from the node matching the searchresult
                 * to the root node.
                 */
                let currentPath = [];
                let currentNode = node;
                let currentParent = currentNode;
                while (currentNode.parent !== null) {
                    if (!nodeMap[currentNode.data.parentID].children.includes(currentNode)) {
                        nodeMap[currentNode.data.parentID].children = [
                            ...nodeMap[currentNode.data.parentID].children,
                            currentNode
                        ];
                    }
                    let path = d3.select(`#path-${currentNode.data.parentID}-${currentNode.data.ID}`);
                    path.style("stroke", "red");
                    currentPath.push(currentNode);
                    currentParent = currentNode.parent;
                    d3.selectAll(`#rect-${currentNode.data.ID}`).style("stroke", "red");
                    currentNode = currentParent;

                }
                d3.selectAll(`#rect-${currentNode.data.ID}`).style("stroke", "red");
            }
        });

        /**
         * Mark the nodes included in the
         * generated selector string
         */
        //if (selectorString !== "") {
        //    let selected = d3.selectAll(selectorString.substring(1));
        //    let selectedRect = selected.filter(".node-rectangle");
        //    selectedRect.style("stroke", "red");
        //}
        
        let newRoot;

        /**
         * Remove children from nodes that
         * aren't included in the search so we
         * can collapse parts of the tree.
         */
        if (COLLAPSE) {
            allNodes.forEach((node: any) => {
                node.data._children = nodeMap[node.data.ID].data._children;
                node._children = nodeMap[node.data.ID]._children;
                if (nodeMap[node.data.ID].children?.length == 0) {
                    delete node.children;
                    delete node.data.children;
                } else {
                    node.children = nodeMap[node.data.ID].children;
                    node.data.children = nodeMap[node.data.ID].data.children;
                }
                if (node.data.ID == "1") {
                    newRoot = node;
                }
            });
        }
        // Handle the collapse case
        //reBuildNodes(newRoot);
        // Will have to traverse all nodes

        update(newRoot, true);
        //update(root, true);
    }

    function updateColumnPicker(root : any) {
        let minMax = getColumnRange(root);
        let picker = document.getElementById("column-input");
        if (picker == null) {
            return;
        }
        picker.setAttribute("min", String(minMax[0]))
        picker.setAttribute("max", String(minMax[1]))
        
    }

    function getColumnRange(root : any) : number[] {
        let allNodes = getAllNodes(root);
        let minMax = [allNodes[0].depth, allNodes[0].depth] // minMax[0] = min, minMax[1] = max
        allNodes.forEach(node => {
            if (node.depth < minMax[0]) {
                minMax[0] = node.depth;
            }
            if (node.depth > minMax[1]) {
                minMax[1] = node.depth;
            }
        })
        return minMax;
    }

    /**
     * Draws rectangular selection
     */
    function drawRectangularSelection() {
        function drawRectangle(x: number, y: number, w: number, h: number) {
            return "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z";
        }

        const rectangle = svg.append("path").attr("class", "rectangle").attr("visibility", "hidden");

        const startSelection = function (start: [number, number]) {
            rectangle.attr("d", drawRectangle(start[0], start[0], 0, 0)).attr("visibility", "visible");
        };

        const moveSelection = function (start: [number, number], moved: [number, number]) {
            rectangle.attr("d", drawRectangle(start[0], start[1], moved[0] - start[0], moved[1] - start[1]));
        };

        const endSelection = function (start: [number, number], end: [number, number]) {
            rectangle.attr("visibility", "hidden");

            // Ignore rectangular markings that were just a click.
            if (Math.abs(start[0] - end[0]) < 2 || Math.abs(start[1] - end[1]) < 2) {
                if (
                    d3.select(d3.event.target.parentNode).classed("node-blobs") ||
                    d3.select(d3.event.target).classed("line-hover line-hover-bg")
                ) {
                    return;
                }
                // return data.clearMarking();
                return null;
            }

            // const selectionBox = rectangle.node()!.getBoundingClientRect();
            // const svgMarkedNodes = svg.selectAll<SVGCircleElement, Point>(".node-blobs").filter(function () {
            //     const box = this.getBoundingClientRect();
            //     return (
            //         box.x >= selectionBox.x &&
            //         box.y >= selectionBox.y &&
            //         box.x + box.width <= selectionBox.x + selectionBox.width &&
            //         box.y + box.height <= selectionBox.y + selectionBox.height
            //     );S
            // });

            // if (svgMarkedNodes.size() === 0) {
            //     return data.clearMarking();
            // }

            // svgMarkedNodes.each(mark);
        };

        svg.on("mousedown", function (this) {
            onSelection(true);
            if (d3.event.which === 3) {
                return;
            }
            let subject = d3.select(window),
                start = d3.mouse(this);
            startSelection(start);
            subject
                .on("mousemove.rectangle", function () {
                    moveSelection(start, d3.mouse(svg.node()!));
                })
                .on("mouseup.rectangle", function () {
                    endSelection(start, d3.mouse(svg.node()!));
                    subject.on("mousemove.rectangle", null).on("mouseup.rectangle", null);
                });
        });
        svg.on("mouseup", function (this) {
            onSelection(false);
        });
    }
}

function handleZoom() {
    d3.select("svg g:not(.settings-button)").attr("transform", d3.event.transform);
}

/**
 * Calls the zoom on the svg
 */
function initZoom(zoom: any) {
    d3.select("svg").call(zoom).on("dblclick.zoom", null);
}
