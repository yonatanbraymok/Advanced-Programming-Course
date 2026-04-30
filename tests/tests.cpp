#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <fstream>
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
        // Persistence smoke test: write -> reload -> validate.
        const std::string path = makeTempFilePath();
        {
            FileRepository repo(path);

            // Fresh path.
            repo.load();

            // Write a small dataset.
            repo.addWatched(1, {100, 101, 102, 103});
            repo.addWatched(2, {104, 105});
        }

        {
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

        std::remove(path.c_str());
    }

    {
        // Load should ignore invalid IDs in the file.
        const std::string path = makeTempFilePath();
        {
            std::ofstream out(path, std::ios::trunc);
            out << "0 100 200\n";          // invalid user id
            out << "-7 100\n";             // invalid user id
            out << "1 -5 10 0 20\n";       // invalid product ids mixed with valid ones
            out << "abc 1 2 3\n";          // invalid line
            out << "2 30 30 40\n";         // duplicates are ok (set)
        }

        FileRepository repo(path);
        repo.load();

        const auto* w1 = repo.getWatched(1);
        ok &= expect(w1 != nullptr, "user 1 loaded");
        ok &= expect(w1 != nullptr && w1->count(10) == 1, "user 1 contains valid product 10");
        ok &= expect(w1 != nullptr && w1->count(20) == 1, "user 1 contains valid product 20");
        ok &= expect(w1 != nullptr && w1->count(-5) == 0, "user 1 ignores negative product");
        ok &= expect(w1 != nullptr && w1->count(0) == 0, "user 1 ignores product 0");

        const auto* w2 = repo.getWatched(2);
        ok &= expect(w2 != nullptr && w2->count(30) == 1 && w2->count(40) == 1, "user 2 loaded with deduped products");

        ok &= expect(repo.getWatched(0) == nullptr, "user 0 not loaded");
        ok &= expect(repo.getWatched(-7) == nullptr, "negative user id not loaded");

        std::remove(path.c_str());
    }

    if (!ok) {
        return 1;
    }

    std::cout << "All tests passed\n";
    return 0;
}
