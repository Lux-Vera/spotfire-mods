import * as d3 from "d3";

export function renderInfoBox() {
    let container = d3.select("#mod-container");
    container
        .append("div")
        .attr("class", "info-box")
        .style("position", "absolute")
        .style("top", "0")
        .style("right", "0")
        .style("width", "200px")
        .style("height", "100px")
        .style("text-align", "left")
        .style("background-color", "red");

    generateReferencesContainer(d3.select(".info-box"), ["Abel", "Eve"]);
}

function generateReferencesContainer(
    container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    references: string[]
) {
    container
        .style("border", "1px solid black")
        .append("div")
        .attr("class", "references-container")
        .append("h2")
        .text("Referenced by");

    container.append("ul");
    references.map((reference) => {
        container
            .append("li")
            .style("font-size", "16px")
            .append("span")
            .text(reference)
            .style("color", "blue")
            .style("text-decoration", "underline")
            .on("click", () => {
                console.log("Navigating");
            });
    });
}
