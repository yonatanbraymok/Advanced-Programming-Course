#pragma once

#include <unordered_set>
#include <vector>
#include <string>
#include "Types.h"

class IRepository {
public:
    virtual ~IRepository() = default;

    // Load/initialize repository state from its backing storage.
    virtual void load() = 0;

    // Associate the given list of products as "watched" by the user.
    virtual void addWatched(UserId userId, const ProductList& productIds) = 0;

    // Return the watched products for a user.
    // - Returns a pointer to an internal set owned by the repository.
    virtual const std::unordered_set<ProductId>* getWatched(UserId userId) const = 0;

    // support DELETE command.
    virtual void removeUser(UserId userId) = 0;

    // Return a snapshot list of all known user IDs in the repository.
    virtual std::vector<UserId> getAllUsers() const = 0;
};
// Recommender API: returns ranked product suggestions.
class IRecommender {
public:
    virtual ~IRecommender() = default;
    // Recommend products for userId, using productId as context.
    virtual ProductList recommend(UserId userId, ProductId productId, std::size_t limit = 10) const = 0;
};
// This allows us to easily switch from console input to file input in the future.
class IInput {
    public:
        virtual ~IInput() = default; // Virtual destructor for safe inheritance
        
        // Reads a line of input into outLine. Returns false if there's no more input.
        virtual bool readLine(std::string& outLine) = 0;
    };
    
    // Makes it easy to redirect the app's output (e.g., to a file or network) later on.
    class IOutput {
    public:
        virtual ~IOutput() = default;
        
        // Prints a single line of text.
        virtual void writeLine(const std::string& line) = 0;
    };
