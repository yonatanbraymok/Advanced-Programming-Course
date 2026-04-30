#include <algorithm>
#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "../interfaces.h"
#include "../SimilarityRecommender.h"

namespace {

// Simple in-memory repository for recommender tests.
class InMemoryRepository : public IRepository {
public:
    // Add all watched products for a user.
    void addWatched(UserId userId, const ProductList& productIds) override {
        auto& watched = usersToProducts_[userId];
        watched.insert(productIds.begin(), productIds.end());
    }

    // Return watched set for a user (or nullptr if user not found).
    const std::unordered_set<ProductId>* getWatched(UserId userId) const override {
        const auto it = usersToProducts_.find(userId);
        if (it == usersToProducts_.end()) {
            return nullptr;
        }
        return &it->second;
    }

    // Return all user IDs that currently exist in the test data.
    std::vector<UserId> getAllUsers() const override {
        std::vector<UserId> users;
        users.reserve(usersToProducts_.size());
        for (const auto& [userId, _] : usersToProducts_) {
            users.push_back(userId);
        }
        return users;
    }

private:
    // userId -> set of watched product IDs
    std::unordered_map<UserId, std::unordered_set<ProductId>> usersToProducts_;
};

// Small helper to print a clear failure message.
bool expect(bool condition, const std::string& message) {
    if (!condition) {
        std::cerr << "FAILED: " << message << '\n';
    }
    return condition;
}

}  

int main() {
    bool ok = true;

    {
        // Main scenario: verify ranking and excluded products.
        InMemoryRepository repo;
        repo.addWatched(1, {100, 101, 102, 103});
        repo.addWatched(2, {101, 102, 104, 105, 106});
        repo.addWatched(3, {100, 104, 105, 107, 108});
        repo.addWatched(4, {101, 105, 106, 107, 109, 110});
        repo.addWatched(5, {100, 102, 103, 105, 108, 111});
        repo.addWatched(6, {100, 103, 104, 110, 111, 112, 113});
        repo.addWatched(7, {102, 105, 106, 107, 108, 109, 110});
        repo.addWatched(8, {101, 104, 105, 106, 109, 111, 114});
        repo.addWatched(9, {100, 103, 105, 107, 112, 113, 115});
        repo.addWatched(10, {100, 102, 105, 106, 107, 109, 110, 116});

        SimilarityRecommender recommender(repo);
        const ProductList rec = recommender.recommend(1, 104, 10);
        const ProductList expected = {105, 106, 111, 110, 112, 113, 107, 108, 109, 114};
        ok &= expect(rec == expected, "recommender returns expected ranking");
        ok &= expect(std::find(rec.begin(), rec.end(), 100) == rec.end(), "exclude already watched 100");
        ok &= expect(std::find(rec.begin(), rec.end(), 101) == rec.end(), "exclude already watched 101");
        ok &= expect(std::find(rec.begin(), rec.end(), 104) == rec.end(), "exclude queried product");
    }

    {
        // Real tie case: 200 and 400 get equal score, so 200 should come first.
        InMemoryRepository repo;
        repo.addWatched(1, {100});
        repo.addWatched(2, {100, 200, 300});
        repo.addWatched(3, {100, 400, 300});

        SimilarityRecommender recommender(repo);
        const ProductList rec = recommender.recommend(1, 300, 10);
        ok &= expect(rec.size() >= 2 && rec[0] == 200 && rec[1] == 400, "ties break by ascending product id");
    }

    {
        // Unknown user should return no recommendations.
        InMemoryRepository repo;
        SimilarityRecommender recommender(repo);
        const ProductList rec = recommender.recommend(42, 999, 10);
        ok &= expect(rec.empty(), "unknown user returns no recommendations");
    }

    if (!ok) {
        return 1;
    }

    std::cout << "SimilarityRecommender tests passed\n";
    return 0;
}
