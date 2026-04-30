#pragma once

#include <string>
#include <unordered_set>
#include <vector>

#include "Types.h"

class IRepository {
public:
    virtual ~IRepository() = default;
    virtual void load() = 0;
    virtual void addWatched(UserId userId, const ProductList& productIds) = 0;
    virtual const std::unordered_set<ProductId>* getWatched(UserId userId) const = 0;
    virtual std::vector<UserId> getAllUsers() const = 0;
};

