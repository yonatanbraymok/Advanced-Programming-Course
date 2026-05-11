#pragma once

#include <string>

#include "Interfaces.h"

// Responsible for executing the commands parsed from the user input.
// This separates the "what to do" (execution) from the "how to read it" (parsing).
class CommandExecutor {
public:
    // Takes interfaces as dependencies to ensure loose coupling
    CommandExecutor(IRepository& repository, const IRecommender& recommender, IOutput& output);

    // Command handlers
    void executeAdd(UserId userId, const ProductList& products);
    
    void executePost(UserId userId, const ProductList& products);
    void executePatch(UserId userId, const ProductList& products);
    
    // command handlers for GET and DELETE
    void executeGet(UserId userId);
    void executeDelete(UserId userId);
    
    void executeRecommend(UserId userId, ProductId productId);
    void executeHelp();

private:
    // References to our core data and output components
    IRepository& repository_;
    const IRecommender& recommender_;
    IOutput& output_;

    // Helper function to format the product list into a single space-separated string.
    // Made static because it doesn't need access to any class member variables.
    static std::string joinProducts(const ProductList& products);
};