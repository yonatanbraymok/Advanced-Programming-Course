#include "App.h"

#include <iostream>

int main() {
    // Wire console input/output into our temporary parser test app.
    App app(std::cin, std::cout);
    app.run();
    return 0;
}
