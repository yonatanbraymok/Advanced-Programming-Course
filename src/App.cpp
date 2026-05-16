#include "App.h"
#include <string>

// Constructor uses dependency injection to receive its I/O and execution tools
App::App(IInput& input, CommandExecutor& executor) : input_(input), executor_(executor) {}

void App::run() {
    std::string line;
    
    // One iteration = one line from IInput (console OR TCP — App stays the same).
    // readLine returns false when the stream ends (EOF on stdin, or client closed
    // the socket), which ends THIS session only; main()'s accept loop may start
    // another client afterward.
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
            
            case CommandType::Post:
                executor_.executePost(cmd.userId, cmd.products);
                break;

            case CommandType::Patch:
                executor_.executePatch(cmd.userId, cmd.products);
                break;

            case CommandType::Get:
                executor_.executeGet(cmd.userId);
                break;

            case CommandType::Delete:
                executor_.executeDelete(cmd.userId);
                break;

            case CommandType::Recommend:
                executor_.executeRecommend(cmd.userId, cmd.productId);
                break;

            case CommandType::Help:
                executor_.executeHelp();
                break;

            // Parser could not build a known command (wrong tokens, bad numbers,
            // unknown verb, …). On the network we must answer with exactly one line:
            // "400 Bad Request" — see CommandExecutor::executeInvalidCommand().
            case CommandType::Invalid:
            default:
                executor_.executeInvalidCommand();
                break;
        }
    }
}