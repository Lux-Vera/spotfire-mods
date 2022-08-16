
export enum NodeType {
    Internal = "node-internal",
    Leaf = "node-leaf"
}
export interface Nodes {
    id: number;
    parentId : number;
    value: string;
    width?: number;
    type?: NodeType;
    mark(node : Nodes) : void;
    markColumn(toMark : number[]) : void;
    marked : boolean;
    //mark(mode?: MarkingOperation): void;
    children: Nodes[] | null;
    _children: Nodes[] | null;
    level? : number;
    color? : string;
}

//export function buildNodes(
//    node: RawData,
//    fontSize: number
//) {
//    let type = node.children ? NodeType.Internal : NodeType.Leaf;
//    let width = calcNodeWidth();
//    let children = node.children?.map((child, index) => buildNodes(child, fontSize));
//
//    let nodes : Nodes = {
//        value: node.value,
//        width: width,
//        type: type,
//        mark() {
//            
//        },
//        marked : false,
//        children: children
//    }
//
//    return nodes;
//
//    function calcNodeWidth() : number{
//        //TODO -- needs improvement
//        return fontSize*node.value.length*0.7;
//    }
//}