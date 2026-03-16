declare module "topojson-client" {
  export interface Topology {
    type: "Topology";
    objects: Record<string, GeometryCollection>;
    bbox?: number[];
    transform?: object;
    arcs?: number[][][];
  }

  export interface GeometryCollection {
    type: "GeometryCollection";
    geometries: object[];
  }

  export function feature<T>(
    topology: Topology,
    object: GeometryCollection,
  ): T;
}
