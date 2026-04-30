#pragma once

#include <istream>
#include <ostream>

#include "CommandParser.h"

// Temporary app shell used to manually test the parser.
// It reads text input, parses it, and prints a normalized parse result.
class App {
public:
    App(std::istream& input, std::ostream& output);

    // Starts the read-parse-print loop until input stream ends (EOF).
    void run();

private:
    std::istream& input_;
    std::ostream& output_;
    CommandParser parser_;

    // Helper that turns ParsedCommand into a human-readable debug line.
    void printParsedCommand(const ParsedCommand& cmd);
};
