#include "App.h"
#include "Commands.h"
#include "ConsoleIO.h"
#include "FileRepository.h"
#include "SimilarityRecommender.h"

int main() {
    // 1. Initialize the data storage. 
    // The assignment requires saving/loading to a 'data' folder.
    FileRepository repository("data/users_products.txt");
    repository.load();

    // 2. Initialize the core logic components
    SimilarityRecommender recommender(repository);
    
    // 3. Initialize the I/O components
    ConsoleInput input;
    ConsoleOutput output;
    
    // 4. Wire up the Executor with its dependencies
    CommandExecutor executor(repository, recommender, output);

    // 5. Start the application loop
    App app(input, executor);
    app.run();
    
    return 0;
}