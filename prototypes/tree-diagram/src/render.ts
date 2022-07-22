// @ts-ignore
import * as d3 from "d3";
import { FontInfo, Size, Tooltip } from "spotfire-api";
import { getAllNodes } from "./helper";
import { RenderState } from "./index";

// type D3_SELECTION = d3.Selection<SVGGElement, unknown, HTMLElement, any>;
// type D3_HIERARCHY_SELECTION = d3.Selection<SVGGElement | d3.EnterElement, d3.HierarchyPointNode<unknown> | d3.HierarchyPointLink<unknown>, SVGGElement, unknown>;
/**
 * Main svg container
 */
const svg = d3.select("#mod-container").append("svg").attr("xmlns", "http://www.w3.org/2000/svg");

export interface Options {
    /** The opacity of the branch lines */
    opacityLines: number;
    /** The width of the stroke around each blob */
    strokeWidth: number;
    /** The distance between the axis labels and the axis */
    labelOffset: number;
    /** Minimum size of a box. Defaults to 300 */
    minBoxSize: number;
    onLabelClick: null | ((x: number, y: number) => void);
}

const defaultConfig: Options = {
    opacityLines: 0.3,
    strokeWidth: 2,
    labelOffset: 20,
    minBoxSize: 50,
    onLabelClick: null
};

// export interface Data {
//     nodes: Nodes[];
//     clearMarking(): void;
// }

// marked : boolean -> To be replaced by spotfires internal API


var treeData = 
{
    "name": "Eve",
    "type": "black",
    "marked" : false,
    "children": [
       {
          "name": "Cain",
          "type": "grey",
          "marked" : true,
       },
       {
          "name": "Seth",
          "type": "grey",
          "marked" : false,
          "children": [
             {
                "name": "Enos",
                "type": "grey",
                "marked" : true,
             },
             {
                "name": "Noam",
                "type": "grey",
                "marked" : false,
             }
          ]
       },
       {
          "name": "Abel",
          "type": "grey",
          "marked" : false,
       },
       {
          "name": "Awan",
          "type": "grey",
          "marked" : false,
          "children": [
             {
                "name": "Enoch",
                "type": "grey",
                "marked" : false,
             }
          ]
       },
       {
          "name": "Azura",
          "type": "grey",
          "children" : [
            {
                "name" : "Abel",
                "type" : "grey",
                "marked" : false
            }
          ]
       }
    ]
 };
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
    //data: Data,
    windowSize: Size,
    config: Partial<Options>,
    styling: {
        scales: FontInfo;
        stroke: string;
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
        ...config
    };

    let data = treeData;

    /**
     * Calculating the position and size of the chart
     */
    const width = Math.max(windowSize.width, cfg.minBoxSize);
    const height = Math.max(windowSize.height, cfg.minBoxSize);
    const padding = 70;
    const duration = 750;
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

    var diagonal = function link(d : any) {
        return "M" + d.source.y + "," + d.source.x
            + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
            + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
      };

    let root : any = d3.hierarchy(data, (d: any) => d.children);

    root.x0 = height / 2;
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
     * @param nodes - Data nodes
     */
    function update(source: any) {
        /**
         * Compute the new tree layout
         */
        var treeLayout = tree(root);
        var links = treeLayout.links();

        /**
         * Update links
         */    
        const link = svgChart.selectAll(".link")
        .data(links, function(d:any) { return d.target.id; });

        drawLinks(link.enter());

        /**
         * Transition links to new position
         */ 
        svgChart.selectAll(".link").transition()
        .duration(duration)
        .attr("d", diagonal);

        exitLinks(link.exit());

        /**
         * Update nodes
         */
        var node = svgChart.selectAll(".node")
        .data(treeLayout.descendants(), function(d:any) { return d.id || (d.id = ++i); });

        drawNodes(node.enter());

        /**
         * Transition nodes to new position
         */ 
        svgChart.selectAll(".node")
            .transition()
            .duration(duration)
            .attr("transform", function(d:any) { return "translate(" + d.y + "," + d.x + ")"; });

        exitNodes(node.exit());
    }
    
     /**
      * Draws the links
      * @param  - 
      */
      function drawLinks(link: d3.Selection<d3.EnterElement, d3.HierarchyPointLink<unknown>, SVGGElement, unknown>) {
        /**
         * Create the branches
         */
        link
         .append("path")
         .attr("class", "link")
         .attr("d", d => diagonal({source: d.source, target: d.source}));
    }

    /**
      * Removes the branches
      * @param  - 
      */
    function exitLinks(link: d3.Selection<d3.BaseType, d3.HierarchyPointLink<unknown>, SVGGElement, unknown>) {
         // Transition exiting nodes to the parent's new position.
         link
         .transition()
           .duration(duration)
           .attr("d", d => diagonal({source: d.source, target: d.source}))
           .remove();
    }

    /**
     * Draws the nodes
     * @param node - 
     */
    function drawNodes(node: d3.Selection<any, d3.HierarchyPointNode<unknown>, SVGGElement, unknown>) {
        /**
         * Enter new nodes
         */
        let nodesEnter = node
         .append("g")
         .attr("class", d => "node " + (d.children ? "node-internal" : "node-leaf") + ` ${d.data.name}-${d.data.type}`)
         .attr("transform", d => "translate(" + (d.parent ? d.parent.y : d.y)  + "," + (d.parent ? d.parent.x : d.x) + ")")
         .on("click", singleClick)
         .on("dblclick", click);
         

        var nodeHeight = 21;
        var nodeWidth = 67;
        nodesEnter.append("rect")
         .attr("width", nodeWidth)
         .attr("height", nodeHeight)
         .attr("rx", 10)
         .style("fill", d => {
            if(d.data.marked) {
                return "grey";
            } else {
                return "white";
            }
            
         })
         .attr("y", -nodeHeight/2)
         .attr("x", -nodeWidth/2);
 
        nodesEnter.append("text")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text((d : any) => d.data.name);

        // Toggle children on click.
        function click(d : any) {
            if (d.children) {
            d._children = d.children;
            d.children = null;
            } else {
            d.children = d._children;
            d._children = null;
            }
            update(d);
        }

        function singleClick(d : any) {
            d.data.marked = !d.data.marked || false;
            update(d);
            //let nodes = getAllNodes(d);
            //nodes.forEach((node : any) => {
            //    if ((node.data.name == d.data.name) && (node.data.type == d.data.type)) {
            //        console.log(node);
            //        node.data.marked = !node.marked.data || false;
            //        update(node);
            //    } 
            //})
            //console.log(nodes[0].data.name)
            //update(nodes[0]);
        }
    }

    /**
     * Removes the nodes
     * @param node - 
     */
     function exitNodes(node: d3.Selection<d3.BaseType, d3.HierarchyPointNode<unknown>, SVGGElement, unknown>) {
    
         /**
         * Exiting nodes move to parents new position
         */
          var nodesExit = node
          .transition()
          .duration(duration)
          .attr("transform", function(d:any) { return "translate(" + d.parent.y + "," + d.parent.x + ")"; })
          .remove();
  
          /**
           * Exiting nodes shrinks
           */
          nodesExit.select("rect")
          .attr("width", 1e-6)
          .attr("height", 1e-6);
  
          /**
           * Exiting nodes text fades
           */
          nodesExit.select("text")
          .style("fill-opacity", 1e-6);
  

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

function mark(node : any ) {
    //d3.event.ctrlKey ? d.mark("ToggleOrAdd") : d.mark();
    console.log("CLICK");
}




