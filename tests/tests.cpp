#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <gtest/gtest.h>

#include "CommandParser.h"
#include "Commands.h"
#include "FileRepository.h"
#include "Interfaces.h"
#include "SimilarityRecommender.h"

namespace {

// A mock output class. Instead of printing to the console, 
// it saves the output to a vector so we can verify the text in our tests.
class BufferOutput : public IOutput {
public:
    void writeLine(const std::string& line) override { lines.push_back(line); }
    std::vector<std::string> lines;
};

// Helper function to print clear failure messages if a test doesn't pass
bool expect(bool condition, const std::string& message) {
    if (!condition) {
        std::cerr << "FAILED: " << message << '\n';
    }
    return condition;
}

// Generates a random temporary file path for safe repository testing
std::string makeTempFilePath() {
    const auto suffix = std::to_string(std::rand());
    return (std::filesystem::temp_directory_path() / ("ex1_test_" + suffix + ".txt")).string();
}
}  // namespace

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);

    bool ok = true;

    {
        // 1. Parser Tests: Ensure raw strings are correctly converted to commands
        // and that malformed inputs are safely rejected.
        CommandParser parser;
        
        const ParsedCommand help = parser.parse("help");
        ok &= expect(help.type == CommandType::Help, "help command parsed");

        const ParsedCommand invalidTabs = parser.parse("add\t1 2");
        ok &= expect(invalidTabs.type == CommandType::Invalid, "tabs are invalid");

        const ParsedCommand add = parser.parse("add 1 100 101");
        ok &= expect(add.type == CommandType::Invalid, "add is not an Ex2 wire command");

        const ParsedCommand spacedAdd = parser.parse("add   1    100   101   102");
        ok &= expect(spacedAdd.type == CommandType::Invalid, "add with spaces is invalid on wire");

        const ParsedCommand badAdd = parser.parse("add 1");
        ok &= expect(badAdd.type == CommandType::Invalid, "short add invalid");

        const ParsedCommand recommend = parser.parse("recommend 1 104");
        ok &= expect(recommend.type == CommandType::Invalid, "recommend is not an Ex2 wire command");

        const ParsedCommand badNumber = parser.parse("recommend x 104");
        ok &= expect(badNumber.type == CommandType::Invalid, "recommend invalid number");

        const ParsedCommand getCmd = parser.parse("GET 1 104");
        ok &= expect(getCmd.type == CommandType::Get && getCmd.userId == 1 && getCmd.productId == 104,
                      "GET parses userid and productid");

        const ParsedCommand deleteCmd = parser.parse("DELETE 1 100 101");
        ok &= expect(deleteCmd.type == CommandType::Delete && deleteCmd.userId == 1 &&
                         deleteCmd.products.size() == 2,
                      "DELETE parses userid and product list");
    }

    {
        // 2. Integration Test: Verifies the exact scenario provided in the assignment's PDF Appendix.
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
            
            // Expected output straight from the assignment instructions
            const ProductList expected = {105, 106, 111, 110, 112, 113, 107, 108, 109, 114};
            
            ok &= expect(rec == expected, "appendix recommendation order");
            ok &= expect(std::find(rec.begin(), rec.end(), 100) == rec.end(), "exclude already watched product 100");
            ok &= expect(std::find(rec.begin(), rec.end(), 101) == rec.end(), "exclude already watched product 101");
            ok &= expect(std::find(rec.begin(), rec.end(), 104) == rec.end(), "exclude queried product");
        }

        {
            // Verify that data is actually persisting to the file and reloading correctly
            FileRepository reloaded(path);
            reloaded.load();
            const auto* watched = reloaded.getWatched(1);
            ok &= expect(watched != nullptr && watched->count(100) == 1, "data persisted and reloaded");
        }

        std::remove(path.c_str()); // Clean up temp file
    }

    {
        // 3. Edge Case: Test tie-breaking logic when products have the exact same score.
        const std::string path = makeTempFilePath();
        FileRepository repo(path);
        repo.load();
        repo.addWatched(1, {100});
        repo.addWatched(2, {100, 200, 300});
        repo.addWatched(3, {100, 400, 300});

        SimilarityRecommender recommender(repo);
        const ProductList rec = recommender.recommend(1, 300, 10);
        
        // Product 200 should beat 400 due to ascending ID sorting
        ok &= expect(!rec.empty() && rec[0] == 200, "tie-break uses ascending product id");
        std::remove(path.c_str());
    }

    {
        // 4. Executor Test: Verify output formatting using our mock BufferOutput.
        const std::string path = makeTempFilePath();
        FileRepository repo(path);
        repo.load();
        SimilarityRecommender recommender(repo);
        
        BufferOutput out; // Using the mock output!
        CommandExecutor executor(repo, recommender, out);

        executor.executeHelp();
        
        // Ex2 help: alphabetical verbs, arguments syntax, help last
        ok &= expect(out.lines.size() == 5, "help prints exactly 5 lines");
        ok &= expect(out.lines[0] == "DELETE, arguments: [userid] [productid1] [productid2] ...", "help line 1");
        ok &= expect(out.lines[1] == "GET, arguments: [userid] [productid]", "help line 2");
        ok &= expect(out.lines[2] == "PATCH, arguments: [userid] [productid1] [productid2] ...", "help line 3");
        ok &= expect(out.lines[3] == "POST, arguments: [userid] [productid1] [productid2] ...", "help line 4");
        ok &= expect(out.lines[4] == "help", "help line 5");
        
        std::remove(path.c_str());
    }

    if (!ok) {
        return 1;
    }

    if (ok) {
        std::cout << "Legacy tests passed, now running GTest (TDD)..." << std::endl;
    }

    return RUN_ALL_TESTS();

    std::cout << "All tests passed\n";
    return 0;
}