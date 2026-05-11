#pragma once

#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "Interfaces.h"

class FileRepository : public IRepository {
public:
    explicit FileRepository(std::string path);

    void load() override;
    void addWatched(UserId userId, const ProductList& productIds) override;
    const std::unordered_set<ProductId>* getWatched(UserId userId) const override;
    
    // Implementation of the removal logic
    void removeUser(UserId userId) override;

    std::vector<UserId> getAllUsers() const override;

private:
    void save() const;

    std::string filePath_;
    std::unordered_map<UserId, std::unordered_set<ProductId>> userProducts_;
};