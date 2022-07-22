import {Column, DataViewHierarchyNode, MarkingOperation } from "spotfire-api";

export interface Node {
    // id: string;
    value?: string;
    width?: number;
    // mark(mode?: MarkingOperation): void;
    children?: Node[];
}

export function buildNodeSeries(
    nodes: Column[],
    fontSize: number,
) {

    //TODO

    let childNodes : Node[] = nodes.map((node) => ({
        // id: node.,
        value: node.name,
        width: node.name.length*fontSize*0.7
        //mark: (m) => node.mark(m)
    }));

    //Fake build
    let nodeSeries : Node[] = [{ value: "SuperStore", width: "SuperStore".length*fontSize, children: childNodes}]

    return nodeSeries;
}
