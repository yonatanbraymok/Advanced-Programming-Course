#pragma once

#include <string>
#include <vector>

#include "Types.h"

// High-level command categories recognized by the parser.
enum class CommandType {
    Invalid,
    Add,
    Recommend,
    Help
};

// Result container produced by parse().
// The relevant fields depend on the command type:
// - Add uses: userId + products
// - Recommend uses: userId + productId
// - Help/Invalid ignore id fields
struct ParsedCommand {
    CommandType type{CommandType::Invalid};
    UserId userId{0};
    ProductId productId{0};
    ProductList products;
};

class CommandParser {
public:
    // Converts one raw CLI line into structured data.
    // If the line does not match the expected command grammar,
    // the returned type remains CommandType::Invalid.
    ParsedCommand parse(const std::string& line) const;

private:
    // Validates and converts a token like "123" into an int.
    // Rejects empty tokens, non-digit characters, and overflow.
    static bool parsePositiveInt(const std::string& token, int& value);

    // Splits input by plain spaces.
    // Consecutive spaces are treated as one separator.
    static std::vector<std::string> splitBySpaces(const std::string& line);
};
