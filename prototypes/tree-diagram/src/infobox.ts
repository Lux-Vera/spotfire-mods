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
        .style("box-shadow", "0 4px 18px 0 rgb(0 0 0 / 15%), 0 4px 5px 0 rgb(0 0 0 / 14%)")
        .style("width", "fit-content")
        .style("min-width", "320px")
        .style("height", "fit-content")
        .style("text-align", "left")
        .style("font-family", "Roboto, sans-serif")
        .style("border-radius", "5px")
        .style("background-color", "white")
        .style("padding", "5px");

    let infoBox = d3.select(".info-box");
    generateHideButton(infoBox, tooltip);
    generateHeader(infoBox, d);

    let referencedBy = getReferencedBy(d);
    if (referencedBy.length !== 0) {
        generateReferencesByContainer(infoBox, referencedBy, d, update, tooltip);
    }

    let references = getReferences(d);
    if (references.length !== 0) {
        generateReferencesContainer(infoBox, references, d, update, tooltip);
    }

    generateCallSite(infoBox, d, update, tooltip);
}

function generateHeader(
    container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    d: d3.HierarchyPointNode<Node>
) {
    container
        .append("h1")
        .text(d.data.name)
        .style("font-size", "3em")
        .style("font-weight", "bold")
        .style("margin-left", "10px")
        .style("margin-bottom", "0px")
        .style("color", "#000000")
        .style("font-family", "Roboto, sans-serif");
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
        .style("width", "12px")
        .style("height", "2px")
        .style("background-color", "black")
        .style("margin-top", "7px")
        .style("margin-left", "2px")
        .style("transform", "rotate(45deg)")
        .append("div")
        .style("width", "12px")
        .style("height", "2px")
        .style("background-color", "black")
        .style("margin-top", "4px")
        .style("margin-left", "2px")
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
        .append("div")
        .attr("class", "references-container")
        .style("padding", "10px")
        .style("padding-top", "0px") 
        .style("margin-top", "0px")
        .append("h2")
        .text("Parents")
        .style("font-size", "20px")
        .style("margin-top", "0px")
        .style("margin-bottom", "0px")
        .style("color", "#000000");

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
            .style("margin-left", "20px")
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
        .append("div")
        .attr("class", "references-container")
        .style("padding", "10px")
        .style("padding-top", "0px") 
        .append("h2")
        .text("Children")
        .style("font-size", "20px")
        .style("margin-bottom", "0px")
        .style("color", "#000000");

    container.append("ul");
    references.map((reference) => {
        container
            .append("li")
            .style("font-size", "16px")
            .style("list-style-type", "none")
            .append("span")
            .text(reference.name)
            .style("color", "#3050ef")
            .style("text-decoration", "underline")
            .style("margin-left", "20px")
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

function generateCallSite(
    container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    d: d3.HierarchyPointNode<Node>,
    update : any,
    tooltip : Tooltip
) {
    let sites = getCallSites(d);

    let csContainer = container
        .append("div")
        .attr("class", "call-site-container")
        .style("padding", "10px")
        .style("padding-top", "0px") 
        .append("h2")
        .text("Root Path")
        .style("font-size", "20px")
        .style("margin-bottom", "0px")
        .style("color", "#000000")
        .append("ul");

    sites.forEach((siteList) => {
        let li = csContainer.append("li").style("font-size", "16px").style("margin-right", "10px").style("margin-top", "0px");
        siteList.forEach((site, idx) => {
            if (idx !== 0) {
                li.append("span")
                    .text(` > ${site.data.name}`)
                    .style("color", "#3050ef")
                    .style("font-size", "16x")
                    .on("click", () => {
                        singleClick(site, update, tooltip);
                    });
            } else {
                li.append("span")
                    .text(site.data.name)
                    .style("color", "#3050ef")
                    .style("font-size", "16px")
                    .on("click", () => {
                        singleClick(site, update, tooltip)
                    });
            }
        });
    });
}

function getCallSites(d: d3.HierarchyPointNode<Node>) : d3.HierarchyPointNode<Node>[][] {
    let sites : d3.HierarchyPointNode<Node>[][] = []
    let allNodes = getAllNodes(d);
    allNodes.forEach(node => {
        if(compareNodes(node, d)) {
            sites.push(node.ancestors().reverse())
        }
    })
    return sites;
}
