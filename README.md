# Advanced Programming Course - (Current Phase)

This repository contains our current implementation stage of the Ex1 CLI recommender system in C++.

## Project Structure (Current State)

- `src/`
  - core application code (`App`, parser, repository, recommender, `main`)
- `tests/`
  - current test runner (`tests.cpp`)
- `data/`
  - runtime storage file for user-product data (`users_products.txt`) when generated
- `CMakeLists.txt`
  - build and test configuration

## Build and Run

### 1. Configure + build

```bash
cmake -S . -B build
cmake --build build
```

### 2. Run the app

```bash
./build/app
```

## How to Use the CLI (Current Behavior)

Supported commands:

```text
add [userid] [productid1] [productid2] ...
recommend [userid] [productid]
help
```

Notes:
- invalid commands are ignored silently (no extra output)
- `help` prints the exact command list
- `add` updates data and prints nothing
- `recommend` prints one line of recommendations (space-separated)

## Example Session

Input:

```text
add 1 100 101 102
add 2 101 103
recommend 1 103
help
```

Expected behavior:
- first two `add` commands: no output
- `recommend`: prints one recommendation line (or empty line if none found)
- `help`: prints the 3 help lines exactly

## Notes for TA
- Each task's finished product will be pushed to TASK-#tasknum-DONE for your code review. Please note that we will continue merging code in to main branch as a new task is out. We will NOT however merge code in to a specific task branch after due date.
Example: Task 1 code will be presented in a branch named "TASK-1-DONE"