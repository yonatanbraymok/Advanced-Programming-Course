#include "FileRepository.h"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <vector>

FileRepository::FileRepository(std::string path) : filePath_(std::move(path)) {}

void FileRepository::load() {
    userProducts_.clear();

    std::ifstream in(filePath_);
    if (!in.is_open()) {
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
    std::ofstream out(filePath_, std::ios::trunc);
    if (!out.is_open()) {
        return;
    }

    // Make sure diffs are stable.
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
    auto& watched = userProducts_[userId];
    for (ProductId productId : productIds) {
        watched.insert(productId);
    }
    save();
}

const std::unordered_set<ProductId>* FileRepository::getWatched(UserId userId) const {
    auto it = userProducts_.find(userId);
    if (it == userProducts_.end()) {
        return nullptr;
    }
    return &it->second;
}

std::vector<UserId> FileRepository::getAllUsers() const {
    std::vector<UserId> users;
    users.reserve(userProducts_.size());
    for (const auto& [userId, _] : userProducts_) {
        users.push_back(userId);
    }
    return users;
}
