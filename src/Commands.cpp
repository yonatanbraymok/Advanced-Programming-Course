#include "Commands.h"
#include <sstream>

CommandExecutor::CommandExecutor(IRepository& repository, const IRecommender& recommender, IOutput& output)
    : repository_(repository), recommender_(recommender), output_(output) {}

// Saves the list of viewed products to the user's history in the repository
void CommandExecutor::executeAdd(UserId userId, const ProductList& products) { 
    repository_.addWatched(userId, products); 
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