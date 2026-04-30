#pragma once

#include <istream>
#include <ostream>

#include "CommandParser.h"
#include "Interfaces.h"

// Main CLI app loop: read command -> parse -> execute behavior.
class App {
public:
    App(std::istream& input, std::ostream& output, IRepository& repository, const IRecommender& recommender);

    // Runs until input ends (EOF in local runs).
    void run();

private:
    std::istream& input_;
    std::ostream& output_;
    IRepository& repository_;
    const IRecommender& recommender_;
    CommandParser parser_;

    // Command handlers kept separate to keep run() easy to read.
    void handleAdd(const ParsedCommand& cmd);
    void handleRecommend(const ParsedCommand& cmd);
    void handleHelp();

    // Formats products exactly as one space-separated line.
    static std::string joinProducts(const ProductList& products);
};
