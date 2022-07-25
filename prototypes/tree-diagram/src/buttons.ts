import * as d3 from "d3";
<<<<<<< HEAD
import { style } from "d3";
import { ChartSize } from "./render";

export interface ButtonSettings {
    X: number; // X position for the top right corner of the button (X=0 is the left side of the page)
    Y: number; // Y position for the top right corner of the button (Y=0 is the top of the page)
    width: number; // Width of the button
    height: number; // Height of the button
}
=======
import { ChartSize } from "./render";

// Todo use spotfire API to render tooltip displaying informations on hoover
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)

/**
 * Draws a button that allows for resetting
 * the graphs horizontal and vertical position
 */
export function renderResetPositionButton(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    zoom: any,
<<<<<<< HEAD
    size: ChartSize,
    tooltip: Spotfire.Tooltip,
    settings: ButtonSettings
=======
    size: ChartSize
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
) {
    let button = svg
        .append("g")
        .attr("class", "settings-button")
        .attr("id", "reset-position")
<<<<<<< HEAD
        .on("mouseenter", () => {
            d3.selectAll(".reset-button-component").style("stroke", "#3050ef").style("fill", "#ebefff");
            d3.selectAll("#reset-button-circle").style("fill", "#3050ef").style("fill", "#3050ef");
            tooltip.show("Reset Position");
        })
        .on("mouseleave", () => {
            d3.selectAll(".reset-button-component").style("stroke", "grey").style("fill", "transparent");
            d3.selectAll("#reset-button-circle").style("fill", "grey");
            tooltip.hide();
=======
        .on('mouseenter', () => {
            d3.selectAll(".reset-button-component").style("stroke", "black");
        })
        .on("mouseleave", () => {
            console.log("Mouse LEave")
            d3.selectAll(".reset-button-component").style("stroke", "gray");
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        })
        .on("click", () => {
            d3.select("svg")
                .transition()
<<<<<<< HEAD
                .call(zoom.translateTo, 0.5 * size.width, 0.5 * size.height)
                .transition()
                .call(zoom.scaleTo, 1);
=======
                .call(zoom.translateTo, 0.5 * size.width, 0.5 * size.height).transition().call(zoom.scaleTo, 1);
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        });

    button
        .append("rect")
<<<<<<< HEAD
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
=======
        .attr("height", 20)
        .attr("width", 20)
        .attr("class", "reset-button-component")
        .attr("x", 10)
        .attr("y", 50)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 7)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 52)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
<<<<<<< HEAD
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / margin))
        .attr("y", settings.Y + Math.round(settings.height / margin))
=======
        .attr("width", 7)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 52)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
<<<<<<< HEAD
        .attr("height", lineHeight)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + settings.width - Math.round(settings.width / margin) - 0.5)
        .attr("y", settings.Y + Math.round(settings.height / margin))
=======
        .attr("height", 6)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 27)
        .attr("y", 52)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
<<<<<<< HEAD
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + settings.width - Math.round(settings.width / margin) - lineWidth)
        .attr("y", settings.Y + Math.round(settings.height / margin))
=======
        .attr("width", 6)
        .attr("class", "reset-button-component")
        .attr("x", 21)
        .attr("y", 52)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
<<<<<<< HEAD
        .attr("height", lineHeight)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / margin))
        .attr("y", settings.Y + settings.height - (lineHeight + Math.round(settings.height / margin)))
=======
        .attr("height", 7)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 61)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
<<<<<<< HEAD
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / margin))
        .attr("y", settings.Y + settings.height - Math.round(settings.height / margin))
=======
        .attr("width", 7)
        .attr("class", "reset-button-component")
        .attr("x", 12)
        .attr("y", 68)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
<<<<<<< HEAD
        .attr("width", lineWidth)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + Math.round(settings.width / 2 + settings.width / margin)) // HERE
        .attr("y", settings.Y + settings.height - Math.round(settings.height / margin))
=======
        .attr("width", 7)
        .attr("class", "reset-button-component")
        .attr("x", 21)
        .attr("y", 68)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
<<<<<<< HEAD
        .attr("height", lineHeight)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", settings.X + settings.width - Math.round(settings.width / margin))
        .attr("y", settings.Y + Math.round(settings.height / 2 + settings.height / margin))
=======
        .attr("height", 6)
        .attr("width", 0.5)
        .attr("class", "reset-button-component")
        .attr("x", 27)
        .attr("y", 61)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("circle")
<<<<<<< HEAD
        .attr("cx", settings.X + Math.round(settings.width / 2))
        .attr("cy", settings.Y + Math.round(settings.height / 2))
        .attr("class", "reset-button-component")
        .attr("id", "reset-button-circle")
        .attr("r", Math.round(Math.sqrt(settings.height ** 2 + settings.width ** 2) / 8))
        .style("stroke", "grey")
        .style("fill", "grey");
}

