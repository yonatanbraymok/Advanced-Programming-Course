#include "App.h"

#include <sstream>
#include <string>

App::App(std::istream& input, std::ostream& output, IRepository& repository, const IRecommender& recommender)
    : input_(input), output_(output), repository_(repository), recommender_(recommender) {}

void App::run() {
    std::string line;
    while (std::getline(input_, line)) {
        const ParsedCommand cmd = parser_.parse(line);
        switch (cmd.type) {
            case CommandType::Add:
                handleAdd(cmd);
                break;
            case CommandType::Recommend:
                handleRecommend(cmd);
                break;
            case CommandType::Help:
                handleHelp();
                break;
            case CommandType::Invalid:
            default:
                //invalid commands must be ignored silently.
                break;
        }
    }
}

void App::handleAdd(const ParsedCommand& cmd) { repository_.addWatched(cmd.userId, cmd.products); }

std::string App::joinProducts(const ProductList& products) {
    std::ostringstream out;
    for (std::size_t i = 0; i < products.size(); ++i) {
        if (i > 0) {
            out << ' ';
        }
        out << products[i];
    }
    return out.str();
}

void App::handleRecommend(const ParsedCommand& cmd) {
    const ProductList recommendations = recommender_.recommend(cmd.userId, cmd.productId, 10);
    // Ex1 expects a single output line for recommend, even if no products exist.
    output_ << joinProducts(recommendations) << '\n';
}

void App::handleHelp() {
    // Keep the exact text/order from the assignment contract.
    output_ << "add [userid] [productid1] [productid2] ...\n";
    output_ << "recommend [userid] [productid]\n";
    output_ << "help\n";
}
