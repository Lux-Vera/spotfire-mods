// @ts-ignore
import * as d3 from "d3";
import { FontInfo, Size, Tooltip } from "spotfire-api";
import { RenderState } from "./index";
import { Serie, Point } from "./series";

// type D3_SELECTION = d3.Selection<SVGGElement, unknown, HTMLElement, any>;
// type D3_SERIE_SELECTION = d3.Selection<SVGGElement, Serie, SVGGElement | null, unknown>;

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
    minBoxSize: 300,
    onLabelClick: null
};

export interface Data {
    yDomain: { min: number; max: number };
    xScale: string[];
    series: Serie[];
    clearMarking(): void;
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

    /**
     * Calculating the position and size of the chart
     */
    const width = Math.max(windowSize.width, cfg.minBoxSize);
    const padding = 70;
    const height = Math.max(windowSize.height, cfg.minBoxSize);

    /**
     * Sets the viewBox to match windowSize
     */
    svg.attr("viewBox", `0, 0, ${width}, ${height}`);
    svg.style("width", "100%");
    svg.style("height", height + "px");
    svg.selectAll("*").remove();

    
    const colorSeries = data.series;

    /**
     * Drawing the chart
     */
    draw(colorSeries);

    /**
     * Draw the rectangular selection
     */
    drawRectangularSelection();

    /**
     * Draws a group.
     * @param series - Data series
     */
    function draw(series: Serie[]) {
        /**
         * Append a g element where the current group will be drawn.
         * Translating the position of the chart according to the width and height of it
         */
        const svgChart = svg
            .append("g")
            .attr(
                "transform",
                "translate(" +
                    (width + padding) +
                    "," +
                    (height + padding) +
                    ")"
            );

        /**
         * Create a wrapper for the blobs
         */
        const svgNodes = svgChart
            .selectAll(".node-blobs")
            .data(series)
            .enter()
            .append("g")
            .attr("class", "node-blobs");

        drawNodes(svgNodes);
        drawBranches( svgNodes );
    }


    /**
     * Draws the nodes
     * @param svgNodeBlobs - Wrapper for the blobs
     */
    function drawNodes(svgNodeBlobs: d3.Selection<SVGGElement, Serie, SVGGElement, unknown>) {
        /**
         * Create the nodes
         */
    }

     /**
     * Draws the branches
     * @param svgNodeBlobs - Wrapper for the blobs
     */
      function drawBranches(svgNodeBlobs: d3.Selection<SVGGElement, Serie, SVGGElement, unknown>) {
        /**
         * Create the branches
         */
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
                return data.clearMarking();
            }

            const selectionBox = rectangle.node()!.getBoundingClientRect();
            const svgMarkedNodes = svg.selectAll<SVGCircleElement, Point>(".node-blobs").filter(function () {
                const box = this.getBoundingClientRect();
                return (
                    box.x >= selectionBox.x &&
                    box.y >= selectionBox.y &&
                    box.x + box.width <= selectionBox.x + selectionBox.width &&
                    box.y + box.height <= selectionBox.y + selectionBox.height
                );
            });

            if (svgMarkedNodes.size() === 0) {
                return data.clearMarking();
            }

            svgMarkedNodes.each(mark);
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

function mark(d: Serie | Point) {
    d3.event.ctrlKey ? d.mark("ToggleOrAdd") : d.mark();
}

