#pragma once

#include <unordered_set>
#include <vector>

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
