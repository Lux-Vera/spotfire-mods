import * as d3 from "d3";
import { Node, singleClick } from "./render";
import { getAllNodes, compareNodes } from "./helper";
import { Tooltip } from "spotfire-api";

function getReferences(d: d3.HierarchyPointNode<Node>): Node[] {
    let nodes = getAllNodes(d);
    let references: Node[] = [];
    nodes.forEach((node) => {
        if (compareNodes(d, node) && node.data.children !== undefined) {
            references.push(...node.data.children);
        }
    });
    return references;
}

function getReferencedBy(d: d3.HierarchyPointNode<Node>): Node[] {
    let nodes = getAllNodes(d);
    let referencedBy: Node[] = [];
    nodes.forEach((node) => {
        if (node.data.children !== undefined) {
            if (node.data.children?.filter((n) => n.name === d.data.name).length > 0) {
                referencedBy.push(node.data);
            }
        }
    });
    return referencedBy;
}

export function renderInfoBox(d: d3.HierarchyPointNode<Node>, update: any, tooltip: Tooltip) {
    d3.selectAll(".info-box").remove();
    let container = d3.select("#mod-container");
    container
        .append("div")
        .attr("class", "info-box")
        .style("position", "absolute")
        .style("top", "0")
        .style("right", "0")
        .style("width", "200px")
        .style("height", "fit-content")
        .style("text-align", "left")
        .style("border-radius", "5px")
        .style("background-color", "white")
        .style("padding", "5px");

    let infoBox = d3.select(".info-box");
    generateHideButton(infoBox, tooltip);

    let referencedBy = getReferencedBy(d);
    if (referencedBy.length !== 0) {
        generateReferencesByContainer(infoBox, referencedBy, d, update, tooltip);
    }

    let references = getReferences(d);
    if (references.length !== 0) {
        generateReferencesContainer(infoBox, references, d, update, tooltip);
    }
}

function generateHideButton(container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tooltip: Tooltip) {
    container
        .append("span")
        .style("width", "18px")
        .style("height", "18px")
        .style("display", "inline-block")
        .style("position", "absolute")
        .style("right", 0)
        .style("margin-right", "5px")
        .style("margin-top", "5px")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("background-color", "white")
        .on("click", () => {
            d3.selectAll(".info-box").remove();
            tooltip.hide();
        })
        .on("mouseenter", () => {
            tooltip.show("Close");
        })
        .on("mouseleave", () => {
            tooltip.hide();
        })
        .append("div")
        .style("width", "16px")
        .style("height", "3px")
        .style("background-color", "black")
        .style("margin-top", "7px")
        .style("margin-left", "1px")
        .style("transform", "rotate(45deg)")
        .append("div")
        .style("width", "16px")
        .style("height", "3px")
        .style("background-color", "black")
        .style("margin-top", "7px")
        .style("margin-left", "1px")
        .style("transform", "rotate(90deg)");
}

function generateReferencesByContainer(
    container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    references: Node[],
    d: d3.HierarchyPointNode<Node>,
    update: any,
    tooltip: Tooltip
) {
    container
        .style("border", "1px solid black")
        .append("div")
        .attr("class", "references-container")
        .append("h2")
        .text("Parents");

    container.append("ul");
    references.map((reference) => {
        container
            .append("li")
            .style("list-style-type", "none")
            .style("font-size", "16px")
            .append("span")
            .text(reference.name)
            .style("color", "blue")
            .style("text-decoration", "underline")
            .on("click", () => {
                let nodes = getAllNodes(d);
                nodes.forEach((node) => {
                    if (node.data.name == reference.name && node.data.type == reference.type) {
                        singleClick(node, update, tooltip);
                    }
                });
            });
    });
}

function generateReferencesContainer(
    container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    references: Node[],
    d: d3.HierarchyPointNode<Node>,
    update: any,
    tooltip: Tooltip
) {
    container
        .style("border", "1px solid black")
        .append("div")
        .attr("class", "references-container")
        .append("h2")
        .text("Children");

    container.append("ul");
    references.map((reference) => {
        container
            .append("li")
            .style("font-size", "16px")
            .style("list-style-type", "none")
            .append("span")
            .text(reference.name)
            .style("color", "blue")
            .style("text-decoration", "underline")
            .on("click", () => {
                let nodes = getAllNodes(d);
                nodes.forEach((node) => {
                    if (node.data.name == reference.name && node.data.type == reference.type) {
                        singleClick(node, update, tooltip);
                    }
                });
            });
    });
}
