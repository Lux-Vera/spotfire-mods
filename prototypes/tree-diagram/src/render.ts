// @ts-ignore
import * as d3 from "d3";
import { FontInfo, Size, Tooltip } from "spotfire-api";
import { RenderState } from "./index";
import { Nodes } from "./series";

// type D3_SELECTION = d3.Selection<SVGGElement, unknown, HTMLElement, any>;
// type D3_HIERARCHY_SELECTION = d3.Selection<SVGGElement | d3.EnterElement, d3.HierarchyPointNode<unknown> | d3.HierarchyPointLink<unknown>, SVGGElement, unknown>;
/**
 * Main svg container
 */
const svg = d3.select("#mod-container").append("svg").attr("xmlns", "http://www.w3.org/2000/svg");

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
    nodes: Nodes
}

interface CustomLinkObject {
    source: {
        x : number,
        y : number,
        nodeWidth : number
    },
    target: {
        x : number,
        y : number,
        nodeWidth : number
    }
}

/**
 * Renders the chart.
 * @param {RenderState} state
 * @param {Spotfire.DataView} dataView - dataView
 * @param {Spotfire.Size} windowSize - windowSize
 * @param {Partial<Options>} config - config
 * @param {Object} styling - styling
 * @param {Tooltip} tooltip - tooltip
 */
