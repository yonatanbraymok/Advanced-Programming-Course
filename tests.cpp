#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "CommandParser.h"
#include "Commands.h"
#include "FileRepository.h"
#include "Interfaces.h"
#include "SimilarityRecommender.h"

namespace {
class BufferOutput : public IOutput {
public:
    void writeLine(const std::string& line) override { lines.push_back(line); }
    std::vector<std::string> lines;
};

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
        CommandParser parser;
        const ParsedCommand help = parser.parse("help");
        ok &= expect(help.type == CommandType::Help, "help command parsed");

        const ParsedCommand invalidTabs = parser.parse("add\t1 2");
        ok &= expect(invalidTabs.type == CommandType::Invalid, "tabs are invalid");

        const ParsedCommand add = parser.parse("add 1 100 101");
        ok &= expect(add.type == CommandType::Add && add.products.size() == 2, "add command parsed");

        const ParsedCommand spacedAdd = parser.parse("add   1    100   101   102");
        ok &= expect(spacedAdd.type == CommandType::Add && spacedAdd.products.size() == 3, "add supports multiple spaces");

        const ParsedCommand badAdd = parser.parse("add 1");
        ok &= expect(badAdd.type == CommandType::Invalid, "short add invalid");

        const ParsedCommand badNumber = parser.parse("recommend x 104");
        ok &= expect(badNumber.type == CommandType::Invalid, "recommend invalid number");
    }

    {
        const std::string path = makeTempFilePath();
        {
            FileRepository repo(path);
            repo.load();
            repo.addWatched(1, {100, 101, 102, 103});
            repo.addWatched(2, {101, 102, 104, 105, 106});
            repo.addWatched(3, {100, 104, 105, 107, 108});
            repo.addWatched(4, {101, 105, 106, 107, 109, 110});
            repo.addWatched(5, {100, 102, 103, 105, 108, 111});
            repo.addWatched(6, {100, 103, 104, 110, 111, 112, 113});
            repo.addWatched(7, {102, 105, 106, 107, 108, 109, 110});
            repo.addWatched(8, {101, 104, 105, 106, 109, 111, 114});
            repo.addWatched(9, {100, 103, 105, 107, 112, 113, 115});
            repo.addWatched(10, {100, 102, 105, 106, 107, 109, 110, 116});

            SimilarityRecommender recommender(repo);
            const ProductList rec = recommender.recommend(1, 104, 10);
            const ProductList expected = {105, 106, 111, 110, 112, 113, 107, 108, 109, 114};
            ok &= expect(rec == expected, "appendix recommendation order");
            ok &= expect(std::find(rec.begin(), rec.end(), 100) == rec.end(), "exclude already watched product 100");
            ok &= expect(std::find(rec.begin(), rec.end(), 101) == rec.end(), "exclude already watched product 101");
            ok &= expect(std::find(rec.begin(), rec.end(), 104) == rec.end(), "exclude queried product");
        }

        {
            FileRepository reloaded(path);
            reloaded.load();
            const auto* watched = reloaded.getWatched(1);
            ok &= expect(watched != nullptr && watched->count(100) == 1, "data persisted and reloaded");
        }

        std::remove(path.c_str());
    }

    {
        const std::string path = makeTempFilePath();
        FileRepository repo(path);
        repo.load();
        repo.addWatched(1, {100});
        repo.addWatched(2, {100, 200, 300});
        repo.addWatched(3, {100, 200, 300});
        repo.addWatched(4, {400, 300});

        SimilarityRecommender recommender(repo);
        const ProductList rec = recommender.recommend(1, 300, 10);
        ok &= expect(!rec.empty() && rec[0] == 200, "tie-break uses ascending product id");
        std::remove(path.c_str());
    }

    {
        const std::string path = makeTempFilePath();
        FileRepository repo(path);
        repo.load();
        SimilarityRecommender recommender(repo);
        BufferOutput out;
        CommandExecutor executor(repo, recommender, out);

        executor.executeHelp();
        ok &= expect(out.lines.size() == 3, "help prints exactly 3 lines");
        ok &= expect(out.lines[0] == "add [userid] [productid1] [productid2] ...", "help line 1");
        ok &= expect(out.lines[1] == "recommend [userid] [productid]", "help line 2");
        ok &= expect(out.lines[2] == "help", "help line 3");
        std::remove(path.c_str());
    }

    if (!ok) {
        return 1;
    }

    std::cout << "All tests passed\n";
    return 0;
}
