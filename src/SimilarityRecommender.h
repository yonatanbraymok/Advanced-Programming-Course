#pragma once

#include "interfaces.h"

class SimilarityRecommender : public IRecommender {
public:
    // Uses existing repository data (doesn't own it).
    explicit SimilarityRecommender(const IRepository& repository);

    // Get top recommendations for userId based on productId context.
    ProductList recommend(UserId userId, ProductId productId, std::size_t limit = 10) const override;

private:
    const IRepository& repository_;
};
