#include "FileRepository.h"

#include <algorithm>
#include <fstream>
#include <sstream>
#include <vector>

/**
 * FileRepository Implementation
 * ----------------------------
 * This class serves as the persistence layer for the Recommendation System.
 * It handles the mapping between Users and the Products they have watched
 */

// Constructor: Initializes the repository with the target file path.
FileRepository::FileRepository(std::string path) : filePath_(std::move(path)) {}

void FileRepository::load() {
    // Clear existing in-memory data to prevent duplicates if load is called multiple times.
    userProducts_.clear();

    std::ifstream in(filePath_);
    if (!in.is_open()) {
        // If the file is missing, we treat it as an empty repository.
        return;
    }

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
    // Open the file in truncation mode to overwrite it with the current state.
    std::ofstream out(filePath_, std::ios::trunc);
    if (!out.is_open()) {
        return;
    }

    // Requirement: Output must be deterministic for stable Git diffs.
    std::vector<UserId> users;
    users.reserve(userProducts_.size());
    for (const auto& [userId, _] : userProducts_) {
        users.push_back(userId);
    }
    std::sort(users.begin(), users.end());

    for (UserId userId : users) {
        out << userId;
        
        const auto& productSet = userProducts_.at(userId);
        std::vector<ProductId> products(productSet.begin(), productSet.end());
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
        if (productId > 0) {
            watched.insert(productId);
        }
    }

    // Requirement: Data must be saved immediately to the file upon update.
    save();
}

const std::unordered_set<ProductId>* FileRepository::getWatched(UserId userId) const {
    auto it = userProducts_.find(userId);
    
    if (it == userProducts_.end()) {
        return nullptr;
    }
    return &it->second;
}

// Implementation of user removal
void FileRepository::removeUser(UserId userId) {
    // erase() returns the number of elements removed (0 or 1)
    if (userProducts_.erase(userId) > 0) {
        // Requirement: Persist changes immediately
        save();
    }
}

std::vector<UserId> FileRepository::getAllUsers() const {
    std::vector<UserId> users;
    users.reserve(userProducts_.size());
    for (const auto& [userId, _] : userProducts_) {
        users.push_back(userId);
    }
    return users;
}