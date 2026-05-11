#include <iostream>
#include <string>
#include <stdexcept>
#include "App.h"
#include "Commands.h"
#include "ConsoleIO.h"
#include "FileRepository.h"
#include "SimilarityRecommender.h"

int main(int argc, char* argv[]) {
    // The server requires exactly one argument: the port number.
    if (argc < 2) {
        // Exit if no port is provided
        return 1;
    }

    int port;
    try {
        // Attempt to convert the first argument to an integer
        port = std::stoi(argv[1]);

        // Validate that the port is in the valid range (1024-65535)
        if (port < 1024 || port > 65535) {
            return 1;
        }
    } catch (...) {
        // Catch conversion errors (if argv[1] is not a number) and exit
        return 1;
    }

    // Initialize the data storage. 
    FileRepository repository("data/users_products.txt");
    repository.load();

    // initialize the core logic components
    SimilarityRecommender recommender(repository);
    
    // initialize the I/O components
    ConsoleInput input;
    ConsoleOutput output;
    
    // Wire up the Executor and dependencies
    CommandExecutor executor(repository, recommender, output);

    // starting the loop of the application
    App app(input, executor);
    app.run();
    
    return 0;
}
