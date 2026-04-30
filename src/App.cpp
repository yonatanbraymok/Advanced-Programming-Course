#include "App.h"

#include <string>

App::App(std::istream& input, std::ostream& output) : input_(input), output_(output) {}

void App::run() {
    // This banner is only for the current parser-testing phase.
    output_ << "Parser test mode. Enter commands, Ctrl+D to stop.\n";

    std::string line;
    // getline returns false on EOF/error, which stops the loop.
    while (std::getline(input_, line)) {
        const ParsedCommand cmd = parser_.parse(line);
        printParsedCommand(cmd);
    }
}

void App::printParsedCommand(const ParsedCommand& cmd) {
    // We print one normalized output line per parsed command.
    switch (cmd.type) {
        case CommandType::Help:
            output_ << "[OK] help\n";
            return;
        case CommandType::Add:
            output_ << "[OK] add user=" << cmd.userId << " products=";
            // Print product list as comma-separated values for readability.
            for (std::size_t i = 0; i < cmd.products.size(); ++i) {
                if (i > 0) {
                    output_ << ",";
                }
                output_ << cmd.products[i];
            }
            output_ << '\n';
            return;
        case CommandType::Recommend:
            output_ << "[OK] recommend user=" << cmd.userId << " product=" << cmd.productId << '\n';
            return;
        case CommandType::Invalid:
        default:
            // In this debug harness we show invalid explicitly.
            // In the final assignment app, invalid commands should be silent.
            output_ << "[INVALID]\n";
            return;
    }
}
