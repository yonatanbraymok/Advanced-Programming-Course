#include "FileRepository.h"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <vector>

// FileRepository
// --------------
// A tiny persistence layer that stores, in a plain text file, which products each user is "watching".
//
// In-memory structure:
//   userProducts_[userId] = set of watched productIds
//
// On-disk format (one line per user):
//   <userId> <productId> <productId> ...
//
// Notes:
// - We treat non-positive ids as invalid and ignore them while loading.
// - We keep data in sets to avoid duplicates automatically.

FileRepository::FileRepository(std::string path) : filePath_(std::move(path)) {}

void FileRepository::load() {
    // Rebuild the in-memory map from the file contents.
    userProducts_.clear();

    std::ifstream in(filePath_);
    if (!in.is_open()) {
        // If the file doesn't exist / can't be opened, we simply start empty.
        return;
    }

    // Storage format (one line per user):
    //   <userId> <productId> <productId> ...
    std::string line;
    while (std::getline(in, line)) {
        if (line.empty()) {
            continue;
        }

        std::istringstream ss(line);
        int userId = 0;
        if (!(ss >> userId)) {
            // Ignore malformed lines that don't start with a user id.
            continue;
        }
        if (userId <= 0) {
            continue;
        }

        int productId = 0;
        while (ss >> productId) {
            if (productId <= 0) {
                continue;
            }
            userProducts_[userId].insert(productId);
        }
    }
}

void FileRepository::save() const {
    // Persist the current in-memory map to disk (overwrite existing file).
    std::ofstream out(filePath_, std::ios::trunc);
    if (!out.is_open()) {
        // If we can't write, we silently keep running (callers can decide if that's acceptable).
        return;
    }

    // Make output deterministic: iterate users/products in sorted order so git diffs are stable.
    std::vector<UserId> users;
    users.reserve(userProducts_.size());
    for (const auto& [userId, _] : userProducts_) {
        users.push_back(userId);
    }
    std::sort(users.begin(), users.end());

    for (UserId userId : users) {
        out << userId;
        std::vector<ProductId> products(userProducts_.at(userId).begin(), userProducts_.at(userId).end());
        std::sort(products.begin(), products.end());
        for (ProductId productId : products) {
            out << ' ' << productId;
        }
        out << '\n';
    }
}

void FileRepository::addWatched(UserId userId, const ProductList& productIds) {
    // Merge new watched products into the user's set (duplicates are ignored by the set).
    auto& watched = userProducts_[userId];
    for (ProductId productId : productIds) {
        watched.insert(productId);
    }
    // This repository saves immediately to keep persistence simple.
    save();
}

const std::unordered_set<ProductId>* FileRepository::getWatched(UserId userId) const {
    // Returns a pointer to the internal set, or nullptr if the user isn't known.
    auto it = userProducts_.find(userId);
    if (it == userProducts_.end()) {
        return nullptr;
    }
    return &it->second;
}

std::vector<UserId> FileRepository::getAllUsers() const {
    // Helper for callers that need to iterate over all users currently stored in memory.
    std::vector<UserId> users;
    users.reserve(userProducts_.size());
    for (const auto& [userId, _] : userProducts_) {
        users.push_back(userId);
    }
    return users;
}
