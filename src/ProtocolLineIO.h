#pragma once

#include <string>

// APC-81: read/write one line on a socket. Each message must end with '\n'.
// TCP gives you bytes in chunks — these functions turn that into full lines.

bool readLineFromSocket(int fd, std::string& outLine);
void writeLineToSocket(int fd, const std::string& line);
