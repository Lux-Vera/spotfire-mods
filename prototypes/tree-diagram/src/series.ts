import {MarkingOperation } from "spotfire-api";

export interface Node {
    id: string;
    value?: string;
    mark(mode?: MarkingOperation): void;
    children?: Node[];
}

export function buildNodeSeries(
    id: string,
    name: string,
    // nodes: DataViewHierarchyNode[],
) {

    // let nodeSeries: Node[] = nodes.map((node) => ({
    //     id: node.key!,
    //     value: node.formattedPath(),
    //     connections: [],
    //     mark: (m) => node.mark(m)
    // }));

    // return nodeSeries;
}