=======
        .attr("cx", 20)
        .attr("cy", 61)
        .attr("class", "reset-button-component")
        .attr("r", 4)
        .style("stroke", "grey")
        .style("fill", "transparent")

}


>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
/**
 * Button to increase the zoom
 * by a fixed amount.
 * The text should be replaced by an img
 */
<<<<<<< HEAD
export function renderZoomInButton(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    zoom: any,
    tooltip: Spotfire.Tooltip,
    settings: ButtonSettings
) {
=======
export function renderZoomInButton(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, zoom: any) {
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
    let button = svg
        .append("g")
        .attr("class", "settings-button")
        .attr("id", "increase-zoom")
        .on("mouseenter", () => {
<<<<<<< HEAD
            d3.selectAll(".zoom-in-component").style("stroke", "#3050ef").style("fill", "#ebefff");
            tooltip.show("Zoom in");
        })
        .on("mouseleave", () => {
            d3.selectAll(".zoom-in-component").style("stroke", "grey").style("fill", "transparent");
            tooltip.hide();
=======
            d3.selectAll(".zoom-in-component").style("stroke", "black");
        })
        .on("mouseleave", () => {
            d3.selectAll(".zoom-in-component").style("stroke", "grey");
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        })
        .on("click", () => {
            d3.select("svg").transition().call(zoom.scaleBy, 1.35);
        });

    button
        .append("rect")
<<<<<<< HEAD
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
=======
        .attr("height", 20)
        .attr("width", 20)
        .attr("class", "zoom-in-component")
        .attr("x", 10)
        .attr("y", 80)
        .style("stroke", "black")
        .style("fill", "transparent");
    
    button
        .append("rect")
        .attr("height", 12)
        .attr("width", 0.5)
        .attr("class", "zoom-in-component")
        .attr("x", 20)
        .attr("y", 84)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
<<<<<<< HEAD
        .attr("width", Math.round(settings.width * 0.6))
        .attr("class", "zoom-in-component")
        .attr("x", settings.X + Math.round(settings.width / 2 - settings.width * 0.3))
        .attr("y", settings.Y + Math.round(settings.height / 2))
        .style("stroke", "grey")
        .style("fill", "transparent");
=======
        .attr("width", 12)
        .attr("class", "zoom-in-component")
        .attr("x", 14)
        .attr("y", 89)
        .style("stroke", "grey")
        .style("fill", "transparent");
    
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
}

/**
 * Button to decrease the zoom
 * by a fixed amount.
 * The text should be replaced by an img
 */
<<<<<<< HEAD
export function renderZoomOutButton(
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
    zoom: any,
    tooltip: Spotfire.Tooltip,
    settings: ButtonSettings
) {
=======
export function renderZoomOutButton(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, zoom: any) {
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
    let button = svg
        .append("g")
        .attr("class", "settings-button")
        .attr("id", "decrease-zoom")
        .on("mouseenter", () => {
<<<<<<< HEAD
            d3.selectAll(".zoom-out-component").style("stroke", "#3050ef").style("fill", "#ebefff");
            tooltip.show("Zoom out");
        })
        .on("mouseleave", () => {
            d3.selectAll(".zoom-out-component").style("stroke", "grey").style("fill", "transparent");
            tooltip.hide();
=======
            d3.selectAll(".zoom-out-component").style("stroke", "black");
        })
        .on("mouseleave", () => {
            d3.selectAll(".zoom-out-component").style("stroke", "grey");
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        })
        .on("click", () => {
            d3.select("svg").transition().call(zoom.scaleBy, 0.65);
        });
<<<<<<< HEAD
    button
        .append("rect")
        .attr("height", settings.width)
        .attr("width", settings.height)
        .attr("class", "zoom-out-component")
        .attr("x", settings.X)
        .attr("y", settings.Y)
=======
;
    button
        .append("rect")
        .attr("height", 20)
        .attr("width", 20)
        .attr("class", "zoom-out-component")
        .attr("x", 10)
        .attr("y", 110)
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
        .style("stroke", "grey")
        .style("fill", "transparent");

    button
        .append("rect")
        .attr("height", 0.5)
<<<<<<< HEAD
        .attr("width", Math.round(settings.width * 0.6))
        .attr("x", settings.X + Math.round(settings.width / 5))
        .attr("y", settings.Y + Math.round(settings.height / 2) - 0.5)
        .attr("class", "zoom-out-component")
        .style("stroke", "grey")
        .style("fill", "transparent");
}
=======
        .attr("width", 12)
        .attr("x", 14)
        .attr("y", 118.5)
        .attr("class", "zoom-out-component")
        .style("stroke", "grey")
        .style("fill", "transparent");

}
>>>>>>> 119cbfc (Updating buttons to render svg's instead of text and moving them to a seperate file)
