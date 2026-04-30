#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <string>

#include "FileRepository.h"

namespace {
bool expect(bool condition, const std::string& message) {
    if (!condition) {
        std::cerr << "FAILED: " << message << '\n';
    }
    return condition;
}

std::string makeTempFilePath() {
    const auto suffix = std::to_string(std::rand());
    return (std::filesystem::temp_directory_path() / ("ex1_test_" + suffix + ".txt")).string();
}
}  // namespace

int main() {
    bool ok = true;

    {
        // Repository persistence smoke test: write -> reload -> validate.
        const std::string path = makeTempFilePath();
        {
            FileRepository repo(path);

            // Fresh path should be handled gracefully.
            repo.load();

            // Write a small dataset.
            repo.addWatched(1, {100, 101, 102, 103});
            repo.addWatched(2, {104, 105});
        }

        {
            FileRepository reloaded(path);
            reloaded.load();

            // Validate user 1 was persisted.
            const auto* watched1 = reloaded.getWatched(1);
            ok &= expect(watched1 != nullptr, "user 1 exists after reload");
            ok &= expect(watched1 != nullptr && watched1->count(100) == 1, "user 1 contains product 100 after reload");
            ok &= expect(watched1 != nullptr && watched1->count(103) == 1, "user 1 contains product 103 after reload");

            // Validate user 2 was persisted.
            const auto* watched2 = reloaded.getWatched(2);
            ok &= expect(watched2 != nullptr, "user 2 exists after reload");
            ok &= expect(watched2 != nullptr && watched2->count(104) == 1, "user 2 contains product 104 after reload");
        }

        std::remove(path.c_str());
    }

    if (!ok) {
        return 1;
    }

    std::cout << "All tests passed\n";
    return 0;
}

