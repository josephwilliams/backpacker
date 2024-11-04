import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useSolanaContract } from "@/contexts/ContractContext";

const GRID_SIZE = 30;
const SPRITES = [" ", " ", "", "~", "*", " ", "+", "🌳"]; // Include tree emoji

type Cell = string | null;
type ForestContextType = {
  matrix: Cell[][];
  addTree: () => void;
  regenerateForest: () => void;
};

// Create the context
const ForestContext = createContext<ForestContextType | undefined>(undefined);

const getRandomSprite = () => {
  const randomIndex = Math.floor(Math.random() * (SPRITES.length - 1)); // Exclude tree initially
  return SPRITES[randomIndex];
};

// Generate matrix with trees and sprites
const generateMatrix = (count: number, existingMatrix?: Cell[][]): Cell[][] => {
  // If existingMatrix is provided, deeply clone it; otherwise, create a new matrix
  const grid: Cell[][] = existingMatrix
    ? existingMatrix.map((row) => [...row]) // Proper deep clone of the 2D array
    : Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => null)
      );

  // Fill the grid with random sprites only in cells that don't already have a tree
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === null) {
        grid[i][j] = getRandomSprite();
      }
    }
  }

  // Randomly place tree emojis in available spots
  let currentTreeCount = existingMatrix
    ? existingMatrix.flat().filter((cell) => cell === "🌳").length
    : 0;

  while (currentTreeCount < count) {
    const randomRow = Math.floor(Math.random() * GRID_SIZE);
    const randomCol = Math.floor(Math.random() * GRID_SIZE);

    if (grid[randomRow][randomCol] !== "🌳") {
      grid[randomRow][randomCol] = "🌳";
      currentTreeCount++;
    }
  }

  return grid;
};

// Create the ForestProvider to hold the forest state
export const ForestProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { count: treeCount } = useSolanaContract();
  const [matrix, setMatrix] = useState<Cell[][]>([]);
  const matrixRef = useRef<Cell[][]>(null); // Store the matrix in a ref so it persists between renders

  const regenerateForest = useCallback(() => {
    const newMatrix = generateMatrix(treeCount, matrixRef.current); // Generate based on existing matrix
    matrixRef.current = newMatrix; // Update the reference to the new matrix
    setMatrix(newMatrix); // Update the state
  }, [treeCount]);

  useEffect(() => {
    regenerateForest(); // Initialize the forest on mount
  }, [regenerateForest, treeCount]);

  // Function to add a tree emoji in an empty spot in the matrix
  const addTree = () => {
    const newMatrix = [...matrix]; // Create a copy of the existing matrix

    // Find all empty cells where a tree can be placed
    const emptyCells: { row: number; col: number }[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newMatrix[i][j] !== "🌳") {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length === 0) return; // No empty cells available

    // Randomly choose an empty cell to place a new tree
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    // Place a tree in the selected empty cell
    newMatrix[row][col] = "🌳";

    // Update the matrix with the new tree
    setMatrix(newMatrix);
  };

  return (
    <ForestContext.Provider value={{ matrix, addTree, regenerateForest }}>
      {children}
    </ForestContext.Provider>
  );
};

// Custom hook to use the ForestContext
export const useForest = () => {
  const context = useContext(ForestContext);
  if (!context) {
    throw new Error("useForest must be used within a ForestProvider");
  }
  return context;
};
