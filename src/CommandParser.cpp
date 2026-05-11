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
    auto tokens = splitBySpaces(line);
    ParsedCommand cmd; // Defaults to CommandType::Invalid

    if (tokens.empty()) {
        return cmd;
    }

    // help format: help
    if (tokens[0] == "help") {
        if (tokens.size() == 1) {
            cmd.type = CommandType::Help;
        }
        return cmd;
    }

    // POST format: POST <userId> <productId1> <productId2> ...
    if (tokens[0] == "POST") {
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
            if (!parsePositiveInt(tokens[i], productId)) {
                return ParsedCommand{}; // Invalid product cancels the whole command
            }
            products.push_back(productId);
        }

        cmd.type = CommandType::Post;
        cmd.userId = userId;
        cmd.products = std::move(products);
        return cmd;
    }

    // PATCH format: PATCH <userId> <productId1> <productId2> ...
    if (tokens[0] == "PATCH") {
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
            if (!parsePositiveInt(tokens[i], productId)) {
                return ParsedCommand{};
            }
            products.push_back(productId);
        }

        cmd.type = CommandType::Patch;
        cmd.userId = userId;
        cmd.products = std::move(products);
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
            if (!parsePositiveInt(tokens[i], productId)) {
                return ParsedCommand{};
            }
            products.push_back(productId);
        }

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

        cmd.type = CommandType::Recommend;
        cmd.userId = userId;
        cmd.productId = productId;
        return cmd;
    }

    return cmd;
}