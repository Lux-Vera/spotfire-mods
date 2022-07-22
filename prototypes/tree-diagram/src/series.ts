import {Column, MarkingOperation } from "spotfire-api";

export enum NodeType {
    Internal = "node-internal",
    Leaf = "node-leaf"
}
export interface Node {
    // id: string;
    value?: string;
    width?: number;
    type?: NodeType,
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
        width: node.name.length*fontSize*0.7,
        type: NodeType.Leaf
        //mark: (m) => node.mark(m)
    }));

    //Fake build
    let nodeSeries : Node[] = [{ value: "SuperStore", width: "SuperStore".length*fontSize, type: NodeType.Internal, children: childNodes}]

    return nodeSeries;
}
