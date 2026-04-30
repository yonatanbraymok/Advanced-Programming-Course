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
 * 
 * Requirement Compliance:
 * - Persistent Storage: Automatically saves data to disk on changes.
 * - Validation: Filters out non-positive IDs.
 * - Stability: Sorts data during save to ensure clean Git diffs.
 */

// Constructor: Initializes the repository with the target file path.
// Uses std::move for efficient string handling.
FileRepository::FileRepository(std::string path) : filePath_(std::move(path)) {}

void FileRepository::load() {
    // Clear existing in-memory data to prevent duplicates if load is called multiple times.
    userProducts_.clear();

    std::ifstream in(filePath_);
    if (!in.is_open()) {
        // If the file is missing (e.g., first run), we treat it as an empty repository.
        return;
    }

    std::string line;
    // Read the file line by line. Format: <userId> <productId1> <productId2> ...
    while (std::getline(in, line)) {
        if (line.empty()) {
            continue;
        }

        std::istringstream ss(line);
        int userId = 0;
        
        // Extract the first integer as the UserID.
        if (!(ss >> userId)) {
            continue; // Skip malformed lines.
        }

        // Validate UserID (per assignment logic: IDs must be positive).
        if (userId <= 0) {
            continue;
        }

        int productId = 0;
        // Extract all subsequent integers on the line as ProductIDs.
        while (ss >> productId) {
            if (productId <= 0) {
                continue; // Ignore invalid product IDs.
            }
            // std::unordered_set handles uniqueness automatically.
            userProducts_[userId].insert(productId);
        }
    }
}

void FileRepository::save() const {
    // Open the file in truncation mode to overwrite it with the current state.
    std::ofstream out(filePath_, std::ios::trunc);
    if (!out.is_open()) {
        // If file access fails, we continue without throwing to maintain CLI stability.
        return;
    }

    // Requirement: Output must be deterministic for stable Git diffs.
    // 1. Collect and sort all User IDs.
    std::vector<UserId> users;
    users.reserve(userProducts_.size());
    for (const auto& [userId, _] : userProducts_) {
        users.push_back(userId);
    }
    std::sort(users.begin(), users.end());

    // 2. Iterate through users in order.
    for (UserId userId : users) {
        out << userId;
        
        // 3. Collect and sort Product IDs for this specific user.
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
    // Access the user's set (creates it if it doesn't exist).
    auto& watched = userProducts_[userId];
    
    // Add each new product to the set.
    for (ProductId productId : productIds) {
        if (productId > 0) {
            watched.insert(productId);
        }
    }

    // Requirement: Data must be saved immediately to the file upon update.
    save();
}

const std::unordered_set<ProductId>* FileRepository::getWatched(UserId userId) const {
    // Search for the user in the map.
    auto it = userProducts_.find(userId);
    
    // Return nullptr if the user has no recorded history, 
    // otherwise return a pointer to their set of products.
    if (it == userProducts_.end()) {
        return nullptr;
    }
    return &it->second;
}

std::vector<UserId> FileRepository::getAllUsers() const {
    // Extract all keys (UserIDs) from the internal map.
    std::vector<UserId> users;
    users.reserve(userProducts_.size());
    for (const auto& [userId, _] : userProducts_) {
        users.push_back(userId);
    }
    return users;
}