export async function render(
    state: RenderState,
    data: Data,
    windowSize: Size,
    styling: {
        font: FontInfo;
    },
    tooltip: Tooltip,
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
        ...defaultConfig,
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
    svg.style("width", '100%');
    svg.style("height", '100%');
    svg.selectAll("*").remove();

    const svgChart = svg
            .append("g")
            .attr("transform", "translate(" + padding + "," + 0 + ")");

    /**
     * Create tree layout
     */
    let tree = d3.tree().size([height-(2*padding), width-(2*padding)]);

    var diagonal = function link(d : CustomLinkObject) {
        const s = d.source;
        const t = d.target;
        return "M" + (s.y+s.nodeWidth/2) + "," + s.x
            + "C" + ((s.y+s.nodeWidth/2) + t.y) / 2 + "," + s.x
            + " " + ((s.y+s.nodeWidth/2) + t.y) / 2 + "," + t.x
            + " " + t.y + "," + t.x;
      };

    let root : any = d3.hierarchy(nodesData);
    
    root.x0 = (height-(2*padding)) / 2;
    root.y0 = 0;

    /**
     * Update the graph
     */
    update(root);

    /**
     * Draw the rectangular selection
     */
    drawRectangularSelection();

    /**
     * Draws a group.
     * @param source - source node that will be updated
     */
    function update(source: any) {    

        /**
         * Compute the new tree layout
         */
        var treeLayout = tree(root);
        var links = treeLayout.links();
        var nodes = treeLayout.descendants();

        /**
         * Update links
         */    
        const link = svgChart.selectAll(".link")
        .data(links, function(d:any) { return d.target.id; });

        drawLinks(link.enter(), source);
        exitLinks(link.exit(), source);

        /**
         * Update nodes
         */
        var node = svgChart.selectAll(".node")
        .data(nodes, function(d:any) { return d.id || (d.id = ++i); });

        drawNode(node.enter(), source);

        /**
         * Transition nodes to new position
         */ 
        svgChart.selectAll(".node")
            .transition()
            .duration(cfg.duration)
            .attr("transform", function(d:any) { return "translate(" + d.y + "," + d.x + ")"; });

        exitNodes(node.exit(), source);

        /**
         * Stash the old positions for transition.
         */
        nodes.forEach(function(d:any) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
    
     /**
      * Draws the links
      * @param  - 
      */
      function drawLinks(link: d3.Selection<d3.EnterElement, d3.HierarchyPointLink<unknown>, SVGGElement, unknown>, source : any) {
        /**
         * Create the branches
         */
        link
         .append("path")
         .attr("class", "link")
          .attr("d", d => {
          return diagonal({
            source:{
                x: source.x0,
                y: source.y0,
                nodeWidth: source.data.width}, 
            target: {
                x: source.x0,
                y: source.y0+source.data.width/2,
                nodeWidth: source.data.width}
            });
        });

         /**
         * Transition links to new position
         */ 
        svgChart.selectAll(".link").transition()
        .duration(cfg.duration)
        .attr("d", (d:any) => {
            return diagonal({
              source:{
                  x: d.source.x,
                  y: d.source.y,
                  nodeWidth: d.source.data.width}, 
              target: {
                  x: d.target.x,
                  y: d.target.y,
                  nodeWidth: d.target.data.width}
              });
        });
    }

    /**
      * Removes the branches
      * @param  - 
      */
    function exitLinks(link: d3.Selection<d3.BaseType, d3.HierarchyPointLink<unknown>, SVGGElement, unknown>, source : any) {
         // Transition exiting nodes to the parent's new position.
         link
         .transition()
           .duration(cfg.duration)
           .attr("d", (d:any) => {
		    return diagonal({
                source:{
                    x: source.x,
                    y: source.y,
                    nodeWidth: source.data.width
                },
                target: {
                    x: source.x,
                    y: source.y+source.data.width/2,
                    nodeWidth: source.data.width
                }
                });
	        })
           .remove();
    }

    /**
     * Draws the nodes
     * @param node - 
     */
    function drawNode(node: d3.Selection<any, d3.HierarchyPointNode<unknown>, SVGGElement, unknown>, source : any) {

        /**
         * Enter new nodes
         */
         let nodeEnter = node
         .append("g")
         .attr("class", (d : any) => "node " + d.data.type)
         .attr("transform", d => "translate(" + (source.y0+source.data.width/2)  + "," + source.x0 + ")")
         .on("dblclick", toggleCollapse);

        nodeEnter.append("rect")
         .attr("rx", 10)
         .transition()
          .duration(cfg.duration)
          .attr("y", -cfg.nodeHeight/2)
          .attr("x", (d:any) => -d.data.width/2)
          .attr("width", (d:any) => d.data.width )
          .attr("height", cfg.nodeHeight);
   
        let f = styling.font;

        nodeEnter.append("text")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text((d : any) => d.data.value)
            .attr("font-style", f.fontStyle)
            .attr("font-weight", f.fontWeight)
            .attr("font-size", f.fontSize)
            .attr("font-family", f.fontFamily)
            .attr("fill", f.color)
            .style("fill-opacity", 1e-6)
            .transition()
             .duration(cfg.duration)
             .style("fill-opacity", 1);

        // Toggle children on click.
        function toggleCollapse(d : any) {
            if (d.children) {
            d._children = d.children;
            d.children = null;
            } else {
            d.children = d._children;
            d._children = null;
            }
            update(d);
        }
    }

    /**
     * Removes the nodes
     * @param node - 
     */
     function exitNodes(node: d3.Selection<d3.BaseType, d3.HierarchyPointNode<unknown>, SVGGElement, unknown>, source : any) {
    
         /**
         * Exiting nodes move to parents new position
         */
          var nodesExit = node
          .transition()
          .duration(cfg.duration)
          .attr("transform", function(d:any) { return "translate(" + (source.y+source.data.width/2) + "," + source.x + ")"; })
          .remove();
  
          /**
           * Exiting nodes shrinks
           */
          nodesExit.select("rect")
          .attr("y", 1e-6)
          .attr("x", 1e-6)
          .attr("width", 1e-6)
          .attr("height", 1e-6);
  
          /**
           * Exiting nodes text fades
           */
          nodesExit.select("text")
          .style("fill-opacity", 1e-6)
          .style("font-size", 1e-6);
  

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

// function mark(d: Node ) {
//     d3.event.ctrlKey ? d.mark("ToggleOrAdd") : d.mark();
// }
