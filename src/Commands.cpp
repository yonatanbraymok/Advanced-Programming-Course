#include "Commands.h"

#include <sstream>

CommandExecutor::CommandExecutor(IRepository& repository, const IRecommender& recommender, IOutput& output)
    : repository_(repository), recommender_(recommender), output_(output) {}

void CommandExecutor::executePost(UserId userId, const ProductList& products) {
    if (repository_.getWatched(userId) != nullptr) {
        output_.writeLine("404 Not Found");
        return;
    }

    repository_.addWatched(userId, products);
    output_.writeLine("201 Created");
}

void CommandExecutor::executePatch(UserId userId, const ProductList& products) {
    if (repository_.getWatched(userId) == nullptr) {
        output_.writeLine("404 Not Found");
        return;
    }

    repository_.addWatched(userId, products);
    output_.writeLine("204 No Content");
}

void CommandExecutor::executeGet(UserId userId, ProductId productId) {
    if (repository_.getWatched(userId) == nullptr) {
        output_.writeLine("404 Not Found");
        return;
    }

    const ProductList recommendations = recommender_.recommend(userId, productId, 10);
    output_.writeLine("200 Ok\n");
    output_.writeLine(joinProducts(recommendations));
}

void CommandExecutor::executeDelete(UserId userId, const ProductList& products) {
    if (!repository_.removeWatched(userId, products)) {
        output_.writeLine("404 Not Found");
        return;
    }

    output_.writeLine("204 No Content");
}

std::string CommandExecutor::joinProducts(const ProductList& products) {
    std::ostringstream out;
    for (std::size_t i = 0; i < products.size(); ++i) {
        if (i > 0) {
            out << ' ';
        }
        out << products[i];
    }
    return out.str();
}

void CommandExecutor::executeHelp() {
    output_.writeLine("add [userid] [productid1] [productid2] ...");
    output_.writeLine("recommend [userid] [productid]");
    output_.writeLine("help");
}

void CommandExecutor::executeInvalidCommand() {
    output_.writeLine("400 Bad Request");
}
