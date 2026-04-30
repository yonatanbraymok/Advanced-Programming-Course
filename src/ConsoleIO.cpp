#include "ConsoleIO.h"

// Reads a full line from the console. Returns false if we hit EOF.
bool ConsoleInput::readLine(std::string& outLine) { 
    return static_cast<bool>(std::getline(std::cin, outLine)); 
}

// Prints the given string to the console, followed by a newline.
void ConsoleOutput::writeLine(const std::string& line) { 
    std::cout << line << '\n'; 
}