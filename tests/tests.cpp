#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <string>

#include "FileRepository.h"

namespace {
// Minimal assertion helper:
// - If `condition` is false, print a readable message.
// - Return the condition so the caller can combine results.
bool expect(bool condition, const std::string& message) {
    if (!condition) {
        std::cerr << "FAILED: " << message << '\n';
    }
    return condition;
}

// Create a unique temporary file path for this test run.
// We write repository data to this file, then delete it at the end.
std::string makeTempFilePath() {
    const auto suffix = std::to_string(std::rand());
    return (std::filesystem::temp_directory_path() / ("ex1_test_" + suffix + ".txt")).string();
}
}  // namespace

int main() {
    // Tracks whether ALL checks passed. If any expect(...) fails, `ok` becomes false.
    bool ok = true;

    {
        // Persistence smoke test:
        // 1) Create a repository and write some data to disk
        // 2) Create a NEW repository instance reading the same file
        // 3) Verify the data survived the reload
        const std::string path = makeTempFilePath();
        {
            // First scope: create & write data.
            // When this block ends, `repo` is destroyed (and should have saved data to `path`).
            FileRepository repo(path);

            // Fresh path should be handled gracefully.
            repo.load();

            // Write a small dataset.
            repo.addWatched(1, {100, 101, 102, 103});
            repo.addWatched(2, {104, 105});
        }

        {
            // Second scope: create a NEW instance to prove persistence
            FileRepository reloaded(path);
            reloaded.load();

            // Validate user 1.
            const auto* watched1 = reloaded.getWatched(1);
            ok &= expect(watched1 != nullptr, "user 1 exists after reload");
            ok &= expect(watched1 != nullptr && watched1->count(100) == 1, "user 1 contains product 100 after reload");
            ok &= expect(watched1 != nullptr && watched1->count(103) == 1, "user 1 contains product 103 after reload");

            // Validate user 2.
            const auto* watched2 = reloaded.getWatched(2);
            ok &= expect(watched2 != nullptr, "user 2 exists after reload");
            ok &= expect(watched2 != nullptr && watched2->count(104) == 1, "user 2 contains product 104 after reload");
        }

        // Cleanup: delete the temporary file we created for this test.
        std::remove(path.c_str());
    }

    // Any failure returns non-zero so CI / scripts can detect it.
    if (!ok) {
        return 1;
    }

    std::cout << "All tests passed\n";
    return 0;
}