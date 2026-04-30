#include <cassert>

#include "../src/CommandParser.h"

namespace {

// Verifies the exact valid shape of the "help" command.
void testHelpCommand() {
    CommandParser parser;
    const ParsedCommand cmd = parser.parse("help");

    assert(cmd.type == CommandType::Help);
}

// Verifies minimum valid add command with one product id.
void testAddCommandMinimalValid() {
    CommandParser parser;
    const ParsedCommand cmd = parser.parse("add 7 101");

    assert(cmd.type == CommandType::Add);
    assert(cmd.userId == 7);
    assert(cmd.products.size() == 1);
    assert(cmd.products[0] == 101);
}

// Verifies minimum valid recommend command.
void testRecommendCommandMinimalValid() {
    CommandParser parser;
    const ParsedCommand cmd = parser.parse("recommend 9 222");

    assert(cmd.type == CommandType::Recommend);
    assert(cmd.userId == 9);
    assert(cmd.productId == 222);
}

// Unknown command should be classified as Invalid.
void testInvalidCommandIgnored() {
    CommandParser parser;
    const ParsedCommand cmd = parser.parse("foo");

    assert(cmd.type == CommandType::Invalid);
}

// Assignment contract: tabs are not accepted as separators.
void testTabsAreRejected() {
    CommandParser parser;
    const ParsedCommand cmd = parser.parse("add\t1 2");

    assert(cmd.type == CommandType::Invalid);
}

}  // namespace

int main() {
    // Keep this suite intentionally tiny for the first TDD milestone.
    testHelpCommand();
    testAddCommandMinimalValid();
    testRecommendCommandMinimalValid();
    testInvalidCommandIgnored();
    testTabsAreRejected();
    return 0;
}
