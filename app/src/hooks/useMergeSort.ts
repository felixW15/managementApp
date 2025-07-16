import type{ Task } from "../api/tasks";
import { useState } from "react";

export function useMergeSort(tasks: Task[]) {
  const [sorted, setSorted] = useState<Task[] | null>(null);
  const [currentPair, setCurrentPair] = useState<[Task, Task] | null>(null);
  const [stack, setStack] = useState<any[]>([]);

  const start = () => {
    const s = createMergeStack(tasks);
    console.log("merge stack", s);
    setStack(s);
    showNextComparison(s);
  };

  const choose = (preferred: Task) => {
    const top = stack[stack.length - 1];
    let { left, right, result, i, j } = top;

    if (preferred.id === left[i].id) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }

    if (i < left.length && j < right.length) {
      updateTop({ i, j, result });
      setCurrentPair([left[i], right[j]]);
    } else {
      result.push(...left.slice(i), ...right.slice(j));
      stack.pop();

      if (stack.length === 0) {
        setSorted(result);
        setCurrentPair(null);
      } else {
        const parent = stack[stack.length - 1];
        if (!parent.subResults) parent.subResults = [];
        parent.subResults.push(result);
        showNextComparison(stack);
      }
    }
  };

  const showNextComparison = (s: any[]) => {
    let top = s[s.length - 1];
    console.log("top before pairing:", top);
    console.log(top.subResults)
    while (top.subResults?.length === 2) {
      const [left, right] = top.subResults;
      top.left = left;
      top.right = right;
      top.i = 0;
      top.j = 0;
      top.result = [];
      top.subResults = undefined;
      top = s[s.length - 1];
    }

    if (top.left && top.right) {
        console.log("Setting currentPair to:", [top.left[top.i], top.right[top.j]]);
      setCurrentPair([top.left[top.i], top.right[top.j]]);
    }
  };

  const updateTop = (updates: any) => {
    const updated = { ...stack[stack.length - 1], ...updates };
    const newStack = [...stack.slice(0, -1), updated];
    setStack(newStack);
  };

  return {
    currentPair,
    sorted,
    start,
    choose,
  };
}

function createMergeStack(arr: Task[]) {
  const stack: any[] = [];

  const divide = (list: Task[]): any => {
    if (list.length <= 1) return list;

    const mid = Math.floor(list.length / 2);
    const left = divide(list.slice(0, mid));
    const right = divide(list.slice(mid));

    const mergeStep = {
      subResults: [left, right],
    };

    stack.push(mergeStep);
    return mergeStep;
  };

  divide(arr);
  return stack;
}