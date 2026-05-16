#include "CommandParser.h"

#include <cctype>
#include <limits>

bool CommandParser::parsePositiveInt(const std::string& token, int& value) {
    if (token.empty()) {
        return false;
    }

    long long parsed = 0;
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
    return value > 0;
}

std::vector<std::string> CommandParser::splitBySpaces(const std::string& line) {
    std::vector<std::string> tokens;
    std::string current;
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

    if (!current.empty()) {
        tokens.push_back(current);
    }
    return tokens;
}

ParsedCommand CommandParser::parse(const std::string& line) const {
    auto tokens = splitBySpaces(line);
    ParsedCommand cmd;

    if (tokens.empty()) {
        return cmd;
    }

    if (tokens[0] == "help") {
        if (tokens.size() == 1) {
            cmd.type = CommandType::Help;
        }
        return cmd;
    }

    // GET format: GET <userId> <productId>
    if (tokens[0] == "GET") {
        int userId = 0;
        int productId = 0;
        if (tokens.size() == 3 && parsePositiveInt(tokens[1], userId) &&
            parsePositiveInt(tokens[2], productId)) {
            cmd.type = CommandType::Get;
            cmd.userId = userId;
            cmd.productId = productId;
        }
        return cmd;
    }

    // DELETE format: DELETE <userId> <productId1> <productId2> ...
    if (tokens[0] == "DELETE") {
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

        cmd.type = CommandType::Delete;
        cmd.userId = userId;
        cmd.products = std::move(products);
        return cmd;
    }

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
                return ParsedCommand{};
            }
            products.push_back(productId);
        }

        cmd.type = CommandType::Post;
        cmd.userId = userId;
        cmd.products = std::move(products);
        return cmd;
    }

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

    return cmd;
}
