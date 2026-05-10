#pragma once

#include <iostream>

#include "Interfaces.h"

// Implements IInput to read directly from standard input (cin)
class ConsoleInput : public IInput {
public:
    bool readLine(std::string& outLine) override;
};

// Implements IOutput to print directly to standard output (cout)
class ConsoleOutput : public IOutput {
public:
    void writeLine(const std::string& line) override;
};