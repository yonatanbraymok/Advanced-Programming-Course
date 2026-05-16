#include "App.h"
#include <string>

App::App(IInput& input, CommandExecutor& executor) : input_(input), executor_(executor) {}

void App::run() {
    std::string line;

    while (input_.readLine(line)) {
        if (line.empty()) {
            continue;
        }

        const ParsedCommand cmd = parser_.parse(line);

        switch (cmd.type) {
            case CommandType::Post:
                executor_.executePost(cmd.userId, cmd.products);
                break;

            case CommandType::Patch:
                executor_.executePatch(cmd.userId, cmd.products);
                break;

            case CommandType::Get:
                executor_.executeGet(cmd.userId, cmd.productId);
                break;

            case CommandType::Delete:
                executor_.executeDelete(cmd.userId, cmd.products);
                break;

            case CommandType::Help:
                executor_.executeHelp();
                break;

            case CommandType::Invalid:
            default:
                executor_.executeInvalidCommand();
                break;
        }
    }
}
