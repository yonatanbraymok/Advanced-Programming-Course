#include "CommandParser.h"

#include <cctype>
#include <limits>

bool CommandParser::parsePositiveInt(const std::string& token, int& value) {
    // Empty token cannot represent a valid numeric id.
    if (token.empty()) {
        return false;
    }

    // Use a wider type during parsing so we can detect overflow
    // before assigning into int.
    long long parsed = 0;
    // Parse manually to reject signs/letters and detect overflow early.
    for (char ch : token) {
        if (!std::isdigit(static_cast<unsigned char>(ch))) {
            return false;
        }
        parsed = (parsed * 10) + (ch - '0');
        if (parsed > std::numeric_limits<int>::max()) {
            return false;
        }
    }

    value = static_cast<int>(parsed);
    // IDs in this app are positive (zero is treated as invalid input).
    return value > 0;
}

std::vector<std::string> CommandParser::splitBySpaces(const std::string& line) {
    std::vector<std::string> tokens;
    std::string current;
    // Build tokens while collapsing consecutive spaces.
    for (char ch : line) {
        if (ch == ' ') {
            if (!current.empty()) {
                tokens.push_back(current);
                current.clear();
            }
            continue;
        }
        current.push_back(ch);
    }

    // Push the last token after the loop ends.
    if (!current.empty()) {
        tokens.push_back(current);
    }
    return tokens;
}

ParsedCommand CommandParser::parse(const std::string& line) const {
    // Default is Invalid; we only set fields when a format is fully valid.
    ParsedCommand cmd;

    // Baseline contract: tab-separated input is considered malformed.
    if (line.find('\t') != std::string::npos) {
        return cmd;
    }

    // First stage: lexical split from raw text into tokens.
    const std::vector<std::string> tokens = splitBySpaces(line);
    // Blank or whitespace-only input stays Invalid (silent ignore path).
    if (tokens.empty()) {
        return cmd;
    }

    // help has a strict form: exactly one token.
    if (tokens[0] == "help") {
        if (tokens.size() == 1) {
            cmd.type = CommandType::Help;
        }
        // If extra tokens exist, help is invalid by the strict contract.
        return cmd;
    }

    // add format: add <userId> <productId> [more productId...]
    if (tokens[0] == "add") {
        if (tokens.size() < 3) {
            return cmd;
        }

        int userId = 0;
        if (!parsePositiveInt(tokens[1], userId)) {
            return cmd;
        }

        ProductList products;
        products.reserve(tokens.size() - 2);
        for (std::size_t i = 2; i < tokens.size(); ++i) {
            int productId = 0;
            // Any invalid product token invalidates the entire command.
            if (!parsePositiveInt(tokens[i], productId)) {
                return ParsedCommand{};
            }
            products.push_back(productId);
        }

        // Only after all checks pass do we mark this command as valid Add.
        cmd.type = CommandType::Add;
        cmd.userId = userId;
        cmd.products = std::move(products);
        return cmd;
    }

    // recommend format: recommend <userId> <productId>
    if (tokens[0] == "recommend") {
        if (tokens.size() != 3) {
            return cmd;
        }

        int userId = 0;
        int productId = 0;
        if (!parsePositiveInt(tokens[1], userId) || !parsePositiveInt(tokens[2], productId)) {
            return cmd;
        }

        // Recommend carries exactly one user id and one product id.
        cmd.type = CommandType::Recommend;
        cmd.userId = userId;
        cmd.productId = productId;
        return cmd;
    }

    // Unknown command keyword.
    return cmd;
}
