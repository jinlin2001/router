import { BitSet, Origins_Matrix, Path_Cost_List } from './types';

function solve({ origins, matrix }: Origins_Matrix): string[] {
  const stopsN = origins.length - 1;
  let partial_paths = partialPath({ 1: true }, stopsN);
  let path_cost: Path_Cost_List[] = [];
  let last_stop = 1;
  for (const partial in partial_paths) {
    const cost = matrix[0][last_stop];
    const path = `${last_stop}`;
    path_cost[last_stop++] = { [partial]: { cost, path } };
  }
  for (let i = 2; i <= stopsN; i++) {
    partial_paths = partialPath(partial_paths, stopsN);
    path_cost = append(matrix, partial_paths, path_cost, stopsN);
  }
  const full_bits = (1 << origins.length) - 1;
  const dest_index = origins.length === matrix[0].length ? 0 : origins.length;
  for (let i = 1; i <= stopsN; i++) {
    path_cost[i][full_bits].cost += matrix[i][dest_index];
  }
  const min_path = minPath(stopsN, full_bits, path_cost);
  const path_i = min_path.split('-');
  const path_str = path_i.map((i) => {
    return origins[+i];
  });
  return path_str;
}

function partialPath(partial_paths: BitSet, stopsN: number): BitSet {
  const new_paths: BitSet = {};
  for (let i = 1; i <= stopsN; i++) {
    const bit = 1 << i;
    for (const partial in partial_paths) {
      const partialN = +partial;
      if (!isOne(bit, partialN)) {
        new_paths[bit | partialN] = true;
      }
    }
  }
  return new_paths;
}

function minPath(
  stopsN: number,
  full_bits: number,
  path_cost: Path_Cost_List[]
) {
  let min_cost = Number.MAX_SAFE_INTEGER;
  let min_path = '';
  for (let i = 1; i <= stopsN; i++) {
    if (min_cost > path_cost[i][full_bits].cost) {
      min_cost = path_cost[i][full_bits].cost;
      min_path = path_cost[i][full_bits].path;
    }
  }
  return min_path;
}

function append(
  matrix: number[][],
  partial_paths: BitSet,
  path_cost: Path_Cost_List[],
  stopsN: number
) {
  const pc_list: Path_Cost_List[] = [];
  for (let i = 1; i <= stopsN; i++) {
    pc_list[i] = {};
  }
  for (const partial_str in partial_paths) {
    const partial = +partial_str;
    for (let next = 1; next <= stopsN; next++) {
      const next_bit = 1 << next;
      if (isOne(next_bit, partial)) {
        const old_partial = next_bit ^ partial;
        for (let previous = 1; previous <= stopsN; previous++) {
          if (next !== previous && old_partial in path_cost[previous]) {
            const pc = path_cost[previous][old_partial];
            const cost = pc.cost + matrix[previous][next];
            if (
              !(partial in pc_list[next]) ||
              cost < pc_list[next][partial].cost
            ) {
              pc_list[next][partial] = { cost, path: `${pc.path}-${next}` };
            }
          }
        }
      }
    }
  }
  return pc_list;
}

function isOne(b: number, bits: number) {
  return (b & bits) > 0;
}

export { solve };
