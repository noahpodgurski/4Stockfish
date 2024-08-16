import type {Stage, Surface, LabelledSurface} from "../../stages/stage";

// zips labelling information onto a list
export function zipLabels ( list: Surface[], string: string, start: number = 0 ): any {
  if (list.length === 0) {
    return [];
  }
  else {
    const [head, ...tail] = list;
    return ( [[head, [string, start]]] . concat( zipLabels(tail, string, start+1) ) ) ;
  }
}
