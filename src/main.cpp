#include "App.h"
#include "FileRepository.h"
#include "SimilarityRecommender.h"

#include <iostream>

int main() {
    // Production wiring for current stage:
    // repository holds persisted watched products and recommender reads from it.
    FileRepository repository("data/users_products.txt");
    repository.load();

    SimilarityRecommender recommender(repository);
    App app(std::cin, std::cout, repository, recommender);
    app.run();
    return 0;
}
