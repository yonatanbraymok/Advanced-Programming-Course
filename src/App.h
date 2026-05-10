#pragma once

#include "CommandParser.h"
#include "Commands.h"
#include "Interfaces.h"

// It adheres to the Single Responsibility Principle by only managing the main loop,
// delegating the actual work of parsing and executing to other classes.
class App {
public:
    // Constructor uses dependency injection for its I/O and execution dependencies.
    // This ensures loose coupling—App doesn't know if it's reading from a console or a file.
    App(IInput& input, CommandExecutor& executor);

    // Starts the blocking main application loop.
    void run();

private:
    // References to our injected tools
    IInput& input_;
    CommandExecutor& executor_;
    
    // Utility for translating raw strings into command structures
    CommandParser parser_;
};