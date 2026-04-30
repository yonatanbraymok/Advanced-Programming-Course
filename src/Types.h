#pragma once

#include <vector>

// These aliases make function signatures easier to read.
// Even though all are currently int-based, naming them by domain concept
// helps avoid mixing "user id" and "product id" by mistake.
using UserId = int;
using ProductId = int;

// A command can carry zero or more product ids, so we model that as a list.
using ProductList = std::vector<ProductId>;
