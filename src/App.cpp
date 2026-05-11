#include "App.h"
#include <string>

// Constructor uses dependency injection to receive its I/O and execution tools
App::App(IInput& input, CommandExecutor& executor) : input_(input), executor_(executor) {}

void App::run() {
    std::string line;
    
    // Standard blocking loop: waits naturally for user input.
    // Automatically returns false and exits the loop if the input stream is closed.
    while (input_.readLine(line)) {
        
        // Skip processing if the user just hits Enter on an empty line
        if (line.empty()) {
            continue;
        }

        // Parse the raw input string into an actionable command struct
        const ParsedCommand cmd = parser_.parse(line);
        
        // Route the parsed command to the appropriate execution logic
        switch (cmd.type) {
            case CommandType::Add:
                executor_.executeAdd(cmd.userId, cmd.products);
                break;
            
            // Handling the POST command
            case CommandType::Post:
                executor_.executePost(cmd.userId, cmd.products);
                break;

            // Handling the PATCH command
            case CommandType::Patch:
                executor_.executePatch(cmd.userId, cmd.products);
                break;

            case CommandType::Recommend:
                executor_.executeRecommend(cmd.userId, cmd.productId);
                break;

            case CommandType::Help:
                executor_.executeHelp();
                break;

            case CommandType::Invalid:
            default:
                // ignore invalid commands silently without printing any errors
                break;
        }
    }
}