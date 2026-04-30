# Advanced Programming Course - Ex1 (Current App State)

This is our current C++ CLI implementation for Ex1.
The app supports adding watched products for users, asking for recommendations, and printing help.

## Functionality

The app currently supports these commands:

```text
add [userid] [productid1] [productid2] ...
recommend [userid] [productid]
help
```

Behavior rules:
- invalid commands are ignored silently (no extra output)
- `add` updates stored data and prints nothing
- `recommend` prints one newline-terminated line (space-separated product IDs)
- `help` prints the exact required 3-line command list

## Architecture

Main flow:
1. `main.cpp` creates concrete objects (`FileRepository`, `SimilarityRecommender`, `App`).
2. `App` reads user lines from standard input.
3. `CommandParser` validates and parses each line to a `ParsedCommand`.
4. `App` dispatches by command type:
   - `Add` -> repository update
   - `Recommend` -> recommender call + output formatting
   - `Help` -> exact contract text
   - `Invalid` -> ignore silently

Core files:
- `src/main.cpp` - app wiring/composition root
- `src/App.h`, `src/App.cpp` - loop + dispatch logic
- `src/CommandParser.h`, `src/CommandParser.cpp` - strict command grammar
- `src/Commands.h`, `src/Commands.cpp` - command execution and output formatting
- `src/ConsoleIO.h`, `src/ConsoleIO.cpp` - standard input/output decoupling
- `src/FileRepository.h`, `src/FileRepository.cpp` - persistence layer
- `src/SimilarityRecommender.h`, `src/SimilarityRecommender.cpp` - recommendation logic
- `src/Interfaces.h` - shared abstractions
- `tests/tests.cpp` - behavior/integration-style checks for current phase

## How to Build and Run

### Option A: Run via Docker (Recommended / Grader Environment)

**1) Build the Docker image**
```bash
docker build -t advanced-prog-ex1 .
```
**2) Run the App

```bash
docker run -it advanced-prog-ex1 ./build/app
```

**3) Run the tests separately

```bash
docker run advanced-prog-ex1 ctest --test-dir build --output-on-failure
```
### Option B: Local Build (Linux/Mac)

**1) Configure and build**
```bash
cmake -S . -B build
cmake --build build
```
**2) Run the test

```bash
ctest --test-dir build --output-on-failure
```
**3) Run the App
```bash
./build/app
```

## Example Usage

Example input:

```text
add 1 100 101 102
add 2 101 103
recommend 1 103
help
```

Expected output pattern:
- first two `add` commands -> no output
- `recommend` -> one recommendation line (or empty line if no candidates)
- `help` -> exact 3-line command list

## Notes for Development

- Build artifacts go under `build/` and should not be committed.
- Runtime data file may appear under `data/users_products.txt`; treat it as generated local data unless explicitly required by the task.
