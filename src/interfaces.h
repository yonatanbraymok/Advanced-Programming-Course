#pragma once

#include <unordered_set>
#include <vector>

#include "Types.h"

// Repository API used by the recommender to read user-product data.
class IRepository {
public:
    virtual ~IRepository() = default;
    // Add watched products for a specific user.
    virtual void addWatched(UserId userId, const ProductList& productIds) = 0;
    // Get watched products of a user (nullptr if user does not exist).
    virtual const std::unordered_set<ProductId>* getWatched(UserId userId) const = 0;
    // Get all existing user IDs.
    virtual std::vector<UserId> getAllUsers() const = 0;
};

// Recommender API: returns ranked product suggestions.
class IRecommender {
public:
    virtual ~IRecommender() = default;
    // Recommend products for userId, using productId as context.
    virtual ProductList recommend(UserId userId, ProductId productId, std::size_t limit = 10) const = 0;
};
