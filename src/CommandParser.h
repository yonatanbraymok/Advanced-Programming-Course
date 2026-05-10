#pragma once

#include <string>
#include <vector>

#include "Types.h" // Assumes UserId, ProductId, and ProductList are defined here

// Command categories recognized by the parser.
enum class CommandType {
    Invalid,
    Add,
    Recommend,
    Help
};

// Result container produced by the parse() method.
// Acts as a Data Transfer Object (DTO) between the parser and the executor.
struct ParsedCommand {
    CommandType type{CommandType::Invalid}; // Defaults to Invalid for safety
    UserId userId{0};
    ProductId productId{0};
    ProductList products;
};

// Responsible strictly for translating raw text into structured command data.
// Adheres to the Single Responsibility Principle.
class CommandParser {
public:
    // Converts one raw CLI line into structured data.
    // If the line is malformed (e.g., uses tabs instead of spaces), 
    // it safely returns a CommandType::Invalid struct.
    ParsedCommand parse(const std::string& line) const;

private:
    // Validates and converts a string token into an integer.
    // Protects against overflow and non-digit characters.
    static bool parsePositiveInt(const std::string& token, int& value);

    // Splits input by plain spaces, collapsing consecutive spaces as required.
    // Explicitly avoids splitting by other whitespace like tabs.
    static std::vector<std::string> splitBySpaces(const std::string& line);
};