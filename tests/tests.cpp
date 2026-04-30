#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <unordered_map>
#include <unordered_set>

#include "App.h"
#include "CommandParser.h"
#include "FileRepository.h"
#include "Interfaces.h"

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

// Small fake repository used to verify App behavior without touching disk.
class FakeRepository : public IRepository {
public:
    void load() override {}

    void addWatched(UserId userId, const ProductList& productIds) override {
        lastAddUserId = userId;
        lastAddedProducts = productIds;
        addCalls++;
    }

    const std::unordered_set<ProductId>* getWatched(UserId userId) const override {
        auto it = watched.find(userId);
        if (it == watched.end()) {
            return nullptr;
        }
        return &it->second;
    }

    std::vector<UserId> getAllUsers() const override {
        std::vector<UserId> users;
        users.reserve(watched.size());
        for (const auto& [userId, _] : watched) {
            users.push_back(userId);
        }
        return users;
    }

    mutable int addCalls{0};
    mutable UserId lastAddUserId{0};
    mutable ProductList lastAddedProducts;
    std::unordered_map<UserId, std::unordered_set<ProductId>> watched;
};

// Small fake recommender to control recommendation output deterministically.
class FakeRecommender : public IRecommender {
public:
    ProductList recommend(UserId userId, ProductId productId, std::size_t limit = 10) const override {
        lastUserId = userId;
        lastProductId = productId;
        lastLimit = limit;
        return nextResult;
    }

    mutable UserId lastUserId{0};
    mutable ProductId lastProductId{0};
    mutable std::size_t lastLimit{0};
    ProductList nextResult;
};
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

    {
        // Parser strictness: IDs must be positive and help must have exact format.
        CommandParser parser;

        const ParsedCommand addZeroUser = parser.parse("add 0 10");
        ok &= expect(addZeroUser.type == CommandType::Invalid, "parser rejects add with user id 0");

        const ParsedCommand addZeroProduct = parser.parse("add 1 0");
        ok &= expect(addZeroProduct.type == CommandType::Invalid, "parser rejects add with product id 0");

        const ParsedCommand recommendZero = parser.parse("recommend 1 0");
        ok &= expect(recommendZero.type == CommandType::Invalid, "parser rejects recommend with product id 0");

        const ParsedCommand helpExtra = parser.parse("help now");
        ok &= expect(helpExtra.type == CommandType::Invalid, "parser rejects help with extra arguments");

        const ParsedCommand spacedAdd = parser.parse("   add   3   10   11   ");
        ok &= expect(spacedAdd.type == CommandType::Add, "parser accepts add with leading/trailing/multiple spaces");
        ok &= expect(spacedAdd.userId == 3, "parser extracts add user id with extra spaces");
        ok &= expect(spacedAdd.products.size() == 2 && spacedAdd.products[0] == 10 && spacedAdd.products[1] == 11,
                     "parser extracts add products with extra spaces");

        const ParsedCommand spacedRecommend = parser.parse("  recommend   8   77  ");
        ok &= expect(spacedRecommend.type == CommandType::Recommend,
                     "parser accepts recommend with leading/trailing/multiple spaces");
        ok &= expect(spacedRecommend.userId == 8 && spacedRecommend.productId == 77,
                     "parser extracts recommend ids with extra spaces");

        const ParsedCommand incompleteAdd = parser.parse("add 1");
        ok &= expect(incompleteAdd.type == CommandType::Invalid, "parser rejects incomplete add command");

        const ParsedCommand incompleteRecommend = parser.parse("recommend 1");
        ok &= expect(incompleteRecommend.type == CommandType::Invalid, "parser rejects incomplete recommend command");

        const ParsedCommand overflowUser = parser.parse("add 999999999999999999999 10");
        ok &= expect(overflowUser.type == CommandType::Invalid, "parser rejects overflowing user id");

        const ParsedCommand overflowProduct = parser.parse("add 1 999999999999999999999");
        ok &= expect(overflowProduct.type == CommandType::Invalid, "parser rejects overflowing product id");

        const ParsedCommand keywordCase = parser.parse("Help");
        ok &= expect(keywordCase.type == CommandType::Invalid, "parser enforces exact lowercase command keywords");
    }

    {
        // App-level contract: help output must match exact assignment text.
        FakeRepository repository;
        FakeRecommender recommender;
        std::istringstream in("help\n");
        std::ostringstream out;

        App app(in, out, repository, recommender);
        app.run();

        const std::string expected =
            "add [userid] [productid1] [productid2] ...\n"
            "recommend [userid] [productid]\n"
            "help\n";
        ok &= expect(out.str() == expected, "help output matches exact contract");
    }

    {
        // App-level contract: invalid commands are ignored silently.
        FakeRepository repository;
        FakeRecommender recommender;
        std::istringstream in("foo\nadd\t1 2\n");
        std::ostringstream out;

        App app(in, out, repository, recommender);
        app.run();

        ok &= expect(out.str().empty(), "invalid commands produce no output");
    }

    {
        // Add should call repository and still print nothing.
        FakeRepository repository;
        FakeRecommender recommender;
        std::istringstream in("add 7 101 102\n");
        std::ostringstream out;

        App app(in, out, repository, recommender);
        app.run();

        ok &= expect(repository.addCalls == 1, "add command reaches repository");
        ok &= expect(repository.lastAddUserId == 7, "add command passes correct user id");
        ok &= expect(repository.lastAddedProducts.size() == 2, "add command passes products list");
        ok &= expect(out.str().empty(), "add command prints no output");
    }

    {
        // Recommend should print one line with space-separated product ids.
        FakeRepository repository;
        FakeRecommender recommender;
        recommender.nextResult = {55, 66, 77};
        std::istringstream in("recommend 2 99\n");
        std::ostringstream out;

        App app(in, out, repository, recommender);
        app.run();

        ok &= expect(recommender.lastUserId == 2, "recommend command passes user id");
        ok &= expect(recommender.lastProductId == 99, "recommend command passes product id");
        ok &= expect(recommender.lastLimit == 10, "recommend command uses top-10 limit");
        ok &= expect(out.str() == "55 66 77\n", "recommend output uses expected spacing");
    }

    {
        // Even when there are no recommendations, output should still be one empty line.
        FakeRepository repository;
        FakeRecommender recommender;
        recommender.nextResult = {};
        std::istringstream in("recommend 5 42\n");
        std::ostringstream out;

        App app(in, out, repository, recommender);
        app.run();

        ok &= expect(out.str() == "\n", "recommend with empty result still prints newline-terminated line");
    }

    if (!ok) {
        return 1;
    }

    std::cout << "All tests passed\n";
    return 0;
}
