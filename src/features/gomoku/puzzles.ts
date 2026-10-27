// Three "win in one" positions. `mover` is whoever is playing: Jingyi sees her purple to move,
// Yifan his green, so the same puzzle serves both. Each has exactly one winning point (tested).
import type { Cell } from './core';

export interface Puzzle { id: string; mover: Cell[]; other: Cell[]; answer: Cell }

export const PUZZLES: Puzzle[] = [
  {
    // A four blocked at one end: the open end wins.
    id: 'four',
    mover: [[7, 5], [7, 6], [7, 7], [7, 8], [5, 6], [9, 8], [6, 9]],
    other: [[7, 4], [6, 6], [8, 7], [6, 8], [8, 5], [5, 7], [8, 9]],
    answer: [7, 9],
  },
  {
    // A diagonal with a hole in the middle, both ends shut.
    id: 'hole',
    mover: [[4, 4], [5, 5], [7, 7], [8, 8], [5, 7], [8, 5], [10, 6]],
    other: [[3, 3], [9, 9], [5, 6], [6, 5], [4, 8], [7, 4], [6, 8], [9, 6]],
    answer: [6, 6],
  },
  {
    // A split four up the middle while the other side has an open four waiting: win now or lose.
    id: 'now',
    mover: [[3, 7], [4, 7], [6, 7], [7, 7], [9, 3], [10, 4], [11, 5], [5, 9], [6, 10]],
    other: [[2, 7], [8, 7], [5, 6], [10, 8], [10, 9], [10, 10], [10, 11], [8, 2], [12, 6], [4, 8]],
    answer: [5, 7],
  },
];
