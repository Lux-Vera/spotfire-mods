import * as d3 from "d3";
import { style } from "d3";
import { ChartSize } from "./render";

export interface ButtonSettings {
    X: number; // X position for the top right corner of the button (X=0 is the left side of the page)
    Y: number; // Y position for the top right corner of the button (Y=0 is the top of the page)
    width: number; // Width of the button
    height: number; // Height of the button
}

/**
 * Draws a button that allows for resetting
 * the graphs horizontal and vertical position
 */
export function renderResetPositionButton(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    zoom: any,
    size: ChartSize,
    tooltip: Spotfire.Tooltip,
    settings: ButtonSettings
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
        .attr("height", settings.height)
        .attr("width", settings.width)
        .attr("class", "reset-button-component")
        .attr("x", settings.X)
        .attr("y", settings.Y)
        .style("stroke", "grey")
        .style("fill", "transparent");

    let lineWidth = Math.round(settings.width / 5);
    let lineHeight = Math.round(settings.height / 5);
    let margin = 8;

    button
        .append("rect")
        .attr("height", lineHeight)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / margin))
        .attr("y", settings.Y + Math.round(settings.height / margin))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / margin))
        .attr("y", settings.Y + Math.round(settings.height / margin))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", lineHeight)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + settings.width - Math.round(settings.width / margin) - 0.5)
        .attr("y", settings.Y + Math.round(settings.height / margin))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + settings.width - Math.round(settings.width / margin) - lineWidth)
        .attr("y", settings.Y + Math.round(settings.height / margin))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", lineHeight)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / margin))
        .attr("y", settings.Y + settings.height - (lineHeight + Math.round(settings.height / margin)))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / margin))
        .attr("y", settings.Y + settings.height - Math.round(settings.height / margin))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / 2 + settings.width / margin)) // HERE
        .attr("y", settings.Y + settings.height - Math.round(settings.height / margin))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", lineHeight)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + settings.width - Math.round(settings.width / margin))
        .attr("y", settings.Y + Math.round(settings.height / 2 + settings.height / margin))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("circle")
        .attr("cx", settings.X + Math.round(settings.width / 2))
        .attr("cy", settings.Y + Math.round(settings.height / 2))
        .attr("class", "reset-button-component")
        .attr("id", "reset-button-circle")
        .attr("r", Math.round(Math.sqrt(settings.height * settings.width + settings.width * settings.width) / 8))
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
    tooltip: Spotfire.Tooltip,
    settings: ButtonSettings
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
        .attr("height", settings.height)
        .attr("width", settings.width)
        .attr("class", "zoom-in-component")
        .attr("x", settings.X)
        .attr("y", settings.Y)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", Math.round(settings.height * 0.6))
        .attr("width", 0.5)
        .attr("class", "zoom-in-component")
        .attr("x", settings.X + Math.round(settings.width / 2))
        .attr("y", settings.Y + Math.round(settings.height / 2 - settings.height * 0.3))
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", Math.round(settings.width * 0.6))
        .attr("class", "zoom-in-component")
        .attr("x", settings.X + Math.round(settings.width / 2 - settings.width * 0.3))
        .attr("y", settings.Y + Math.round(settings.height / 2))
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
    tooltip: Spotfire.Tooltip,
    settings: ButtonSettings
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
        .attr("height", settings.width)
        .attr("width", settings.height)
        .attr("class", "zoom-out-component")
        .attr("x", settings.X)
        .attr("y", settings.Y)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
        .attr("width", Math.round(settings.width * 0.6))
        .attr("x", settings.X + Math.round(settings.width / 5))
        .attr("y", settings.Y + Math.round(settings.height / 2) - 0.5)
        .attr("class", "zoom-out-component")
        .style("stroke", "grey")
        .style("fill", "transparent");
}
