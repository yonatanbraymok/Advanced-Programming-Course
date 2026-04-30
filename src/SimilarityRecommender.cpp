#include "SimilarityRecommender.h"

#include <algorithm>
#include <cstddef>
#include <unordered_map>
#include <vector>

SimilarityRecommender::SimilarityRecommender(const IRepository& repository) : repository_(repository) {}

ProductList SimilarityRecommender::recommend(UserId userId, ProductId productId, std::size_t limit) const {
    const auto* targetWatched = repository_.getWatched(userId);
    if (targetWatched == nullptr) {
        return {};
    }

    // Step 1: similarity score per other user = number of common watched products.
    std::unordered_map<UserId, int> similarity;
    const std::vector<UserId> users = repository_.getAllUsers();
    for (UserId otherUser : users) {
        if (otherUser == userId) {
            continue;
        }
        const auto* otherWatched = repository_.getWatched(otherUser);
        if (otherWatched == nullptr) {
            continue;
        }

        int common = 0;
        for (ProductId watchedProduct : *targetWatched) {
            if (otherWatched->count(watchedProduct) > 0) {
                ++common;
            }
        }
        similarity[otherUser] = common;
    }

    // Step 2: score candidate products from users who watched productId.
    std::unordered_map<ProductId, int> scoreByProduct;
    for (UserId otherUser : users) {
        if (otherUser == userId) {
            continue;
        }

        const auto* otherWatched = repository_.getWatched(otherUser);
        if (otherWatched == nullptr || otherWatched->count(productId) == 0) {
            continue;
        }

        const int weight = similarity[otherUser];
        for (ProductId candidate : *otherWatched) {
            if (candidate == productId) {
                continue;
            }
            if (targetWatched->count(candidate) > 0) {
                continue;
            }
            scoreByProduct[candidate] += weight;
        }
    }

    // Step 3: sort by score desc, and by product id asc for tie-break.
    std::vector<std::pair<ProductId, int>> scored(scoreByProduct.begin(), scoreByProduct.end());
    std::sort(scored.begin(), scored.end(), [](const auto& left, const auto& right) {
        if (left.second != right.second) {
            return left.second > right.second;
        }
        return left.first < right.first;
    });

    ProductList result;
    for (const auto& [product, _] : scored) {
        if (result.size() >= limit) {
            break;
        }
        result.push_back(product);
    }
    return result;
}
