// export interface RGB {
//     readonly r: number
//     readonly g: number
//     readonly b: number
// }
// export interface RGBA {
//     readonly r: number
//     readonly g: number
//     readonly b: number
//     readonly a: number
// }
// export interface SolidPaint {
//     readonly type: 'SOLID'
//     readonly color: RGB
//     readonly visible?: boolean
//     readonly opacity?: number
//     readonly blendMode?: BlendMode
//     readonly boundVariables?: {
//       [field in VariableBindablePaintField]?: VariableAlias
//     }
// }

// export interface BaseNode {
//     id: string;
//     name: string;
//     visible: boolean;
//     locked: boolean;
//     removed: boolean;
//     parent: (BaseNode & ChildrenMixin) | null;
//     children: ReadonlyArray<SceneNode>;
//     readonly type: NodeType;
//     readonly pluginData: string;
//     readonly sharedPluginData: string;
//   }
  
// export interface SceneNode extends BaseNode {
//     readonly type: "GROUP" | "FRAME" | "COMPONENT" | "INSTANCE" | "BOOLEAN_OPERATION" | "VECTOR" | "STAR" | "LINE" | "ELLIPSE" | "POLYGON" | "RECTANGLE";
//     readonly parent: (PageNode | SceneNode) & ChildrenMixin;
//     readonly width: number;
//     readonly height: number;
//     x: number;
//     y: number;
//     readonly rotation: number;
//   }
  
// export interface RectangleNode extends SceneNode {
//     fills: ReadonlyArray<Paint>;
//     strokes: ReadonlyArray<Paint>;
//     strokeWeight: number;
//     cornerRadius: number;
//   }