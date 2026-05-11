#include "Commands.h"
#include <sstream>
#include <vector>
#include <algorithm>

CommandExecutor::CommandExecutor(IRepository& repository, const IRecommender& recommender, IOutput& output)
    : repository_(repository), recommender_(recommender), output_(output) {}

// Saves the list of viewed products to the user's history in the repository
void CommandExecutor::executeAdd(UserId userId, const ProductList& products) { 
    repository_.addWatched(userId, products); 
}

// Implementation of POST. Adds/Updates user and returns 201 Created status code.
void CommandExecutor::executePost(UserId userId, const ProductList& products) {
    repository_.addWatched(userId, products);
    output_.writeLine("201 Created");
}

// Implementation of PATCH. Updates existing user products and returns 204 No Content.
void CommandExecutor::executePatch(UserId userId, const ProductList& products) {
    if (repository_.getWatched(userId) == nullptr) {
        output_.writeLine("404 Not Found");
        return;
    }
    
    repository_.addWatched(userId, products);
    output_.writeLine("204 No Content");
}

// Implementation of GET. Returns the user's product list or 404.
void CommandExecutor::executeGet(UserId userId) {
    const std::unordered_set<ProductId>* watched = repository_.getWatched(userId);
    if (watched == nullptr) {
        output_.writeLine("404 Not Found");
        return;
    }
    // Status line + blank line (\n results in double newline with writeLine)
    output_.writeLine("200 Ok\n");

    // Convert unordered_set to vector for joining
    ProductList products(watched->begin(), watched->end());
    // sorting the output set.
    std::sort(products.begin(), products.end());

    output_.writeLine(joinProducts(products));
}

// Implementation of DELETE. Removes the user and returns 204 or 404.
void CommandExecutor::executeDelete(UserId userId) {
    if (repository_.getWatched(userId) == nullptr) {
        output_.writeLine("404 Not Found");
        return;
    }

    repository_.removeUser(userId); // Assumes removeUser is defined in IRepository
    output_.writeLine("204 No Content");
}

// Combines product IDs into a single string separated by spaces for printing
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

// Fetches up to 10 recommendations and prints them using the IOutput interface
void CommandExecutor::executeRecommend(UserId userId, ProductId productId) {
    const ProductList recommendations = recommender_.recommend(userId, productId, 10);
    output_.writeLine(joinProducts(recommendations));
}

// Prints the available system commands exactly as required by the assignment
void CommandExecutor::executeHelp() {
    output_.writeLine("add [userid] [productid1] [productid2] ...");
    output_.writeLine("recommend [userid] [productid]");
    output_.writeLine("help");
}