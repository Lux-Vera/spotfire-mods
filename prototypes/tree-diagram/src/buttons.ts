import * as d3 from "d3";
import { style } from "d3";
import { ChartSize } from "./render";

/**
 * Draws a button that allows for resetting
 * the graphs horizontal and vertical position
 */
export function renderResetPositionButton(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    zoom: any,
    size: ChartSize,
    tooltip: Spotfire.Tooltip
) {
    let button = svg
        .append("g")
        .attr("class", "settings-button")
        .attr("id", "reset-position")
        .on("mouseenter", () => {
            d3.selectAll(".reset-button-component").style("stroke", "black");
            d3.selectAll("#reset-button-circle").style("fill", "black");
            tooltip.show("Reset Position");
        })
        .on("mouseleave", () => {
            d3.selectAll(".reset-button-component").style("stroke", "grey");
            d3.selectAll("#reset-button-circle").style("fill", "grey");
            tooltip.hide();
        })
        .on("click", () => {
            d3.select("svg")
                .transition()
                .call(zoom.translateTo, 0.5 * size.width, 0.5 * size.height)
                .transition()
                .call(zoom.scaleTo, 1);
        });

    button
        .append("rect")
        .attr("height", 20)
        .attr("width", 20)
        .attr("class", "reset-button-component")
        .attr("x", 10)
        .attr("y", 50)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 5)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 52)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", 5)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 52)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 5)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 27)
        .attr("y", 52)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", 5)
        .attr("class", "reset-button-component")
        .attr("x", 21)
        .attr("y", 52)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 5)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 62)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", 5)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 68)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", 5)
        .attr("class", "reset-button-component")
        .attr("x", 21)
        .attr("y", 68)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 5)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 27)
        .attr("y", 63)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("circle")
        .attr("cx", 20)
        .attr("cy", 60.5)
        .attr("class", "reset-button-component")
        .attr("id", "reset-button-circle")
        .attr("r", 3)
        .style("stroke", "grey")
        .style("fill", "grey");
}

/**
 * Button to increase the zoom
 * by a fixed amount.
 * The text should be replaced by an img
 */
export function renderZoomInButton(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    zoom: any,
    tooltip: Spotfire.Tooltip
) {
    let button = svg
        .append("g")
        .attr("class", "settings-button")
        .attr("id", "increase-zoom")
        .on("mouseenter", () => {
            d3.selectAll(".zoom-in-component").style("stroke", "black");
            tooltip.show("Zoom in");
        })
        .on("mouseleave", () => {
            d3.selectAll(".zoom-in-component").style("stroke", "grey");
            tooltip.hide();
        })
        .on("click", () => {
            d3.select("svg").transition().call(zoom.scaleBy, 1.35);
        });

    button
        .append("rect")
        .attr("height", 20)
        .attr("width", 20)
        .attr("class", "zoom-in-component")
        .attr("x", 10)
        .attr("y", 80)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 12)
        .attr("width", 0.5)
        .attr("class", "zoom-in-component")
        .attr("x", 20)
        .attr("y", 84)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", 12)
        .attr("class", "zoom-in-component")
        .attr("x", 14)
        .attr("y", 89)
        .style("stroke", "grey")
        .style("fill", "transparent");
}

/**
 * Button to decrease the zoom
 * by a fixed amount.
 * The text should be replaced by an img
 */
export function renderZoomOutButton(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    zoom: any,
    tooltip: Spotfire.Tooltip
) {
    let button = svg
        .append("g")
        .attr("class", "settings-button")
        .attr("id", "decrease-zoom")
        .on("mouseenter", () => {
            d3.selectAll(".zoom-out-component").style("stroke", "black");
            tooltip.show("Zoom out");
        })
        .on("mouseleave", () => {
            d3.selectAll(".zoom-out-component").style("stroke", "grey");
            tooltip.hide();
        })
        .on("click", () => {
            d3.select("svg").transition().call(zoom.scaleBy, 0.65);
        });
    button
        .append("rect")
        .attr("height", 20)
        .attr("width", 20)
        .attr("class", "zoom-out-component")
        .attr("x", 10)
        .attr("y", 110)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", 12)
        .attr("x", 14)
        .attr("y", 118.5)
        .attr("class", "zoom-out-component")
        .style("stroke", "grey")
        .style("fill", "transparent");
}
