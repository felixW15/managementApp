import { useState, useCallback } from "react";
import type { Task } from "../api/tasks";

type CompareRequest = {
  leftIndex: number;
  rightIndex: number;
  resolve: (winnerIndex: number) => void;
};

export function useMergeSort(tasks: Task[]) {
  const [sortedIndexes, setSortedIndexes] = useState<number[] | null>(null);
  const [compareRequest, setCompareRequest] = useState<CompareRequest | null>(null);

  const sort = useCallback(async () => {
    const indexes = tasks.map((_, i) => i); // [0, 1, 2, ...]
    const result = await mergeSort(indexes);
    setSortedIndexes(result);
  }, [tasks]);

  async function mergeSort(indexes: number[]): Promise<number[]> {
    if (indexes.length <= 1) return indexes;

    const mid = Math.floor(indexes.length / 2);
    const left = await mergeSort(indexes.slice(0, mid));
    const right = await mergeSort(indexes.slice(mid));

    return await merge(left, right);
  }

  async function merge(left: number[], right: number[]): Promise<number[]> {
    const result: number[] = [];
    let indexL = 0;
    let indexR = 0;

    while (indexL < left.length && indexR < right.length) {
      const leftIndex = left[indexL];
      const rightIndex = right[indexR];

      const winnerIndex = await new Promise<number>((resolve) => {
        setCompareRequest({ leftIndex, rightIndex, resolve });
      });

      if (winnerIndex === leftIndex) {
        result.push(leftIndex);
        indexL++;
      } else {
        result.push(rightIndex);
        indexR++;
      }
    }

    while (indexL < left.length) {
      result.push(left[indexL]);
      indexL++;
    }

    while (indexR < right.length) {
      result.push(right[indexR]);
      indexR++;
    }
    return result;
  }

  const choose = (winnerIndex: number) => {
    if (compareRequest) {
      compareRequest.resolve(winnerIndex);
      setCompareRequest(null);
    }
  };

  return {
    tasks,
    sortedTasks: sortedIndexes ? sortedIndexes.map((i) => tasks[i]) : null,
    currentComparison:
      compareRequest !== null
        ? [tasks[compareRequest.leftIndex], tasks[compareRequest.rightIndex]]
        : null,
    sort,
    choose,
  };
}